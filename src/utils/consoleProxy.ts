export function getConsoleProxyScript() {
  return `
    (function() {
      const methods = ["log", "error", "warn", "info"];
      const original = window.console;

      const serialize = (arg) => {
        if (arg instanceof Error) return arg.name + ': ' + arg.message;
        if (typeof arg === 'object' && arg !== null) {
          try { return JSON.stringify(arg, null, 2); } catch { return String(arg); }
        }
        return String(arg);
      };

      let isProxying = false;
      window.console = new Proxy(original, {
        get(target, prop) {
          if (typeof prop === 'string' && methods.includes(prop)) {
            return (...args) => {
              if (isProxying) return target[prop](...args);
              isProxying = true;
              try {
                const message = args.map(serialize).join(' ');
                window.parent.postMessage({ type: prop, data: message }, '*');
              } catch (e) {}
              isProxying = false;
              return target[prop](...args);
            };
          }
          return target[prop];
        },
      });

      const showErrorOverlay = (msg) => {
        try {
          const overlay = document.getElementById('error-overlay');
          if (overlay) {
            overlay.style.display = 'flex';
            overlay.textContent = msg;
          }
        } catch(e) {}
      };
      
      window.__showError__ = showErrorOverlay;

      let isHandlingError = false;
      window.onerror = (msg, src, line, col, err) => {
        if (isHandlingError) return;
        isHandlingError = true;
        try {
          const errorMsg = err ? err.name + ': ' + err.message : String(msg);
          showErrorOverlay(errorMsg);
          window.parent.postMessage({
            type: 'error',
            data: errorMsg,
            source: src,
            line: line,
            col: col,
          }, '*');
        } finally {
          isHandlingError = false;
        }
      };

      window.addEventListener('unhandledrejection', (e) => {
        if (isHandlingError) return;
        isHandlingError = true;
        try {
          const errorMsg = 'Unhandled rejection: ' + String(e.reason);
          showErrorOverlay(errorMsg);
          window.parent.postMessage({
            type: 'error',
            data: errorMsg,
          }, '*');
        } finally {
          isHandlingError = false;
        }
      });
    })();
  `;
}
