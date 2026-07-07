import { ArrowRightLeft } from "lucide-react";
import { Card, SecTitle, EditableTable, RefSelect } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const STATUS_OPTIONS = ["deliberato", "bonificato", "documentato", "da formalizzare"];

export default function IntercompanyLoans() {
  const { data, updateItem, addItem, removeItem } = useStore();

  function companySelect(row, field) {
    return <RefSelect value={row[field]} options={data.companies} onChange={(id) => updateItem("intercompanyLoans", row.id, { [field]: id })} />;
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
