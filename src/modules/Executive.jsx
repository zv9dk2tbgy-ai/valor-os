import { useMemo, useState } from "react";
import { Wallet, Landmark, TrendingDown, TrendingUp, Gauge, CalendarClock, AlertTriangle } from "lucide-react";
import { B } from "../lib/theme.js";
import { eur, monthLabel } from "../lib/theme.js";
import { Card, SecTitle, KpiCard, AlertBanner, Bar, Bdg, EditableTable, RefSelect } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";
import { buildProjection, healthScore, buildAlerts, SCENARIOS, cashOnHand, isActiveObligation } from "../lib/calc.js";

const START_YM = "2026-07";
const END_YM = "2026-12";

export default function Executive() {
  const { data, updateItem, addItem, removeItem } = useStore();
  const [scenario, setScenario] = useState("realistico");

  const projections = useMemo(() => {
    const out = {};
    for (const s of SCENARIOS) {
      out[s.id] = buildProjection({
        cashFlowItems: data.cashFlowItems,
        bankObligations: data.bankObligations,
        cashPositions: data.cashPositions,
        startYm: START_YM, endYm: END_YM, scenario: s.id,
      });
    }
    return out;
  }, [data]);

  const proj = projections[scenario];
  const score = healthScore(proj);
  const alerts = buildAlerts({ ...proj, bankObligations: data.bankObligations, decisions: data.decisions });

  // cashOnHand nets positives and negatives, so it IS the after-debts figure;
  // grossCash isolates the positive balances for the headline KPI.
  const netCash = cashOnHand(data.cashPositions);
  const grossCash = data.cashPositions.filter((c) => (Number(c.amount) || 0) > 0).reduce((s, c) => s + Number(c.amount), 0);
  const immediateDebts = data.cashPositions.filter((c) => (Number(c.amount) || 0) < 0).reduce((s, c) => s + Number(c.amount), 0);
  const monthlyBank = data.bankObligations.filter(isActiveObligation).reduce((s, b) => s + (Number(b.monthly_payment) || 0), 0);
  const thisMonthRow = proj.rows[0];
  const decRow = proj.rows[proj.rows.length - 1];

  const totalIn = proj.rows.reduce((s, r) => s + r.entrate, 0);
  const totalOut = proj.rows.reduce((s, r) => s + r.uscite, 0);
  const burnRate = proj.rows.length ? totalOut / proj.rows.length : 0;
  const negIdx = proj.rows.findIndex((r) => r.closing < 0);
  const runway = negIdx === -1 ? `> ${proj.rows.length} mesi` : negIdx === 0 ? "< 1 mese" : `${negIdx} mes${negIdx === 1 ? "e" : "i"}`;
  const unschedIn = proj.unscheduled.filter((u) => u.type === "entrata").reduce((s, u) => s + (Number(u.amount) || 0), 0);
  const bankInWindow = monthlyBank * proj.rows.length;
  const dscr = bankInWindow > 0 ? (totalIn / bankInWindow) : null;
  const docsTot = data.documents.length;
  const docsOk = data.documents.filter((d) => d.status === "presente").length;
  const docPct = docsTot ? Math.round((docsOk / docsTot) * 100) : null;

  const scoreColor = score >= 70 ? B.green : score >= 40 ? B.amber : B.red;

  return (
    <div className="fu">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Executive Dashboard</div>
        <div style={{ display: "flex", gap: 6 }}>
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setScenario(s.id)}
              style={{
                fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 8, cursor: "pointer",
                background: scenario === s.id ? `${s.color}22` : B.surface,
                border: `1px solid ${scenario === s.id ? s.color : B.border}`,
                color: scenario === s.id ? s.color : B.gray,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <AlertBanner
        color={alerts.some((a) => a.level === "high") ? B.red : B.amber}
        items={alerts.map((a) => a.text)}
      />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Cassa disponibile oggi" value={eur(grossCash)} icon={Wallet} sub="Somma saldi attivi" />
        <KpiCard label="Cassa netta dopo debiti immediati" value={eur(netCash)} icon={Wallet} sub={`Debiti immediati: ${eur(immediateDebts)}`} alert={netCash < 0} />
        <KpiCard label="Impegni bancari mensili" value={eur(monthlyBank)} icon={Landmark} sub="Rate + Telepass + Amex" />
        <KpiCard label={`Saldo previsto fine ${monthLabel(thisMonthRow.ym)}`} value={eur(thisMonthRow.closing)} icon={thisMonthRow.closing >= 0 ? TrendingUp : TrendingDown} alert={thisMonthRow.closing < 0} />
        <KpiCard label="Saldo previsto dicembre 2026" value={eur(decRow.closing)} icon={CalendarClock} alert={decRow.closing < 0} sub={`Scenario ${scenario}`} />
        <KpiCard label="Health score" value={String(score)} color={scoreColor} icon={Gauge} sub="0 = critico, 100 = solido" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Burn rate mensile" value={eur(burnRate)} icon={TrendingDown} sub="Uscite medie mensili nel periodo" />
        <KpiCard label="Cash runway" value={runway} icon={CalendarClock} alert={negIdx !== -1} color={negIdx !== -1 ? B.red : B.white} sub="Mesi prima del primo saldo negativo" />
        <KpiCard label="Incassi attesi nel periodo" value={eur(totalIn)} icon={TrendingUp} sub={`Scenario ${scenario}, solo voci con data`} />
        <KpiCard label="Incassi da programmare" value={eur(unschedIn)} icon={AlertTriangle} alert={unschedIn > 0} sub="Senza data: fuori dalla proiezione" />
        <KpiCard label="Debt service coverage" value={dscr === null ? "—" : dscr.toFixed(2)} icon={Landmark} alert={dscr !== null && dscr < 1} sub="Incassi attesi / rate bancarie del periodo" />
        <KpiCard label="Document readiness" value={docPct === null ? "—" : `${docPct}%`} icon={Gauge} sub={docsTot ? `${docsOk}/${docsTot} documenti presenti` : "Nessun documento censito"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14, marginBottom: 14 }}>
        <Card>
          <SecTitle icon={CalendarClock} title={`Andamento cassa · Lug–Dic 2026 · Scenario ${scenario}`} />
          <MonthlyBars rows={proj.rows} />
        </Card>
        <Card>
          <SecTitle icon={AlertTriangle} title="Confronto scenari — saldo a dicembre 2026" color={B.amber} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SCENARIOS.map((s) => {
              const p = projections[s.id];
              const last = p.rows[p.rows.length - 1];
              const min = Math.min(...p.rows.map((r) => r.closing));
              return (
                <div key={s.id} style={{ borderTop: `1px solid ${B.border}`, paddingTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.label}</span>
                    <span style={{ fontWeight: 700 }}>{eur(last.closing)}</span>
                  </div>
                  <div style={{ fontSize: 11, color: B.gray, marginTop: 2 }}>Minimo periodo: {eur(min)}</div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={Wallet} title="Posizioni di cassa" sub="Saldi positivi e debiti immediati (importo negativo) — base di ogni proiezione" />
        <EditableTable
          columns={[
            {
              key: "company_id", label: "Società", width: 170,
              render: (row) => <RefSelect value={row.company_id} options={data.companies} onChange={(id) => updateItem("cashPositions", row.id, { company_id: id })} />,
            },
            { key: "label", label: "Descrizione", width: 200 },
            { key: "amount", label: "Importo € (negativo = debito)", type: "number", width: 150 },
            { key: "as_of_date", label: "Aggiornato al", type: "date", width: 130 },
            { key: "source", label: "Fonte", width: 150 },
            { key: "reliability", label: "Affidabilità", width: 130 },
            { key: "notes", label: "Note", width: 200 },
          ]}
          rows={data.cashPositions}
          onCellChange={(id, key, value) => updateItem("cashPositions", id, { [key]: value })}
          onDelete={(id) => removeItem("cashPositions", id)}
          onAdd={() => addItem("cashPositions", { company_id: null, label: "Nuova posizione", amount: null, as_of_date: null, source: null, reliability: null, notes: null })}
          addLabel="Aggiungi posizione di cassa"
          emptyLabel="Nessuna posizione di cassa: la proiezione parte da €0. Aggiungi il saldo conto reale."
        />
      </Card>

      {proj.unscheduled.length > 0 && (
        <Card>
          <SecTitle icon={AlertTriangle} title="Incassi/uscite senza data — non inclusi nella proiezione mensile" color={B.amber} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {proj.unscheduled.map((u) => (
              <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5, borderTop: `1px solid ${B.border}`, paddingTop: 8 }}>
                <span>{u.description}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Bdg color={u.type === "entrata" ? B.green : B.red}>{eur(u.amount)}</Bdg>
                  <span style={{ color: B.dim, fontSize: 11 }}>Vai in Cash Flow Center per assegnare una data</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function MonthlyBars({ rows }) {
  const max = Math.max(...rows.map((r) => Math.abs(r.closing)), 1000);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((r) => (
        <div key={r.ym} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 64, fontSize: 11, color: B.gray, textTransform: "capitalize" }}>{monthLabel(r.ym)}</div>
          <div style={{ flex: 1 }}>
            <Bar pct={Math.round((Math.abs(r.closing) / max) * 100)} color={r.closing < 0 ? B.red : B.green} h={8} />
          </div>
          <div style={{ width: 96, textAlign: "right", fontSize: 12, fontWeight: 700, color: r.closing < 0 ? B.red : B.white }}>{eur(r.closing)}</div>
        </div>
      ))}
    </div>
  );
}
