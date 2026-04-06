import { useState } from "react";
import Editor from "./components/Editor";
import Preview from "./components/Preview";
import Logs from "./components/Logs";
import { useExecutor } from "./hooks/useExecutor";

function App() {
  const [code, setCode] = useState(`console.log("Hello World")`);

  const { run, output, logs, status } = useExecutor();

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      {/* Editor */}
      <div style={{ flex: 1 }}>
        <Editor code={code} onChange={setCode} />
      </div>

      {/* Right Panel */}
      <div style={{ width: "50%", display: "flex", flexDirection: "column" }}>
        <button onClick={() => run(code)}>Run ({status})</button>

        <div style={{ flex: 1 }}>
          <Preview code={output} />
        </div>

        <Logs logs={logs} />
      </div>
    </div>
  );
}

export default App;
