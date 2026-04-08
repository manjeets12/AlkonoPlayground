# AlkonoPlayground 🚀

AlkonoPlayground is a high-performance, browser-based IDE designed for building and testing React and React Native applications. It is built as a **free tool** specifically tailored for developers to **practice and prepare for technical interviews** in a realistic environment.

## 🎯 Project Goals

The primary goal of AlkonoPlayground is to provide a free, zero-setup, high-fidelity coding experience that simulates a professional interview environment.

- **Interview Preparation**: Practice complex React and React Native problems without the distraction of environment configuration.
- **Zero Cost**: Entirely client-side and open-access, providing a premium practice tool for free.
- **Instant Feedback**: Incremental, non-blocking bundling translates your thoughts to code updates in milliseconds.
- **Professional Environment**: Move beyond simple single-file editors; practice using folders, utilities, and components just as you would in a real-world project.


## ✨ Key Features

- **Multi-file System**: Support for complex folder structures and file relationships.
- **Rich Editor**: Powered by CodeMirror with TypeScript/JSX syntax highlighting and smart indenting.
- **Console Proxy**: Real-time log interception that surfaces `console.log`, `warn`, and `error` directly in the playground UI.
- **Smart Scaffolding**: Modular templates that instantly set up best-practice project structures.
- **Responsive Preview**: Live rendering with error overlays for both bundling and runtime failures.

## 🚀 How to Use

### 1. Local Setup
Clone the repository and install dependencies:
```bash
npm install
npm run dev
```

### 2. The Development Workflow
1. **Explore**: Use the Left Panel to browse the project structure or create new files and folders.
2. **Code**: Edit your components in the main editor. The root of your app is typically `main.tsx` or `App.tsx`.
3. **Run**: Click the **Run** button (or press `Cmd/Ctrl + Enter`) to bundle and update the preview.
4. **Debug**: Monitor the bottom **Console** panel for logs or runtime errors.

### 3. Framework Switching
Use the **Footer Bar** at the bottom to switch between **React** and **React Native** modes.
> [!IMPORTANT]
> Switching frameworks will prompt you to update your main content to match the new platform's environment.

### 4. Persistence
Your files and settings are automatically persisted to `localStorage`. You can manually trigger a save using `Cmd/Ctrl + S` or the Save button in the footer.

## 🛠️ Architecture
- **Bundler**: `esbuild-wasm` (Running in Web Worker)
- **Runtime**: `react-native-web` + `react-dom`
- **Styling**: Vanilla CSS Modules
- **State Management**: Zero-dependency React Hooks architecture

---
Built with ❤️ for the Alkono Developer Community.
