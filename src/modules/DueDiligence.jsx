import { FileText } from "lucide-react";
import { B } from "../lib/theme.js";
import { Card, SecTitle, EditableTable } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const CATEGORY_OPTIONS = [
  "legale", "fiscale", "bancaria", "societaria", "contrattuale", "tecnica", "catastale",
  "urbanistica", "commerciale", "compliance", "KYC/AML", "assicurazioni", "contenziosi",
  "autorizzazioni", "provenienza beni", "titolarità asset", "vincoli/ipoteche", "notarile",
];
const STATUS_OPTIONS = ["presente", "mancante", "da aggiornare", "scaduto", "da firmare", "in attesa", "da completare"];

export default function DueDiligence() {
  const { data, updateItem, addItem, removeItem } = useStore();

  function relSelect(row, field, options) {
    return (
      <select
        value={options.find((o) => o.id === row[field])?.name || options.find((o) => o.id === row[field])?.title || ""}
        onChange={(e) => updateItem("documents", row.id, { [field]: options.find((o) => (o.name || o.title) === e.target.value)?.id || null })}
        style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
      >
        <option value="">—</option>
        {options.map((o) => <option key={o.id} value={o.name || o.title}>{o.name || o.title}</option>)}
      </select>
    );
  }

  const columns = [
    { key: "name", label: "Nome documento", width: 220 },
    { key: "category", label: "Categoria", type: "select", options: CATEGORY_OPTIONS, width: 150 },
    { key: "company_id", label: "Società", width: 150, render: (row) => relSelect(row, "company_id", data.companies) },
    { key: "project_id", label: "Progetto", width: 150, render: (row) => relSelect(row, "project_id", data.projects) },
    { key: "status", label: "Stato", type: "select", options: STATUS_OPTIONS, width: 130 },
    { key: "issue_date", label: "Data documento", type: "date", width: 130 },
    { key: "expiry_date", label: "Scadenza", type: "date", width: 120 },
    { key: "responsible", label: "Responsabile", width: 130 },
    { key: "notes", label: "Note", width: 220 },
  ];

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Due Diligence & Documenti</div>
      <Card>
        <SecTitle icon={FileText} title="Checklist documentale per società, progetto e asset" sub={`${data.documents.length} documenti`} />
        <EditableTable
          columns={columns}
          rows={data.documents}
          onCellChange={(id, key, value) => updateItem("documents", id, { [key]: value })}
          onDelete={(id) => removeItem("documents", id)}
          onAdd={() => addItem("documents", { company_id: null, project_id: null, asset_id: null, name: "Nuovo documento", category: null, status: "da completare", issue_date: null, expiry_date: null, file_url: null, responsible: null, notes: null })}
          addLabel="Aggiungi documento"
        />
      </Card>
    </div>
  );
}
