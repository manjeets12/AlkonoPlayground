import type { Framework } from "../../types/framework";

import { iframeStyles, errorOnlyStyles } from "./styles";
import { getGlobalMappingScript, getMountingScript } from "./scripts";

/**
 * Builds the full HTML shell for code execution within an iframe.
 */
export function buildExecutionIframe(
  bundledCode: string,
  framework: Framework,
): string {
  const isRN = framework === "react-native";
  const globalScript = getGlobalMappingScript();
  const mountingScript = getMountingScript(framework);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>${iframeStyles}</style>
</head>
<body>
  <div id="error-overlay"></div>
  <div id="root"></div>

  <script src="/vendor.bundle.js"></script>

  <script>${globalScript}</script>

  <script>
    try {
      if (!window.React || !window.ReactDOM || (${isRN} && !window.ReactNativeWeb)) {
        throw new Error("Vendor bundle failed to initialize globals.");
      }
      ${bundledCode}
    } catch (err) {
      window.__showError__('Execution Error:\\n' + err.stack);
    }
  </script>

  <script>${mountingScript}</script>
</body>
</html>`;
}

/**
 * Builds a simple error overlay HTML for when bundling or loading fails early.
 */
export function buildErrorIframe(errorMessage: string): string {
  const safeMessage = errorMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>${errorOnlyStyles}</style>
</head>
<body>
  <div id="error-overlay">${safeMessage}</div>
</body>
</html>`;
}
