import { Building2 } from "lucide-react";
import { B } from "../lib/theme.js";
import { Card, SecTitle, EditableTable } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const STATUS_OPTIONS = ["attiva", "sospesa", "in liquidazione", "da completare"];

export default function Companies() {
  const { data, updateItem, addItem, removeItem } = useStore();

  const columns = [
    { key: "name", label: "Società", width: 220 },
    { key: "country", label: "Paese", width: 110 },
    { key: "type", label: "Tipo", width: 160 },
    { key: "tax_id", label: "P.IVA / Tax ID", width: 140 },
    { key: "status", label: "Stato", type: "select", options: STATUS_OPTIONS, width: 130 },
    { key: "notes", label: "Note", width: 260 },
  ];

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Società del gruppo</div>
      <Card>
        <SecTitle icon={Building2} title={`${data.companies.length} società censite`} color={B.gold} />
        <EditableTable
          columns={columns}
          rows={data.companies}
          onCellChange={(id, key, value) => updateItem("companies", id, { [key]: value })}
          onDelete={(id) => removeItem("companies", id)}
          onAdd={() => addItem("companies", { name: "Nuova società", country: null, type: null, tax_id: null, status: "da completare", notes: null })}
          addLabel="Aggiungi società"
        />
      </Card>
    </div>
  );
}
