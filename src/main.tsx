import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import * as esbuild from "esbuild-wasm";

await esbuild.initialize({
  worker: true,
  wasmURL: "https://unpkg.com/esbuild-wasm@latest/esbuild.wasm",
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
