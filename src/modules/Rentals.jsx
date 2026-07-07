import { KeyRound } from "lucide-react";
import { B } from "../lib/theme.js";
import { Card, SecTitle, EditableTable } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const PAYMENT_OPTIONS = ["regolare", "insoluto", "parziale", "da verificare"];
const RENEWAL_OPTIONS = ["rinnovo automatico", "da rinnovare", "disdetta inviata", "in scadenza"];

export default function Rentals() {
  const { data, updateItem, addItem, removeItem } = useStore();

  function companySelect(row) {
    return (
      <select
        value={data.companies.find((c) => c.id === row.company_id)?.name || ""}
        onChange={(e) => updateItem("rentalContracts", row.id, { company_id: data.companies.find((c) => c.name === e.target.value)?.id || null })}
        style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
      >
        <option value="">—</option>
        {data.companies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
    );
  }

  function assetSelect(row) {
    return (
      <select
        value={data.assets.find((a) => a.id === row.asset_id)?.model || ""}
        onChange={(e) => updateItem("rentalContracts", row.id, { asset_id: data.assets.find((a) => a.model === e.target.value)?.id || null })}
        style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
      >
        <option value="">—</option>
        {data.assets.map((a) => <option key={a.id} value={a.model}>{a.model || a.valor_id}</option>)}
      </select>
    );
  }

  const columns = [
    { key: "asset_id", label: "Asset", width: 150, render: assetSelect },
    { key: "company_id", label: "Società proprietaria", width: 160, render: companySelect },
    { key: "customer", label: "Cliente / conduttore", width: 160 },
    { key: "monthly_fee", label: "Canone mensile €", type: "number", width: 110 },
    { key: "deposit", label: "Cauzione €", type: "number", width: 100 },
    { key: "start_date", label: "Inizio", type: "date", width: 120 },
    { key: "end_date", label: "Fine", type: "date", width: 120 },
    { key: "payment_status", label: "Stato pagamento", type: "select", options: PAYMENT_OPTIONS, width: 130 },
    { key: "renewal_status", label: "Rinnovo/disdetta", type: "select", options: RENEWAL_OPTIONS, width: 150 },
    { key: "notes", label: "Note", width: 200 },
  ];

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Affitti & Noleggi</div>
      <Card>
        <SecTitle icon={KeyRound} title="Asset messi a reddito" sub={`${data.rentalContracts.length} contratti`} />
        <EditableTable
          columns={columns}
          rows={data.rentalContracts}
          onCellChange={(id, key, value) => updateItem("rentalContracts", id, { [key]: value })}
          onDelete={(id) => removeItem("rentalContracts", id)}
          onAdd={() => addItem("rentalContracts", { asset_id: null, company_id: null, customer: null, monthly_fee: null, deposit: null, start_date: null, end_date: null, payment_status: "da verificare", renewal_status: null, notes: null })}
          addLabel="Aggiungi contratto"
          emptyLabel="Nessun contratto di affitto/noleggio censito."
        />
      </Card>
    </div>
  );
}
