import { getConsoleProxyScript } from "../../utils/consoleProxy";

export function getGlobalMappingScript(): string {
  return `
    window.__showError__ = (msg) => {
      const overlay = document.getElementById('error-overlay');
      if (overlay) {
        overlay.textContent = msg;
        overlay.style.display = 'block';
      }
    };

    window.__esbuild_globals__ = {
      "react": window.React,
      "react-dom": window.ReactDOM,
      "react-native": window.ReactNativeWeb,
      "react-native-web": window.ReactNativeWeb,
      "react/jsx-runtime": {
        jsx: window.React.createElement,
        jsxs: window.React.createElement,
        Fragment: window.React.Fragment
      }
    };

    ${getConsoleProxyScript()}
  `;
}

export function getMountingScript(framework: "react" | "react-native"): string {
  const isRN = framework === "react-native";

  return `
    (function mount() {
      try {
        const rootElement = document.getElementById('root');
        let AppComponent = window.App;
        if (AppComponent && AppComponent.default) AppComponent = AppComponent.default;
        
        if (!AppComponent && window.App) {
          const keys = Object.keys(window.App);
          if (keys.length === 1) AppComponent = window.App[keys[0]];
        }

        if (!AppComponent) throw new Error('No component found. Please export your component as default or as a named export.');

        if (${isRN}) {
           const { AppRegistry } = window.ReactNativeWeb;
           AppRegistry.registerComponent('Main', () => AppComponent);
           AppRegistry.runApplication('Main', {
             initialProps: {},
             rootTag: rootElement
           });
        } else {
           const root = window.ReactDOM.createRoot(rootElement);
           root.render(window.React.createElement(AppComponent));
        }
      } catch (err) {
        window.__showError__('Mounting Error:\\n' + err.message);
      }
    })();
  `;
}
