import { Landmark, AlertTriangle } from "lucide-react";
import { B } from "../lib/theme.js";
import { eur, fmtDate } from "../lib/theme.js";
import { Card, SecTitle, EditableTable, KpiCard } from "../lib/ui.jsx";
import { useStore, companyName } from "../lib/store.jsx";

const STATUS_OPTIONS = ["attivo", "variabile", "estinto", "in ritardo"];

export default function BankDebt() {
  const { data, updateItem, addItem, removeItem } = useStore();

  const companyOptions = data.companies.map((c) => c.name);
  const companyByName = (name) => data.companies.find((c) => c.name === name)?.id || null;

  const totalNow = data.bankObligations.reduce((s, b) => s + (Number(b.monthly_payment) || 0), 0);
  const totalAfterDec2026 = data.bankObligations
    .filter((b) => !b.final_due_date || b.final_due_date > "2026-12-31")
    .reduce((s, b) => s + (Number(b.monthly_payment) || 0), 0);
  const relief = totalNow - totalAfterDec2026;

  const upcoming = data.bankObligations.filter((b) => b.final_due_date && b.final_due_date <= "2026-12-31");

  const columns = [
    {
      key: "company_id", label: "Società debitrice", width: 170,
      render: (row) => (
        <select
          value={data.companies.find((c) => c.id === row.company_id)?.name || ""}
          onChange={(e) => updateItem("bankObligations", row.id, { company_id: companyByName(e.target.value) })}
          style={{ padding: "9px 11px", background: B.surface, border: `1px solid ${B.border}`, borderRadius: 8, color: B.white, fontSize: 13, width: "100%" }}
        >
          <option value="">—</option>
          {companyOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      ),
    },
    { key: "lender", label: "Banca / Finanziatore", width: 150 },
    { key: "description", label: "Descrizione", width: 200 },
    { key: "monthly_payment", label: "Rata mensile €", type: "number", width: 110 },
    { key: "final_due_date", label: "Scadenza finale", type: "date", width: 130 },
    { key: "residual_debt", label: "Debito residuo €", type: "number", width: 120 },
    { key: "interest_rate", label: "Tasso %", type: "number", width: 90 },
    { key: "status", label: "Stato", type: "select", options: STATUS_OPTIONS, width: 110 },
    { key: "notes", label: "Note", width: 220 },
  ];

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Bank Debt & Loans</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Impegno mensile attuale" value={eur(totalNow)} icon={Landmark} />
        <KpiCard label="Impegno mensile da gennaio 2027" value={eur(totalAfterDec2026)} icon={Landmark} />
        <KpiCard label="Alleggerimento da gennaio 2027" value={eur(relief)} color={B.green} icon={Landmark} />
        <KpiCard label="Totale luglio–dicembre 2026" value={eur(totalNow * 6)} icon={Landmark} sub="Stima lineare, 6 mesi" />
      </div>

      {upcoming.length > 0 && (
        <Card style={{ marginBottom: 14 }}>
          <SecTitle icon={AlertTriangle} title="Rate in scadenza entro dicembre 2026" color={B.amber} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcoming.map((b) => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, borderTop: `1px solid ${B.border}`, paddingTop: 8 }}>
                <span>{b.description} — {companyName(data.companies, b.company_id)}</span>
                <span style={{ color: B.amber }}>{fmtDate(b.final_due_date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SecTitle icon={Landmark} title="Finanziamenti, mutui e prestiti" />
        <EditableTable
          columns={columns}
          rows={data.bankObligations}
          onCellChange={(id, key, value) => updateItem("bankObligations", id, { [key]: value })}
          onDelete={(id) => removeItem("bankObligations", id)}
          onAdd={() => addItem("bankObligations", { company_id: null, lender: null, description: "Nuovo impegno", monthly_payment: null, final_due_date: null, residual_debt: null, interest_rate: null, status: "attivo", notes: null })}
          addLabel="Aggiungi impegno bancario"
        />
      </Card>
    </div>
  );
}
