"use client";

import { useMemo, useState } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function calculateAgeParts(birth: Date, today: Date) {
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += lastDayPrevMonth;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
}

export default function AgePage() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const today = useMemo(() => new Date(), []);

  const parsed = useMemo(() => {
    const d = Number(day);
    const m = Number(month);
    const y = Number(year);

    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) return null;
    if (y < 1900 || y > 2100) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;

    const birth = new Date(y, m - 1, d);

    // ungültige Daten wie 31.02. abfangen
    if (birth.getFullYear() !== y || birth.getMonth() !== m - 1 || birth.getDate() !== d) return null;

    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (birth > todayDateOnly) return null;

    const age = calculateAgeParts(birth, todayDateOnly);
    if (age.years < 0) return null;

    return { birth, age };
  }, [day, month, year, today]);

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
      <div style={{ width: "100%", maxWidth: 880 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, margin: 0, color: "#1b1b1b" }}>Alter</h1>

          <a
            href="/"
            style={{
              textDecoration: "none",
              fontWeight: 900,
              padding: "10px 14px",
              borderRadius: 14,
              border: "2px solid rgba(0,0,0,0.15)",
              background: "rgba(255,255,255,0.8)",
              color: "#111",
              boxShadow: "0 10px 0 rgba(0,0,0,0.10)",
            }}
          >
            ⟵ Start
          </a>
        </div>

        <p style={{ marginTop: 10, fontWeight: 700, color: "rgba(0,0,0,0.65)" }}>
          Geburtsdatum eingeben (TT / MM / JJJJ). Es wird nichts gespeichert.
        </p>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 14,
            padding: 18,
            borderRadius: 22,
            background: "rgba(255,255,255,0.78)",
            border: "2px solid rgba(0,0,0,0.12)",
            boxShadow: "0 14px 0 rgba(0,0,0,0.10), 0 22px 36px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "grid", gap: 6, fontWeight: 900 }}>
              Tag
              <input
                inputMode="numeric"
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="TT"
                style={{
                  width: 120,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "2px solid rgba(0,0,0,0.15)",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontWeight: 900 }}>
              Monat
              <input
                inputMode="numeric"
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="MM"
                style={{
                  width: 120,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "2px solid rgba(0,0,0,0.15)",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontWeight: 900 }}>
              Jahr
              <input
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="JJJJ"
                style={{
                  width: 160,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: "2px solid rgba(0,0,0,0.15)",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              />
            </label>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(0,0,0,0.10)",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            {parsed ? (
              <>
                <div style={{ fontSize: 16, opacity: 0.75 }}>
                  Geburtsdatum: {pad2(parsed.birth.getDate())}.{pad2(parsed.birth.getMonth() + 1)}.
                  {parsed.birth.getFullYear()}
                </div>
                <div style={{ fontSize: 26, marginTop: 6 }}>
                  {parsed.age.years} Jahre, {parsed.age.months} Monate, {parsed.age.days} Tage
                </div>
              </>
            ) : (
              <div style={{ opacity: 0.75 }}>Bitte ein gültiges Geburtsdatum eingeben.</div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setDay("");
              setMonth("");
              setYear("");
            }}
            style={{
              width: 240,
              padding: "12px 14px",
              borderRadius: 16,
              border: "2px solid rgba(0,0,0,0.15)",
              fontWeight: 900,
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 12px 0 rgba(0,0,0,0.10)",
              cursor: "pointer",
            }}
          >
            Eingabe löschen
          </button>
        </div>
      </div>
    </main>
  );
}
