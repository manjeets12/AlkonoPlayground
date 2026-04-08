import { build } from "esbuild";

const isProd = process.env.NODE_ENV === "production";

build({
  entryPoints: ["vendor-entry.js"],
  bundle: true,
  outfile: "public/vendor.bundle.js",
  format: "iife",
  minify: isProd,
  sourcemap: isProd ? false : "inline",
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      isProd ? "production" : "development"
    ),
  },
}).catch(() => process.exit(1));