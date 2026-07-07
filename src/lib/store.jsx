import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SEED } from "./seed.js";

const STORAGE_KEY = "bowser-rti-command-center-v1";

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

let idCounter = 0;
export function newId(prefix) {
  idCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`;
}

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(loadInitial);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setLastSaved(new Date().toISOString());
    } catch (e) {
      console.warn("Impossibile salvare in locale", e);
    }
  }, [data]);

  const api = useMemo(() => {
    function addItem(collection, item) {
      setData((d) => ({ ...d, [collection]: [...d[collection], { id: newId(collection), demo: false, ...item }] }));
    }
    function updateItem(collection, id, patch) {
      setData((d) => ({
        ...d,
        [collection]: d[collection].map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
    }
    function setField(collection, id, key, value) {
      updateItem(collection, id, { [key]: value });
    }
    function removeItem(collection, id) {
      setData((d) => ({ ...d, [collection]: d[collection].filter((r) => r.id !== id) }));
    }
    function resetToDemo() {
      setData({ ...emptyState(), ...SEED });
    }
    function clearAll() {
      setData(emptyState());
    }
    function importJSON(json) {
      const merged = emptyState();
      for (const k of COLLECTIONS) merged[k] = Array.isArray(json[k]) ? json[k] : [];
      setData(merged);
    }
    function importRows(collection, rows) {
      setData((d) => ({ ...d, [collection]: [...d[collection], ...rows.map((r) => ({ id: newId(collection), demo: false, ...r }))] }));
    }
    return { addItem, updateItem, setField, removeItem, resetToDemo, clearAll, importJSON, importRows };
  }, []);

  const value = useMemo(() => ({ data, lastSaved, ...api }), [data, lastSaved, api]);

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
