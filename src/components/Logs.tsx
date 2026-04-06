export default function Logs({ logs }: { logs: string[] }) {
  return (
    <div
      style={{
        background: "#020617",
        color: "#e2e8f0",
        padding: "10px",
        fontSize: "12px",
        height: "150px",
        overflow: "auto",
        borderTop: "1px solid #1e293b",
      }}
    >
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  );
}
