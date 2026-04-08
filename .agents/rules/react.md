---
trigger: always_on
---

# 🧠 Project: React Native Web Playground Architecture

You are working on a **production-grade React Native coding platform** (browser-based IDE).
This is a developer tool, not a standard React web app.

---

## 🎯 Project Goal & Capabilities
Build a browser-based coding environment that supports:
- React Native code editing
- Multi-file system (folders + files)
- Code execution inside a sandboxed Web Worker
- Bundling via `esbuild`
- Live preview rendering via an `iframe`
- React Native rendering via `react-native-web`

---

## 🧱 Existing Architecture (DO NOT BREAK)
The core execution engine is highly decoupled and relies on the following flow:
1. **Editor:** CodeMirror (handles JS/TS/JSX).
2. **Bundler:** `esbuild-wasm` running inside a Web Worker to prevent UI blocking.
3. **Preview:** An `iframe` using `srcdoc` to render the bundled code in a sandbox.
4. **Logs:** A custom proxy script inside the iframe intercepts `console.log`, `warn`, `error`, and unhandled rejections, sending them to the parent via `postMessage`.

**⚠️ CRITICAL RULES:**
- DO NOT modify existing working functionality unless explicitly asked.
- DO NOT change worker execution logic, iframe preview logic, or console.log handling.
- DO NOT introduce a backend, unnecessary abstractions, or external UI libraries.

---

## ⚙️ EXECUTION MODEL (IMPORTANT)
- Code runs ONLY when the "Run" button is clicked.
- The Preview remains STALE until the next manual run.
- Execution happens off the main thread (inside the Web Worker).
- Output is exclusively rendered in the iframe.

---

## ⚛️ REACT & TYPESCRIPT BEST PRACTICES
- **Components:** Functional components only. Keep them small and single-responsibility.
- **State:** Use `useState` for local state, `useRef` for mutable values to avoid re-renders. Lift state only when necessary. No global state libraries.
- **Props & Types:** Keep props minimal. Use explicit TypeScript types/interfaces for all props. Avoid `any`.
- **Performance:** Avoid unnecessary re-renders. Clean up all side effects (workers, event listeners, timers).

---

## 🎨 STYLING GUIDELINES (MANDATORY)
- **No Inline Styles:** Do NOT use inline styles for layout or UI (except for rare dynamic values or temporary debugging).
- **CSS Modules:** Use CSS Modules strictly. The `.module.css` file must live inside the component's dedicated folder.
- **Structure:** Keep styles scoped, avoid deeply nested selectors, and utilize the existing dark theme typography tokens.

---

## 📁 FILE STRUCTURE
Maintain the following root structure:
- `src/components/` → Reusable UI (Editor, Preview, Logs)
- `src/layout/` → Layout components (Panels)
- `src/hooks/` → Logic hooks (`useExecutor`, etc.)
- `src/worker/` → Execution worker (`executor.worker.ts`)
- `src/utils/` → Helpers (`consoleProxy.ts`, etc.)

**UI Component Pattern (Mandatory):**
All UI components must be grouped into their own folders containing the component, its styles, and an export barrel file:
```text
ComponentName/
├── ComponentName.tsx
├── ComponentName.module.css
├── index.ts