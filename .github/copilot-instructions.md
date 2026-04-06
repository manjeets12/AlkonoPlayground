# 🧠 Project: React Native Coding Platform (Web-based)

You are working on a **production-grade React Native coding platform**.

This is NOT a normal React app. It is a **developer tool (IDE-like system)**.

---

# 🎯 Project Goal

Build a browser-based platform that supports:

- React Native code editing
- Multi-file system
- Code execution using Web Worker
- Bundling via esbuild
- Preview via iframe
- React Native rendering via react-native-web

---

# 🧱 Existing Architecture (DO NOT BREAK)

The project already has:

- CodeMirror editor
- Web Worker execution system
- esbuild bundling
- Preview iframe rendering
- Logs system (console.log support)

---

# 🚫 CRITICAL RULES (MUST FOLLOW)

1. DO NOT modify existing working functionality unless explicitly asked
2. DO NOT refactor working code
3. DO NOT change:
   - Worker execution logic
   - iframe preview logic
   - console.log handling

4. DO NOT introduce unnecessary abstractions
5. DO NOT add external UI libraries

---

# ⚛️ REACT BEST PRACTICES (MANDATORY)

## Component Design

- Use **functional components only**
- Keep components **small and single responsibility**
- Avoid deeply nested components
- Prefer composition over large monolithic components

## State Management

- Use `useState` for local state
- Use `useRef` for mutable values (avoid re-renders)
- Do NOT introduce global state libraries
- Lift state only when necessary

## Effects

- Use `useEffect` only when required
- Always clean up side effects (workers, listeners, timers)
- Avoid unnecessary dependencies

## Props

- Keep props minimal and explicit
- Avoid prop drilling beyond 2–3 levels (will refactor later if needed)

## Performance

- Avoid unnecessary re-renders
- Do not prematurely optimize (no memo/useMemo unless needed)
- Keep rendering predictable

---

# 🟦 TYPESCRIPT BEST PRACTICES

- Use explicit types for props
- Avoid `any` unless absolutely necessary
- Use simple types/interfaces (avoid complex generics)
- Keep types close to usage (no over-abstraction)

---

# 📁 FILE STRUCTURE GUIDELINES

Follow this structure:

src/
components/ → reusable UI (Editor, Preview, Logs)
layout/ → layout components (panels)
hooks/ → logic hooks (useExecutor, useFileSystem)
worker/ → execution worker
utils/ → helpers (formatting, etc.)

---

# 🎨 STYLING GUIDELINES (MANDATORY)

- Do NOT use inline styles for layout or UI
- Use **CSS Modules** for all styling
- Each component must have its own `.module.css` file

## Structure

- Component: `LeftPanel.tsx`
- Styles: `LeftPanel.module.css`

## Rules

- Use descriptive class names (container, header, section)
- Keep styles scoped (no global CSS)
- Avoid deeply nested selectors
- Maintain consistent dark theme

## Exceptions

- Inline styles allowed ONLY for:
  - dynamic styles (rare)
  - quick temporary debugging

Otherwise, always use CSS modules

---

# 🧩 NAMING CONVENTIONS

- Components: PascalCase (Editor, PreviewPanel)
- Hooks: camelCase starting with "use" (useExecutor)
- Files: match component name
- Variables: descriptive, no abbreviations

---

# 🎨 UI PRINCIPLES

- Dark theme
- Minimal and clean (interview platform style)
- No heavy styling systems
- Use inline styles or simple CSS only
- Use flexbox layouts only

---

# ⚙️ EXECUTION MODEL (IMPORTANT)

- Code runs ONLY when "Run" is clicked
- Preview remains STALE until next run
- Execution happens inside Web Worker
- Output is rendered in iframe

---

# 🧠 EDITOR PRINCIPLES

- No autocomplete
- No heavy IDE features
- Keep it simple and fast
- CodeMirror is used as editor

---

# 🔥 PERFORMANCE + SAFETY

- Never block main thread
- Use Web Worker for execution
- Avoid infinite loops (handled later)
- Clean up resources properly

---

# 🧭 HOW TO RESPOND

When given a task:

- ONLY implement what is asked
- DO NOT go beyond scope
- DO NOT anticipate future steps
- DO NOT refactor unrelated code

---

# ⚠️ WHAT NOT TO DO

- Do not rebuild architecture
- Do not introduce backend
- Do not replace existing tools
- Do not change working logic

---

# ✅ SUCCESS CRITERIA

After every change:

- Existing features must still work
- Editor must remain functional
- Run → Preview → Logs must work
- UI changes should not break execution

---

This is a controlled, step-by-step build of a production system.
Respect constraints strictly.
