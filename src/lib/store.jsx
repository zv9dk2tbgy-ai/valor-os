import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SEED } from "./seed.js";

const STORAGE_KEY = "bowser-rti-command-center-v1";
const AUDIT_KEY = "bowser-rti-audit-v1";
const AUDIT_MAX = 400;
// Keystroke coalescing: successive edits to the same field within this window
// collapse into one audit entry (keeping the original "before" value).
const AUDIT_COALESCE_MS = 15000;

const COLLECTIONS = [
  "companies", "cashPositions", "bankObligations", "intercompanyLoans",
  "projects", "cashFlowItems", "decisions", "documents", "assets",
  "rentalContracts", "deals",
];

function emptyState() {
  const s = {};
  for (const k of COLLECTIONS) s[k] = [];
  return s;
}

function loadInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const merged = emptyState();
      for (const k of COLLECTIONS) merged[k] = Array.isArray(parsed[k]) ? parsed[k] : [];
      return merged;
    }
  } catch (e) {
    console.warn("Impossibile leggere lo storage locale, riparto dai dati demo.", e);
  }
  return { ...emptyState(), ...SEED };
}

function loadAudit() {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* riparto con log vuoto */ }
  return [];
}

let idCounter = 0;
export function newId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

function rowLabel(row) {
  if (!row) return "—";
  return row.description || row.name || row.title || row.counterparty || row.customer || row.label || row.id;
}

function fmtVal(v) {
  if (v === null || v === undefined || v === "") return "—";
  const s = String(v);
  return s.length > 60 ? s.slice(0, 57) + "…" : s;
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadInitial);
  const [auditLog, setAuditLog] = useState(loadAudit);
  const [lastSaved, setLastSaved] = useState(null);
  const dataRef = useRef(data);

  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date().toISOString());
    } catch (e) {
      console.warn("Impossibile salvare in locale", e);
    }
  }, [data]);

  useEffect(() => {
    try {
      localStorage.setItem(AUDIT_KEY, JSON.stringify(auditLog.slice(-AUDIT_MAX)));
    } catch { /* audit best-effort */ }
  }, [auditLog]);

  const api = useMemo(() => {
    function pushAudit(entry) {
      setAuditLog((l) => [...l.slice(-(AUDIT_MAX - 1)), { id: newId("a"), ts: new Date().toISOString(), ...entry }]);
    }

    function logFieldChange(collection, itemId, label, field, before, after) {
      setAuditLog((l) => {
        const last = l[l.length - 1];
        if (
          last && last.action === "modifica" && last.collection === collection &&
          last.itemId === itemId && last.field === field &&
          Date.now() - new Date(last.ts).getTime() < AUDIT_COALESCE_MS
        ) {
          return [...l.slice(0, -1), { ...last, ts: new Date().toISOString(), after: fmtVal(after) }];
        }
        return [...l.slice(-(AUDIT_MAX - 1)), {
          id: newId("a"), ts: new Date().toISOString(), action: "modifica",
          collection, itemId, label, field, before: fmtVal(before), after: fmtVal(after),
        }];
      });
    }

    function addItem(collection, item) {
      const row = { id: newId(collection), demo: false, ...item };
      setData((d) => ({ ...d, [collection]: [...d[collection], row] }));
      pushAudit({ action: "aggiunta", collection, itemId: row.id, label: rowLabel(row) });
      return row.id;
    }
    function updateItem(collection, id, patch) {
      const before = dataRef.current[collection]?.find((r) => r.id === id);
      setData((d) => ({
        ...d,
        [collection]: d[collection].map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
      for (const [field, after] of Object.entries(patch)) {
        logFieldChange(collection, id, rowLabel(before), field, before?.[field], after);
      }
    }
    function setField(collection, id, key, value) {
      updateItem(collection, id, { [key]: value });
    }
    function removeItem(collection, id) {
      const before = dataRef.current[collection]?.find((r) => r.id === id);
      setData((d) => ({ ...d, [collection]: d[collection].filter((r) => r.id !== id) }));
      pushAudit({ action: "eliminazione", collection, itemId: id, label: rowLabel(before) });
    }
    function resetToDemo() {
      setData({ ...emptyState(), ...SEED });
      pushAudit({ action: "reset dati demo", collection: "*" });
    }
    function clearAll() {
      setData(emptyState());
      pushAudit({ action: "svuotamento totale", collection: "*" });
    }
    function importJSON(json) {
      const merged = emptyState();
      for (const k of COLLECTIONS) merged[k] = Array.isArray(json[k]) ? json[k] : [];
      setData(merged);
      pushAudit({ action: "import backup JSON", collection: "*" });
    }
    function importRows(collection, rows) {
      setData((d) => ({ ...d, [collection]: [...d[collection], ...rows.map((r) => ({ id: newId(collection), demo: false, ...r }))] }));
      pushAudit({ action: `import CSV (${rows.length} righe)`, collection });
    }
    function clearAudit() {
      setAuditLog([]);
    }
    return { addItem, updateItem, setField, removeItem, resetToDemo, clearAll, importJSON, importRows, clearAudit };
  }, []);

  const value = useMemo(() => ({ data, auditLog, lastSaved, ...api }), [data, auditLog, lastSaved, api]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function companyName(companies, id) {
  return companies.find((c) => c.id === id)?.name || (id ? id : "—");
}
