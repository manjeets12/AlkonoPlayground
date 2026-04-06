/**
 * executor.worker.ts
 *
 * Runs in a Web Worker. Receives a { files, entryPoint } message,
 * bundles with esbuild-wasm using a virtual FS plugin, and posts back
 * either { type: 'success', code } or { type: 'error', errors }.
 *
 * Virtual FS plugin:
 *   - All files live in memory (the snapshot from useFileSystem)
 *   - Imports are resolved relative to the importing file's path
 *   - react-native is aliased to react-native-web (loaded in the iframe via CDN)
 *   - External packages (react, react-dom, react-native-web) are NOT bundled —
 *     they are expected as globals in the iframe (window.React, window.ReactDOM, etc.)
 */

import * as esbuild from "esbuild-wasm";

// ─── esbuild init (once per worker lifetime) ──────────────────────────────────

let initPromise: Promise<void> | null = null;

function ensureInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = esbuild.initialize({
      worker: false, // we ARE the worker, don't spawn another
      wasmURL: "https://unpkg.com/esbuild-wasm@0.20.2/esbuild.wasm",
    });
  }
  return initPromise;
}

// ─── Path utilities ───────────────────────────────────────────────────────────

/**
 * Resolve a relative import path against the importer's directory.
 * e.g. resolve("components/Card", "App.tsx") → "components/Card"
 *      resolve("../utils/helpers", "components/Card.tsx") → "utils/helpers"
 */
function resolvePath(importPath: string, importer: string): string {
  // External package — not a relative import
  if (!importPath.startsWith(".")) return importPath;

  const importerDir = importer.includes("/")
    ? importer.split("/").slice(0, -1).join("/")
    : "";

  const segments = importerDir
    ? `${importerDir}/${importPath}`.split("/")
    : importPath.split("/");

  // Normalise: resolve ".." and "."
  const resolved: string[] = [];
  for (const seg of segments) {
    if (seg === "..") resolved.pop();
    else if (seg !== ".") resolved.push(seg);
  }

  return resolved.join("/");
}

/**
 * Given a bare path (no extension), try each candidate extension in order.
 */
function findFile(
  bare: string,
  files: Record<string, string>,
): string | undefined {
  const EXTS = [".tsx", ".ts", ".jsx", ".js"];

  // 1. Exact match (already has extension)
  if (files[bare] !== undefined) return bare;

  // 2. Try adding extensions
  for (const ext of EXTS) {
    const candidate = bare + ext;
    if (files[candidate] !== undefined) return candidate;
  }

  // 3. index file inside a directory
  for (const ext of EXTS) {
    const candidate = `${bare}/index${ext}`;
    if (files[candidate] !== undefined) return candidate;
  }

  return undefined;
}

// ─── Virtual FS esbuild plugin ────────────────────────────────────────────────

function virtualFSPlugin(files: Record<string, string>): esbuild.Plugin {
  const NAMESPACE = "virtual";

  return {
    name: "virtual-fs",
    setup(build) {
      // ── Resolve ────────────────────────────────────────────────────────────

      build.onResolve({ filter: /.*/ }, (args) => {
        // react-native → react-native-web (global in iframe)
        if (args.path === "react-native") {
          return { path: "react-native-web", external: true };
        }

        // Known CDN globals — mark external so esbuild skips bundling them
        const EXTERNALS = [
          "react",
          "react-dom",
          "react-native-web",
          "react/jsx-runtime",
        ];
        if (EXTERNALS.includes(args.path)) {
          return { path: args.path, external: true };
        }

        // Relative import — resolve against importer
        if (args.path.startsWith(".")) {
          const importer =
            args.namespace === NAMESPACE
              ? args.importer.replace(`${NAMESPACE}:`, "")
              : args.importer;

          const bare = resolvePath(args.path, importer);
          const resolved = findFile(bare, files);

          if (!resolved) {
            return {
              errors: [
                {
                  text: `Cannot resolve '${args.path}' from '${importer}'. Available files: ${Object.keys(files).join(", ")}`,
                },
              ],
            };
          }

          return { path: resolved, namespace: NAMESPACE };
        }

        // Unknown bare import — mark external and warn
        return { path: args.path, external: true };
      });

      // ── Load ───────────────────────────────────────────────────────────────

      build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => {
        const content = files[args.path];
        if (content === undefined) {
          return {
            errors: [{ text: `File not found in virtual FS: ${args.path}` }],
          };
        }

        const ext = args.path.split(".").pop() ?? "tsx";
        const loaderMap: Record<string, esbuild.Loader> = {
          tsx: "tsx",
          ts: "ts",
          jsx: "jsx",
          js: "js",
          json: "json",
          css: "css",
        };

        return {
          contents: content,
          loader: loaderMap[ext] ?? "tsx",
        };
      });
    },
  };
}

// ─── Message handler ──────────────────────────────────────────────────────────

self.onmessage = async (
  e: MessageEvent<{ files: Record<string, string>; entryPoint: string }>,
) => {
  const { files, entryPoint } = e.data;

  try {
    await ensureInitialized();

    const result = await esbuild.build({
      entryPoints: [entryPoint],
      bundle: true,
      write: false,
      format: "iife", // wraps in (function(){...})() — safe for iframe
      globalName: "App", // exports available as window.App
      jsx: "automatic",
      jsxImportSource: "react",
      target: "es2017",
      plugins: [virtualFSPlugin(files)],

      // These are loaded via CDN script tags in the iframe HTML
      external: ["react", "react-dom", "react-native-web", "react/jsx-runtime"],

      // Inline sourcemaps for error line mapping
      sourcemap: "inline",

      // Suppress "bundle contains dynamic require" warnings for RN internals
      logLevel: "silent",
      platform: "browser", // ✅
    });

    const code = result.outputFiles[0].text;

    // Surface any non-fatal warnings as structured data
    const warnings = result.warnings.map((w) => ({
      message: w.text,
      file: w.location?.file,
      line: w.location?.line,
    }));

    self.postMessage({ type: "success", code, warnings });
  } catch (err: unknown) {
    // esbuild throws an object with { errors: BuildMessage[] }
    if (
      err &&
      typeof err === "object" &&
      "errors" in err &&
      Array.isArray((err as { errors: unknown[] }).errors)
    ) {
      const buildErr = err as esbuild.BuildFailure;
      const errors = buildErr.errors.map((e) => ({
        message: e.text,
        file: e.location?.file,
        line: e.location?.line,
        col: e.location?.column,
      }));
      self.postMessage({ type: "error", errors });
    } else {
      self.postMessage({
        type: "error",
        errors: [{ message: String(err) }],
      });
    }
  }
};
