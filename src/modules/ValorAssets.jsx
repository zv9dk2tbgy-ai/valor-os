import { useState } from "react";
import { Package, ExternalLink } from "lucide-react";
import { B, C } from "../lib/theme.js";
import { Card, SecTitle, EditableTable, RefSelect } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";
import SicanOS from "../legacy/SicanOS.jsx";

const STATUS_OPTIONS = ["da ispezionare", "pronto per vendita", "in vendita", "venduto", "affittato", "noleggiato", "rottamato"];
const CHANNEL_OPTIONS = ["vendita diretta", "asta", "broker", "noleggio", "affitto", "redeploy", "scrap"];

export default function ValorAssets() {
  const { data, updateItem, addItem, removeItem } = useStore();
  const [view, setView] = useState("assets");

  const columns = [
    { key: "valor_id", label: "VALOR ID", width: 100 },
    { key: "original_code", label: "Codice originario", width: 120 },
    {
      key: "company_id", label: "Società", width: 150,
      render: (row) => <RefSelect value={row.company_id} options={data.companies} onChange={(id) => updateItem("assets", row.id, { company_id: id })} />,
    },
    { key: "category", label: "Categoria", width: 130 },
    { key: "make", label: "Marca", width: 110 },
    { key: "model", label: "Modello", width: 110 },
    { key: "serial_number", label: "Seriale", width: 120 },
    { key: "vin", label: "VIN / Telaio", width: 120 },
    { key: "location", label: "Sede fisica", width: 130 },
    { key: "condition", label: "Stato tecnico", width: 120 },
    { key: "book_value", label: "Valore contabile €", type: "number", width: 120 },
    { key: "estimated_value", label: "Valore stimato €", type: "number", width: 120 },
    { key: "quick_sale_value", label: "Vendita rapida €", type: "number", width: 120 },
    { key: "rental_value_monthly", label: "Noleggio/mese €", type: "number", width: 120 },
    { key: "monetization_strategy", label: "Canale consigliato", type: "select", options: CHANNEL_OPTIONS, width: 140 },
    { key: "status", label: "Stato", type: "select", options: STATUS_OPTIONS, width: 140 },
    { key: "data_completeness", label: "Completezza dati %", type: "number", width: 100 },
    { key: "notes", label: "Note operative", width: 200 },
  ];

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>VALOR Asset Intelligence</div>
        <div style={{ display: "flex", gap: 6 }}>
          <TabBtn active={view === "assets"} onClick={() => setView("assets")}>Portafoglio asset</TabBtn>
          <TabBtn active={view === "legacy"} onClick={() => setView("legacy")}><ExternalLink size={12} style={{ marginRight: 4 }} />VALOR · SICAN OS (deal recovery)</TabBtn>
        </div>
      </div>

      {view === "legacy" ? (
        <div style={{ margin: "0 -20px" }}>
          <SicanOS />
        </div>
      ) : (
        <Card>
          <SecTitle icon={Package} title="Asset industriali, veicoli, macchinari, impianti" sub={`${data.assets.length} asset censiti`} />
          <EditableTable
            columns={columns}
            rows={data.assets}
            onCellChange={(id, key, value) => updateItem("assets", id, { [key]: value })}
            onDelete={(id) => removeItem("assets", id)}
            onAdd={() => addItem("assets", {
              valor_id: null, original_code: null, company_id: null, category: null, make: null, model: null,
              serial_number: null, vin: null, location: null, condition: null, book_value: null, estimated_value: null,
              quick_sale_value: null, rental_value_monthly: null, monetization_strategy: null, status: "da ispezionare",
              data_completeness: 0, notes: null,
            })}
            addLabel="Aggiungi asset"
            emptyLabel="Nessun asset ancora censito — aggiungine uno, oppure consulta il modulo SICAN OS legacy per il flusso di recovery deal."
          />
        </Card>
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{ ...C.btnGhost, background: active ? `${B.gold}22` : B.surface, borderColor: active ? B.gold : B.border, color: active ? B.gold : B.gray }}>
      {children}
    </button>
  );
}
