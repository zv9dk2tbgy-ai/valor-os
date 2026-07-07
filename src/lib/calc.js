// Cash flow projection & scenario engine.
// Rules (per il brief):
//  - CONSERVATIVO: solo incassi con probabilità >= 90 o già confermati/incassati, e con
//    uno slittamento prudenziale di 45 giorni sulle date attese. Tutte le uscite contano sempre.
//  - REALISTICO: incassi con probabilità >= 50, nessuno slittamento.
//  - OTTIMISTICO: tutti gli incassi con probabilità > 0 (incluso il pipeline).
// Le voci senza data prevista non possono essere collocate in un mese preciso: finiscono
// nel bucket "da programmare" e non alterano il grafico mensile finché non viene data una data.

export const SCENARIOS = [
  { id: "conservativo", label: "Conservativo", color: "#EF4444" },
  { id: "realistico", label: "Realistico", color: "#F59E0B" },
  { id: "ottimistico", label: "Ottimistico", color: "#22C55E" },
];

export function ym(dateStr) {
  if (!dateStr) return null;
  return dateStr.slice(0, 7);
}

export function monthsBetween(startYm, endYm) {
  const [sy, sm] = startYm.split("-").map(Number);
  const [ey, em] = endYm.split("-").map(Number);
  const out = [];
  let y = sy, m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  return out;
}

function addDaysToYm(dateStr, days) {
  const dt = new Date(dateStr);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function cashOnHand(cashPositions) {
  return cashPositions.reduce((s, c) => s + (Number(c.amount) || 0), 0);
}

function entrataIncluded(item, scenario) {
  const prob = item.probability ?? 50;
  const confirmed = item.status === "confermato" || item.status === "incassato";
  if (scenario === "conservativo") return confirmed || prob >= 90;
  if (scenario === "realistico") return prob >= 50;
  return prob > 0; // ottimistico
}

/**
 * Builds a month-by-month projection.
 * Returns { months, rows, unscheduled, endingBalance }
 * rows[i] = { ym, label, entrate, uscite, net, opening, closing }
 */
export function buildProjection({ cashFlowItems, bankObligations, cashPositions, startYm, endYm, scenario }) {
  const months = monthsBetween(startYm, endYm);
  const opening0 = cashOnHand(cashPositions);

  const active = cashFlowItems.filter((i) => !i.simulateOff);
  const unscheduled = [];
  const byMonth = Object.fromEntries(months.map((m) => [m, { entrate: 0, uscite: 0, items: [] }]));

  for (const item of active) {
    const isEntrata = item.type === "entrata";
    if (isEntrata && !entrataIncluded(item, scenario)) continue;

    let dueDate = item.due_date;
    if (isEntrata && scenario === "conservativo" && dueDate) {
      dueDate = addDaysToYm(dueDate, 45);
    }

    if (!dueDate) {
      unscheduled.push(item);
      continue;
    }
    const monthKey = ym(dueDate);
    if (!byMonth[monthKey]) continue; // outside the visible window
    const amount = Number(item.amount) || 0;
    if (isEntrata) byMonth[monthKey].entrate += amount;
    else byMonth[monthKey].uscite += amount;
    byMonth[monthKey].items.push(item);
  }

  // recurring bank obligations
  for (const bo of bankObligations) {
    const monthly = Number(bo.monthly_payment) || 0;
    if (!monthly) continue;
    for (const m of months) {
      if (bo.final_due_date && m > ym(bo.final_due_date)) continue;
      byMonth[m].uscite += monthly;
      byMonth[m].items.push({ ...bo, type: "uscita", description: bo.description || bo.lender, category: "Rata bancaria" });
    }
  }

  let opening = opening0;
  const rows = months.map((m) => {
    const { entrate, uscite, items } = byMonth[m];
    const net = entrate - uscite;
    const closing = opening + net;
    const row = { ym: m, entrate, uscite, net, opening, closing, items };
    opening = closing;
    return row;
  });

  return { months, rows, unscheduled, openingCash: opening0, endingBalance: opening };
}

export function healthScore({ rows, unscheduled }) {
  if (!rows.length) return 50;
  const minClosing = Math.min(...rows.map((r) => r.closing));
  const lastClosing = rows[rows.length - 1].closing;
  let score = 60;
  if (minClosing < 0) score -= 35;
  else if (minClosing < 10000) score -= 15;
  else score += 10;
  if (lastClosing > 0) score += 15;
  if (lastClosing > 30000) score += 10;
  const criticalUnscheduled = unscheduled.filter((u) => u.type === "entrata" && (Number(u.amount) || 0) > 20000);
  score -= Math.min(20, criticalUnscheduled.length * 8);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function buildAlerts({ rows, unscheduled, bankObligations, decisions }) {
  const alerts = [];
  const negativeMonth = rows.find((r) => r.closing < 0);
  if (negativeMonth) {
    alerts.push({ level: "high", text: `Cash gap previsto a ${negativeMonth.ym}: saldo stimato ${Math.round(negativeMonth.closing).toLocaleString("it-IT")} €.` });
  }
  const tightMonth = !negativeMonth && rows.find((r) => r.closing < 8000);
  if (tightMonth) {
    alerts.push({ level: "med", text: `Margine di sicurezza basso a ${tightMonth.ym}: saldo stimato ${Math.round(tightMonth.closing).toLocaleString("it-IT")} €.` });
  }
  for (const u of unscheduled) {
    if (u.type === "entrata" && (Number(u.amount) || 0) > 0) {
      alerts.push({ level: "med", text: `Incasso critico senza data confermata: "${u.description}" (${Math.round(u.amount).toLocaleString("it-IT")} €).` });
    }
  }
  const openDecisionsHigh = (decisions || []).filter((d) => d.priority === "alta" && d.status !== "chiusa" && d.status !== "completata");
  if (openDecisionsHigh.length) {
    alerts.push({ level: "med", text: `${openDecisionsHigh.length} decisione/i ad alta priorità ancora aperte.` });
  }
  return alerts;
}
