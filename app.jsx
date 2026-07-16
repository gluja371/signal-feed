/* Signal Feed — app.jsx (runs via Babel standalone + React UMD, no build step) */
const { useState, useEffect, useRef, useCallback, useMemo } = React;

/* ---------- tokens ---------- */
const T = {
  bg: "#08090C", card: "#101218", ink: "#F2F4F8", dim: "#8A93A6", line: "#232733",
  accents: { coral: "#FF6B5E", gold: "#FFC24B", teal: "#39D0B8", indigo: "#6C7BFF", lime: "#9BE15D", sky: "#5EC8F8" },
};
const disp = "'Space Grotesk', system-ui, sans-serif";
const body = "'Inter', system-ui, sans-serif";
const mono = "'IBM Plex Mono', ui-monospace, monospace";

const TOPICS = [
  { id: "all", label: "For you" },
  { id: "computer-vision", label: "Computer vision" },
  { id: "vibe-coding", label: "Vibe coding" },
  { id: "agentic-ai", label: "Agentic AI" },
  { id: "ai-news", label: "AI news" },
  { id: "startup-ideas", label: "Startup ideas" },
  { id: "aerospace", label: "Aerospace" },
];
const FORMAT_LABEL = { infographic: "Infographic", story: "Story", replay: "Screen replay" };

/* ---------- shared ---------- */
function useVisible(ref, threshold = 0.6) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setVisible(e.intersectionRatio >= threshold), { threshold: [0, threshold] });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function ActionRail({ accent, saved, onSave }) {
  const [liked, setLiked] = useState(false);
  const btn = {
    background: "rgba(16,18,24,0.55)", border: `1px solid ${T.line}`, borderRadius: 999,
    width: 44, height: 44, display: "grid", placeItems: "center", cursor: "pointer", backdropFilter: "blur(6px)",
  };
  return (
    <div style={{ position: "absolute", right: 12, bottom: 96, display: "flex", flexDirection: "column", gap: 10, zIndex: 5 }}>
      <button aria-label={liked ? "Unlike" : "Like"} style={btn} onClick={() => setLiked(!liked)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? accent : "none"} stroke={liked ? accent : T.ink} strokeWidth="2">
          <path d="M12 21C12 21 4 14.6 4 9.3 4 6.4 6.2 4 9 4c1.5 0 2.5.7 3 1.5C12.5 4.7 13.5 4 15 4c2.8 0 5 2.4 5 5.3C20 14.6 12 21 12 21z" />
        </svg>
      </button>
      <button aria-label={saved ? "Remove from saved" : "Save"} style={btn} onClick={onSave}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? accent : "none"} stroke={saved ? accent : T.ink} strokeWidth="2">
          <path d="M6 3h12v18l-6-4-6 4V3z" />
        </svg>
      </button>
    </div>
  );
}

