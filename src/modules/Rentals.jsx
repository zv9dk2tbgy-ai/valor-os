import { KeyRound, AlertTriangle } from "lucide-react";
import { B } from "../lib/theme.js";
import { eur, fmtDate } from "../lib/theme.js";
import { Card, SecTitle, EditableTable, KpiCard, RefSelect } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";

const PAYMENT_OPTIONS = ["regolare", "insoluto", "parziale", "da verificare"];
const RENEWAL_OPTIONS = ["rinnovo automatico", "da rinnovare", "disdetta inviata", "in scadenza"];
const EXPIRY_ALERT_DAYS = 60;

export default function Rentals() {
  const { data, updateItem, addItem, removeItem } = useStore();

  function companySelect(row) {
    return <RefSelect value={row.company_id} options={data.companies} onChange={(id) => updateItem("rentalContracts", row.id, { company_id: id })} />;
  }

  function assetSelect(row) {
    return <RefSelect value={row.asset_id} options={data.assets} onChange={(id) => updateItem("rentalContracts", row.id, { asset_id: id })} />;
  }

  const annualNet = (row) => {
    if (row.monthly_fee == null) return null;
    return (Number(row.monthly_fee) || 0) * 12 - (Number(row.maintenance_costs) || 0);
  };

  const columns = [
    { key: "asset_id", label: "Asset", width: 150, render: assetSelect },
    { key: "company_id", label: "Società proprietaria", width: 160, render: companySelect },
    { key: "customer", label: "Cliente / conduttore", width: 160 },
    { key: "contract_type", label: "Tipo contratto", width: 130 },
    { key: "monthly_fee", label: "Canone mensile €", type: "number", width: 110 },
    { key: "deposit", label: "Cauzione €", type: "number", width: 100 },
    { key: "start_date", label: "Inizio", type: "date", width: 120 },
    { key: "end_date", label: "Fine", type: "date", width: 120 },
    { key: "payment_status", label: "Stato pagamento", type: "select", options: PAYMENT_OPTIONS, width: 130 },
    { key: "arrears", label: "Insoluti €", type: "number", width: 100 },
    { key: "maintenance_costs", label: "Manutenzione €/anno", type: "number", width: 120 },
    {
      key: "_annual_net", label: "Margine netto annuo", width: 120,
      render: (row) => {
        const v = annualNet(row);
        return <span style={{ fontSize: 12.5, fontWeight: 700, color: v == null ? B.dim : v >= 0 ? B.green : B.red }}>{v == null ? "—" : eur(v)}</span>;
      },
    },
    { key: "renewal_status", label: "Rinnovo/disdetta", type: "select", options: RENEWAL_OPTIONS, width: 150 },
    { key: "notes", label: "Note", width: 200 },
  ];

  const monthlyTotal = data.rentalContracts.reduce((s, r) => s + (Number(r.monthly_fee) || 0), 0);
  const annualTotal = data.rentalContracts.reduce((s, r) => s + (annualNet(r) || 0), 0);
  const arrearsTotal = data.rentalContracts.reduce((s, r) => s + (Number(r.arrears) || 0), 0);

  const soon = new Date();
  soon.setDate(soon.getDate() + EXPIRY_ALERT_DAYS);
  const soonStr = soon.toISOString().slice(0, 10);
  const expiring = data.rentalContracts.filter((r) => r.end_date && r.end_date <= soonStr);

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Affitti & Noleggi</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Canoni mensili totali" value={eur(monthlyTotal)} icon={KeyRound} />
        <KpiCard label="Margine netto annuo totale" value={eur(annualTotal)} icon={KeyRound} color={annualTotal >= 0 ? B.white : B.red} />
        <KpiCard label="Insoluti totali" value={eur(arrearsTotal)} icon={AlertTriangle} alert={arrearsTotal > 0} color={arrearsTotal > 0 ? B.red : B.white} />
      </div>

      {expiring.length > 0 && (
        <Card style={{ marginBottom: 14, borderColor: `${B.amber}55` }}>
          <SecTitle icon={AlertTriangle} title={`Contratti in scadenza entro ${EXPIRY_ALERT_DAYS} giorni — verifica rinnovo/disdetta`} color={B.amber} />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {expiring.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, borderTop: `1px solid ${B.border}`, paddingTop: 8 }}>
                <span>{r.customer || "Cliente da completare"} — {eur(r.monthly_fee)}/mese</span>
                <span style={{ color: B.amber }}>Scade {fmtDate(r.end_date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <SecTitle icon={KeyRound} title="Asset messi a reddito" sub={`${data.rentalContracts.length} contratti`} />
        <EditableTable
          columns={columns}
          rows={data.rentalContracts}
          onCellChange={(id, key, value) => updateItem("rentalContracts", id, { [key]: value })}
          onDelete={(id) => removeItem("rentalContracts", id)}
          onAdd={() => addItem("rentalContracts", { asset_id: null, company_id: null, customer: null, contract_type: null, monthly_fee: null, deposit: null, start_date: null, end_date: null, payment_status: "da verificare", arrears: null, maintenance_costs: null, renewal_status: null, notes: null })}
          addLabel="Aggiungi contratto"
          emptyLabel="Nessun contratto di affitto/noleggio censito."
        />
      </Card>
    </div>
  );
}
