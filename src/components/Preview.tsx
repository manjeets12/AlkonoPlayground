import { useEffect, useRef } from "react";

export default function Preview({ code }: { code: string }) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
      <html>
        <body>
          <div id="root"></div>
          <script>
            try {
              ${code}
            } catch (err) {
              document.body.innerHTML = "<pre style='color:red'>" + err + "</pre>";
            }
          </script>
        </body>
      </html>
    `);
    doc.close();
  }, [code]);

  return (
    <iframe
      ref={iframeRef}
      style={{ width: "100%", height: "100%", border: "none" }}
      title="preview"
    />
  );
}
