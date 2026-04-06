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

      window.console = new Proxy(original, {
        get(target, prop) {
          if (typeof prop === 'string' && methods.includes(prop)) {
            return (...args) => {
              const message = args.map(serialize).join(' ');
              window.parent.postMessage({ type: prop, data: message }, '*');
              target[prop](...args);
            };
          }
          return target[prop];
        },
      });

      window.onerror = (msg, src, line, col, err) => {
        window.parent.postMessage({
          type: 'error',
          data: err ? err.name + ': ' + err.message : String(msg),
          source: src,
          line: line,
          col: col,
        }, '*');
      };

      window.addEventListener('unhandledrejection', (e) => {
        window.parent.postMessage({
          type: 'error',
          data: 'Unhandled rejection: ' + String(e.reason),
        }, '*');
      });
    })();
  `;
}
