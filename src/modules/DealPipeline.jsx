import { Briefcase } from "lucide-react";
import { B } from "../lib/theme.js";
import { eur } from "../lib/theme.js";
import { Card, SecTitle, EditableTable } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const STAGE_OPTIONS = ["lead", "in trattativa", "offerta inviata", "due diligence", "contratto", "pagamento atteso", "incassato", "chiuso perso", "bloccato"];
const COMPLIANCE_OPTIONS = ["ok", "da verificare", "rischio", "bloccato"];

export default function DealPipeline() {
  const { data, updateItem, addItem, removeItem } = useStore();

  function companySelect(row) {
    return (
      <select
        value={data.companies.find((c) => c.id === row.company_id)?.name || ""}
        onChange={(e) => updateItem("deals", row.id, { company_id: data.companies.find((c) => c.name === e.target.value)?.id || null })}
        style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
      >
        <option value="">—</option>
        {data.companies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
    );
  }

  const columns = [
    { key: "company_id", label: "Società", width: 160, render: companySelect },
    { key: "counterparty", label: "Controparte", width: 160 },
    { key: "country", label: "Paese", width: 100 },
    { key: "gross_value", label: "Importo lordo €", type: "number", width: 110 },
    { key: "expected_margin", label: "Margine atteso €", type: "number", width: 110 },
    { key: "probability", label: "Probabilità %", type: "number", width: 90 },
    { key: "expected_close_date", label: "Incasso previsto", type: "date", width: 130 },
    { key: "stage", label: "Stage", type: "select", options: STAGE_OPTIONS, width: 130 },
    { key: "compliance_status", label: "Rischio compliance", type: "select", options: COMPLIANCE_OPTIONS, width: 130 },
    { key: "next_action", label: "Prossima azione", width: 180 },
    { key: "notes", label: "Note", width: 180 },
  ];

  const totalPipeline = data.deals.reduce((s, d) => s + (Number(d.gross_value) || 0), 0);

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Deal Pipeline</div>
      <Card>
        <SecTitle icon={Briefcase} title="Operazioni commerciali e straordinarie" sub={`${data.deals.length} deal · ${eur(totalPipeline)} pipeline`} />
        <EditableTable
          columns={columns}
          rows={data.deals}
          onCellChange={(id, key, value) => updateItem("deals", id, { [key]: value })}
          onDelete={(id) => removeItem("deals", id)}
          onAdd={() => addItem("deals", { company_id: null, project_id: null, asset_id: null, counterparty: "Nuova controparte", country: null, gross_value: null, expected_margin: null, probability: 30, expected_close_date: null, stage: "lead", compliance_status: "da verificare", next_action: null, notes: null })}
          addLabel="Aggiungi deal"
          emptyLabel="Nessun deal in pipeline."
        />
      </Card>
    </div>
  );
}
