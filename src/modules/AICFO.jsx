import { useMemo, useState } from "react";
import { Bot, Sparkles, Send, Clock } from "lucide-react";
import { B, C } from "../lib/theme.js";
import { eur, monthLabel } from "../lib/theme.js";
import { Card, SecTitle } from "../lib/ui.jsx";
import { useStore, companyName } from "../lib/store.jsx";
import { buildProjection, monthsBetween, shiftDate, ym } from "../lib/calc.js";

const START_YM = "2026-07";
const END_YM = "2026-12";
const SAFETY_MARGIN = 8000;

export default function AICFO() {
  const { data } = useStore();
  const [log, setLog] = useState([]);
  const [spendAmount, setSpendAmount] = useState(6000);
  const [spendMonth, setSpendMonth] = useState("2026-08");
  const [targetMonth, setTargetMonth] = useState("2026-12");
  const [targetBuffer, setTargetBuffer] = useState(30000);
  const [delayItemId, setDelayItemId] = useState("");
  const [delayDays, setDelayDays] = useState(60);
  const [hypoMonth, setHypoMonth] = useState("");

  const months = useMemo(() => monthsBetween(START_YM, END_YM), []);
  const incomeItems = data.cashFlowItems.filter((i) => i.type === "entrata" && !i.simulateOff);

  const baseline = useMemo(() => buildProjection({
    cashFlowItems: data.cashFlowItems, bankObligations: data.bankObligations, cashPositions: data.cashPositions,
    startYm: START_YM, endYm: END_YM, scenario: "realistico",
  }), [data]);

  function push(q, a) {
    setLog((l) => [{ q, a, id: Date.now() + Math.random() }, ...l]);
  }

  function runProjection(items, endYm = END_YM) {
    return buildProjection({
      cashFlowItems: items, bankObligations: data.bankObligations, cashPositions: data.cashPositions,
      startYm: START_YM, endYm, scenario: "realistico",
    });
  }

  function decClosing(proj) {
    return proj.rows.find((r) => r.ym === "2026-12")?.closing ?? proj.rows[proj.rows.length - 1].closing;
  }

  function askSpend() {
    const amount = Number(spendAmount) || 0;
    if (!spendMonth || spendMonth < START_YM) {
      push(`Posso spendere ${eur(amount)}?`, `Indica un mese valido da ${monthLabel(START_YM)} in poi: la proiezione parte da luglio 2026.`);
      return;
    }
    const endYm = spendMonth > END_YM ? spendMonth : END_YM;
    const simItems = [...data.cashFlowItems, { id: "__sim", type: "uscita", category: "Simulazione", description: "Spesa simulata", amount, due_date: `${spendMonth}-15`, status: "confermato", probability: 100, simulateOff: false }];
    const sim = runProjection(simItems, endYm);
    const minAfter = Math.min(...sim.rows.map((r) => r.closing));
    const decAfter = decClosing(sim);
    const minBefore = Math.min(...baseline.rows.map((r) => r.closing));
    const safe = minAfter >= 0 && decAfter >= 0;
    const tight = safe && minAfter < SAFETY_MARGIN;
    const verdict = !safe
      ? `🔴 No — con questa spesa il saldo scende sotto zero (minimo previsto ${eur(minAfter)}). Prima di procedere servono incassi aggiuntivi o va rinviata.`
      : tight
      ? `🟡 Sì, ma con margine ridotto — il saldo minimo scende a ${eur(minAfter)} (soglia di sicurezza consigliata: ${eur(SAFETY_MARGIN)}). Fattibile solo se gli incassi previsti si confermano.`
      : `🟢 Sì — anche dopo questa spesa il saldo minimo resta a ${eur(minAfter)} e dicembre 2026 chiude a ${eur(decAfter)} (scenario realistico).`;
    push(
      `Posso spendere ${eur(amount)} a ${monthLabel(spendMonth)} senza mettere a rischio dicembre?`,
      `${verdict}\nSenza questa spesa il minimo di periodo sarebbe ${eur(minBefore)}.`
    );
  }

  function askRunway() {
    const idx = months.indexOf(targetMonth);
    const relevant = idx >= 0 ? baseline.rows.slice(0, idx + 1) : baseline.rows;
    const minBal = Math.min(...relevant.map((r) => r.closing));
    const gapToZero = minBal < 0 ? -minBal : 0;
    const gapToBuffer = Math.max(0, Number(targetBuffer) - minBal);
    push(
      `Quanto devo incassare entro ${monthLabel(targetMonth)} per stare tranquillo (buffer ${eur(targetBuffer)})?`,
      gapToZero > 0
        ? `🔴 Nello scenario realistico il saldo scende sotto zero (minimo ${eur(minBal)}). Servono almeno ${eur(gapToZero)} di incassi aggiuntivi confermati solo per restare non negativo, ${eur(gapToBuffer)} per raggiungere il buffer di sicurezza di ${eur(targetBuffer)}.`
        : gapToBuffer > 0
        ? `🟡 Il saldo minimo previsto è ${eur(minBal)}, sopra zero ma sotto il buffer desiderato. Ti mancano ${eur(gapToBuffer)} per arrivare a un margine di ${eur(targetBuffer)}.`
        : `🟢 Il saldo minimo previsto (${eur(minBal)}) è già sopra il buffer di sicurezza richiesto di ${eur(targetBuffer)}. Nessun incasso aggiuntivo necessario in questo scenario.`
    );
  }

  // "What if this income lands on date X instead of its current planning?"
  // Assumes the income does arrive (probability forced to 100 in both runs) so the
  // comparison isolates the timing effect. Extends the horizon if X goes past Dec 2026.
  function simulateMoveTo(item, toDate, question) {
    const endYm = ym(toDate) > "2026-12" ? ym(toDate) : END_YM;
    const others = data.cashFlowItems.filter((i) => i.id !== item.id);
    const asPlanned = item.due_date
      ? [...others, { ...item, probability: 100, status: "confermato" }]
      : null;
    const moved = [...others, { ...item, due_date: toDate, probability: 100, status: "confermato" }];
    const simMoved = runProjection(moved, endYm);
    const minMoved = Math.min(...simMoved.rows.map((r) => r.closing));
    const decMoved = decClosing(simMoved);
    let comparison;
    if (asPlanned) {
      const simBase = runProjection(asPlanned, endYm);
      comparison = `Con la data attuale (${item.due_date}): minimo ${eur(Math.min(...simBase.rows.map((r) => r.closing)))}, dicembre a ${eur(decClosing(simBase))}.`;
    } else {
      const simWithout = runProjection(others, endYm);
      comparison = `Oggi questo incasso non ha data e quindi NON è contato nella proiezione: senza di esso il minimo è ${eur(Math.min(...simWithout.rows.map((r) => r.closing)))} e dicembre chiude a ${eur(decClosing(simWithout))}.`;
    }
    const firstNeg = simMoved.rows.find((r) => r.closing < 0);
    push(
      question,
      `Se "${item.description}" (${eur(item.amount)}) arriva il ${toDate}: saldo minimo ${eur(minMoved)}, dicembre 2026 a ${eur(decMoved)}${firstNeg ? ` — ⚠️ cash gap a ${firstNeg.ym} (${eur(firstNeg.closing)})` : " — nessun cash gap nel periodo"}.\n${comparison}\n(Ipotesi: l'incasso viene considerato certo in entrambe le simulazioni, per isolare l'effetto della tempistica.)`
    );
  }

  function simulateDelay() {
    const item = incomeItems.find((i) => i.id === delayItemId) || incomeItems[0];
    if (!item) {
      push("Simulazione ritardo incasso", "Nessun incasso presente in Cash Flow Center.");
      return;
    }
    const baseDate = item.due_date || (hypoMonth ? `${hypoMonth}-15` : null);
    if (!baseDate) {
      push(
        `Cosa succede se "${item.description}" ritarda di ${delayDays} giorni?`,
        `Questo incasso non ha una data prevista. Inserisci una "data ipotetica" qui nel simulatore (o assegna la data reale in Cash Flow Center) e riprova: senza una data di partenza il ritardo non è calcolabile — e non invento date.`
      );
      return;
    }
    const toDate = shiftDate(baseDate, Number(delayDays) || 0);
    const endYm = ym(toDate) > "2026-12" ? ym(toDate) : END_YM;
    const others = data.cashFlowItems.filter((i) => i.id !== item.id);
    const onTime = runProjection([...others, { ...item, due_date: baseDate, probability: 100, status: "confermato" }], endYm);
    const late = runProjection([...others, { ...item, due_date: toDate, probability: 100, status: "confermato" }], endYm);
    const minOn = Math.min(...onTime.rows.map((r) => r.closing));
    const minLate = Math.min(...late.rows.map((r) => r.closing));
    const firstNeg = late.rows.find((r) => r.closing < 0);
    push(
      `Cosa succede se "${item.description}" ritarda di ${delayDays} giorni (da ${baseDate})?`,
      `In orario (${baseDate}): minimo di periodo ${eur(minOn)}, dicembre a ${eur(decClosing(onTime))}.\nIn ritardo (${toDate}): minimo ${eur(minLate)}, dicembre a ${eur(decClosing(late))}.\n${firstNeg ? `⚠️ Il ritardo apre un cash gap a ${firstNeg.ym}: ${eur(firstNeg.closing)}.` : "🟢 Anche col ritardo non si apre un cash gap nel periodo."}\n(Ipotesi: incasso considerato certo in entrambe le simulazioni.)`
    );
  }

  function quickDCS() {
    const item = incomeItems.find((i) => (i.description || "").toUpperCase().includes("DCS"));
    if (!item) { push("Cosa succede se DCS ritarda di 60 giorni?", "Non trovo un incasso con descrizione contenente \"DCS\" in Cash Flow Center."); return; }
    const baseDate = item.due_date || (hypoMonth ? `${hypoMonth}-15` : null);
    if (!baseDate) {
      push("Cosa succede se DCS ritarda di 60 giorni?", `L'incasso DCS (${eur(item.amount)}) non ha ancora una data prevista, quindi il "ritardo" non è calcolabile. Inserisci una data ipotetica nel simulatore qui sopra, oppure usa il pulsante "Rogiti/incasso a una data" per testare una data specifica.`);
      return;
    }
    setDelayItemId(item.id); setDelayDays(60);
    const toDate = shiftDate(baseDate, 60);
    simulateMoveTo({ ...item, due_date: baseDate }, toDate, "Cosa succede se DCS ritarda di 60 giorni?");
  }

  function quickRogitiNovembre() {
    const item = incomeItems.find((i) => (i.description || "").toLowerCase().includes("rogit") || (i.description || "").toLowerCase().includes("posti auto"));
    if (!item) { push("Cosa succede se i rogiti slittano a novembre?", "Non trovo un incasso legato ai rogiti/posti auto in Cash Flow Center."); return; }
    simulateMoveTo(item, "2026-11-15", "Cosa succede se i rogiti dei posti auto si fanno a metà novembre?");
  }

  function askAssets() {
    const monetizable = data.assets.filter((a) => a.quick_sale_value || a.estimated_value);
    if (!monetizable.length) {
      push("Quali asset VALOR posso monetizzare entro 60 giorni?", "Nessun asset è ancora censito nel modulo VALOR Assets con un valore di vendita stimato. Aggiungi gli asset con i relativi valori per ottenere una risposta puntuale.");
      return;
    }
    const sorted = [...monetizable].sort((a, b) => (b.quick_sale_value || b.estimated_value || 0) - (a.quick_sale_value || a.estimated_value || 0));
    const lines = sorted.slice(0, 8).map((a) => `• ${a.model || a.valor_id || "Asset"} — vendita rapida ${eur(a.quick_sale_value || a.estimated_value)}`);
    push("Quali asset VALOR posso monetizzare entro 60 giorni?", lines.join("\n"));
  }

  function askLoans2026() {
    const ending = data.bankObligations.filter((b) => b.final_due_date && b.final_due_date <= "2026-12-31");
    if (!ending.length) {
      push("Quali rate bancarie finiscono nel 2026?", "Nessuna rata bancaria censita ha una scadenza finale entro il 2026.");
      return;
    }
    const lines = ending.map((b) => `• ${b.description} (${companyName(data.companies, b.company_id)}) — ${eur(b.monthly_payment)}/mese, fine ${b.final_due_date}`);
    const relief = ending.reduce((s, b) => s + (Number(b.monthly_payment) || 0), 0);
    push("Quali rate bancarie finiscono nel 2026?", lines.join("\n") + `\nAlleggerimento totale da gennaio 2027: ${eur(relief)}/mese.`);
  }

  // Same window rules as the projection: only dated items inside Jul–Dec 2026,
  // bank obligations up to their final due date, undated income reported apart.
  function askBurningCompanies() {
    const byCompany = {};
    for (const c of data.companies) byCompany[c.id] = { name: c.name, net: 0, undated: 0 };
    for (const item of data.cashFlowItems) {
      if (item.simulateOff || !item.company_id || !byCompany[item.company_id]) continue;
      const amt = Number(item.amount) || 0;
      if (!item.due_date) {
        if (item.type === "entrata") byCompany[item.company_id].undated += amt;
        continue;
      }
      const m = ym(item.due_date);
      if (m < START_YM || m > END_YM) continue;
      byCompany[item.company_id].net += item.type === "entrata" ? amt : -amt;
    }
    for (const bo of data.bankObligations) {
      if (bo.status === "estinto" || !byCompany[bo.company_id]) continue;
      const monthsCharged = months.filter((m) => !bo.final_due_date || m <= ym(bo.final_due_date)).length;
      byCompany[bo.company_id].net -= (Number(bo.monthly_payment) || 0) * monthsCharged;
    }
    const ranked = Object.values(byCompany).sort((a, b) => a.net - b.net).filter((c) => c.net !== 0 || c.undated !== 0);
    if (!ranked.length) {
      push("Quali società stanno assorbendo liquidità?", "Dati insufficienti per calcolare il saldo netto per società.");
      return;
    }
    const lines = ranked.map((c) => {
      const base = `• ${c.name}: ${c.net < 0 ? "assorbe" : "genera"} ${eur(Math.abs(c.net))} nel periodo lug–dic 2026`;
      return c.undated > 0 ? `${base} (esclusi ${eur(c.undated)} di incassi senza data, da programmare)` : base;
    });
    push("Quali società stanno assorbendo liquidità?", lines.join("\n") + "\n(Conteggio: solo movimenti con data nel periodo + rate bancarie fino alla loro scadenza.)");
  }

  function askAccelerate() {
    const candidates = data.cashFlowItems.filter((i) => i.type === "entrata" && !i.simulateOff && ["previsto", "da approvare", "da formalizzare"].includes(i.status));
    if (!candidates.length) {
      push("Quali incassi devo accelerare questa settimana?", "Nessun incasso in stato previsto/da approvare al momento.");
      return;
    }
    const sorted = [...candidates].sort((a, b) => (b.amount || 0) - (a.amount || 0));
    const lines = sorted.map((i) => `• ${i.description} — ${eur(i.amount)} (${i.due_date ? `previsto ${i.due_date}` : "senza data — assegnala!"}, probabilità ${i.probability ?? "?"}%)`);
    push("Quali incassi devo accelerare questa settimana?", lines.join("\n"));
  }

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>AI CFO / Operating Assistant</div>
      <div style={{ fontSize: 12, color: B.gray, marginBottom: 16 }}>
        Motore di regole deterministico sui dati reali del sistema — nessuna chiamata esterna, nessun dato inventato.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <SecTitle icon={Sparkles} title="Posso permettermi questa spesa?" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <MiniField label="Importo €"><input type="number" value={spendAmount} onChange={(e) => setSpendAmount(e.target.value)} style={C.inp} /></MiniField>
            <MiniField label="Mese"><input type="month" value={spendMonth} onChange={(e) => setSpendMonth(e.target.value)} style={C.inp} /></MiniField>
            <button style={C.btn} onClick={askSpend}><Send size={13} /> Chiedi</button>
          </div>
        </Card>
        <Card>
          <SecTitle icon={Sparkles} title="Quanto devo incassare per stare tranquillo?" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
            <MiniField label="Entro"><input type="month" value={targetMonth} onChange={(e) => setTargetMonth(e.target.value)} style={C.inp} /></MiniField>
            <MiniField label="Buffer desiderato €"><input type="number" value={targetBuffer} onChange={(e) => setTargetBuffer(e.target.value)} style={C.inp} /></MiniField>
            <button style={C.btn} onClick={askRunway}><Send size={13} /> Chiedi</button>
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={Clock} title="Simulatore ritardi incassi" sub="Testa lo slittamento di un incasso senza toccare i dati reali" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <MiniField label="Incasso">
            <select value={delayItemId || incomeItems[0]?.id || ""} onChange={(e) => setDelayItemId(e.target.value)} style={C.inp}>
              {incomeItems.map((i) => <option key={i.id} value={i.id}>{i.description} ({eur(i.amount)})</option>)}
            </select>
          </MiniField>
          <MiniField label="Data ipotetica (se manca)"><input type="month" value={hypoMonth} onChange={(e) => setHypoMonth(e.target.value)} style={C.inp} /></MiniField>
          <MiniField label="Ritardo (giorni)">
            <select value={delayDays} onChange={(e) => setDelayDays(Number(e.target.value))} style={C.inp}>
              {[30, 60, 90].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </MiniField>
          <button style={C.btn} onClick={simulateDelay}><Send size={13} /> Simula ritardo</button>
        </div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={Bot} title="Domande rapide" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button style={C.btnGhost} onClick={askAssets}>Quali asset posso monetizzare?</button>
          <button style={C.btnGhost} onClick={askLoans2026}>Quali rate bancarie finiscono nel 2026?</button>
          <button style={C.btnGhost} onClick={askBurningCompanies}>Quali società assorbono liquidità?</button>
          <button style={C.btnGhost} onClick={askAccelerate}>Quali incassi devo accelerare?</button>
          <button style={C.btnGhost} onClick={quickDCS}>DCS ritarda 60gg?</button>
          <button style={C.btnGhost} onClick={quickRogitiNovembre}>Rogiti a metà novembre?</button>
        </div>
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {log.length === 0 && <Card style={{ color: B.dim, fontStyle: "italic" }}>Fai una domanda qui sopra per vedere l'analisi.</Card>}
        {log.map((entry) => (
          <Card key={entry.id}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: B.gold, marginBottom: 6 }}>{entry.q}</div>
            <div style={{ fontSize: 13, whiteSpace: "pre-line", lineHeight: 1.5 }}>{entry.a}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MiniField({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 10.5, color: B.dim, marginBottom: 3 }}>{label}</div>
      {children}
    </div>
  );
}
