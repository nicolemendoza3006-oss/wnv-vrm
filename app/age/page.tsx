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
    const lastDayPrevMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      0
    ).getDate();
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

    if (!Number.isInteger(d) || !Number.isInteger(m) || !Number.isInteger(y)) {
      return null;
    }
    if (y < 1900 || y > 2100) return null;
    if (m < 1 || m > 12) return null;
    if (d < 1 || d > 31) return null;

    const birth = new Date(y, m - 1, d);

    if (
      birth.getFullYear() !== y ||
      birth.getMonth() !== m - 1 ||
      birth.getDate() !== d
    ) {
      return null;
    }

    const todayDateOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    if (birth > todayDateOnly) return null;

    const age = calculateAgeParts(birth, todayDateOnly);
    if (age.years < 0) return null;

    return { birth, age };
  }, [day, month, year, today]);

  const theme = {
    text: "#111111",
    subText: "#111111",
    cardBg: "rgba(255,255,255,0.78)",
    cardBorder: "2px solid rgba(0,0,0,0.12)",
    softCardBg: "rgba(255,255,255,0.85)",
    buttonBg: "rgba(255,255,255,0.9)",
    inputBg: "#ffffff",
    inputText: "#111111",
    inputBorder: "2px solid rgba(0,0,0,0.15)",
    shadow: "0 14px 0 rgba(0,0,0,0.10), 0 22px 36px rgba(0,0,0,0.12)",
    smallShadow: "0 10px 0 rgba(0,0,0,0.10)",
  };

  return (
    <main
      className="wnv-bg"
      style={{
        minHeight: "100vh",
        padding: 24,
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        color: theme.text,
      }}
    >
      <div style={{ width: "100%", maxWidth: 880 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h1
            style={{
              fontSize: 44,
              fontWeight: 900,
              margin: 0,
              color: theme.text,
            }}
          >
            Alter
          </h1>

          <a
            href="/"
            style={{
              textDecoration: "none",
              fontWeight: 900,
              padding: "10px 14px",
              borderRadius: 14,
              border: theme.inputBorder,
              background: theme.buttonBg,
              color: theme.text,
              boxShadow: theme.smallShadow,
            }}
          >
            ⟵ Start
          </a>
        </div>

        <p
          style={{
            marginTop: 10,
            fontWeight: 700,
            color: theme.subText,
          }}
        >
          Geburtsdatum eingeben (TT / MM / JJJJ). Es wird nichts gespeichert.
        </p>

        <div
          style={{
            marginTop: 16,
            display: "grid",
            gap: 14,
            padding: 18,
            borderRadius: 22,
            background: theme.cardBg,
            border: theme.cardBorder,
            boxShadow: theme.shadow,
            backdropFilter: "blur(8px)",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <label style={{ display: "grid", gap: 6, fontWeight: 900, color: "#111111" }}>
              Tag
              <input
                inputMode="numeric"
                value={day}
                onChange={(e) =>
                  setDay(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                placeholder="TT"
                style={{
                  width: 120,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: theme.inputBorder,
                  fontSize: 18,
                  fontWeight: 900,
                  background: theme.inputBg,
                  color: theme.inputText,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontWeight: 900, color: "#111111" }}>
              Monat
              <input
                inputMode="numeric"
                value={month}
                onChange={(e) =>
                  setMonth(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
                placeholder="MM"
                style={{
                  width: 120,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: theme.inputBorder,
                  fontSize: 18,
                  fontWeight: 900,
                  background: theme.inputBg,
                  color: theme.inputText,
                  outline: "none",
                }}
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontWeight: 900, color: "#111111" }}>
              Jahr
              <input
                inputMode="numeric"
                value={year}
                onChange={(e) =>
                  setYear(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="JJJJ"
                style={{
                  width: 160,
                  padding: "12px 12px",
                  borderRadius: 14,
                  border: theme.inputBorder,
                  fontSize: 18,
                  fontWeight: 900,
                  background: theme.inputBg,
                  color: theme.inputText,
                  outline: "none",
                }}
              />
            </label>
          </div>

          <div
            style={{
              padding: 14,
              borderRadius: 16,
              background: theme.softCardBg,
              border: "1px solid rgba(0,0,0,0.10)",
              fontWeight: 900,
              fontSize: 18,
              color: theme.text,
            }}
          >
            {parsed ? (
              <>
                <div style={{ fontSize: 16, color: "#111111" }}>
                  Geburtsdatum: {pad2(parsed.birth.getDate())}.
                  {pad2(parsed.birth.getMonth() + 1)}.
                  {parsed.birth.getFullYear()}
                </div>
                <div style={{ fontSize: 26, marginTop: 6, color: "#111111" }}>
                  {parsed.age.years} Jahre, {parsed.age.months} Monate,{" "}
                  {parsed.age.days} Tage
                </div>
              </>
            ) : (
              <div style={{ color: "#111111" }}>
                Bitte ein gültiges Geburtsdatum eingeben.
              </div>
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
              maxWidth: "100%",
              padding: "12px 14px",
              borderRadius: 16,
              border: theme.inputBorder,
              fontWeight: 900,
              background: theme.buttonBg,
              color: theme.text,
              boxShadow: theme.smallShadow,
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