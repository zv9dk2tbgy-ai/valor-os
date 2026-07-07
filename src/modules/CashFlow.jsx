import { useMemo, useState } from "react";
import { Layers, CalendarRange } from "lucide-react";
import { B } from "../lib/theme.js";
import { eur, monthLabel } from "../lib/theme.js";
import { Card, SecTitle, EditableTable, DemoTag } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";
import { buildProjection, SCENARIOS } from "../lib/calc.js";

const STATUS_OPTIONS = ["previsto", "confermato", "incassato", "pagato", "scaduto", "rischio", "da approvare", "da formalizzare"];
const TYPE_OPTIONS = ["entrata", "uscita"];

export default function CashFlow() {
  const { data, updateItem, addItem, removeItem } = useStore();
  const [scenario, setScenario] = useState("realistico");
  const [extend2027, setExtend2027] = useState(false);

  const endYm = extend2027 ? "2027-06" : "2026-12";
  const proj = useMemo(() => buildProjection({
    cashFlowItems: data.cashFlowItems,
    bankObligations: data.bankObligations,
    cashPositions: data.cashPositions,
    startYm: "2026-07", endYm, scenario,
  }), [data, scenario, endYm]);

  const companyOptions = data.companies.map((c) => c.name);
  const projectOptions = data.projects.map((p) => p.name);
  const companyByName = (name) => data.companies.find((c) => c.name === name)?.id || null;
  const projectByName = (name) => data.projects.find((p) => p.name === name)?.id || null;

  const columns = [
    { key: "type", label: "Tipo", type: "select", options: TYPE_OPTIONS, width: 90 },
    {
      key: "company_id", label: "Società", width: 160,
      render: (row) => (
        <select
          value={data.companies.find((c) => c.id === row.company_id)?.name || ""}
          onChange={(e) => updateItem("cashFlowItems", row.id, { company_id: companyByName(e.target.value) })}
          style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
        >
          <option value="">—</option>
          {companyOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      ),
    },
    {
      key: "project_id", label: "Progetto", width: 160,
      render: (row) => (
        <select
          value={data.projects.find((p) => p.id === row.project_id)?.name || ""}
          onChange={(e) => updateItem("cashFlowItems", row.id, { project_id: projectByName(e.target.value) })}
          style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
        >
          <option value="">—</option>
          {projectOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      ),
    },
    { key: "category", label: "Categoria", width: 150 },
    { key: "description", label: "Descrizione", width: 220 },
    { key: "amount", label: "Importo €", type: "number", width: 110 },
    { key: "due_date", label: "Data prevista", type: "date", width: 130 },
    { key: "actual_date", label: "Data effettiva", type: "date", width: 130 },
    { key: "status", label: "Stato", type: "select", options: STATUS_OPTIONS, width: 130 },
    { key: "probability", label: "Probabilità %", type: "number", width: 90 },
    { key: "source", label: "Fonte", width: 150 },
    { key: "notes", label: "Note", width: 200 },
    { key: "simulateOff", label: "Escludi da simulazione", type: "checkbox", width: 60 },
  ];

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Cash Flow Center</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: B.gray }}>
            <input type="checkbox" checked={extend2027} onChange={(e) => setExtend2027(e.target.checked)} />
            Estendi al 2027
          </label>
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
      </div>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={CalendarRange} title="Vista mensile" sub={`Apertura ${eur(proj.openingCash)} → chiusura ${eur(proj.endingBalance)}`} />
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Mese</th><th>Apertura</th><th>Entrate</th><th>Uscite</th><th>Netto</th><th>Chiusura</th>
              </tr>
            </thead>
            <tbody>
              {proj.rows.map((r) => (
                <tr key={r.ym}>
                  <td style={{ textTransform: "capitalize" }}>{monthLabel(r.ym)}</td>
                  <td>{eur(r.opening)}</td>
                  <td style={{ color: B.green }}>{eur(r.entrate)}</td>
                  <td style={{ color: B.red }}>{eur(r.uscite)}</td>
                  <td style={{ color: r.net < 0 ? B.red : B.green }}>{eur(r.net)}</td>
                  <td style={{ fontWeight: 700, color: r.closing < 0 ? B.red : B.white }}>{eur(r.closing)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {proj.unscheduled.length > 0 && (
        <Card style={{ marginBottom: 14, borderColor: `${B.amber}55` }}>
          <SecTitle icon={CalendarRange} title="Voci senza data prevista — assegna una data per includerle nella proiezione" color={B.amber} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {proj.unscheduled.map((u) => (
              <div key={u.id} style={{ fontSize: 12, background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, padding: "8px 10px" }}>
                <strong>{u.description}</strong> — {eur(u.amount)} ({u.type})
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SecTitle icon={Layers} title="Movimenti di cassa" sub={<DemoTagIfAny rows={data.cashFlowItems} />} />
        <EditableTable
          columns={columns}
          rows={data.cashFlowItems}
          onCellChange={(id, key, value) => updateItem("cashFlowItems", id, { [key]: value })}
          onDelete={(id) => removeItem("cashFlowItems", id)}
          onAdd={() => addItem("cashFlowItems", {
            type: "entrata", company_id: null, project_id: null, category: null, description: "Nuovo movimento",
            amount: null, due_date: null, actual_date: null, status: "previsto", probability: 50,
            source: null, responsible: null, notes: null, simulateOff: false,
          })}
          addLabel="Aggiungi movimento"
        />
      </Card>
    </div>
  );
}

function DemoTagIfAny({ rows }) {
  return rows.some((r) => r.demo) ? <DemoTag /> : null;
}
