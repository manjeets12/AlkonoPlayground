interface TabBarProps {
  openTabs: string[];
  activeFile: string;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

export default function TabBar({
  openTabs,
  activeFile,
  onSelect,
  onClose,
}: TabBarProps) {
  if (openTabs.length === 0) return null;

  return (
    <div
      role="tablist"
      style={{
        display: "flex",
        alignItems: "stretch",
        background: "#0a0f1e",
        borderBottom: "1px solid #1e2d4a",
        overflowX: "auto",
        minHeight: 34,
        flexShrink: 0,
      }}
    >
      {openTabs.map((path) => {
        const filename = path.split("/").pop() ?? path;
        const dotIndex = filename.lastIndexOf(".");
        const base = dotIndex > 0 ? filename.slice(0, dotIndex) : filename;
        const ext = dotIndex > 0 ? filename.slice(dotIndex) : "";
        const isActive = path === activeFile;

        return (
          <div
            key={path}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onClick={() => onSelect(path)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(path)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "0 12px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: isActive ? "#e8edf5" : "#445577",
              background: isActive ? "#060912" : "transparent",
              borderRight: "1px solid #1e2d4a",
              borderBottom: isActive
                ? "1px solid #3b7ff5"
                : "1px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "color 0.15s, background 0.15s",
              userSelect: "none",
              position: "relative",
              paddingBottom: isActive ? 0 : 1,
            }}
          >
            <span>{base}</span>
            <span style={{ color: isActive ? "#445577" : "#2a3d5e" }}>
              {ext}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose(path);
              }}
              aria-label={`Close ${filename}`}
              style={{
                width: 16,
                height: 16,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#2a3d5e",
                fontSize: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                padding: 0,
                marginLeft: 2,
                transition: "background 0.1s, color 0.1s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "#1e2d4a";
                (e.target as HTMLElement).style.color = "#e8edf5";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent";
                (e.target as HTMLElement).style.color = "#2a3d5e";
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
