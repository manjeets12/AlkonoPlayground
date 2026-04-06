import { useState, useRef, useCallback } from "react";
import type { FileMap } from "../hooks/useFileSystem";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FileExplorerProps {
  files: FileMap;
  activeFile: string;
  onOpen: (path: string) => void;
  onCreate: (path: string) => void;
  onDelete: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
}

// ─── Build virtual tree from flat FileMap ─────────────────────────────────────

interface TreeDir {
  kind: "dir";
  name: string;
  path: string;
  children: TreeNode[];
}

interface TreeFile {
  kind: "file";
  name: string;
  path: string;
}

type TreeNode = TreeDir | TreeFile;

function buildTree(files: FileMap): TreeDir {
  const root: TreeDir = { kind: "dir", name: "/", path: "", children: [] };

  for (const path of Object.keys(files).sort()) {
    const parts = path.split("/");
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join("/");

      if (isLast) {
        current.children.push({ kind: "file", name: part, path });
      } else {
        let dir = current.children.find(
          (c): c is TreeDir => c.kind === "dir" && c.name === part,
        );
        if (!dir) {
          dir = { kind: "dir", name: part, path: currentPath, children: [] };
          current.children.push(dir);
        }
        current = dir;
      }
    }
  }

  // Sort: dirs first, then files, both alphabetically
  function sortChildren(node: TreeDir) {
    node.children.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === "dir" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    node.children
      .filter((c): c is TreeDir => c.kind === "dir")
      .forEach(sortChildren);
  }
  sortChildren(root);

  return root;
}

// ─── File icon ────────────────────────────────────────────────────────────────

function FileIcon({ filename }: { filename: string }) {
  const ext = filename.split(".").pop() ?? "";
  const color = ["tsx", "jsx"].includes(ext)
    ? "#61dafb"
    : ["ts", "js"].includes(ext)
      ? "#3b7ff5"
      : ext === "json"
        ? "#f5a623"
        : "#8899bb";

  return (
    <span
      style={{
        color,
        fontSize: 9,
        width: 12,
        textAlign: "center",
        flexShrink: 0,
      }}
    >
      ◈
    </span>
  );
}

// ─── Tree node ────────────────────────────────────────────────────────────────

interface TreeNodeRowProps {
  node: TreeNode;
  depth: number;
  activeFile: string;
  onOpen: (path: string) => void;
  onDelete: (path: string) => void;
  onRename: (oldPath: string, newPath: string) => void;
}

function TreeNodeRow({
  node,
  depth,
  activeFile,
  onOpen,
  onDelete,
  onRename,
}: TreeNodeRowProps) {
  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const renameRef = useRef<HTMLInputElement>(null);

  const isActive = node.kind === "file" && node.path === activeFile;
  const indent = 8 + depth * 14;

  function handleClick() {
    if (node.kind === "dir") setExpanded((v) => !v);
    else onOpen(node.path);
  }

  function startRename(e: React.MouseEvent) {
    e.stopPropagation();
    setRenaming(true);
    setRenameValue(node.name);
    setTimeout(() => {
      renameRef.current?.select();
    }, 0);
  }

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== node.name) {
      const parts = node.path.split("/");
      parts[parts.length - 1] = trimmed;
      onRename(node.path, parts.join("/"));
    }
    setRenaming(false);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(`Delete "${node.name}"?`)) {
      onDelete(node.path);
    }
  }

  return (
    <>
      <div
        role={node.kind === "file" ? "button" : "treeitem"}
        tabIndex={0}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          padding: `3px ${indent}px 3px ${indent}px`,
          cursor: "pointer",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: isActive ? "#3b7ff5" : "#8899bb",
          background: isActive ? "#1a2340" : "transparent",
          borderLeft: `2px solid ${isActive ? "#3b7ff5" : "transparent"}`,
          paddingLeft: indent - 2,
          transition: "background 0.1s, color 0.1s",
          userSelect: "none",
          position: "relative",
        }}
        className="tree-node"
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        onMouseEnter={(e) => {
          const actions = (
            e.currentTarget as HTMLElement
          ).querySelector<HTMLElement>(".node-actions");
          if (actions) actions.style.display = "flex";
        }}
        onMouseLeave={(e) => {
          const actions = (
            e.currentTarget as HTMLElement
          ).querySelector<HTMLElement>(".node-actions");
          if (actions) actions.style.display = "none";
        }}
      >
        {/* Expand arrow or file icon */}
        {node.kind === "dir" ? (
          <span
            style={{
              fontSize: 8,
              color: "#f5a623",
              width: 12,
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            {expanded ? "▼" : "▶"}
          </span>
        ) : (
          <FileIcon filename={node.name} />
        )}

        {/* Name or rename input */}
        {renaming ? (
          <input
            ref={renameRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={commitRename}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") setRenaming(false);
              e.stopPropagation();
            }}
            style={{
              flex: 1,
              background: "#0a0f1e",
              border: "1px solid #3b7ff5",
              borderRadius: 3,
              padding: "1px 4px",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "#e8edf5",
              outline: "none",
              minWidth: 0,
            }}
          />
        ) : (
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {node.name}
          </span>
        )}

        {/* Hover actions */}
        <span
          className="node-actions"
          style={{ display: "none", gap: 2, marginLeft: "auto", flexShrink: 0 }}
        >
          <button title="Rename" onClick={startRename} style={actionBtnStyle}>
            ✎
          </button>
          {node.kind === "file" && (
            <button
              title="Delete"
              onClick={handleDelete}
              style={{ ...actionBtnStyle, color: "#f5524a" }}
            >
              ✕
            </button>
          )}
        </span>
      </div>

      {/* Children */}
      {node.kind === "dir" && expanded && (
        <>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activeFile={activeFile}
              onOpen={onOpen}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </>
      )}
    </>
  );
}

const actionBtnStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  border: "none",
  background: "transparent",
  cursor: "pointer",
  color: "#445577",
  fontSize: 11,
  borderRadius: 2,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
};

// ─── FileExplorer ─────────────────────────────────────────────────────────────

export default function FileExplorer({
  files,
  activeFile,
  onOpen,
  onCreate,
  onDelete,
  onRename,
}: FileExplorerProps) {
  const [creating, setCreating] = useState<"file" | "dir" | null>(null);
  const [newName, setNewName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const tree = buildTree(files);

  function startCreate(kind: "file" | "dir") {
    setCreating(kind);
    setNewName("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitCreate() {
    const name = newName.trim();
    if (name) {
      onCreate(name);
    }
    setCreating(null);
    setNewName("");
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* File tree */}
      <div style={{ flex: 1, overflowY: "auto" }} role="tree">
        {tree.children.map((node) => (
          <TreeNodeRow
            key={node.path}
            node={node}
            depth={0}
            activeFile={activeFile}
            onOpen={onOpen}
            onDelete={onDelete}
            onRename={onRename}
          />
        ))}

        {/* New file/folder inline input */}
        {creating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              borderLeft: "2px solid #3b7ff5",
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "#3b7ff5",
                width: 12,
                textAlign: "center",
              }}
            >
              {creating === "dir" ? "▶" : "◈"}
            </span>
            <input
              ref={inputRef}
              placeholder={creating === "dir" ? "folder-name" : "filename.tsx"}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={commitCreate}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCreate();
                if (e.key === "Escape") setCreating(null);
              }}
              style={{
                flex: 1,
                background: "#0a0f1e",
                border: "1px solid #3b7ff5",
                borderRadius: 3,
                padding: "2px 6px",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "#e8edf5",
                outline: "none",
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: "6px 8px",
          borderTop: "1px solid #1e2d4a",
          flexShrink: 0,
        }}
      >
        {(["file", "dir"] as const).map((kind) => (
          <button
            key={kind}
            onClick={() => startCreate(kind)}
            title={`New ${kind}`}
            style={{
              flex: 1,
              padding: "4px 0",
              background: "transparent",
              border: "1px dashed #1e2d4a",
              borderRadius: 3,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              color: "#445577",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.borderColor = "#3b7ff5";
              (e.target as HTMLElement).style.color = "#3b7ff5";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.borderColor = "#1e2d4a";
              (e.target as HTMLElement).style.color = "#445577";
            }}
          >
            + {kind}
          </button>
        ))}
      </div>
    </div>
  );
}