function CardMeta({ card, accent }) {
  return (
    <div style={{ position: "absolute", left: 14, right: 70, bottom: "calc(18px + env(safe-area-inset-bottom))", zIndex: 5 }}>
      <span style={{
        fontFamily: mono, fontSize: 10, letterSpacing: 1.2, textTransform: "uppercase",
        color: accent, border: `1px solid ${accent}55`, background: "rgba(8,9,12,0.6)",
        padding: "3px 8px", borderRadius: 4, backdropFilter: "blur(4px)",
      }}>{FORMAT_LABEL[card.format] || card.format}</span>
      <div style={{ fontFamily: disp, fontWeight: 700, fontSize: 16, color: T.ink, marginTop: 8, lineHeight: 1.25, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>{card.title}</div>
      <a href={card.source.url} target="_blank" rel="noreferrer" style={{ fontFamily: body, fontSize: 11, color: T.dim, marginTop: 3, display: "inline-block", textDecoration: "none" }}>
        {card.source.name} ↗
      </a>
    </div>
  );
}

const shell = { position: "relative", height: "100%", overflow: "hidden", background: T.card };

/* ---------- format renderers ---------- */
function InfographicCard({ card, accent }) {
  return (
    <div style={shell}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 70% at 85% -10%, ${accent}33, transparent 60%), radial-gradient(100% 60% at 0% 110%, ${accent}14, transparent 55%), ${T.card}` }} />
      <div style={{ position: "relative", padding: "calc(58px + env(safe-area-inset-top)) 18px 110px", height: "100%", display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: accent, letterSpacing: 2 }}>{card.kicker}</div>
        <h2 style={{ fontFamily: disp, fontWeight: 700, fontSize: 28, color: T.ink, lineHeight: 1.1, margin: "10px 0 4px" }}>
          {card.headline}<br /><span style={{ color: accent }}>{card.headline_accent}</span>
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
          {card.steps.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 12, background: "rgba(255,255,255,0.035)", border: `1px solid ${T.line}`, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ fontFamily: mono, fontSize: 12, color: accent, fontWeight: 600, paddingTop: 2 }}>{s.n}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: body, fontWeight: 600, fontSize: 13.5, color: T.ink }}>{s.label}</div>
                {s.cmd && <code style={{ display: "block", fontFamily: mono, fontSize: 10.5, color: accent, background: "#0A0C10", border: `1px solid ${T.line}`, borderRadius: 6, padding: "5px 8px", margin: "6px 0 4px", overflowX: "auto", whiteSpace: "nowrap" }}>{s.cmd}</code>}
                <div style={{ fontFamily: body, fontSize: 11.5, color: T.dim, lineHeight: 1.45 }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryCard({ card, accent, visible }) {
  const [idx, setIdx] = useState(0);
  const last = card.panels.length - 1;
  /* manual navigation: tap left third = back, anywhere else = forward */
  const handleTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) setIdx((i) => Math.max(i - 1, 0));
    else setIdx((i) => Math.min(i + 1, last));
  };
  const p = card.panels[idx];
  return (
    <div style={{ ...shell, background: "#0B0D12", cursor: "pointer" }} onClick={handleTap}>
      <div style={{ position: "absolute", inset: 0, transition: "background 600ms ease", background: `radial-gradient(130% 90% at 50% 115%, ${accent}2E, transparent 62%), #0B0D12` }} />
      <div style={{ position: "absolute", top: "calc(50px + env(safe-area-inset-top))", left: 14, right: 14, display: "flex", gap: 5, zIndex: 6 }}>
        {card.panels.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
            <div style={{
              height: "100%", background: T.ink, borderRadius: 2,
              width: i <= idx ? "100%" : "0%",
            }} />
          </div>
        ))}
      </div>
      <div key={idx} style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px 90px", animation: "riseIn 450ms ease both" }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2.2, color: accent }}>{p.kicker}</div>
        <h2 style={{ fontFamily: disp, fontWeight: 700, fontSize: 29, lineHeight: 1.12, color: T.ink, margin: "12px 0 0" }}>{p.head}</h2>
        {p.cmd && <code style={{ fontFamily: mono, fontSize: 12, color: accent, background: "#07080B", border: `1px solid ${T.line}`, borderRadius: 8, padding: "10px 12px", marginTop: 16, overflowX: "auto", whiteSpace: "nowrap" }}>{p.cmd}</code>}
        <p style={{ fontFamily: body, fontSize: 14.5, lineHeight: 1.55, color: T.dim, marginTop: 14, maxWidth: 300 }}>{p.sub}</p>
        <div style={{ fontFamily: body, fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 22 }}>tap to continue · tap left edge to go back · {idx + 1}/{card.panels.length}</div>
      </div>
    </div>
  );
}

