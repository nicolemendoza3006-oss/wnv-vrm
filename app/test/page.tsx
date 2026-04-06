"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Screen = "MENU" | "VRM_V" | "VRM_R" | "RESULTS";

type VrmPhase =
  | "IDLE"
  | "EXAMPLE_SHOW"
  | "EXAMPLE_TESTER_CLICK"
  | "PRACTICE_SHOW"
  | "PRACTICE_INPUT"
  | "TEST_SHOW"
  | "TEST_INPUT"
  | "FINISHED";

type AttemptRow = {
  taskNo: number;
  attemptNo: 1 | 2;
  shown: number[];
  answer: number[];
  pointsAttempt: 0 | 1;
};

function fmtSeq(seq: number[]) {
  return seq.length ? seq.join(" - ") : "–";
}

function reverseCopy(a: number[]) {
  return [...a].reverse();
}

function CubeButton({
  id,
  highlighted,
  disabled,
  onClick,
  showDebugNumber,
  isDark,
}: {
  id: number;
  highlighted?: boolean;
  disabled?: boolean;
  onClick: (id: number) => void;
  showDebugNumber?: boolean;
  isDark: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      disabled={disabled}
      aria-label={`Button ${id}`}
      style={{
        width: "clamp(54px, 7vw, 78px)",
        height: "clamp(54px, 7vw, 78px)",
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: disabled ? "not-allowed" : "pointer",
        outline: "none",
        WebkitTapHighlightColor: "transparent",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 14,
          background: highlighted
            ? "linear-gradient(180deg, #ff9aa2 0%, #ff3b3b 55%, #c40000 100%)"
            : "linear-gradient(180deg, #4fb1ff 0%, #167dff 55%, #0b55d8 100%)",
          border: highlighted
            ? "2px solid rgba(255,255,255,0.85)"
            : isDark
            ? "2px solid rgba(255,255,255,0.10)"
            : "2px solid rgba(0,0,0,0.12)",
          boxShadow: highlighted
            ? "0 0 0 6px rgba(255,255,255,0.30), 0 16px 0 rgba(0,0,0,0.16), 0 26px 40px rgba(0,0,0,0.22)"
            : "0 16px 0 rgba(0,0,0,0.16), 0 26px 40px rgba(0,0,0,0.22)",
          position: "relative",
          transform: highlighted ? "translateY(-2px)" : "translateY(0px)",
          transition:
            "transform 120ms ease, box-shadow 120ms ease, background 120ms ease",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 8,
            borderRadius: 10,
            background: highlighted
              ? "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 55%, rgba(0,0,0,0.10) 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 55%, rgba(0,0,0,0.14) 100%)",
            pointerEvents: "none",
          }}
        />

        {showDebugNumber ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              fontWeight: 1000,
              fontSize: 26,
              color: "rgba(255,255,255,0.92)",
              textShadow: "0 2px 0 rgba(0,0,0,0.25)",
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {id}
          </div>
        ) : null}
      </div>
    </button>
  );
}

const TASKS_V: number[][][] = [
  [[3, 10], [7, 4]],
  [[1, 9, 3], [8, 2, 7]],
  [[4, 9, 1, 6], [10, 6, 2, 7]],
  [[6, 5, 1, 4, 8], [5, 7, 9, 8, 2]],
  [[4, 1, 9, 3, 8, 10], [9, 2, 6, 7, 3, 5]],
  [[10, 1, 6, 4, 8, 5, 7], [2, 6, 3, 8, 2, 10, 1]],
  [[7, 3, 10, 5, 7, 8, 4, 9], [6, 9, 3, 2, 1, 7, 10, 5]],
  [[5, 8, 4, 10, 7, 3, 1, 9, 6], [8, 2, 6, 1, 10, 3, 7, 4, 9]],
];

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetY: number;
  hue: number;
  alive: boolean;
  trail: { x: number; y: number }[];
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  decay: number;
  size: number;
  hue: number;
};

