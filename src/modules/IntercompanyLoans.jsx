import { ArrowRightLeft } from "lucide-react";
import { B } from "../lib/theme.js";
import { Card, SecTitle, EditableTable } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const STATUS_OPTIONS = ["deliberato", "bonificato", "documentato", "da formalizzare"];

export default function IntercompanyLoans() {
  const { data, updateItem, addItem, removeItem } = useStore();
  const companyOptions = data.companies.map((c) => c.name);
  const idFor = (name) => data.companies.find((c) => c.name === name)?.id || null;
  const nameFor = (id) => data.companies.find((c) => c.id === id)?.name || "";

  function companySelect(row, field) {
    return (
      <select
        value={nameFor(row[field])}
        onChange={(e) => updateItem("intercompanyLoans", row.id, { [field]: idFor(e.target.value) })}
        style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
      >
        <option value="">—</option>
        {companyOptions.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    );
  }

  const columns = [
    { key: "lender_company_id", label: "Società finanziatrice", width: 170, render: (row) => companySelect(row, "lender_company_id") },
    { key: "borrower_company_id", label: "Società beneficiaria", width: 170, render: (row) => companySelect(row, "borrower_company_id") },
    { key: "amount", label: "Importo €", type: "number", width: 110 },
    { key: "date", label: "Data bonifico", type: "date", width: 130 },
    { key: "causale", label: "Causale", width: 220 },
    { key: "contract_ref", label: "Contratto / Addendum", width: 160 },
    { key: "addendum_number", label: "N. addendum", width: 100 },
    { key: "status", label: "Stato", type: "select", options: STATUS_OPTIONS, width: 130 },
    { key: "repayment_due", label: "Scadenza rimborso", type: "date", width: 130 },
    { key: "interest", label: "Interesse %", type: "number", width: 90 },
    { key: "notes", label: "Note fiscali/legali", width: 220 },
  ];

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Prestiti infragruppo</div>
      <Card>
        <SecTitle icon={ArrowRightLeft} title="Finanziamenti tra società del gruppo" sub="Es. Bowser → Sichin" />
        <EditableTable
          columns={columns}
          rows={data.intercompanyLoans}
          onCellChange={(id, key, value) => updateItem("intercompanyLoans", id, { [key]: value })}
          onDelete={(id) => removeItem("intercompanyLoans", id)}
          onAdd={() => addItem("intercompanyLoans", { lender_company_id: null, borrower_company_id: null, amount: null, date: null, causale: null, contract_ref: null, addendum_number: null, status: "da formalizzare", repayment_due: null, interest: null, notes: null })}
          addLabel="Aggiungi prestito infragruppo"
        />
      </Card>
    </div>
  );
}