function ReplayCard({ card, accent, visible }) {
  const [lines, setLines] = useState([]);
  const [typing, setTyping] = useState("");
  const run = useCallback(() => {
    let li = 0, ci = 0, cancelled = false;
    setLines([]); setTyping("");
    const tick = () => {
      if (cancelled) return;
      if (li >= card.script.length) { setTimeout(() => { if (!cancelled) { li = 0; ci = 0; setLines([]); tick(); } }, 3500); return; }
      const item = card.script[li];
      if (item.type === "cmd") {
        if (ci <= item.text.length) { setTyping(item.text.slice(0, ci)); ci++; setTimeout(tick, 34); }
        else { setLines((l) => [...l, item]); setTyping(""); li++; ci = 0; setTimeout(tick, 350); }
      } else { setLines((l) => [...l, item]); li++; setTimeout(tick, 520); }
    };
    tick();
    return () => { cancelled = true; };
  }, [card.script]);
  useEffect(() => {
    if (!visible) return;
    return run();
  }, [visible, run]);
  return (
    <div style={{ ...shell, background: "#0A0C10" }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(110% 65% at 50% -15%, ${accent}1F, transparent 60%)` }} />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 16px 96px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: 2, color: accent, marginBottom: 10, paddingLeft: 2 }}>WATCH IT HAPPEN</div>
        <div style={{ background: "#05060A", border: `1px solid ${T.line}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 18px 50px rgba(0,0,0,0.55), 0 0 0 1px ${accent}14` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 12px", borderBottom: `1px solid ${T.line}`, background: "#0B0D12" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <span key={c} style={{ width: 10, height: 10, borderRadius: 5, background: c, opacity: 0.9 }} />)}
            <span style={{ fontFamily: mono, fontSize: 10, color: T.dim, marginLeft: 8 }}>{card.terminal_title}</span>
          </div>
          <div style={{ padding: "14px 14px 16px", minHeight: 250, fontFamily: mono, fontSize: 11.5, lineHeight: 1.75 }}>
            {lines.map((l, i) => (
              <div key={i} style={{ color: l.type === "cmd" ? T.ink : accent, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                {l.type === "cmd" ? <React.Fragment><span style={{ color: T.accents.coral }}>$ </span>{l.text}</React.Fragment> : <span style={{ opacity: 0.85 }}>{l.text}</span>}
              </div>
            ))}
            {typing !== "" && (
              <div style={{ color: T.ink, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                <span style={{ color: T.accents.coral }}>$ </span>{typing}
                <span style={{ display: "inline-block", width: 7, height: 13, background: accent, marginLeft: 2, verticalAlign: "-2px" }} />
              </div>
            )}
          </div>
        </div>
        <p style={{ fontFamily: body, fontSize: 12.5, color: T.dim, lineHeight: 1.55, marginTop: 14, paddingLeft: 2 }}>{card.caption}</p>
      </div>
    </div>
  );
}

/* ---------- card wrapper ---------- */
function FeedCard({ card, saved, onSave }) {
  const ref = useRef(null);
  const visible = useVisible(ref);
  const accent = T.accents[card.accent] || T.accents.indigo;
  return (
    <section ref={ref} aria-label={card.title} style={{ height: "100%", flexShrink: 0, scrollSnapAlign: "start", scrollSnapStop: "always", position: "relative" }}>
      {card.format === "infographic" && <InfographicCard card={card} accent={accent} />}
      {card.format === "story" && <StoryCard card={card} accent={accent} visible={visible} />}
      {card.format === "replay" && <ReplayCard card={card} accent={accent} visible={visible} />}
      <ActionRail accent={accent} saved={saved} onSave={onSave} />
      <CardMeta card={card} accent={accent} />
    </section>
  );
}

/* ---------- app ---------- */
function FeedApp() {
  const [feed, setFeed] = useState(null);
  const [error, setError] = useState(null);
  const [topic, setTopic] = useState("all");
  const [savedIds, setSavedIds] = useState([]);
  const scrollerRef = useRef(null);

  useEffect(() => {
    fetch("feed.json")
      .then((r) => { if (!r.ok) throw new Error(`feed.json: ${r.status}`); return r.json(); })
      .then(setFeed)
      .catch((e) => setError(String(e)));
  }, []);

  const cards = useMemo(() => {
    if (!feed) return [];
    return topic === "all" ? feed.cards : feed.cards.filter((c) => c.topic === topic);
  }, [feed, topic]);

  useEffect(() => { scrollerRef.current?.scrollTo({ top: 0 }); }, [topic]);

  const toggleSave = (id) => setSavedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  if (error) return (
    <div style={{ height: "100dvh", display: "grid", placeItems: "center", color: T.dim, fontFamily: body, textAlign: "center", padding: 24 }}>
      <div>Couldn't load today's feed.<br /><span style={{ fontSize: 12 }}>{error}</span></div>
    </div>
  );
  if (!feed) return <div style={{ height: "100dvh", display: "grid", placeItems: "center", color: T.dim, fontFamily: body }}>Loading today's feed…</div>;

  return (
    <div style={{ height: "100dvh", background: T.bg, position: "relative", overflow: "hidden", fontFamily: body }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { display: none; }
        @keyframes fillbar { from { width: 0% } to { width: 100% } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: translateY(0) } }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, padding: "calc(12px + env(safe-area-inset-top)) 12px 10px", background: "linear-gradient(180deg, rgba(4,5,7,0.92) 35%, transparent)" }}>
        <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
          {TOPICS.map((t) => (
            <button key={t.id} onClick={() => setTopic(t.id)} style={{
              fontFamily: body, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap",
              color: topic === t.id ? "#0A0B0E" : T.ink,
              background: topic === t.id ? T.ink : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999,
              padding: "6px 13px", cursor: "pointer",
            }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div ref={scrollerRef} style={{ height: "100%", overflowY: "auto", scrollSnapType: "y mandatory", display: "flex", flexDirection: "column" }}>
        {cards.map((c) => (
          <FeedCard key={c.id} card={c} saved={savedIds.includes(c.id)} onSave={() => toggleSave(c.id)} />
        ))}
        <section style={{ height: "100%", flexShrink: 0, scrollSnapAlign: "start", display: "grid", placeItems: "center", background: T.bg }}>
          <div style={{ textAlign: "center", padding: 30 }}>
            <div style={{ fontSize: 34 }}>🌊</div>
            <div style={{ fontFamily: disp, fontWeight: 700, fontSize: 22, color: T.ink, marginTop: 12 }}>You're caught up.</div>
            <p style={{ fontFamily: body, fontSize: 13, color: T.dim, marginTop: 8, maxWidth: 250, lineHeight: 1.55 }}>
              {cards.length} card{cards.length === 1 ? "" : "s"} · {savedIds.length} saved · fresh feed tomorrow. Go check the swell.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<FeedApp />);
