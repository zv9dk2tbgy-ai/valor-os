import { Briefcase, Scale, Target } from "lucide-react";
import { eur } from "../lib/theme.js";
import { Card, SecTitle, EditableTable, KpiCard, RefSelect } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const STAGE_OPTIONS = ["lead", "in trattativa", "offerta inviata", "due diligence", "contratto", "pagamento atteso", "incassato", "chiuso perso", "bloccato"];
const COMPLIANCE_OPTIONS = ["ok", "da verificare", "rischio", "bloccato"];
const CLOSED_STAGES = ["incassato", "chiuso perso"];

export default function DealPipeline() {
  const { data, updateItem, addItem, removeItem } = useStore();

  function companySelect(row) {
    return <RefSelect value={row.company_id} options={data.companies} onChange={(id) => updateItem("deals", row.id, { company_id: id })} />;
  }

  function projectSelect(row) {
    return <RefSelect value={row.project_id} options={data.projects} onChange={(id) => updateItem("deals", row.id, { project_id: id })} />;
  }

  const columns = [
    { key: "company_id", label: "Società", width: 150, render: companySelect },
    { key: "project_id", label: "Progetto", width: 140, render: projectSelect },
    { key: "counterparty", label: "Controparte", width: 160 },
    { key: "country", label: "Paese", width: 100 },
    { key: "gross_value", label: "Importo lordo €", type: "number", width: 110 },
    { key: "expected_margin", label: "Margine atteso €", type: "number", width: 110 },
    { key: "probability", label: "Probabilità %", type: "number", width: 90 },
    { key: "expected_close_date", label: "Incasso previsto", type: "date", width: 130 },
    { key: "stage", label: "Stage", type: "select", options: STAGE_OPTIONS, width: 130 },
    { key: "compliance_status", label: "Rischio compliance", type: "select", options: COMPLIANCE_OPTIONS, width: 130 },
    { key: "missing_documents", label: "Documenti mancanti", width: 170 },
    { key: "next_action", label: "Prossima azione", width: 170 },
    { key: "responsible", label: "Responsabile", width: 120 },
    { key: "notes", label: "Note", width: 170 },
  ];

  const open = data.deals.filter((d) => !CLOSED_STAGES.includes(d.stage));
  const totalPipeline = open.reduce((s, d) => s + (Number(d.gross_value) || 0), 0);
  const weighted = open.reduce((s, d) => s + (Number(d.gross_value) || 0) * ((Number(d.probability) || 0) / 100), 0);
  const totalMargin = open.reduce((s, d) => s + (Number(d.expected_margin) || 0), 0);

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Deal Pipeline</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Pipeline aperta" value={eur(totalPipeline)} icon={Briefcase} sub={`${open.length} deal attivi`} />
        <KpiCard label="Pipeline ponderata" value={eur(weighted)} icon={Scale} sub="Importi × probabilità" />
        <KpiCard label="Margine atteso totale" value={eur(totalMargin)} icon={Target} />
      </div>

      <Card>
        <SecTitle icon={Briefcase} title="Operazioni commerciali e straordinarie" sub={`${data.deals.length} deal totali`} />
        <EditableTable
          columns={columns}
          rows={data.deals}
          onCellChange={(id, key, value) => updateItem("deals", id, { [key]: value })}
          onDelete={(id) => removeItem("deals", id)}
          onAdd={() => addItem("deals", { company_id: null, project_id: null, asset_id: null, counterparty: "Nuova controparte", country: null, gross_value: null, expected_margin: null, probability: 30, expected_close_date: null, stage: "lead", compliance_status: "da verificare", missing_documents: null, next_action: null, responsible: null, notes: null })}
          addLabel="Aggiungi deal"
          emptyLabel="Nessun deal in pipeline."
        />
      </Card>
    </div>
  );
}
