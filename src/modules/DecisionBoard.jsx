import { useMemo } from "react";
import { ListChecks, Flame } from "lucide-react";
import { B } from "../lib/theme.js";
import { eur, fmtDate } from "../lib/theme.js";
import { Card, SecTitle, EditableTable, KpiCard, Bdg, RefSelect } from "../lib/ui.jsx";
import { useStore, companyName } from "../lib/store.jsx";

const PRIORITY_OPTIONS = ["alta", "media", "bassa"];
const STATUS_OPTIONS = ["aperta", "in corso", "completata", "annullata"];
const PRIORITY_ORDER = { alta: 0, media: 1, bassa: 2 };
const PRIORITY_COLOR = { alta: B.red, media: B.amber, bassa: B.gray };

export default function DecisionBoard() {
  const { data, updateItem, addItem, removeItem } = useStore();

  const sorted = useMemo(
    () => [...data.decisions].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)),
    [data.decisions]
  );

  const open = data.decisions.filter((d) => d.status !== "completata" && d.status !== "annullata");
  const highOpen = open.filter((d) => d.priority === "alta");
  const cashAtStake = open.reduce((s, d) => s + Math.abs(Number(d.cash_impact) || 0), 0);

  function companySelect(row) {
    return <RefSelect value={row.company_id} options={data.companies} onChange={(id) => updateItem("decisions", row.id, { company_id: id })} />;
  }

  const columns = [
    { key: "priority", label: "Priorità", type: "select", options: PRIORITY_OPTIONS, width: 100 },
    { key: "title", label: "Decisione", width: 240 },
    { key: "description", label: "Descrizione", width: 220 },
    { key: "company_id", label: "Società", width: 150, render: companySelect },
    { key: "cash_impact", label: "Impatto cassa €", type: "number", width: 110 },
    { key: "risk_if_delayed", label: "Rischio se non fatta", width: 200 },
    { key: "deadline", label: "Deadline", type: "date", width: 120 },
    { key: "responsible", label: "Responsabile", width: 130 },
    { key: "status", label: "Stato", type: "select", options: STATUS_OPTIONS, width: 120 },
  ];

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Decision Board</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Decisioni aperte" value={String(open.length)} icon={ListChecks} />
        <KpiCard label="Alta priorità aperte" value={String(highOpen.length)} icon={Flame} alert={highOpen.length > 0} color={highOpen.length > 0 ? B.red : B.white} />
        <KpiCard label="Cassa in gioco (aperte)" value={eur(cashAtStake)} icon={ListChecks} />
      </div>

      {highOpen.length > 0 && (
        <Card style={{ marginBottom: 14, borderColor: `${B.red}55` }}>
          <SecTitle icon={Flame} title="Da fare oggi — alta priorità" color={B.red} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {highOpen.map((d) => (
              <div key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 12.5, borderTop: `1px solid ${B.border}`, paddingTop: 8, flexWrap: "wrap" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <Bdg color={PRIORITY_COLOR[d.priority] || B.gray}>{d.priority}</Bdg>
                  <span><strong>{d.title}</strong> — {companyName(data.companies, d.company_id)}</span>
                </span>
                <span style={{ color: B.gray }}>{d.deadline ? `Entro ${fmtDate(d.deadline)}` : "Senza deadline"}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SecTitle icon={ListChecks} title="Tutte le decisioni" sub={`${sorted.length} voci, ordinate per priorità`} />
        <EditableTable
          columns={columns}
          rows={sorted}
          onCellChange={(id, key, value) => updateItem("decisions", id, { [key]: value })}
          onDelete={(id) => removeItem("decisions", id)}
          onAdd={() => addItem("decisions", { company_id: null, project_id: null, asset_id: null, title: "Nuova decisione", description: null, priority: "media", cash_impact: null, risk_if_delayed: null, deadline: null, status: "aperta", responsible: null })}
          addLabel="Aggiungi decisione"
        />
      </Card>
    </div>
  );
}
