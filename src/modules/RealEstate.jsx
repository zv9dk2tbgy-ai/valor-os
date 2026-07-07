import { Home, Plus, Trash2 } from "lucide-react";
import { B, C } from "../lib/theme.js";
import { eur, pct } from "../lib/theme.js";
import { Card, SecTitle, Bar, DemoTag } from "../lib/ui.jsx";
import { useStore, companyName } from "../lib/store.jsx";

const TEXT_FIELDS = [
  ["address", "Indirizzo"], ["foglio", "Foglio"], ["mappale", "Mappale"], ["particella", "Particella"], ["subalterno", "Subalterno"],
];
const STATUS_FIELDS = [
  ["stato_urbanistico", "Stato urbanistico"], ["stato_catastale", "Stato catastale"], ["stato_lavori", "Stato lavori"],
  ["stato_vendite", "Stato vendite"], ["stato_rogiti", "Stato rogiti"],
];
const NUMBER_FIELDS = [
  ["num_posti_auto", "Numero posti auto"], ["target_amount", "Target finanziario €"], ["bonifici_eseguiti", "Bonifici già eseguiti €"],
  ["fabbisogno_residuo", "Fabbisogno residuo €"], ["expected_revenue", "Incassi attesi €"], ["received_revenue", "Incassi già ricevuti €"],
  ["technical_costs", "Costi tecnici €"], ["company_costs", "Costi imprese €"], ["notarial_costs", "Costi notarili €"], ["expected_margin", "Margine atteso €"],
];
const RISK_FIELDS = [["legal_risk", "Rischio legale"], ["technical_risk", "Rischio tecnico"], ["commercial_risk", "Rischio commerciale"]];

export default function RealEstate() {
  const { data, updateItem, addItem, removeItem } = useStore();

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>Progetti immobiliari</div>
        <button
          style={C.btn}
          onClick={() => addItem("projects", {
            company_id: null, name: "Nuovo progetto", type: "immobiliare", address: null, foglio: null, mappale: null,
            particella: null, subalterno: null, description: null, num_posti_auto: null, unita_collegate: null,
            stato_urbanistico: null, stato_catastale: null, stato_lavori: null, stato_vendite: null, stato_rogiti: null,
            target_amount: null, bonifici_eseguiti: null, fabbisogno_residuo: null, expected_revenue: null, received_revenue: null,
            technical_costs: null, company_costs: null, notarial_costs: null, expected_margin: null, missing_documents: null,
            legal_risk: null, technical_risk: null, commercial_risk: null, next_action: null, notes: null,
          })}
        >
          <Plus size={13} /> Nuovo progetto
        </button>
      </div>

      {data.projects.length === 0 && <Card>Nessun progetto censito.</Card>}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {data.projects.map((p) => (
          <ProjectCard key={p.id} p={p} companies={data.companies} onChange={(k, v) => updateItem("projects", p.id, { [k]: v })} onDelete={() => removeItem("projects", p.id)} />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ p, companies, onChange, onDelete }) {
  const progress = pct(p.bonifici_eseguiti || 0, p.target_amount || 0);
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
        <SecTitle icon={Home} title={p.name} sub={p.demo ? <DemoTag /> : null} />
        <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: B.dim }}><Trash2 size={14} /></button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, marginBottom: 14 }}>
        <FieldText label="Nome progetto" value={p.name} onChange={(v) => onChange("name", v)} />
        <FieldSelect label="Società proprietaria" value={companyName(companies, p.company_id)} options={companies.map((c) => c.name)}
          onChange={(name) => onChange("company_id", companies.find((c) => c.name === name)?.id || null)} />
        <FieldText label="Tipo" value={p.type} onChange={(v) => onChange("type", v)} />
      </div>

      {p.target_amount != null && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: B.gray, marginBottom: 4 }}>
            <span>Bonifici eseguiti: {eur(p.bonifici_eseguiti)}</span>
            <span>Target: {eur(p.target_amount)}</span>
          </div>
          <Bar pct={progress} color={B.gold} h={8} />
          <div style={{ fontSize: 11.5, color: B.amber, marginTop: 4 }}>Fabbisogno residuo: {eur(p.fabbisogno_residuo)}</div>
        </div>
      )}

      <FieldTextarea label="Descrizione" value={p.description} onChange={(v) => onChange("description", v)} />

      <SubGrid title="Dati catastali / urbanistici">
        {TEXT_FIELDS.map(([k, l]) => <FieldText key={k} label={l} value={p[k]} onChange={(v) => onChange(k, v)} />)}
      </SubGrid>

      <SubGrid title="Stato progetto">
        {STATUS_FIELDS.map(([k, l]) => <FieldText key={k} label={l} value={p[k]} onChange={(v) => onChange(k, v)} />)}
      </SubGrid>

      <SubGrid title="Numeri chiave">
        {NUMBER_FIELDS.map(([k, l]) => <FieldNumber key={k} label={l} value={p[k]} onChange={(v) => onChange(k, v)} />)}
      </SubGrid>

      <SubGrid title="Rischi">
        {RISK_FIELDS.map(([k, l]) => <FieldText key={k} label={l} value={p[k]} onChange={(v) => onChange(k, v)} />)}
      </SubGrid>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 4 }}>
        <FieldTextarea label="Documenti mancanti" value={p.missing_documents} onChange={(v) => onChange("missing_documents", v)} />
        <FieldTextarea label="Prossima azione necessaria" value={p.next_action} onChange={(v) => onChange("next_action", v)} highlight />
      </div>
    </Card>
  );
}

function SubGrid({ title, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10.5, color: B.gray, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10 }}>{children}</div>
    </div>
  );
}

function Label({ children }) {
  return <div style={{ fontSize: 10.5, color: B.dim, marginBottom: 3 }}>{children}</div>;
}

function FieldText({ label, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="text" value={value ?? ""} placeholder="da completare" onChange={(e) => onChange(e.target.value || null)} style={C.inp} />
    </div>
  );
}

function FieldNumber({ label, value, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <input type="number" value={value ?? ""} placeholder="da completare" onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))} style={C.inp} />
    </div>
  );
}

function FieldSelect({ label, value, options, onChange }) {
  return (
    <div>
      <Label>{label}</Label>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={C.inp}>
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FieldTextarea({ label, value, onChange, highlight }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value ?? ""}
        placeholder="da completare"
        onChange={(e) => onChange(e.target.value || null)}
        rows={2}
        style={{ ...C.inp, resize: "vertical", borderColor: highlight ? `${B.gold}66` : B.border }}
      />
    </div>
  );
}
