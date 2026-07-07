import { useMemo, useState } from "react";
import { Bot, Sparkles, Send } from "lucide-react";
import { B, C } from "../lib/theme.js";
import { eur, monthLabel } from "../lib/theme.js";
import { Card, SecTitle } from "../lib/ui.jsx";
import { useStore, companyName } from "../lib/store.jsx";
import { buildProjection, monthsBetween } from "../lib/calc.js";

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

  const months = useMemo(() => monthsBetween(START_YM, END_YM), []);

  const baseline = useMemo(() => buildProjection({
    cashFlowItems: data.cashFlowItems, bankObligations: data.bankObligations, cashPositions: data.cashPositions,
    startYm: START_YM, endYm: END_YM, scenario: "realistico",
  }), [data]);

  function push(q, a) {
    setLog((l) => [{ q, a, id: Date.now() + Math.random() }, ...l]);
  }

  function askSpend() {
    const amount = Number(spendAmount) || 0;
    const simItems = [...data.cashFlowItems, { id: "__sim", type: "uscita", category: "Simulazione", description: "Spesa simulata", amount, due_date: `${spendMonth}-15`, status: "confermato", probability: 100, simulateOff: false }];
    const sim = buildProjection({ cashFlowItems: simItems, bankObligations: data.bankObligations, cashPositions: data.cashPositions, startYm: START_YM, endYm: END_YM, scenario: "realistico" });
    const minAfter = Math.min(...sim.rows.map((r) => r.closing));
    const decAfter = sim.rows[sim.rows.length - 1].closing;
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
    push("Quali rate bancarie finiscono nel 2026?", lines.join("\n"));
  }

  function askBurningCompanies() {
    const byCompany = {};
    for (const c of data.companies) byCompany[c.id] = { name: c.name, net: 0 };
    for (const item of data.cashFlowItems) {
      if (item.simulateOff || !item.company_id || !byCompany[item.company_id]) continue;
      const amt = Number(item.amount) || 0;
      byCompany[item.company_id].net += item.type === "entrata" ? amt : -amt;
    }
    for (const bo of data.bankObligations) {
      if (!byCompany[bo.company_id]) continue;
      byCompany[bo.company_id].net -= (Number(bo.monthly_payment) || 0) * 6;
    }
    const ranked = Object.values(byCompany).sort((a, b) => a.net - b.net).filter((c) => c.net !== 0);
    if (!ranked.length) {
      push("Quali società stanno assorbendo liquidità?", "Dati insufficienti per calcolare il saldo netto per società.");
      return;
    }
    const lines = ranked.map((c) => `• ${c.name}: ${c.net < 0 ? "assorbe" : "genera"} ${eur(Math.abs(c.net))} nel periodo lug–dic 2026`);
    push("Quali società stanno assorbendo liquidità?", lines.join("\n"));
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

  function askDelaySensitivity(label) {
    const undated = data.cashFlowItems.filter((i) => i.type === "entrata" && !i.due_date && (i.amount || 0) > 0);
    push(
      label,
      undated.length
        ? `Queste voci non hanno ancora una data prevista, quindi uno slittamento non è simulabile finché non assegni una data in Cash Flow Center: ${undated.map((i) => i.description).join(", ")}. Non appena inserisci una data, potrai testare qui lo scenario di ritardo di 30/60/90 giorni.`
        : "Tutte le voci principali hanno una data assegnata: modifica la data prevista in Cash Flow Center per vedere l'effetto di uno slittamento."
    );
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
        <SecTitle icon={Bot} title="Domande rapide" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button style={C.btnGhost} onClick={askAssets}>Quali asset posso monetizzare?</button>
          <button style={C.btnGhost} onClick={askLoans2026}>Quali rate bancarie finiscono nel 2026?</button>
          <button style={C.btnGhost} onClick={askBurningCompanies}>Quali società assorbono liquidità?</button>
          <button style={C.btnGhost} onClick={askAccelerate}>Quali incassi devo accelerare?</button>
          <button style={C.btnGhost} onClick={() => askDelaySensitivity("Cosa succede se DCS ritarda di 60 giorni?")}>DCS ritarda 60gg?</button>
          <button style={C.btnGhost} onClick={() => askDelaySensitivity("Cosa succede se i rogiti slittano a novembre?")}>Rogiti slittano a novembre?</button>
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
