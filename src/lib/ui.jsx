import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { B, C } from "./theme.js";

export function Card({ children, style }) {
  return <div style={{ ...C.card, ...style }}>{children}</div>;
}

export function SecTitle({ icon: Icon, title, sub, color = B.gold }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
      {Icon && <Icon size={15} color={color} />}
      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{title}</div>
      {sub && <div style={{ fontSize: 11.5, color: B.gray, marginLeft: "auto" }}>{sub}</div>}
    </div>
  );
}

export function Chip({ color = B.gray, icon: Icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color, background: `${color}18`, border: `1px solid ${color}44`, borderRadius: 20, padding: "5px 10px", whiteSpace: "nowrap" }}>
      {Icon && <Icon size={11} />}
      {text}
    </div>
  );
}

export function Bdg({ color = B.gray, children }) {
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, color, background: `${color}1c`, border: `1px solid ${color}44`, borderRadius: 6, padding: "3px 7px", whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

const STATUS_COLORS = {
  previsto: B.blue, confermato: B.green, incassato: B.green, pagato: B.green,
  scaduto: B.red, rischio: B.red, "da approvare": B.amber, "da definire": B.amber,
  "da completare": B.dim, mancante: B.red, presente: B.green, "da aggiornare": B.amber,
  "da firmare": B.amber, attivo: B.green, chiuso: B.dim, urgente: B.red,
  "in corso": B.blue, "in attesa": B.amber, deliberato: B.blue, bonificato: B.green,
  "da formalizzare": B.amber, lead: B.gray, vinto: B.green, perso: B.dim, bloccato: B.red,
};

export function StatusBdg({ status }) {
  if (!status) return <Bdg color={B.dim}>—</Bdg>;
  const color = STATUS_COLORS[status.toLowerCase?.()] || B.gray;
  return <Bdg color={color}>{status}</Bdg>;
}

export function Bar({ pct: p, color = B.gold, h = 6 }) {
  return (
    <div style={{ height: h, background: B.surface, borderRadius: 3, overflow: "hidden" }}>
      <div style={{ width: `${Math.max(2, p)}%`, height: "100%", background: color, borderRadius: 3, transition: "width .3s" }} />
    </div>
  );
}

export function KpiCard({ label, value, sub, color = B.white, icon: Icon, alert }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ fontSize: 10.5, color: B.gray, textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</div>
        {Icon && <Icon size={14} color={alert ? B.red : B.gold} />}
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: -0.5, color }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: B.gray, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 34, height: 19, borderRadius: 12, border: "none", cursor: "pointer", position: "relative",
        background: checked ? B.green : B.border, flexShrink: 0, transition: "background .2s",
      }}
    >
      <span style={{
        position: "absolute", top: 2, left: checked ? 17 : 2, width: 15, height: 15, borderRadius: "50%",
        background: "#fff", transition: "left .2s",
      }} />
    </button>
  );
}

export function AlertBanner({ items = [], color = B.amber }) {
  if (!items.length) return null;
  return (
    <div style={{ background: `${color}14`, border: `1px solid ${color}44`, borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5 }}>
          <AlertTriangle size={13} color={color} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>{it}</span>
        </div>
      ))}
    </div>
  );
}

export function DemoTag() {
  return <Bdg color={B.purple}>DEMO — da completare</Bdg>;
}

/**
 * Foreign-key select: option values are entity IDs, never display names,
 * so duplicate names can't corrupt references.
 * options: array of entities with {id} plus name/title as label.
 */
export function RefSelect({ value, options, onChange, labelKey }) {
  const labelOf = (o) => (labelKey ? o[labelKey] : null) || o.name || o.title || o.model || o.valor_id || o.id;
  return (
    <select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)} style={C.inp}>
      <option value="">—</option>
      {options.map((o) => <option key={o.id} value={o.id}>{labelOf(o)}</option>)}
    </select>
  );
}

/**
 * Generic inline-editable data grid.
 * columns: [{ key, label, type: text|number|date|select|percent|checkbox|readonly, options?, width?, render?(row) }]
 */
export function EditableTable({ columns, rows, onCellChange, onDelete, onAdd, addLabel = "Aggiungi riga", emptyLabel = "Nessuna riga — aggiungine una." }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={{ minWidth: c.width || 100 }}>{c.label}</th>
            ))}
            {onDelete && <th style={{ width: 36 }} />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr><td colSpan={columns.length + 1} style={{ color: B.dim, fontStyle: "italic", padding: "16px 12px" }}>{emptyLabel}</td></tr>
          )}
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => (
                <td key={c.key}>
                  <Cell col={c} row={row} onChange={(v) => onCellChange(row.id, c.key, v)} />
                </td>
              ))}
              {onDelete && (
                <td>
                  <button onClick={() => onDelete(row.id)} title="Elimina" style={{ background: "none", border: "none", cursor: "pointer", color: B.dim, padding: 4 }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {onAdd && (
        <button onClick={onAdd} style={{ ...C.btnGhost, marginTop: 10 }}>
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
  );
}

function Cell({ col, row, onChange }) {
  const v = row[col.key];
  if (col.render) return col.render(row);
  if (col.type === "readonly") return <span style={{ fontSize: 12.5, color: B.gray }}>{v}</span>;
  if (col.type === "checkbox") return <Toggle checked={!!v} onChange={onChange} />;
  if (col.type === "select") {
    return (
      <select value={v ?? ""} onChange={(e) => onChange(e.target.value)} style={C.inp}>
        <option value="">—</option>
        {col.options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }
  if (col.type === "number" || col.type === "percent") {
    return (
      <input
        type="number"
        value={v ?? ""}
        placeholder="da completare"
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        style={C.inp}
      />
    );
  }
  if (col.type === "date") {
    return <input type="date" value={v ?? ""} onChange={(e) => onChange(e.target.value || null)} style={C.inp} />;
  }
  return (
    <input
      type="text"
      value={v ?? ""}
      placeholder="da completare"
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      style={C.inp}
    />
  );
}