function RocketsFireworksOverlay() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    const resize = () => {
      canvas.width = Math.floor(W() * dpr);
      canvas.height = Math.floor(H() * dpr);
      canvas.style.width = `${W()}px`;
      canvas.style.height = `${H()}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const rockets: Rocket[] = [];
    const sparks: Spark[] = [];

    const drawNight = () => {
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W(), H());
      const g = ctx.createLinearGradient(0, 0, 0, H());
      g.addColorStop(0, "rgba(0,0,0,0.45)");
      g.addColorStop(0.55, "rgba(0,0,0,0.22)");
      g.addColorStop(1, "rgba(0,0,0,0.12)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W(), H());
    };

    const glow = (x: number, y: number, r: number, hue: number, a: number) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 10);
      g.addColorStop(0, `hsla(${hue}, 100%, 70%, ${a})`);
      g.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 10, 0, Math.PI * 2);
      ctx.fill();
    };

    const explode = (x: number, y: number, hue: number) => {
      const count = Math.floor(rand(110, 170));
      for (let i = 0; i < count; i++) {
        const ang = rand(0, Math.PI * 2);
        const sp = rand(2.4, 7.6);
        sparks.push({
          x,
          y,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp,
          life: 1,
          decay: rand(0.01, 0.018),
          size: rand(1.8, 3.4),
          hue: hue + rand(-20, 20),
        });
      }
    };

    const spawnRocket = () => {
      const x = rand(W() * 0.12, W() * 0.88);
      const y = H() + rand(40, 120);
      const targetY = rand(H() * 0.1, H() * 0.4);

      rockets.push({
        x,
        y,
        vx: rand(-1.6, 1.6),
        vy: -rand(12, 17),
        targetY,
        hue: rand(0, 360),
        alive: true,
        trail: [],
      });
    };

    spawnRocket();
    spawnRocket();
    spawnRocket();

    const t0 = performance.now();
    let lastSpawn = 0;

    const loop = (now: number) => {
      if (!running) return;

      drawNight();

      if (now - t0 < 2200 && now - lastSpawn > 220) {
        lastSpawn = now;
        spawnRocket();
      }

      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        if (!r.alive) {
          rockets.splice(i, 1);
          continue;
        }

        r.x += r.vx;
        r.y += r.vy;

        r.trail.unshift({ x: r.x, y: r.y });
        if (r.trail.length > 34) r.trail.pop();

        if (r.trail.length > 2) {
          ctx.lineWidth = 3.6;
          ctx.lineCap = "round";
          ctx.strokeStyle = `hsla(${r.hue},100%,65%,0.55)`;
          ctx.beginPath();
          ctx.moveTo(r.trail[r.trail.length - 1].x, r.trail[r.trail.length - 1].y);
          for (let k = r.trail.length - 2; k >= 0; k--) {
            ctx.lineTo(r.trail[k].x, r.trail[k].y);
          }
          ctx.stroke();
        }

        glow(r.x, r.y, 3, r.hue, 0.9);
        ctx.fillStyle = `hsla(${r.hue},100%,78%,1)`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 2.4, 7.2, 0, 0, Math.PI * 2);
        ctx.fill();

        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.hue);
          r.alive = false;
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;

        p.vy += 0.09;
        p.vx *= 0.985;
        p.vy *= 0.985;

        p.life -= p.decay;
        const a = Math.max(0, p.life);

        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.strokeStyle = `hsla(${p.hue},100%,70%,${a})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 1.8, p.y - p.vy * 1.8);
        ctx.stroke();

        glow(p.x, p.y, p.size, p.hue, a * 0.75);

        if (p.life <= 0 || p.y > H() + 160) sparks.splice(i, 1);
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function TestPage() {
  const [screen, setScreen] = useState<Screen>("MENU");
  const [showDebugNumber, setShowDebugNumber] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => setIsDark(media.matches);
    updateTheme();
    media.addEventListener("change", updateTheme);
    return () => media.removeEventListener("change", updateTheme);
  }, []);

  const theme = isDark
    ? {
        text: "#f8fafc",
        subText: "rgba(248,250,252,0.72)",
        softText: "rgba(248,250,252,0.82)",
        chipBg: "rgba(15,23,42,0.82)",
        chipBorder: "1px solid rgba(255,255,255,0.10)",
        cardBg: "rgba(17,24,39,0.88)",
        cardBorder: "2px solid rgba(255,255,255,0.08)",
        innerBg: "rgba(30,41,59,0.88)",
        buttonBg: "rgba(30,41,59,0.94)",
        boardBg: "rgba(15,23,42,0.92)",
        shadow: "0 14px 0 rgba(0,0,0,0.25), 0 22px 36px rgba(0,0,0,0.35)",
        smallShadow: "0 10px 0 rgba(0,0,0,0.20)",
        overlayBg: "rgba(0,0,0,0.35)",
        tableBorder: "rgba(255,255,255,0.10)",
        emptyText: "rgba(248,250,252,0.38)",
      }
    : {
        text: "#1b1b1b",
        subText: "rgba(0,0,0,0.65)",
        softText: "rgba(0,0,0,0.75)",
        chipBg: "rgba(255,255,255,0.75)",
        chipBorder: "1px solid rgba(0,0,0,0.10)",
        cardBg: "rgba(255,255,255,0.86)",
        cardBorder: "2px solid rgba(0,0,0,0.10)",
        innerBg: "rgba(255,255,255,0.90)",
        buttonBg: "rgba(255,255,255,0.90)",
        boardBg: "rgba(255,255,255,0.92)",
        shadow: "0 14px 0 rgba(0,0,0,0.10), 0 22px 36px rgba(0,0,0,0.12)",
        smallShadow: "0 10px 0 rgba(0,0,0,0.10)",
        overlayBg: "rgba(255,255,255,0.25)",
        tableBorder: "rgba(0,0,0,0.10)",
        emptyText: "rgba(0,0,0,0.35)",
      };

  const positions = [
    { id: 1, left: 18, top: 16 },
    { id: 2, left: 45, top: 28 },
    { id: 6, left: 63, top: 16 },
    { id: 7, left: 83, top: 22 },
    { id: 3, left: 22, top: 44 },
    { id: 8, left: 78, top: 44 },
    { id: 4, left: 8, top: 68 },
    { id: 5, left: 30, top: 76 },
    { id: 9, left: 68, top: 68 },
    { id: 10, left: 86, top: 78 },
  ];

  const title =
    screen === "MENU"
      ? "Test"
      : screen === "VRM_V"
      ? "VRM-V"
      : screen === "VRM_R"
      ? "VRM-R"
      : "Ergebnisse";

  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [thumbOverlay, setThumbOverlay] = useState(false);
  const [handOverlay, setHandOverlay] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);

  function sleep(ms: number) {
    return new Promise<void>((resolve) => setTimeout(resolve, ms));
  }

  const presentingRef = useRef(false);
  const [presenting, setPresenting] = useState(false);

  function setPresentingSafe(v: boolean) {
    presentingRef.current = v;
    setPresenting(v);
  }

  const seqLockRef = useRef(0);

  async function showSequence(seq: number[]) {
    const token = ++seqLockRef.current;
    setPresentingSafe(true);
    setHighlighted(null);

    try {
      await sleep(500);
      for (const id of seq) {
        if (token !== seqLockRef.current) return;
        setHighlighted(id);
        await sleep(500);
        setHighlighted(null);
        await sleep(500);
      }
    } finally {
      if (token === seqLockRef.current) setPresentingSafe(false);
    }
  }

  async function flashThumb() {
    setThumbOverlay(true);
    await sleep(500);
    setThumbOverlay(false);
  }

  async function flashHand() {
    setHandOverlay(true);
    await sleep(500);
    setHandOverlay(false);
  }

  async function fireworksAndBackToMenu() {
    setShowFireworks(true);
    await sleep(3000);
    setShowFireworks(false);
    setScreen("MENU");
  }

  function isCorrect(expected: number[], answer: number[]) {
    if (expected.length !== answer.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== answer[i]) return false;
    }
    return true;
  }

  const outcomeVRef = useRef<Record<number, { a1?: 0 | 1; a2?: 0 | 1 }>>({});
  const outcomeRRef = useRef<Record<number, { a1?: 0 | 1; a2?: 0 | 1 }>>({});

  const [phaseV, setPhaseV] = useState<VrmPhase>("IDLE");
  const [msgV, setMsgV] = useState("");
  const [canClickV, setCanClickV] = useState(false);
  const [currentShownV, setCurrentShownV] = useState<number[]>([]);
  const [currentExpectedV, setCurrentExpectedV] = useState<number[]>([]);
  const [inputV, setInputV] = useState<number[]>([]);
  const [practiceIndexV, setPracticeIndexV] = useState(0);
  const [taskIndexV, setTaskIndexV] = useState(0);
  const [attemptIndexV, setAttemptIndexV] = useState<0 | 1>(0);
  const [rowsV, setRowsV] = useState<AttemptRow[]>([]);

  const VRMV_EXAMPLE = [10, 1];
  const VRMV_PRACTICE = [
    [1, 6],
    [5, 8],
  ];

  const [phaseR, setPhaseR] = useState<VrmPhase>("IDLE");
  const [msgR, setMsgR] = useState("");
  const [canClickR, setCanClickR] = useState(false);
  const [currentShownR, setCurrentShownR] = useState<number[]>([]);
  const [currentExpectedR, setCurrentExpectedR] = useState<number[]>([]);
  const [inputR, setInputR] = useState<number[]>([]);
  const [practiceIndexR, setPracticeIndexR] = useState(0);
  const [taskIndexR, setTaskIndexR] = useState(0);
  const [attemptIndexR, setAttemptIndexR] = useState<0 | 1>(0);
  const [rowsR, setRowsR] = useState<AttemptRow[]>([]);

  const VRMR_EXAMPLE = [10, 1];
  const VRMR_PRACTICE = [
    [5, 8],
    [1, 6],
  ];

  const TASKS_R = useMemo(() => TASKS_V.map((pair) => [pair[1], pair[0]]), []);

  async function startVRMV() {
    seqLockRef.current++;
    outcomeVRef.current = {};

    setPhaseV("EXAMPLE_SHOW");
    setMsgV("Beispiel wird gezeigt…");
    setCanClickV(false);
    setInputV([]);

    setPracticeIndexV(0);
    setTaskIndexV(0);
    setAttemptIndexV(0);
    setRowsV([]);

    setCurrentShownV(VRMV_EXAMPLE);
    setCurrentExpectedV(VRMV_EXAMPLE);

    await showSequence(VRMV_EXAMPLE);

    setPhaseV("EXAMPLE_TESTER_CLICK");
    setMsgV("Jetzt klickt die Testleitung dieselben Würfel (Beispiel).");
    setCanClickV(true);
  }

  async function startPracticeV(i: number) {
    setPhaseV("PRACTICE_SHOW");
    setMsgV(`Übung ${i + 1} wird gezeigt…`);
    setCanClickV(false);
    setInputV([]);

    const shown = VRMV_PRACTICE[i];
    setCurrentShownV(shown);
    setCurrentExpectedV(shown);

    await showSequence(shown);

    setPhaseV("PRACTICE_INPUT");
    setMsgV(`Übung ${i + 1}: Bitte nachklicken.`);
    setCanClickV(true);
  }

  async function startTestAttemptV(tIndex: number, aIndex: 0 | 1) {
    setPhaseV("TEST_SHOW");
    setMsgV(`Aufgabe ${tIndex + 1}, Versuch ${aIndex + 1} wird gezeigt…`);
    setCanClickV(false);
    setInputV([]);

    const shown = TASKS_V[tIndex][aIndex];
    setCurrentShownV(shown);
    setCurrentExpectedV(shown);

    await showSequence(shown);

    setPhaseV("TEST_INPUT");
    setMsgV(`Aufgabe ${tIndex + 1}, Versuch ${aIndex + 1}: Bitte nachklicken.`);
    setCanClickV(true);
  }

  async function finishVRMV(reason: string) {
    setPhaseV("FINISHED");
    setMsgV(reason);
    setCanClickV(false);
    await fireworksAndBackToMenu();
  }

  function handleClickVRMV_Stable(id: number) {
    setHighlighted(id);
    window.setTimeout(() => setHighlighted(null), 160);

    if (presentingRef.current) return;
    if (!canClickV) return;

    setInputV((prev) => {
      const next = [...prev, id].slice(0, currentExpectedV.length);
      if (next.length !== currentExpectedV.length) return next;

      setCanClickV(false);
      const correct = isCorrect(currentExpectedV, next);
      const pointsAttempt: 0 | 1 = correct ? 1 : 0;

      void (async () => {
        if (phaseV === "EXAMPLE_TESTER_CLICK") {
          if (correct) {
            await flashThumb();
            setMsgV("Richtig. Jetzt beginnt die Übung.");
            await startPracticeV(0);
          } else {
            await flashHand();
            setMsgV("Falsch. Beispiel wird wiederholt (vorwärts klicken).");
            setInputV([]);
            setCanClickV(false);

            await showSequence(currentShownV);

            setPhaseV("EXAMPLE_TESTER_CLICK");
            setMsgV("Nochmal: Bitte dieselben Würfel vorwärts klicken (Beispiel).");
            setCanClickV(true);
          }
          return;
        }

        if (phaseV === "PRACTICE_INPUT") {
          if (correct) {
            await flashThumb();
            const nextP = practiceIndexV + 1;
            if (nextP < VRMV_PRACTICE.length) {
              setPracticeIndexV(nextP);
              await startPracticeV(nextP);
            } else {
              setMsgV("Test startet…");
              await startTestAttemptV(0, 0);
            }
          } else {
            await flashHand();
            setMsgV("Falsch. Übung wird wiederholt (vorwärts klicken).");
            setInputV([]);
            setCanClickV(false);

            await showSequence(currentShownV);

            setPhaseV("PRACTICE_INPUT");
            setMsgV(`Nochmal: Übung ${practiceIndexV + 1} bitte nachklicken.`);
            setCanClickV(true);
          }
          return;
        }

        if (phaseV === "TEST_INPUT") {
          await flashThumb();

          const taskNo = taskIndexV + 1;
          const attemptNo = (attemptIndexV + 1) as 1 | 2;

          setRowsV((rows) => {
            const newRow: AttemptRow = {
              taskNo,
              attemptNo,
              shown: currentShownV,
              answer: next,
              pointsAttempt,
            };
            const filtered = rows.filter(
              (r) => !(r.taskNo === taskNo && r.attemptNo === attemptNo)
            );
            return [...filtered, newRow].sort((a, b) => {
              if (a.taskNo !== b.taskNo) return a.taskNo - b.taskNo;
              return a.attemptNo - b.attemptNo;
            });
          });

          const prevOut = outcomeVRef.current[taskNo] || {};
          outcomeVRef.current[taskNo] = {
            ...prevOut,
            ...(attemptNo === 1 ? { a1: pointsAttempt } : { a2: pointsAttempt }),
          };

          if (attemptIndexV === 0) {
            setAttemptIndexV(1);
            await startTestAttemptV(taskIndexV, 1);
            return;
          }

          const out = outcomeVRef.current[taskNo] || {};
          const a1 = out.a1 ?? 0;
          const a2 = out.a2 ?? 0;
          const anyCorrect = a1 + a2 >= 1;

          if (!anyCorrect) {
            await finishVRMV("VRM-V beendet (Abbruchregel: beide Versuche falsch).");
            return;
          }

          const nextTask = taskIndexV + 1;
          if (nextTask < TASKS_V.length) {
            setTaskIndexV(nextTask);
            setAttemptIndexV(0);
            await startTestAttemptV(nextTask, 0);
          } else {
            await finishVRMV("VRM-V abgeschlossen.");
          }
          return;
        }
      })();

      return next;
    });
  }

  async function startVRMR() {
    seqLockRef.current++;
    outcomeRRef.current = {};

    setPhaseR("EXAMPLE_SHOW");
    setMsgR("Beispiel wird gezeigt…");
    setCanClickR(false);
    setInputR([]);

    setPracticeIndexR(0);
    setTaskIndexR(0);
    setAttemptIndexR(0);
    setRowsR([]);

    setCurrentShownR(VRMR_EXAMPLE);
    setCurrentExpectedR(reverseCopy(VRMR_EXAMPLE));

    await showSequence(VRMR_EXAMPLE);

    setPhaseR("EXAMPLE_TESTER_CLICK");
    setMsgR("Jetzt klickt die Testleitung rückwärts (Beispiel).");
    setCanClickR(true);
  }

  async function startPracticeR(i: number) {
    setPhaseR("PRACTICE_SHOW");
    setMsgR(`Übung ${i + 1} wird gezeigt…`);
    setCanClickR(false);
    setInputR([]);

    const shown = VRMR_PRACTICE[i];
    setCurrentShownR(shown);
    setCurrentExpectedR(reverseCopy(shown));

    await showSequence(shown);

    setPhaseR("PRACTICE_INPUT");
    setMsgR(`Übung ${i + 1}: Bitte rückwärts nachklicken.`);
    setCanClickR(true);
  }

  async function startTestAttemptR(tIndex: number, aIndex: 0 | 1) {
    setPhaseR("TEST_SHOW");
    setMsgR(`Aufgabe ${tIndex + 1}, Versuch ${aIndex + 1} wird gezeigt…`);
    setCanClickR(false);
    setInputR([]);

    const shown = TASKS_R[tIndex][aIndex];
    setCurrentShownR(shown);
    setCurrentExpectedR(reverseCopy(shown));

    await showSequence(shown);

    setPhaseR("TEST_INPUT");
    setMsgR(`Aufgabe ${tIndex + 1}, Versuch ${aIndex + 1}: Bitte rückwärts nachklicken.`);
    setCanClickR(true);
  }

  async function finishVRMR(reason: string) {
    setPhaseR("FINISHED");
    setMsgR(reason);
    setCanClickR(false);
    await fireworksAndBackToMenu();
  }

  function handleClickVRMR_Stable(id: number) {
    setHighlighted(id);
    window.setTimeout(() => setHighlighted(null), 160);

    if (presentingRef.current) return;
    if (!canClickR) return;

    setInputR((prev) => {
      const next = [...prev, id].slice(0, currentExpectedR.length);
      if (next.length !== currentExpectedR.length) return next;

      setCanClickR(false);
      const correct = isCorrect(currentExpectedR, next);
      const pointsAttempt: 0 | 1 = correct ? 1 : 0;

      void (async () => {
        if (phaseR === "EXAMPLE_TESTER_CLICK") {
          if (correct) {
            await flashThumb();
            setMsgR("Richtig. Jetzt beginnt die Übung.");
            await startPracticeR(0);
          } else {
            await flashHand();
            setMsgR("Falsch. Beispiel wird wiederholt (rückwärts klicken).");
            setInputR([]);
            setCanClickR(false);

            await showSequence(currentShownR);

            setPhaseR("EXAMPLE_TESTER_CLICK");
            setMsgR("Nochmal: Bitte dieselben Würfel rückwärts klicken (Beispiel).");
            setCanClickR(true);
          }
          return;
        }

        if (phaseR === "PRACTICE_INPUT") {
          if (correct) {
            await flashThumb();
            const nextP = practiceIndexR + 1;
            if (nextP < VRMR_PRACTICE.length) {
              setPracticeIndexR(nextP);
              await startPracticeR(nextP);
            } else {
              setMsgR("Test startet…");
              await startTestAttemptR(0, 0);
            }
          } else {
            await flashHand();
            setMsgR("Falsch. Übung wird wiederholt (rückwärts klicken).");
            setInputR([]);
            setCanClickR(false);

            await showSequence(currentShownR);

            setPhaseR("PRACTICE_INPUT");
            setMsgR(`Nochmal: Übung ${practiceIndexR + 1} bitte rückwärts nachklicken.`);
            setCanClickR(true);
          }
          return;
        }

        if (phaseR === "TEST_INPUT") {
          await flashThumb();

          const taskNo = taskIndexR + 1;
          const attemptNo = (attemptIndexR + 1) as 1 | 2;

          setRowsR((rows) => {
            const newRow: AttemptRow = {
              taskNo,
              attemptNo,
              shown: currentShownR,
              answer: next,
              pointsAttempt,
            };
            const filtered = rows.filter(
              (r) => !(r.taskNo === taskNo && r.attemptNo === attemptNo)
            );
            return [...filtered, newRow].sort((a, b) => {
              if (a.taskNo !== b.taskNo) return a.taskNo - b.taskNo;
              return a.attemptNo - b.attemptNo;
            });
          });

          const prevOut = outcomeRRef.current[taskNo] || {};
          outcomeRRef.current[taskNo] = {
            ...prevOut,
            ...(attemptNo === 1 ? { a1: pointsAttempt } : { a2: pointsAttempt }),
          };

          if (attemptIndexR === 0) {
            setAttemptIndexR(1);
            await startTestAttemptR(taskIndexR, 1);
            return;
          }

          const out = outcomeRRef.current[taskNo] || {};
          const a1 = out.a1 ?? 0;
          const a2 = out.a2 ?? 0;
          const anyCorrect = a1 + a2 >= 1;

          if (!anyCorrect) {
            await finishVRMR("VRM-R beendet (Abbruchregel: beide Versuche falsch).");
            return;
          }

          const nextTask = taskIndexR + 1;
          if (nextTask < TASKS_R.length) {
            setTaskIndexR(nextTask);
            setAttemptIndexR(0);
            await startTestAttemptR(nextTask, 0);
          } else {
            await finishVRMR("VRM-R abgeschlossen.");
          }
          return;
        }
      })();

      return next;
    });
  }

  function buildTableRows(rows: AttemptRow[]) {
    const byKey = new Map<string, AttemptRow>();
    rows.forEach((r) => byKey.set(`${r.taskNo}-${r.attemptNo}`, r));

    const result: AttemptRow[] = [];
    for (let taskNo = 1; taskNo <= 8; taskNo++) {
      for (let attemptNo: 1 | 2 = 1; attemptNo <= 2; attemptNo = (attemptNo + 1) as 1 | 2) {
        const key = `${taskNo}-${attemptNo}`;
        const row = byKey.get(key);
        result.push(
          row || {
            taskNo,
            attemptNo,
            shown: [],
            answer: [],
            pointsAttempt: 0,
          }
        );
      }
    }
    return result;
  }

  function taskPoints(rows16: AttemptRow[], taskNo: number) {
    const a1 =
      rows16.find((r) => r.taskNo === taskNo && r.attemptNo === 1)?.pointsAttempt ?? 0;
    const a2 =
      rows16.find((r) => r.taskNo === taskNo && r.attemptNo === 2)?.pointsAttempt ?? 0;
    return (a1 + a2) as 0 | 1 | 2;
  }

  function rohwertSum(rows16: AttemptRow[]) {
    let sum = 0;
    for (let t = 1; t <= 8; t++) sum += taskPoints(rows16, t);
    return sum;
  }

  function lvrm(rows16: AttemptRow[], tasksSource: number[][][]) {
    let lastTaskWithPoint = 0;
    for (let t = 1; t <= 8; t++) {
      if (taskPoints(rows16, t) > 0) lastTaskWithPoint = t;
    }
    if (lastTaskWithPoint === 0) return 0;
    return tasksSource[lastTaskWithPoint - 1][0].length;
  }

  const tableV = useMemo(() => buildTableRows(rowsV), [rowsV]);
  const tableR = useMemo(() => buildTableRows(rowsR), [rowsR]);

  const lvrmV = useMemo(() => lvrm(tableV, TASKS_V), [tableV]);
  const lvrmR = useMemo(() => lvrm(tableR, TASKS_R), [tableR, TASKS_R]);

  const sumV = useMemo(() => rohwertSum(tableV), [tableV]);
  const sumR = useMemo(() => rohwertSum(tableR), [tableR]);
  const sumTotal = sumV + sumR;

  const boardClickable =
    !presenting &&
    ((screen === "VRM_V" && canClickV) || (screen === "VRM_R" && canClickR));

  const isUserTurn = boardClickable;

  const boardClickHandler = (clicked: number) => {
    if (!boardClickable) return;
    if (screen === "VRM_V") handleClickVRMV_Stable(clicked);
    if (screen === "VRM_R") handleClickVRMR_Stable(clicked);
  };

  return (
    <main
      className="wnv-bg"
      style={{
        minHeight: "100vh",
        padding: "clamp(12px, 3vw, 24px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        color: theme.text,
      }}
    >
      <style>{`
        @media print {
          a, button, input, label { display: none !important; }
          main { padding: 0 !important; background: white !important; }
        }
      `}</style>

      {thumbOverlay ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            display: "grid",
            placeItems: "center",
            background: theme.overlayBg,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              fontSize: "min(220px, 35vw)",
              filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.35))",
              transform: "translateY(-8px)",
            }}
          >
            👍
          </div>
        </div>
      ) : null}

      {handOverlay ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            pointerEvents: "none",
            display: "grid",
            placeItems: "center",
            background: theme.overlayBg,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            style={{
              fontSize: "min(220px, 35vw)",
              filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.35))",
              transform: "translateY(-8px)",
            }}
          >
            ✋
          </div>
        </div>
      ) : null}

      {showFireworks ? <RocketsFireworksOverlay /> : null}

      <div style={{ width: "100%", maxWidth: 1100 }}>
        <div style={{ position: "relative", marginTop: 6 }}>
          {(screen === "VRM_V" || screen === "VRM_R") && isUserTurn ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                borderRadius: 14,
                background: theme.chipBg,
                border: theme.chipBorder,
                boxShadow: theme.smallShadow,
                fontWeight: 900,
                color: theme.softText,
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>👉</span>
              <span style={{ fontSize: 14 }}>bereit</span>
            </div>
          ) : null}

          <a
            href="/"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              textDecoration: "none",
              fontWeight: 900,
              padding: "10px 14px",
              borderRadius: 14,
              border: isDark
                ? "2px solid rgba(255,255,255,0.10)"
                : "2px solid rgba(0,0,0,0.15)",
              background: theme.buttonBg,
              color: theme.text,
              boxShadow: theme.smallShadow,
            }}
          >
            ⟵ Start
          </a>

          <div style={{ textAlign: "center", paddingTop: 2 }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                background: theme.chipBg,
                border: theme.chipBorder,
                fontWeight: 900,
                letterSpacing: 1,
                color: theme.text,
              }}
            >
              WNV · VRM
            </div>

            <h1
              style={{
                fontSize: "clamp(34px, 8vw, 64px)",
                fontWeight: 1000,
                margin: "10px 0 6px",
                letterSpacing: 2,
                color: theme.text,
                textShadow: isDark
                  ? "0 10px 24px rgba(0,0,0,0.35)"
                  : "0 4px 0 rgba(255,255,255,0.7), 0 16px 30px rgba(0,0,0,0.12)",
              }}
            >
              {title}
            </h1>

            <div style={{ fontWeight: 800, color: theme.subText }}>
              Visueller Reaktionstest – Vorwärts & Rückwärts
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 16,
            padding: 18,
            borderRadius: 26,
            background: theme.cardBg,
            border: theme.cardBorder,
            boxShadow: theme.shadow,
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "grid", gap: 4 }}>
              <div style={{ fontWeight: 900 }}>Menü / Steuerung</div>
              <div style={{ fontWeight: 700, color: theme.subText }}>
                Keine Speicherung. Nummern sind nur intern (Debug optional).
              </div>
            </div>

            <label
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontWeight: 900,
              }}
            >
              <input
                type="checkbox"
                checked={showDebugNumber}
                onChange={(e) => setShowDebugNumber(e.target.checked)}
              />
              Nummern anzeigen (Debug)
            </label>
          </div>

          {screen === "MENU" ? (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={async () => {
                  setScreen("VRM_V");
                  await startVRMV();
                }}
                style={menuBtnStyle(isDark)}
              >
                VRM-V starten
              </button>

              <button
                type="button"
                onClick={async () => {
                  setScreen("VRM_R");
                  await startVRMR();
                }}
                style={menuBtnStyle(isDark)}
              >
                VRM-R starten
              </button>

              <button
                type="button"
                onClick={() => setScreen("RESULTS")}
                style={menuBtnStyle(isDark)}
              >
                Ergebnisse
              </button>
            </div>
          ) : (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => setScreen("MENU")}
                style={smallBtnStyle(isDark)}
              >
                ⟵ Menü
              </button>

              <div style={{ fontWeight: 900, color: theme.softText }}>
                {screen === "RESULTS"
                  ? "Ergebnisseübersicht."
                  : screen === "VRM_V"
                  ? msgV
                  : msgR}
              </div>

              {screen === "RESULTS" ? (
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{ ...smallBtnStyle(isDark), marginLeft: "auto" }}
                >
                  Als PDF speichern
                </button>
              ) : null}
            </div>
          )}

          {screen === "VRM_V" || screen === "VRM_R" ? (
            <div
              style={{
                marginTop: 18,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "min(100%, 860px)",
                  aspectRatio: "860 / 440",
                  minHeight: 240,
                  borderRadius: 24,
                  background: theme.boardBg,
                  border: isDark
                    ? "2px solid rgba(255,255,255,0.08)"
                    : "2px solid rgba(0,0,0,0.10)",
                  boxShadow: theme.shadow,
                  position: "relative",
                  overflow: "hidden",
                  padding: 18,
                  marginTop: 18,
                  pointerEvents: boardClickable ? "auto" : "none",
                }}
              >
                {positions.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      left: `${p.left}%`,
                      top: `${p.top}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <CubeButton
                      id={p.id}
                      highlighted={highlighted === p.id}
                      showDebugNumber={showDebugNumber}
                      disabled={!boardClickable}
                      onClick={boardClickHandler}
                      isDark={isDark}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {screen === "RESULTS" ? (
            <div style={{ marginTop: 18, display: "grid", gap: 18 }}>
              <ResultTable
                title="VRM-V"
                rows16={tableV}
                taskPointsFn={(t) => taskPoints(tableV, t)}
                isDark={isDark}
              />
              <ScoreCards
                labelMax="LVRM-V (Maximum = 9)"
                valueMax={lvrmV}
                labelSum="VRM-V Rohwertsumme (Maximum = 16)"
                valueSum={sumV}
                isDark={isDark}
              />

              <ResultTable
                title="VRM-R"
                rows16={tableR}
                taskPointsFn={(t) => taskPoints(tableR, t)}
                isDark={isDark}
              />
              <ScoreCards
                labelMax="LVRM-R (Maximum = 9)"
                valueMax={lvrmR}
                labelSum="VRM-R Rohwertsumme (Maximum = 16)"
                valueSum={sumR}
                isDark={isDark}
              />

              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  background: theme.innerBg,
                  border: isDark
                    ? "2px solid rgba(255,255,255,0.08)"
                    : "2px solid rgba(0,0,0,0.12)",
                  fontWeight: 1000,
                  fontSize: 22,
                }}
              >
                Gesamtrohwert VRM (Maximum = 32):{" "}
                <span style={{ fontSize: 28 }}>{sumTotal}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function ResultTable({
  title,
  rows16,
  taskPointsFn,
  isDark,
}: {
  title: string;
  rows16: AttemptRow[];
  taskPointsFn: (taskNo: number) => 0 | 1 | 2;
  isDark: boolean;
}) {
  const border = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";
  const bg = isDark ? "rgba(30,41,59,0.88)" : "rgba(255,255,255,0.85)";
  const text = isDark ? "#f8fafc" : "#111";
  const emptyText = isDark ? "rgba(248,250,252,0.38)" : "rgba(0,0,0,0.35)";

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        background: bg,
        border: isDark
          ? "2px solid rgba(255,255,255,0.08)"
          : "2px solid rgba(0,0,0,0.12)",
        color: text,
      }}
    >
      <div style={{ fontWeight: 1000, fontSize: 22, marginBottom: 10 }}>
        {title}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr>
              {["Aufgabe", "Gezeigt", "Antwort", "Punkte (Versuch)", "Punkte (Aufgabe)"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 10px",
                      borderBottom: `2px solid ${border}`,
                      fontWeight: 1000,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {rows16.map((r) => {
              const isFirstRowOfTask = r.attemptNo === 1;
              const pointsTask = taskPointsFn(r.taskNo);

              return (
                <tr key={`${r.taskNo}-${r.attemptNo}`}>
                  {isFirstRowOfTask ? (
                    <td
                      rowSpan={2}
                      style={{
                        padding: "10px 10px",
                        borderBottom: `1px solid ${border}`,
                        fontWeight: 1000,
                        width: 70,
                        verticalAlign: "top",
                      }}
                    >
                      {r.taskNo}
                    </td>
                  ) : null}

                  <td
                    style={{
                      padding: "10px 10px",
                      borderBottom: `1px solid ${border}`,
                      fontWeight: 800,
                      minWidth: 260,
                    }}
                  >
                    {fmtSeq(r.shown)}
                  </td>

                  <td
                    style={{
                      padding: "10px 10px",
                      borderBottom: `1px solid ${border}`,
                      minWidth: 260,
                      fontWeight: 800,
                      color: r.answer.length ? text : emptyText,
                    }}
                  >
                    {fmtSeq(r.answer)}
                  </td>

                  <td
                    style={{
                      padding: "10px 10px",
                      borderBottom: `1px solid ${border}`,
                      fontWeight: 1000,
                      width: 140,
                    }}
                  >
                    {r.pointsAttempt}
                  </td>

                  {isFirstRowOfTask ? (
                    <td
                      rowSpan={2}
                      style={{
                        padding: "10px 10px",
                        borderBottom: `1px solid ${border}`,
                        fontWeight: 1000,
                        width: 140,
                        verticalAlign: "top",
                      }}
                    >
                      {pointsTask}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ScoreCards({
  labelMax,
  valueMax,
  labelSum,
  valueSum,
  isDark,
}: {
  labelMax: string;
  valueMax: number;
  labelSum: string;
  valueSum: number;
  isDark: boolean;
}) {
  const cardBg = isDark ? "rgba(30,41,59,0.88)" : "rgba(255,255,255,0.85)";
  const border = isDark
    ? "2px solid rgba(255,255,255,0.08)"
    : "2px solid rgba(0,0,0,0.12)";
  const soft = isDark ? "rgba(248,250,252,0.75)" : "rgba(0,0,0,0.75)";
  const text = isDark ? "#f8fafc" : "#111";

  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      }}
    >
      <div
        style={{
          padding: 16,
          borderRadius: 18,
          background: cardBg,
          border,
          fontWeight: 900,
          color: text,
        }}
      >
        <div style={{ opacity: 0.75, fontWeight: 900, color: soft }}>{labelMax}</div>
        <div style={{ fontSize: 34, fontWeight: 1000 }}>{valueMax}</div>
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 18,
          background: cardBg,
          border,
          fontWeight: 900,
          color: text,
        }}
      >
        <div style={{ opacity: 0.75, fontWeight: 900, color: soft }}>{labelSum}</div>
        <div style={{ fontSize: 34, fontWeight: 1000 }}>{valueSum}</div>
      </div>
    </div>
  );
}

const menuBtnStyle = (isDark: boolean): React.CSSProperties => ({
  flex: "1 1 240px",
  padding: "14px 14px",
  borderRadius: 18,
  border: isDark
    ? "2px solid rgba(255,255,255,0.10)"
    : "2px solid rgba(0,0,0,0.15)",
  fontWeight: 1000,
  background: isDark ? "rgba(30,41,59,0.94)" : "rgba(255,255,255,0.9)",
  color: isDark ? "#f8fafc" : "#111",
  boxShadow: isDark
    ? "0 12px 0 rgba(0,0,0,0.22)"
    : "0 12px 0 rgba(0,0,0,0.10)",
  cursor: "pointer",
});

const smallBtnStyle = (isDark: boolean): React.CSSProperties => ({
  padding: "12px 14px",
  borderRadius: 16,
  border: isDark
    ? "2px solid rgba(255,255,255,0.10)"
    : "2px solid rgba(0,0,0,0.15)",
  fontWeight: 900,
  background: isDark ? "rgba(30,41,59,0.94)" : "rgba(255,255,255,0.9)",
  color: isDark ? "#f8fafc" : "#111",
  boxShadow: isDark
    ? "0 12px 0 rgba(0,0,0,0.22)"
    : "0 12px 0 rgba(0,0,0,0.10)",
  cursor: "pointer",
});