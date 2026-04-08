export function getConsoleProxyScript() {
  return `
    (function() {
      const methods = ["log", "error", "warn", "info"];
      const original = window.console;

      const serialize = (arg) => {
        try {
          if (arg instanceof Error) {
            return {
              __error: true,
              name: arg.name,
              message: arg.message,
              stack: arg.stack,
            };
          }
          if (typeof arg === 'function') return '[Function: ' + (arg.name || 'anonymous') + ']';
          if (typeof arg === 'symbol') return arg.toString();
          if (typeof arg === 'undefined') return 'undefined';
          
          // For objects, we'll try to let postMessage handle them, 
          // but if they are complex we might need a fallback.
          // However, for this playground, simple JSON-like structures are common.
          return arg;
        } catch (e) {
          return String(arg);
        }
      };

      let isProxying = false;
      window.console = new Proxy(original, {
        get(target, prop) {
          if (typeof prop === 'string' && methods.includes(prop)) {
            return (...args) => {
              if (isProxying) return target[prop](...args);
              isProxying = true;
              try {
                const serializedArgs = args.map(serialize);
                window.parent.postMessage({ type: prop, data: serializedArgs }, '*');
              } catch (e) {
                // Fallback for non-cloneable data
                try {
                   const fallback = args.map(a => String(a));
                   window.parent.postMessage({ type: prop, data: fallback }, '*');
                } catch(e2) {}
              }
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
