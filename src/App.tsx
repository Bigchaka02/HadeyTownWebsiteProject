import Scene from "./components/Scene";

export default function App() {
  return (
    <>
      {/* floating header (doesn't affect layout height) */}
      <header
        style={{
          position: "fixed",
          top: 8,
          left: 12,
          zIndex: 10,
          fontSize: 12,
          color: "white",
          opacity: 0.8,
          pointerEvents: "none",
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        HadeyTown · Part 1
      </header>

      {/* full-viewport canvas */}
      <div style={{ position: "fixed", inset: 0, background: "grey" }}>
        <Scene />
      </div>
    </>
  );
}
