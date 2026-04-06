import * as esbuild from "esbuild-wasm";

let initialized = false;

async function init() {
  if (!initialized) {
    await esbuild.initialize({
      worker: true,
      wasmURL: "https://unpkg.com/esbuild-wasm@latest/esbuild.wasm",
    });
    initialized = true;
  }
}

self.onmessage = async (e) => {
  const { code } = e.data;

  await init();

  try {
    const result = await esbuild.build({
      stdin: {
        contents: code,
        loader: "tsx",
      },
      bundle: true,
      write: false,
    });

    const bundledCode = result.outputFiles[0].text;

    self.postMessage({
      type: "success",
      code: bundledCode,
    });
  } catch (err: any) {
    self.postMessage({
      type: "error",
      error: err.message,
    });
  }
};
