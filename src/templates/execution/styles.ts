export const iframeStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  
  html, body, #root { 
    height: 100%; width: 100%; margin: 0; padding: 0; 
    background: #0b1220; color: #ffffff; 
    display: flex; flex-direction: column;
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  #error-overlay {
    display: none; 
    position: fixed; 
    inset: 0;
    background: rgba(127, 29, 29, 0.98); 
    color: #fecaca;
    padding: 24px; 
    z-index: 9999; 
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    white-space: pre-wrap; 
    overflow-y: auto;
    font-size: 14px;
    line-height: 1.5;
  }
`;

export const errorOnlyStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0b1220; height: 100vh; overflow: hidden; }
  #error-overlay {
    display: flex;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(220, 38, 38, 0.95);
    color: #fff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    padding: 24px;
    z-index: 9999;
    white-space: pre-wrap;
    overflow: auto;
    flex-direction: column;
    font-size: 14px;
    line-height: 1.5;
  }
`;
