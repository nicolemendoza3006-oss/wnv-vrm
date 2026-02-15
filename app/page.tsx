export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        backgroundImage:
          "linear-gradient(180deg, #bfe9ff 0%, #ffe7b8 35%, #ffd1dc 60%, #fff6d6 85%, #ffffff 100%)",
      }}
    >
      <div style={{ width: "100%", maxWidth: 980 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div
            style={{
              display: "inline-block",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(0,0,0,0.10)",
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            Arbeitsbereich
          </div>

          <h1
            style={{
              margin: "14px 0 6px",
              fontSize: 78,
              fontWeight: 1000,
              letterSpacing: 6,
              color: "#1b1b1b",
              textShadow: "0 4px 0 rgba(255,255,255,0.7), 0 16px 30px rgba(0,0,0,0.12)",
            }}
          >
            WNV
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 800,
              color: "rgba(0,0,0,0.65)",
            }}
          >
            Alterberechnung & VRM-Test (vorwärts / rückwärts)
          </p>
        </div>

        {/* Content Card */}
        <div
          style={{
            marginTop: 22,
            padding: 18,
            borderRadius: 26,
            background: "rgba(255,255,255,0.78)",
            border: "2px solid rgba(0,0,0,0.10)",
            boxShadow: "0 14px 0 rgba(0,0,0,0.10), 0 22px 36px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                display: "grid",
                gap: 6,
                padding: 14,
                borderRadius: 18,
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 16 }}>Hinweis</div>
              <div style={{ fontWeight: 700, color: "rgba(0,0,0,0.65)" }}>
                Es werden keine personenbezogenen Daten gespeichert. Alles wird nur während der Nutzung im
                Arbeitsspeicher gehalten.
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              <a
                href="/age"
                style={{
                  flex: "1 1 280px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "26px 18px",
                  borderRadius: 24,
                  textDecoration: "none",
                  fontSize: 22,
                  fontWeight: 1000,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#111",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #f6fbff 55%, #e3f3ff 100%)",
                  border: "2px solid rgba(0,0,0,0.14)",
                  boxShadow:
                    "0 16px 0 rgba(0,0,0,0.12), 0 26px 44px rgba(0,0,0,0.18)",
                }}
              >
                Alter
              </a>

              <a
                href="/test"
                style={{
                  flex: "1 1 280px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "26px 18px",
                  borderRadius: 24,
                  textDecoration: "none",
                  fontSize: 22,
                  fontWeight: 1000,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  color: "#111",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #fff7f3 55%, #ffe6dc 100%)",
                  border: "2px solid rgba(0,0,0,0.14)",
                  boxShadow:
                    "0 16px 0 rgba(0,0,0,0.12), 0 26px 44px rgba(0,0,0,0.18)",
                }}
              >
                Test
              </a>
            </div>
          </div>
        </div>

        {/* Footer Line */}
        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontWeight: 800,
            color: "rgba(0,0,0,0.55)",
          }}
        >
          Version 0.1
        </div>
      </div>
    </main>
  );
}
