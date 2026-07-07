import { useRef, useState } from "react";
import { Database, Download, Upload, RotateCcw, Trash2, Printer, History } from "lucide-react";
import { B, C } from "../lib/theme.js";
import { Card, SecTitle } from "../lib/ui.jsx";
import { useStore } from "../lib/store.jsx";
import { downloadCSV, downloadJSON, parseCSV } from "../lib/csv.js";

const CASHFLOW_COLUMNS = ["company_id", "project_id", "asset_id", "type", "category", "description", "amount", "due_date", "actual_date", "status", "probability", "source", "responsible", "notes", "simulateOff"];
const ASSET_COLUMNS = ["valor_id", "original_code", "company_id", "category", "make", "model", "serial_number", "vin", "location", "condition", "book_value", "estimated_value", "quick_sale_value", "rental_value_monthly", "monetization_strategy", "status", "data_completeness", "notes"];

export default function Settings() {
  const { data, auditLog, clearAudit, importJSON, importRows, resetToDemo, clearAll, lastSaved } = useStore();
  const jsonInput = useRef(null);
  const cfCsvInput = useRef(null);
  const assetCsvInput = useRef(null);
  const [auditExpanded, setAuditExpanded] = useState(false);

  function exportAllJSON() {
    downloadJSON(`bowser-rti-command-center-${new Date().toISOString().slice(0, 10)}.json`, data);
  }

  function onImportJSONFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        importJSON(JSON.parse(text));
      } catch (err) {
        alert("File JSON non valido: " + err.message);
      }
    });
    e.target.value = "";
  }

  function onImportCsv(collection, castFn) {
    return (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        const rows = parseCSV(text).map(castFn);
        importRows(collection, rows);
      });
      e.target.value = "";
    };
  }

  function castCashFlowRow(r) {
    return {
      ...r,
      amount: r.amount ? Number(r.amount) : null,
      probability: r.probability ? Number(r.probability) : null,
      simulateOff: r.simulateOff === true || r.simulateOff === "true",
    };
  }
  function castAssetRow(r) {
    return {
      ...r,
      book_value: r.book_value ? Number(r.book_value) : null,
      estimated_value: r.estimated_value ? Number(r.estimated_value) : null,
      quick_sale_value: r.quick_sale_value ? Number(r.quick_sale_value) : null,
      rental_value_monthly: r.rental_value_monthly ? Number(r.rental_value_monthly) : null,
      data_completeness: r.data_completeness ? Number(r.data_completeness) : null,
    };
  }

  function doReset() {
    if (confirm("Ripristinare i dati demo iniziali? Le modifiche non salvate altrove andranno perse.")) resetToDemo();
  }
  function doClear() {
    if (confirm("Svuotare completamente tutti i dati? Questa azione non è reversibile da qui.")) clearAll();
  }

  return (
    <div className="fu">
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Settings</div>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={Database} title="Backup completo (JSON)" sub={lastSaved ? `Ultimo salvataggio locale: ${new Date(lastSaved).toLocaleString("it-IT")}` : null} />
        <div style={{ fontSize: 12, color: B.gray, marginBottom: 12 }}>
          Tutti i dati sono salvati solo nel browser (localStorage). Esporta regolarmente un backup JSON: è anche il modo più semplice per spostare i dati su un altro dispositivo.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={C.btn} onClick={exportAllJSON}><Download size={13} /> Esporta backup JSON</button>
          <button style={C.btnGhost} onClick={() => jsonInput.current?.click()}><Upload size={13} /> Importa backup JSON</button>
          <input ref={jsonInput} type="file" accept=".json" style={{ display: "none" }} onChange={onImportJSONFile} />
        </div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={Database} title="Import / Export CSV" />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Movimenti di cassa</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={C.btnGhost} onClick={() => downloadCSV("cash-flow-items.csv", data.cashFlowItems, CASHFLOW_COLUMNS)}><Download size={13} /> Esporta CSV</button>
              <button style={C.btnGhost} onClick={() => cfCsvInput.current?.click()}><Upload size={13} /> Importa CSV</button>
              <input ref={cfCsvInput} type="file" accept=".csv" style={{ display: "none" }} onChange={onImportCsv("cashFlowItems", castCashFlowRow)} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 6 }}>Asset VALOR</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button style={C.btnGhost} onClick={() => downloadCSV("valor-assets.csv", data.assets, ASSET_COLUMNS)}><Download size={13} /> Esporta CSV</button>
              <button style={C.btnGhost} onClick={() => assetCsvInput.current?.click()}><Upload size={13} /> Importa CSV</button>
              <input ref={assetCsvInput} type="file" accept=".csv" style={{ display: "none" }} onChange={onImportCsv("assets", castAssetRow)} />
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={Printer} title="Stampa / Esporta PDF" />
        <div style={{ fontSize: 12, color: B.gray, marginBottom: 12 }}>
          Apre la finestra di stampa del browser sulla pagina corrente (usa "Salva come PDF" nella finestra di stampa). Consigliato dalla schermata Executive Dashboard.
        </div>
        <button style={C.btnGhost} onClick={() => window.print()}><Printer size={13} /> Stampa pagina corrente</button>
      </Card>

      <Card style={{ marginBottom: 14 }}>
        <SecTitle icon={History} title="Audit trail delle modifiche" sub={`${auditLog.length} eventi registrati`} />
        <div style={{ fontSize: 12, color: B.gray, marginBottom: 12 }}>
          Ogni aggiunta, modifica ed eliminazione viene registrata automaticamente (le digitazioni ravvicinate sullo stesso campo vengono raggruppate). Il log è salvato in locale insieme ai dati.
        </div>
        {auditLog.length === 0 ? (
          <div style={{ fontSize: 12.5, color: B.dim, fontStyle: "italic" }}>Nessuna modifica registrata finora.</div>
        ) : (
          <div style={{ overflowX: "auto", maxHeight: auditExpanded ? "none" : 320, overflowY: "auto" }}>
            <table>
              <thead>
                <tr><th>Quando</th><th>Azione</th><th>Sezione</th><th>Voce</th><th>Campo</th><th>Prima</th><th>Dopo</th></tr>
              </thead>
              <tbody>
                {[...auditLog].reverse().slice(0, auditExpanded ? auditLog.length : 30).map((e) => (
                  <tr key={e.id}>
                    <td style={{ whiteSpace: "nowrap", color: B.gray }}>{new Date(e.ts).toLocaleString("it-IT")}</td>
                    <td>{e.action}</td>
                    <td style={{ color: B.gray }}>{e.collection}</td>
                    <td>{e.label || "—"}</td>
                    <td style={{ color: B.gray }}>{e.field || "—"}</td>
                    <td style={{ color: B.dim }}>{e.before ?? "—"}</td>
                    <td>{e.after ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          {auditLog.length > 30 && (
            <button style={C.btnGhost} onClick={() => setAuditExpanded(!auditExpanded)}>
              {auditExpanded ? "Mostra solo gli ultimi 30" : `Mostra tutti (${auditLog.length})`}
            </button>
          )}
          <button style={C.btnGhost} onClick={() => downloadCSV("audit-trail.csv", auditLog, ["ts", "action", "collection", "itemId", "label", "field", "before", "after"])}><Download size={13} /> Esporta audit CSV</button>
          <button style={{ ...C.btnGhost, color: B.red, borderColor: `${B.red}55` }} onClick={() => { if (confirm("Svuotare il log delle modifiche?")) clearAudit(); }}><Trash2 size={13} /> Svuota log</button>
        </div>
      </Card>

      <Card>
        <SecTitle icon={RotateCcw} title="Dati demo" color={B.amber} />
        <div style={{ fontSize: 12, color: B.gray, marginBottom: 12 }}>
          I dati iniziali sono marcati come demo e derivano dal brief fornito il 07/07/2026. Puoi resettarli in qualsiasi momento o ripartire da zero.
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={C.btnGhost} onClick={doReset}><RotateCcw size={13} /> Ripristina dati demo</button>
          <button style={{ ...C.btnGhost, color: B.red, borderColor: `${B.red}55` }} onClick={doClear}><Trash2 size={13} /> Svuota tutto</button>
        </div>
      </Card>
    </div>
  );
}
