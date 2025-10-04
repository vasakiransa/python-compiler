// Full Python IDE with default file, multiple file upload, save, and download functionality
import React, { useState, useRef } from "react";
import { PythonProvider, usePython } from "react-py";
import Editor from "@monaco-editor/react";

export default function App() {
  return (
    <PythonProvider>
      <PythonIDE />
    </PythonProvider>
  );
}

function PythonIDE() {
  const [files, setFiles] = useState({ "main.py": "" });
  const [selectedFile, setSelectedFile] = useState("main.py");
  const [code, setCode] = useState("");
  const fileInputRef = useRef(null);
  const { runPython, stdout, stderr, isRunning } = usePython();

  const handleFileUpload = async (e) => {
    const items = e.target.files;
    const newFiles = {};

    for (let i = 0; i < items.length; i++) {
      const file = items[i];
      if (file.name.endsWith(".py")) {
        const content = await file.text();
        newFiles[file.name] = content;
      }
    }

    setFiles((prev) => ({ ...prev, ...newFiles }));
  };

  const handleFileClick = (fileName) => {
    setSelectedFile(fileName);
    setCode(files[fileName]);
  };

  const handleSave = () => {
    if (!selectedFile) return;
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = selectedFile.split("/").pop();
    a.click();
  };

  const handleSaveAll = () => {
    const zip = require("jszip")();
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });
    zip.generateAsync({ type: "blob" }).then((content) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = "python-files.zip";
      a.click();
    });
  };

  const handleRun = () => {
    if (!isRunning) runPython(code);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Python IDE</h1>
        <div>
          <button style={styles.button} onClick={() => fileInputRef.current.click()}>Add Files</button>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept=".py"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
          <button style={styles.button} onClick={handleSave}>💾 Download File</button>
          <button style={styles.button} onClick={handleSaveAll}>💾 Download All</button>
          <button style={styles.button} onClick={handleRun} disabled={isRunning}>{isRunning ? "Running..." : "▶ Run"}</button>
        </div>
      </header>

      <div style={styles.main}>
        <aside style={styles.sidebar}>
          <h3 style={styles.sidebarTitle}>Files</h3>
          <ul style={styles.fileList}>
            {Object.keys(files).map((fileName) => (
              <li
                key={fileName}
                onClick={() => handleFileClick(fileName)}
                style={{
                  ...styles.fileItem,
                  backgroundColor: selectedFile === fileName ? "#0f62fe22" : "transparent",
                }}
              >
                {fileName.split("/").pop()}
              </li>
            ))}
          </ul>
        </aside>

        <section style={styles.editorSection}>
          <Editor
            height="100%"
            language="python"
            theme="vs-dark"
            value={code}
            onChange={(value) => {
              setCode(value || "");
              if (selectedFile) {
                setFiles((prev) => ({ ...prev, [selectedFile]: value }));
              }
            }}
            options={{
              fontSize: 16,
              minimap: { enabled: false },
              wordWrap: "on",
              tabSize: 4,
              fontFamily: "Fira Code, monospace",
              fontLigatures: true,
              smoothScrolling: true,
            }}
          />
        </section>

        <section style={styles.outputSection}>
          <h2 style={styles.outputHeader}>Output</h2>
          <pre style={styles.outputBox}>{stdout || "No output yet..."}</pre>
          {stderr && (
            <>
              <h2 style={styles.errorHeader}>Error</h2>
              <pre style={styles.errorBox}>{stderr}</pre>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "Fira Code, monospace",
    backgroundColor: "#1e1e1e",
    color: "#fff",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: "#121212",
    borderBottom: "1px solid #333",
  },
  title: {
    fontSize: 24,
    color: "#0f62fe",
    fontWeight: "bold",
  },
  button: {
    marginLeft: 10,
    padding: "0.5rem 1rem",
    backgroundColor: "#0f62fe",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  main: {
    display: "flex",
    flexGrow: 1,
    overflow: "hidden",
  },
  sidebar: {
    width: 200,
    backgroundColor: "#101010",
    borderRight: "1px solid #333",
    padding: "1rem",
    overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: 16,
    color: "#0f62fe",
    marginBottom: 10,
  },
  fileList: {
    listStyle: "none",
    padding: 0,
  },
  fileItem: {
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: 4,
    marginBottom: 4,
    transition: "background 0.3s",
  },
  editorSection: {
    flexGrow: 1,
    backgroundColor: "#1e1e1e",
  },
  outputSection: {
    width: 300,
    backgroundColor: "#121212",
    padding: "1rem",
    borderLeft: "1px solid #333",
    overflowY: "auto",
  },
  outputHeader: {
    color: "#0f62fe",
    fontSize: 18,
  },
  errorHeader: {
    color: "#ff4c4c",
    fontSize: 18,
    marginTop: 10,
  },
  outputBox: {
    backgroundColor: "#1e1e1e",
    color: "#eee",
    padding: "0.5rem",
    borderRadius: 6,
    whiteSpace: "pre-wrap",
  },
  errorBox: {
    backgroundColor: "#330000",
    color: "#ff4c4c",
    padding: "0.5rem",
    borderRadius: 6,
    whiteSpace: "pre-wrap",
  },
};
