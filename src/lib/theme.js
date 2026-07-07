// Shared visual language for the Bowser / RTI Command Center.
export const B = {
  gold: "#C9A227",
  goldDark: "#9C7D1A",
  orange: "#F26522",
  dark: "#0B0C10",
  card: "#131419",
  surface: "#191B22",
  border: "#282A34",
  white: "#EDEDF2",
  gray: "#9498A8",
  dim: "#5B5F70",
  green: "#22C55E",
  red: "#EF4444",
  amber: "#F59E0B",
  teal: "#14B8A6",
  blue: "#6366F1",
  purple: "#A855F7",
};

export const C = {
  card: { background: B.card, border: `1px solid ${B.border}`, borderRadius: 14, padding: 18 },
  inp: { padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" },
  btn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", background: `linear-gradient(135deg,${B.gold},${B.goldDark})`, color: "#0B0C10", border: "none", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer" },
  btnGhost: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", background: B.surface, color: B.white, border: `1px solid ${B.border}`, borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer" },
};

export const eur = (n) => {
  if (n === null || n === undefined || n === "" || Number.isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return sign + "€" + Math.round(Math.abs(n)).toLocaleString("it-IT");
};

export const pct = (v, t) => (t > 0 ? Math.min(100, Math.max(0, Math.round((v / t) * 100))) : 0);

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const fmtDate = (d) => {
  if (!d) return "—";
  try {
    const dt = new Date(d + (d.length === 7 ? "-01" : ""));
    if (Number.isNaN(dt.getTime())) return d;
    return dt.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return d;
  }
};

export const monthLabel = (ym) => {
  const [y, m] = ym.split("-").map(Number);
  const dt = new Date(y, m - 1, 1);
  return dt.toLocaleDateString("it-IT", { month: "short", year: "numeric" });
};
