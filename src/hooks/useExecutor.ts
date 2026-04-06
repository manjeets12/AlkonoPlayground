import { useEffect, useRef, useState } from "react";

export function useExecutor() {
  const workerRef = useRef<Worker | null>(null);

  const [status, setStatus] = useState("idle");
  const [output, setOutput] = useState("");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../worker/executor.worker.ts", import.meta.url),
      { type: "module" },
    );

    workerRef.current.onmessage = (e) => {
      const { type, code, error } = e.data;

      if (type === "success") {
        setOutput(code);
        setStatus("success");
      } else {
        setLogs([error]);
        setStatus("error");
      }
    };

    return () => workerRef.current?.terminate();
  }, []);

  const run = (code: string) => {
    setStatus("running");
    setLogs([]);
    workerRef.current?.postMessage({ code });
  };

  return { run, output, logs, status };
}
