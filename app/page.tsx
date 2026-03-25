export default function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#0b0f1a",
        color: "white",
        textAlign: "center"
      }}
    >
      <h1>AI that tells you what to post daily</h1>
      <p>3 viral ideas. Hooks included. No thinking needed.</p>
      <a
        href="/bot"
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          background: "#22c55e",
          borderRadius: "10px",
          textDecoration: "none",
          color: "black",
          fontWeight: "bold"
        }}
      >
        Try it now
      </a>
    </div>
  );
}
