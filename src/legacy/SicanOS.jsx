import { useState, useMemo } from "react";
import {
  LayoutDashboard, GitBranch, Camera, Calculator, Briefcase, Calendar,
  AlertTriangle, Euro, Users, Target, CheckCircle, Clock, Building2,
  FileText, Activity, Shield, Package, Layers, TrendingUp, ChevronRight,
  MapPin, Zap, Star, Award, BarChart2, Globe, ArrowRight, Cpu
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════
//  VALOR / SICAN OS  —  Dashboard Operativo Interno
//  RTI — Rizzo Trading International  |  v1.0  |  Giugno 2026
//  Blueprint: Industrial Asset Recovery Intelligence
// ══════════════════════════════════════════════════════════════════

const B = {
  orange:"#F26522", orangeDark:"#D4510F",
  dark:"#0C0C10", card:"#141419", surface:"#1A1A22", border:"#2A2A35",
  white:"#EAEAEF", gray:"#9999AA", dim:"#5A5A6E",
  green:"#22C55E", red:"#EF4444", amber:"#F59E0B",
  teal:"#14B8A6", blue:"#6366F1", purple:"#A855F7",
};

// ── RAW DATA (dal PDF Blueprint + Research) ───────────────────────

const STAGES = [
  { id:"lead",        label:"LEAD",        color:B.gray   },
  { id:"audit",       label:"AUDIT",       color:B.blue   },
  { id:"valuation",   label:"VALUATION",   color:B.amber  },
  { id:"offerta",     label:"OFFERTA",     color:B.orange },
  { id:"consignment", label:"CONSIGNMENT", color:B.purple },
  { id:"vendita",     label:"VENDITA",     color:B.green  },
];

const DEALS = [
  { id:"DEAL-2026-001", company:"Impresa Edile Rossi Spa",    stage:"consignment", value:450000, guarantee:150000, machines:12, cat:"MMT",        partner:"SICAN Deal 001 Ltd", split:"60/40", deadline:"2026-12-15", days:32, jv_capital:10000 },
  { id:"DEAL-2026-002", company:"Costr. Bianchi & Figli Srl", stage:"valuation",   value:180000, guarantee:null,   machines:4,  cat:"GRU",        partner:null,                  split:null,    deadline:"2026-09-30", days:12 },
  { id:"DEAL-2026-003", company:"Edilizia Verdi SpA",         stage:"audit",       value:220000, guarantee:null,   machines:8,  cat:"MMT",        partner:null,                  split:null,    deadline:"2026-10-15", days:5  },
  { id:"DEAL-2026-004", company:"Fratelli Neri Costruzioni",  stage:"offerta",     value:95000,  guarantee:null,   machines:2,  cat:"CAMION",     partner:null,                  split:null,    deadline:"2026-08-01", days:18 },
  { id:"DEAL-2026-005", company:"Costruzioni Blu Srl",        stage:"lead",        value:320000, guarantee:null,   machines:15, cat:"MMT",        partner:null,                  split:null,    deadline:null,         days:3  },
  { id:"DEAL-2026-006", company:"Grandi Lavori Spa",          stage:"lead",        value:150000, guarantee:null,   machines:6,  cat:"GENERATORI", partner:null,                  split:null,    deadline:null,         days:1  },
  { id:"DEAL-2026-007", company:"Porto Infrastrutture Srl",   stage:"lead",        value:280000, guarantee:null,   machines:9,  cat:"MMT",        partner:null,                  split:null,    deadline:null,         days:2  },
];

const AUDITS = [
  { id:"AUD-2026-001", company:"Impresa Edile Rossi Spa",     date:"2026-06-01", machines:12, status:"completed",   inspector:"M. Rossi",   cond:3.2, comp:0.75, valorScore:72 },
  { id:"AUD-2026-002", company:"Costr. Bianchi & Figli Srl",  date:"2026-06-05", machines:4,  status:"in_progress", inspector:"L. Ferrari", cond:null, comp:null, valorScore:null },
  { id:"AUD-2026-003", company:"Edilizia Verdi SpA",          date:"2026-06-08", machines:8,  status:"scheduled",   inspector:"G. Conti",   cond:null, comp:null, valorScore:null },
];

const BUDGET = [
  { item:"Sviluppo App (Python freelance)", alloc:4000, spent:1500, icon:"💻" },
  { item:"SDR Freelance (6 mesi)",          alloc:1300, spent:400,  icon:"📞" },
  { item:"Legal / JV Cipro (3 JV)",         alloc:1500, spent:500,  icon:"⚖️" },
  { item:"Copywriter / Report Africa",      alloc:1100, spent:400,  icon:"✍️" },
  { item:"Landing Page SaaS",               alloc:500,  spent:0,    icon:"🌐" },
  { item:"OCR / API",                       alloc:800,  spent:50,   icon:"🔍" },
  { item:"Contingenza",                     alloc:700,  spent:0,    icon:"🛡️" },
];

const KPI = [
  { key:"audits",   label:"Audit completati", unit:"",  m3:3,   m6:15,  cur:2,      icon:Camera },
  { key:"deals",    label:"Deal consignment", unit:"",  m3:1,   m6:3,   cur:1,      icon:Briefcase },
  { key:"machines", label:"Macchine in DB",   unit:"",  m3:50,  m6:200, cur:34,     icon:Package },
  { key:"sales",    label:"Vendite chiuse",   unit:"",  m3:2,   m6:10,  cur:1,      icon:CheckCircle },
  { key:"revenue",  label:"Incasso lordo",    unit:"€", m3:150000, m6:800000, cur:110000, icon:Euro },
  { key:"partners", label:"Partner attivi",   unit:"",  m3:1,   m6:3,   cur:1,      icon:Users },
];

const PIANO = [
  { m:1, label:"Setup & Primo Pilota",    budget:1700, done:true,  week_end:4,  actions:["Brief freelancer Python","Mappa 50 aziende target","Sviluppo app audit+valuation","Audit pilota #1-3 gratuiti"] },
  { m:2, label:"Chiusura Primo Deal",     budget:700,  done:true,  week_end:8,  actions:["Presentazione 3 CFO","SDR 30 call","Attivazione JV Cipriota","Consignment firmato"] },
  { m:3, label:"Vendita & Content",       budget:1900, done:false, week_end:12, actions:["Prima vendita","Africa Demand Report","Spedizione a 100 CFO","App: DEAL pipeline"] },
  { m:4, label:"Scale & 2° Consignment",  budget:2000, done:false, week_end:16, actions:["Secondo consignment","Partner #2 Tunisia/Marocco","App multi-tenant partner","Audit batch 2"] },
  { m:5, label:"Ottimizzazione",          budget:1800, done:false, week_end:20, actions:["Focus fast movers <45gg","App: OCR targhetta base","Terzo consignment","Liquidazione JV #1"] },
  { m:6, label:"SaaS & Chiusura",         budget:500,  done:false, week_end:24, actions:["Case study: €X recuperati","Landing SaaS","Beta 3 trader esterni","Review semestrale"] },
];

const TECH_STACK = [
  { comp:"FastAPI (Python)",            tech:"Backend",    cost:"€0/mese",     phase:"1" },
  { comp:"Streamlit",                   tech:"Frontend v1",cost:"€0/mese",     phase:"1" },
  { comp:"React (questo dashboard)",    tech:"Frontend v2",cost:"€0/mese",     phase:"2" },
  { comp:"SQLite → Supabase Postgres",  tech:"Database",   cost:"€0→€25/mese", phase:"1" },
  { comp:"Supabase Storage",            tech:"Foto/File",  cost:"€0–5/mese",   phase:"1" },
  { comp:"ReportLab / WeasyPrint",      tech:"PDF Report", cost:"€0/mese",     phase:"1" },
  { comp:"AWS Textract",                tech:"OCR",        cost:"€0.001/foto", phase:"2" },
  { comp:"Streamlit Cloud + Render",    tech:"Deploy",     cost:"€0–7/mese",   phase:"1" },
  { comp:"Supabase Auth",               tech:"Auth",       cost:"€0/mese",     phase:"1" },
];

const COMP_MATRIX = [
  { need:"Inventario fisico sul campo",               eam:"◐", erp:"◐", di:"✖", ai:"✖", valor:"✅" },
  { need:"Asset sottoutilizzati / dark assets",       eam:"◐", erp:"◐", di:"◐", ai:"◐", valor:"✅" },
  { need:"Valutazione economica FMV/OLV/FLV",        eam:"✖", erp:"◐", di:"✖", ai:"✖", valor:"✅" },
  { need:"Verifica accessori / completezza",          eam:"✖", erp:"✖", di:"✖", ai:"✖", valor:"✅" },
  { need:"Readiness per vendita / asta",              eam:"✖", erp:"✖", di:"✖", ai:"✖", valor:"✅" },
  { need:"Compliance & due diligence dismissione",    eam:"◐", erp:"◐", di:"◐", ai:"◐", valor:"✅" },
  { need:"Digital Passport + chain of custody",       eam:"◐", erp:"◐", di:"◐", ai:"◐", valor:"✅" },
  { need:"Export premium Africa/MENA pre-emissioni",  eam:"✖", erp:"✖", di:"✖", ai:"✖", valor:"✅" },
];

// ── VALUATION ENGINE ─────────────────────────────────────────────

function computeVal({ make, cat, year, hours, cond, comp, exportPrem }) {
  const NEW  = { MMT:120000, GRU:180000, CAMION:90000, CASSEFORME:60000, GENERATORI:40000 };
  const BASE = { MMT:0.90,   GRU:0.93,   CAMION:0.86,  CASSEFORME:0.90,  GENERATORI:0.91 };
  const PREM = ["CAT","Komatsu","Liebherr","Volvo","Hitachi","Potain","Mercedes","Scania","PERI","Doka","Cummins","MTU"];
  const LOW  = ["Doosan","Kobelco","Iveco","DAF","Condor","SDMO","Pramac"];

  const newVal  = NEW[cat]  || 100000;
  const age     = Math.max(0, 2026 - (parseInt(year) || 2016));
  const ageMult = Math.max(0.15, Math.pow(BASE[cat] || 0.90, age));

  const h = parseInt(hours) || 0;
  const hoursMult = h > 5000 ? Math.max(0.55, 1 - ((h - 5000) / 1000) * 0.10) : 1;

  const c = parseFloat(cond) || 3;
  const condMult = c >= 4.5 ? 1.20 : c >= 3.5 ? 1.10 : c >= 2.5 ? 1.00 : c >= 1.5 ? 0.85 : 0.60;

  const cp = parseFloat(comp) || 1;
  const compMult = cp >= 1 ? 1.15 : cp >= 0.75 ? 1.00 : cp >= 0.5 ? 0.85 : 0.70;

  const brandMult = PREM.includes(make) ? 1.0 : LOW.includes(make) ? 0.82 : 0.90;

  const fmv = newVal * ageMult * hoursMult * condMult * compMult * brandMult;
  const olv = fmv * 0.70;
  const flv = fmv * 0.50;
  const exp = exportPrem ? fmv * 1.25 : null;

  // VALOR Score ponderato
  const identita = 100;
  const operabilita = Math.round(Math.min(100, (hoursMult * condMult) * 100));
  const completezza = Math.round(cp * 100);
  const storico = 70;
  const liquidita = Math.round(Math.min(100, (ageMult * brandMult) * 100));
  const compliance = 80;
  const score = Math.round(0.20*identita + 0.20*operabilita + 0.15*completezza + 0.15*storico + 0.20*liquidita + 0.10*compliance);

  return { fmv, olv, flv, exp, score, factors:{ ageMult, hoursMult, condMult, compMult, brandMult } };
}

// ── UTILS ────────────────────────────────────────────────────────

const eur  = n => "€" + Math.round(n).toLocaleString("it-IT");
const pct  = (v, t) => t > 0 ? Math.min(100, Math.round((v / t) * 100)) : 0;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

// ── MAIN ─────────────────────────────────────────────────────────

export default function ValorSicanOS() {
  const [tab, setTab] = useState("panoramica");

  const TABS = [
    { id:"panoramica", label:"Panoramica",    icon:LayoutDashboard },
    { id:"pipeline",   label:"Pipeline",      icon:GitBranch       },
    { id:"audit",      label:"Audit & DPA",   icon:Camera          },
    { id:"valuation",  label:"Valutazione",   icon:Calculator      },
    { id:"deals",      label:"Deals & JV",    icon:Briefcase       },
    { id:"piano",      label:"Piano 6M",      icon:Calendar        },
  ];

  return (
    <div style={{ minHeight:"100vh", background:B.dark, color:B.white, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes fu { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fu .35s ease both; }
        @keyframes p { 0%,100%{opacity:1} 50%{opacity:.35} }
        .pu { animation:p 1.8s ease infinite; }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${B.card}}
        ::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px}
        input,select{outline:none}
        input::placeholder{color:${B.dim}}
        table{border-collapse:collapse;width:100%}
        th{font-size:10.5px;text-transform:uppercase;letter-spacing:.8px;color:${B.gray};font-weight:600;padding:10px 12px;text-align:left}
        td{padding:10px 12px;font-size:13px;vertical-align:middle}
        tbody tr{border-top:1px solid ${B.border}}
      `}</style>

      {/* HEADER */}
      <div style={{ background:B.card, borderBottom:`1px solid ${B.border}`, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 0 8px" }}>
            <div style={{ width:42,height:42,borderRadius:11,background:`linear-gradient(135deg,${B.orange},${B.orangeDark})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <Layers size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize:17,fontWeight:800,letterSpacing:.2 }}>VALOR · SICAN OS</div>
              <div style={{ fontSize:10,color:B.gray,letterSpacing:1.2,textTransform:"uppercase" }}>Sistema Operativo · RTI — Rizzo Trading International · v1.0</div>
            </div>
            <div style={{ marginLeft:"auto",display:"flex",gap:8,alignItems:"center",flexShrink:0 }}>
              <Chip color={B.amber} icon={AlertTriangle} text={`${DEALS.filter(d=>d.days>14).length} alert`} />
              <Chip color={B.green} text={`€${Math.round(DEALS.reduce((s,d)=>s+d.value,0)/1000)}k pipeline`} />
              <div style={{ fontSize:11,color:B.dim,background:B.surface,borderRadius:8,padding:"5px 10px" }}>Giugno 2026</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:1, overflowX:"auto" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                display:"flex",alignItems:"center",gap:6,padding:"10px 14px",background:"none",border:"none",cursor:"pointer",
                borderBottom:tab===t.id?`2px solid ${B.orange}`:"2px solid transparent",
                color:tab===t.id?B.white:B.gray,fontSize:13,fontWeight:tab===t.id?700:400,whiteSpace:"nowrap",
              }}>
                <t.icon size={15} color={tab===t.id?B.orange:B.dim} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"24px 20px 60px" }}>
        {tab==="panoramica" && <Panoramica />}
        {tab==="pipeline"   && <Pipeline   />}
        {tab==="audit"      && <AuditView  />}
        {tab==="valuation"  && <Valutazione/>}
        {tab==="deals"      && <Deals      />}
        {tab==="piano"      && <Piano      />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  PANORAMICA
// ═══════════════════════════════════════════

function Panoramica() {
  const budgetTot   = BUDGET.reduce((s,b)=>s+b.alloc,0);
  const budgetSpent = BUDGET.reduce((s,b)=>s+b.spent,0);
  const pipeVal     = DEALS.reduce((s,d)=>s+d.value,0);

  return (
    <div className="fu">
      {/* KPI GRID */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))", gap:12, marginBottom:20 }}>
        {KPI.map(k => {
          const p = pct(k.cur, k.m6);
          return (
            <div key={k.key} style={C.card}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                <div style={{ fontSize:11,color:B.gray,textTransform:"uppercase",letterSpacing:.7 }}>{k.label}</div>
                <k.icon size={15} color={B.orange} />
              </div>
              <div style={{ fontSize:25,fontWeight:800,letterSpacing:-.5 }}>
                {k.unit==="€" ? eur(k.cur) : k.cur.toLocaleString("it-IT")}
              </div>
              <div style={{ marginTop:10 }}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:10.5,color:B.dim,marginBottom:4 }}>
                  <span>M3: {k.unit==="€"?eur(k.m3):k.m3}</span>
                  <span>M6: {k.unit==="€"?eur(k.m6):k.m6}</span>
                </div>
                <Bar pct={p} color={B.orange} />
                <div style={{ fontSize:10.5,color:B.gray,marginTop:3 }}>{p}% target M6</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1.1fr 1fr 1.2fr",gap:14,marginBottom:14 }}>
        {/* ALERTS */}
        <div style={C.card}>
          <SecTitle icon={AlertTriangle} title="Alert Operativi" color={B.amber} />
          {[
            { msg:"DEAL-2026-001: scadenza tra 30gg", action:"Accelerare o rinnovare", lvl:"high" },
            { msg:"DEAL-2026-002: senza offerta da 12gg", action:"Rivedere il prezzo", lvl:"med" },
          ].map((a,i)=>(
            <div key={i} style={{ display:"flex",gap:10,padding:"11px 0",borderTop:i>0?`1px solid ${B.border}`:"none",alignItems:"flex-start" }}>
              <span style={{ width:8,height:8,borderRadius:"50%",background:a.lvl==="high"?B.red:B.amber,marginTop:5,flexShrink:0 }} className="pu" />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5,fontWeight:600 }}>{a.msg}</div>
                <div style={{ fontSize:11,color:B.gray,marginTop:2 }}>→ {a.action}</div>
              </div>
            </div>
          ))}
          <div style={{ paddingTop:12,borderTop:`1px solid ${B.border}`,fontSize:11.5,color:B.dim }}>
            Nessun alert critico su compliance
          </div>
        </div>

        {/* BUDGET BURN */}
        <div style={C.card}>
          <SecTitle icon={Euro} title="Budget €10k" color={B.green} />
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
            <div>
              <div style={{ fontSize:22,fontWeight:800,color:B.amber }}>{eur(budgetSpent)}</div>
              <div style={{ fontSize:11,color:B.gray }}>spesi</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:22,fontWeight:800,color:B.green }}>{eur(budgetTot-budgetSpent)}</div>
              <div style={{ fontSize:11,color:B.gray }}>rimanenti</div>
            </div>
          </div>
          <Bar pct={pct(budgetSpent,budgetTot)} color={B.orange} h={8} />
          <div style={{ marginTop:12,display:"flex",flexDirection:"column",gap:6 }}>
            {BUDGET.slice(0,4).map((b,i)=>(
              <div key={i} style={{ display:"flex",justifyContent:"space-between",fontSize:11.5 }}>
                <span style={{ color:B.gray }}>{b.icon} {b.item.split(" ").slice(0,3).join(" ")}</span>
                <span style={{ color:b.spent>0?B.amber:B.dim }}>{eur(b.spent)}/{eur(b.alloc)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PIPELINE SNAPSHOT */}
        <div style={C.card}>
          <SecTitle icon={GitBranch} title="Pipeline" sub={`${eur(pipeVal)} totale`} color={B.orange} />
          <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
            {STAGES.map(s => {
              const cnt = DEALS.filter(d=>d.stage===s.id).length;
              const val = DEALS.filter(d=>d.stage===s.id).reduce((a,d)=>a+d.value,0);
              return (
                <div key={s.id} style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:88,fontSize:10.5,color:s.color,fontWeight:700,textTransform:"uppercase",letterSpacing:.6 }}>{s.label}</div>
                  <div style={{ flex:1,height:5,background:B.surface,borderRadius:3,overflow:"hidden" }}>
                    <div style={{ width:Math.max(3,pct(cnt,DEALS.length))+"%",height:"100%",background:s.color,borderRadius:3 }} />
                  </div>
                  <div style={{ display:"flex",gap:8,fontSize:11.5,whiteSpace:"nowrap" }}>
                    <span style={{ fontWeight:700 }}>{cnt}</span>
                    <span style={{ color:B.dim }}>{val>0?eur(val):"—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MATRICE COMPETITIVA */}
      <div style={C.card}>
        <SecTitle icon={BarChart2} title="Matrice Competitiva — VALOR/SICAN vs. EAM / ERP / Decision Intelligence / Industrial AI" color={B.blue} />
        <div style={{ overflowX:"auto" }}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth:260 }}>Bisogno Operativo</th>
                <th style={{ textAlign:"center" }}>EAM (IBM)</th>
                <th style={{ textAlign:"center" }}>ERP (SAP/Oracle)</th>
                <th style={{ textAlign:"center" }}>Decision Intel.</th>
                <th style={{ textAlign:"center" }}>Industrial AI</th>
                <th style={{ textAlign:"center",color:B.orange }}>VALOR/SICAN</th>
              </tr>
            </thead>
            <tbody>
              {COMP_MATRIX.map((r,i)=>(
                <tr key={i}>
                  <td style={{ fontSize:12.5 }}>{r.need}</td>
                  {[r.eam,r.erp,r.di,r.ai].map((v,j)=>(
                    <td key={j} style={{ textAlign:"center",fontSize:15,color:v==="✅"?B.green:v==="◐"?B.amber:B.dim }}>{v}</td>
                  ))}
                  <td style={{ textAlign:"center",fontSize:16,fontWeight:700,color:B.green }}>{r.valor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex",gap:16,marginTop:12,fontSize:11,color:B.gray }}>
          <span>✅ Nativo</span><span>◐ Parziale</span><span style={{color:B.dim}}>✖ Assente</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  PIPELINE
// ═══════════════════════════════════════════

function Pipeline() {
  return (
    <div className="fu">
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <div style={{ fontSize:15,fontWeight:700 }}>Deal Pipeline — Kanban</div>
        <div style={{ fontSize:12,color:B.gray }}>{DEALS.length} deal · {eur(DEALS.reduce((s,d)=>s+d.value,0))} valore totale</div>
      </div>
      <div style={{ display:"flex",gap:10,overflowX:"auto",paddingBottom:12,alignItems:"flex-start" }}>
        {STAGES.map(s => {
          const lst = DEALS.filter(d=>d.stage===s.id);
          return (
            <div key={s.id} style={{ minWidth:230,background:B.card,border:`1px solid ${B.border}`,borderRadius:12,overflow:"hidden",flexShrink:0 }}>
              <div style={{ padding:"11px 14px",background:B.surface,borderBottom:`1px solid ${B.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:`2px solid ${s.color}` }}>
                <span style={{ fontSize:11.5,fontWeight:700,color:s.color,textTransform:"uppercase",letterSpacing:.8 }}>{s.label}</span>
                <span style={{ fontSize:12,color:B.gray,background:B.dark,borderRadius:10,padding:"2px 8px" }}>{lst.length}</span>
              </div>
              <div style={{ padding:"10px",display:"flex",flexDirection:"column",gap:8,minHeight:50 }}>
                {lst.length===0 && <div style={{ fontSize:12,color:B.dim,textAlign:"center",padding:"14px 0" }}>—</div>}
                {lst.map(d => <DealKanbanCard key={d.id} d={d} sc={s.color} />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DealKanbanCard({d,sc}) {
  const urgColor = d.days>30?B.red:d.days>14?B.amber:B.green;
  return (
    <div style={{ background:B.surface,border:`1px solid ${B.border}`,borderRadius:9,padding:"12px 12px",cursor:"pointer" }}>
      <div style={{ fontSize:10.5,color:sc,fontWeight:700,marginBottom:3 }}>{d.id}</div>
      <div style={{ fontSize:13,fontWeight:700,lineHeight:1.3,marginBottom:7 }}>{d.company}</div>
      <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:7 }}>
        <Bdg color={B.orange}>{eur(d.value)}</Bdg>
        <Bdg color={B.blue}>{d.machines} macch.</Bdg>
        <Bdg color={B.teal}>{d.cat}</Bdg>
      </div>
      {d.partner && <div style={{ fontSize:10,color:B.purple,marginBottom:4 }}>JV: {d.partner} · {d.split}</div>}
      <div style={{ display:"flex",alignItems:"center",gap:5,fontSize:11 }}>
        <Clock size={11} color={urgColor} />
        <span style={{ color:urgColor }}>{d.days}gg</span>
        {d.deadline && <span style={{ color:B.dim,marginLeft:"auto" }}>{d.deadline}</span>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  AUDIT & DIGITAL PASSPORT
// ═══════════════════════════════════════════

function AuditView() {
  const sample = {
    id:"AUD-2026-001-034", date:"2026-06-01", inspector:"Mario Rossi",
    machine:{ make:"Caterpillar",model:"320D",year:2015,serial:"CAT0320DPEJXXXXX",hours:8472,cat:"Escavatore",size:"20-ton",emission:"Tier 3" },
    cond:{ engine:4,hydraulics:3,undercarriage:3,structure:3,electrical:4 },
    comp:[
      {acc:"Benna standard",  ok:true,  cond:3},
      {acc:"Martello idraul.",ok:true,  cond:4},
      {acc:"Benna rock",      ok:false, cond:null},
      {acc:"Forche",          ok:true,  cond:3},
      {acc:"Manuali",         ok:false, cond:null},
      {acc:"Chiavi",          ok:true,  cond:5},
    ],
    valorScore:72,
  };
  const condAvg = Math.round((Object.values(sample.cond).reduce((s,v)=>s+v,0)/5)*10)/10;
  const compScore = sample.comp.filter(c=>c.ok).length / sample.comp.length;

  const PHASES = [
    { phase:"Pre-ingresso",       what:"permessi HSE, zone, lot list",               tools:"App + planimetria",        out:"Piano giornaliero" },
    { phase:"Identità",           what:"serial OEM, targa, QR/RFID",                 tools:"Scanner, OCR smartphone",  out:"Asset ID certo" },
    { phase:"Stato fisico",       what:"struttura, cingoli, perdite, cabina",         tools:"Checklist + foto/video",   out:"Condition score" },
    { phase:"Operabilità",        what:"avviamento, ore, console, errori ECU",        tools:"ANCEL HD3600 + video",     out:"Running / Parked" },
    { phase:"Completezza",        what:"accessori, attacchi, manuali, chiavi",        tools:"Foto dedicate, BOM check", out:"Completeness score" },
    { phase:"Provenienza",        what:"proprietà, manutenzioni, leasing",            tools:"Export ERP/EAM, interviste", out:"Provenance pack" },
    { phase:"Mercato",            what:"comparables, tempo uscita, canale",           tools:"VALOR Engine",             out:"FMV/OLV/FLV range" },
    { phase:"Compliance",         what:"titolarità, vincoli, HSE, export",            tools:"Legale/Finance/HSE",       out:"Sale-ready / Hold" },
    { phase:"Decisione",          what:"redeploy / vendi / asta / scrap",             tools:"Workflow approvativo",     out:"Action recommendation" },
  ];

  return (
    <div className="fu">
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
        {/* AUDIT LIST */}
        <div style={C.card}>
          <SecTitle icon={Camera} title="Audit Attivi" color={B.blue} />
          {AUDITS.map((a,i)=>(
            <div key={a.id} style={{ padding:"13px 0",borderTop:i>0?`1px solid ${B.border}`:"none" }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                <div style={{ fontSize:11.5,color:B.orange,fontWeight:700 }}>{a.id}</div>
                <StatusBdg status={a.status} />
              </div>
              <div style={{ fontSize:14,fontWeight:700,marginBottom:5 }}>{a.company}</div>
              <div style={{ fontSize:12,color:B.gray,display:"flex",gap:12,flexWrap:"wrap" }}>
                <span>👤 {a.inspector}</span>
                <span>📅 {a.date}</span>
                <span>🔧 {a.machines} macchine</span>
              </div>
              {a.valorScore && (
                <div style={{ marginTop:7,display:"flex",gap:7,flexWrap:"wrap" }}>
                  <Bdg color={B.green}>VALOR Score: {a.valorScore}</Bdg>
                  <Bdg color={B.blue}>Cond. {a.cond}/5</Bdg>
                  <Bdg color={B.amber}>Compl. {Math.round(a.comp*100)}%</Bdg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* DIGITAL PASSPORT */}
        <div style={C.card}>
          <SecTitle icon={FileText} title={`Digital Passport — ${sample.id}`} color={B.teal} />
          <div style={{ background:B.surface,borderRadius:10,padding:14,marginBottom:14 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:12 }}>
              {Object.entries(sample.machine).map(([k,v])=>(
                <div key={k}><span style={{ color:B.gray,textTransform:"capitalize" }}>{k}: </span><span style={{ fontWeight:600 }}>{v}</span></div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:11,color:B.gray,marginBottom:8,textTransform:"uppercase",letterSpacing:.7 }}>Condizione Sottosistemi</div>
            {Object.entries(sample.cond).map(([k,v])=>(
              <div key={k} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6 }}>
                <div style={{ width:96,fontSize:11.5,color:B.gray,textTransform:"capitalize" }}>{k}</div>
                <div style={{ flex:1,height:5,background:B.surface,borderRadius:3,overflow:"hidden" }}>
                  <div style={{ width:(v/5*100)+"%",height:"100%",background:v>=4?B.green:v>=3?B.amber:B.red,borderRadius:3 }} />
                </div>
                <div style={{ fontSize:13,fontWeight:700,width:14 }}>{v}</div>
              </div>
            ))}
            <div style={{ fontSize:12,color:B.orange,fontWeight:700,marginTop:6 }}>Media: {condAvg} / 5</div>
          </div>
          {/* VALOR SCORE */}
          <div style={{ background:`${B.teal}18`,border:`1px solid ${B.teal}44`,borderRadius:10,padding:14 }}>
            <div style={{ fontSize:11,color:B.teal,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:6 }}>VALOR Score — Prontezza Economica</div>
            <div style={{ fontSize:32,fontWeight:900,color:sample.valorScore>=80?B.green:sample.valorScore>=60?B.amber:B.red }}>{sample.valorScore}</div>
            <div style={{ fontSize:11.5,color:B.gray,marginTop:4 }}>
              {sample.valorScore>=80?"🟢 Pronto per vendita/asta/redeploy":sample.valorScore>=60?"🟡 Valore presente, remediation rapida":"🔴 Approfondimento tecnico-legale"}
            </div>
            <div style={{ marginTop:10,height:5,background:B.surface,borderRadius:3,overflow:"hidden" }}>
              <div style={{ width:sample.valorScore+"%",height:"100%",background:sample.valorScore>=80?B.green:sample.valorScore>=60?B.amber:B.red,borderRadius:3 }} />
            </div>
          </div>
        </div>
      </div>

      {/* SET FOTOGRAFICO + ACCESSORI */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
        <div style={C.card}>
          <SecTitle icon={Camera} title="Set Fotografico — 10 Scatti Obbligatori" color={B.orange} />
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
            {[
              "Overview frontale","Overview posteriore","Laterale sinistra","Laterale destra",
              "Targa / Seriale","Contaore / Odometro","Motore / Vano tecnico","Accessori chiave","Danni","Documenti"
            ].map((s,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:8,background:B.surface,borderRadius:8,padding:"9px 11px" }}>
                <div style={{ width:22,height:22,borderRadius:6,background:i<6?`${B.green}22`:B.dark,border:`1px solid ${i<6?B.green:B.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:i<6?B.green:B.dim,flexShrink:0 }}>
                  {i<6?"✓":i+1}
                </div>
                <span style={{ fontSize:12 }}>{s}</span>
                {i<6 && <span style={{ marginLeft:"auto",fontSize:9.5,color:B.teal }}>GPS ✓</span>}
              </div>
            ))}
          </div>
        </div>

        <div style={C.card}>
          <SecTitle icon={Package} title="Completezza Accessori" color={B.amber} />
          <div style={{ fontSize:12,color:B.gray,marginBottom:10 }}>
            Score: <strong style={{ color:B.orange }}>{Math.round(compScore*100)}%</strong> · {sample.comp.filter(c=>c.ok).length}/{sample.comp.length} presenti
          </div>
          <table>
            <thead><tr><th>Accessorio</th><th>Presente</th><th>Condizione</th></tr></thead>
            <tbody>
              {sample.comp.map((a,i)=>(
                <tr key={i}>
                  <td>{a.acc}</td>
                  <td><span style={{ color:a.ok?B.green:B.red,fontWeight:700 }}>{a.ok?"✓ Sì":"✗ No"}</span></td>
                  <td style={{ color:B.gray }}>{a.cond?`${a.cond}/5`:"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FLUSSO ISPEZIONE */}
      <div style={C.card}>
        <SecTitle icon={Activity} title="Flusso Ispezione Super Professionale — 9 Fasi" color={B.purple} />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10 }}>
          {PHASES.map((p,i)=>(
            <div key={i} style={{ background:B.surface,borderRadius:9,padding:"11px 13px",display:"flex",gap:10,alignItems:"flex-start" }}>
              <div style={{ width:24,height:24,borderRadius:7,background:B.orange,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#fff",flexShrink:0 }}>{i+1}</div>
              <div>
                <div style={{ fontSize:12,fontWeight:700,marginBottom:3,color:B.white }}>{p.phase}</div>
                <div style={{ fontSize:11,color:B.gray,marginBottom:2 }}>{p.what}</div>
                <div style={{ fontSize:10.5,color:B.dim }}>🔧 {p.tools}</div>
                <div style={{ fontSize:10.5,color:B.teal,marginTop:2 }}>→ {p.out}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  VALUTAZIONE ENGINE
// ═══════════════════════════════════════════

function Valutazione() {
  const [f,setF] = useState({ make:"CAT",cat:"MMT",year:"2015",hours:"8472",cond:"3.2",comp:"0.75",exportPrem:true });
  const [res,setRes] = useState(null);

  const calc = () => setRes(computeVal({ ...f }));

  return (
    <div className="fu">
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1.5fr",gap:16 }}>
        {/* INPUTS */}
        <div style={C.card}>
          <SecTitle icon={Calculator} title="Input Valutazione" color={B.orange} />
          <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
            {[
              { label:"Marca",              key:"make", type:"sel", opts:["CAT","Komatsu","Volvo","Liebherr","JCB","Doosan","Iveco","PERI","Doka","Cummins"] },
              { label:"Categoria",          key:"cat",  type:"sel", opts:["MMT","GRU","CAMION","CASSEFORME","GENERATORI"] },
              { label:"Anno immatric.",     key:"year", type:"txt", ph:"2015" },
              { label:"Ore motore",         key:"hours",type:"txt", ph:"8472" },
              { label:"Condizione (1–5)",   key:"cond", type:"txt", ph:"3.2" },
              { label:"Completezza (0–1)",  key:"comp", type:"txt", ph:"0.75" },
            ].map(field=>(
              <div key={field.key}>
                <div style={{ fontSize:11,color:B.gray,marginBottom:4 }}>{field.label}</div>
                {field.type==="sel" ? (
                  <select value={f[field.key]} onChange={e=>setF({...f,[field.key]:e.target.value})} style={{ ...C.inp,width:"100%" }}>
                    {field.opts.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input value={f[field.key]} onChange={e=>setF({...f,[field.key]:e.target.value})} placeholder={field.ph} style={{ ...C.inp,width:"100%" }} />
                )}
              </div>
            ))}
            <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:13,marginTop:2 }}>
              <input type="checkbox" checked={f.exportPrem} onChange={e=>setF({...f,exportPrem:e.target.checked})} />
              🌍 Export Premium Africa/MENA (+25% Tier 2/3)
            </label>
            <button onClick={calc} style={{ ...C.btnOrange,justifyContent:"center" }}>
              <Calculator size={15} /> Calcola FMV / OLV / FLV
            </button>
          </div>
        </div>

        {/* RESULTS */}
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {res ? (
            <>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10 }}>
                <ValCard label="FMV"  sub="Fair Market Value" val={res.fmv} color={B.teal} />
                <ValCard label="OLV"  sub="Orderly Liquidation" val={res.olv} color={B.orange} />
                <ValCard label="FLV"  sub="Forced Liquidation"  val={res.flv} color={B.red} />
              </div>
              {res.exp && (
                <div style={{ ...C.card,borderTop:`2px solid ${B.green}`,background:`${B.green}0d`,padding:16 }}>
                  <div style={{ fontSize:11,color:B.green,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:5 }}>🌍 Export Premium Africa/MENA</div>
                  <div style={{ fontSize:28,fontWeight:800,color:B.green }}>{eur(res.exp)}</div>
                  <div style={{ fontSize:12,color:B.gray,marginTop:4 }}>+{eur(res.exp-res.fmv)} sopra il FMV europeo · arbitraggio RTI Tier 2/3</div>
                </div>
              )}
              {/* VALOR SCORE */}
              <div style={{ ...C.card,padding:16 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <SecTitle icon={Star} title="VALOR Score" color={B.teal} />
                  <div style={{ fontSize:30,fontWeight:900,color:res.score>=80?B.green:res.score>=60?B.amber:B.red }}>{res.score}</div>
                </div>
                <Bar pct={res.score} color={res.score>=80?B.green:res.score>=60?B.amber:B.red} h={8} />
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12 }}>
                  {[{l:"80–100",t:"Pronto per vendita/asta",c:B.green},{l:"60–79",t:"Remediation rapida",c:B.amber},{l:"40–59",t:"Approfondimento tecnico",c:B.orange},{l:"< 40",t:"Part-out / Scrap / Hold",c:B.red}].map((r,i)=>(
                    <div key={i} style={{ fontSize:11,padding:"6px 9px",background:B.surface,borderRadius:7,borderLeft:`2px solid ${r.c}` }}>
                      <span style={{ color:r.c,fontWeight:700 }}>{r.l}</span> · {r.t}
                    </div>
                  ))}
                </div>
              </div>
              {/* FATTORI */}
              <div style={C.card}>
                <SecTitle icon={Activity} title="Fattori Applicati" color={B.blue} />
                <table>
                  <thead><tr><th>Fattore</th><th>Moltiplicatore</th><th>Impatto €</th></tr></thead>
                  <tbody>
                    {[
                      {n:"Età",    v:res.factors.ageMult   },
                      {n:"Ore",    v:res.factors.hoursMult },
                      {n:"Cond.",  v:res.factors.condMult  },
                      {n:"Compl.", v:res.factors.compMult  },
                      {n:"Brand",  v:res.factors.brandMult },
                    ].map((r,i)=>{
                      const imp = (r.v-1)*res.fmv;
                      return (
                        <tr key={i}>
                          <td>{r.n}</td>
                          <td style={{ fontWeight:700,color:r.v>=1?B.green:B.red }}>×{r.v.toFixed(2)}</td>
                          <td style={{ color:imp>=0?B.green:B.red,fontWeight:600 }}>{imp>0?"+":""}{eur(imp)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div style={{ ...C.card,padding:50,textAlign:"center",color:B.dim }}>
              <Calculator size={44} color={B.border} style={{ marginBottom:14 }} />
              <div style={{ fontSize:14 }}>Inserisci i dati e premi Calcola</div>
              <div style={{ fontSize:12,color:B.dim,marginTop:6 }}>Verranno calcolati FMV · OLV · FLV · Export Premium · VALOR Score</div>
            </div>
          )}
        </div>
      </div>

      {/* TABELLA FATTORI RIFERIMENTO */}
      <div style={{ ...C.card,marginTop:16 }}>
        <SecTitle icon={BarChart2} title="Tabella Fattori — Riferimento Operativo" color={B.gray} />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:10 }}>
          {[
            {n:"Età",          range:"−5% → −35%/anno",              note:"deprezzamento iniziale maggiore",  c:B.red    },
            {n:"Ore Motore",   range:"−10% ogni 1.000h sopra 5.000h",note:"high-hour penalty",                c:B.amber  },
            {n:"Condizione",   range:"+20% (5) → −40% (1)",          note:"scala a 5 punti EquipmentWatch",  c:B.orange },
            {n:"Completezza",  range:"+15% (100%) → −30% (<50%)",    note:"accessori e documentazione",      c:B.blue   },
            {n:"Brand Tier",   range:"+10% premium · −10% generic",  note:"CAT/Komatsu/Liebherr = premium",  c:B.teal   },
            {n:"Export MENA",  range:"+15–35% Tier 2/3",             note:"arbitraggio RTI vs EU",           c:B.green  },
          ].map((f,i)=>(
            <div key={i} style={{ background:B.surface,borderRadius:9,padding:"11px 13px",borderLeft:`2px solid ${f.c}` }}>
              <div style={{ fontSize:12,fontWeight:700,marginBottom:3 }}>{f.n}</div>
              <div style={{ fontSize:12,color:f.c,fontWeight:600 }}>{f.range}</div>
              <div style={{ fontSize:11,color:B.gray,marginTop:2 }}>{f.note}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:14,background:B.surface,borderRadius:10,padding:"13px 16px",fontSize:12,color:B.gray,lineHeight:1.7 }}>
          <strong style={{ color:B.white }}>Standard valutazione:</strong> OLV = FMV × 0,60–0,80 · FLV = FMV × 0,40–0,60 · Asta ≈ 72–80% del retail dealer (Machinery Pete benchmark) · Fonte autoritative: ASA/USPAP Machinery & Technical Specialties
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  DEALS & JV
// ═══════════════════════════════════════════

function Deals() {
  const PITCH = `"VALOR/SICAN vi aiuta a trasformare beni dispersi, duplicati, fermi o sottoutilizzati in un inventario difendibile, riconciliato e pronto per decisione. Il primo obiettivo non è vendere: è darvi evidenza. Il secondo è ridurre acquisti evitabili, noleggi ridondanti, capitale immobilizzato e rischio di audit. Solo il terzo obiettivo è monetizzare."`;

  const NO_RULES = [
    "Conosco la categoria e ho esperienza su questo tipo di asset?",
    "Ho almeno 1 compratore interessato in 48h?",
    "Tempo stimato di uscita < 90 giorni?",
    "Titolarità chiara e documentata?",
    "Macchina mobile / spostabile senza costi eccessivi?",
  ];

  const LEGAL = [
    "Nessun trasferimento di titolo senza approvazione scritta del cliente",
    "Data ownership rimane al cliente",
    "Accesso on-site sotto HSE del cliente",
    "Revenue share o fee per risultato, no grossi canoni iniziali",
    "Diritto del cliente al redeploy interno prima della vendita",
    "Dossier probatorio per ogni asset · No exclusivity nel pilot",
  ];

  return (
    <div className="fu">
      <div style={{ display:"grid",gridTemplateColumns:"1.4fr 1fr",gap:16,marginBottom:16 }}>
        {/* DEAL LIST */}
        <div style={C.card}>
          <SecTitle icon={Briefcase} title="Deal Attivi — Dettaglio" color={B.orange} />
          {DEALS.filter(d=>d.stage!=="lead").map((d,i)=>{
            const s = STAGES.find(s=>s.id===d.stage);
            return (
              <div key={d.id} style={{ padding:"13px 0",borderTop:i>0?`1px solid ${B.border}`:"none" }}>
                <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                  <div style={{ fontSize:11,color:s.color,fontWeight:700,textTransform:"uppercase" }}>{s.label} — {d.id}</div>
                  <div style={{ fontSize:14,fontWeight:800,color:B.orange }}>{eur(d.value)}</div>
                </div>
                <div style={{ fontSize:14,fontWeight:700,marginBottom:6 }}>{d.company}</div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  <Bdg color={B.blue}>{d.machines} macchine</Bdg>
                  <Bdg color={B.teal}>{d.cat}</Bdg>
                  {d.guarantee && <Bdg color={B.green}>Garanzia {eur(d.guarantee)}</Bdg>}
                  {d.partner   && <Bdg color={B.purple}>{d.partner}</Bdg>}
                  {d.deadline  && <Bdg color={B.amber}>⏱ {d.deadline}</Bdg>}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          {/* JV */}
          <div style={C.card}>
            <SecTitle icon={Building2} title="JV SICAN Attive" color={B.purple} />
            <div style={{ background:`${B.purple}18`,border:`1px solid ${B.purple}44`,borderRadius:10,padding:14,marginBottom:8 }}>
              <div style={{ fontSize:12,color:B.purple,fontWeight:700,marginBottom:6 }}>SICAN Deal 001 Ltd</div>
              <div style={{ display:"flex",flexDirection:"column",gap:4,fontSize:12,color:B.gray }}>
                <div>📍 Cipro · Capitale: €10.000</div>
                <div>👥 RTI (60%) + Partner Y (40%)</div>
                <div>🔗 DEAL-2026-001 · {eur(450000)}</div>
                <div>📅 Scadenza: 2026-12-15</div>
              </div>
              <div style={{ marginTop:8 }}><Bdg color={B.green}>✓ Attiva</Bdg></div>
            </div>
            <div style={{ fontSize:12,color:B.dim }}>Target: 3 JV entro M6 · Split 60/40 su tutti i deal</div>
          </div>

          {/* REGOLA DEL NO */}
          <div style={C.card}>
            <SecTitle icon={Shield} title='Regola del "NO" — Proteggi €300k' color={B.red} />
            <div style={{ fontSize:12,color:B.gray,marginBottom:10,padding:"8px 12px",background:`${B.red}11`,borderRadius:8,border:`1px solid ${B.red}33` }}>
              Se ≥ 2 su 5 condizioni = NO → <strong style={{ color:B.red }}>HOLD, non GO</strong>
            </div>
            {NO_RULES.map((r,i)=>(
              <div key={i} style={{ display:"flex",gap:9,padding:"8px 0",borderTop:i>0?`1px solid ${B.border}`:"none",alignItems:"center" }}>
                <div style={{ width:20,height:20,borderRadius:5,border:`1px solid ${B.green}55`,background:`${B.green}15`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                  <CheckCircle size={12} color={B.green} />
                </div>
                <div style={{ fontSize:12.5 }}>{i+1}. {r}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PITCH + LEGAL */}
      <div style={{ display:"grid",gridTemplateColumns:"1.2fr 1fr",gap:16,marginBottom:16 }}>
        <div style={C.card}>
          <SecTitle icon={Award} title="Pitch di Ingresso Raccomandato" color={B.teal} />
          <div style={{ fontSize:13,color:B.white,lineHeight:1.75,fontStyle:"italic",padding:"14px 16px",background:B.surface,borderRadius:10,borderLeft:`3px solid ${B.teal}` }}>
            {PITCH}
          </div>
          <div style={{ marginTop:12,fontSize:12,color:B.gray,lineHeight:1.6 }}>
            Linguaggio CFO-compatibile: <strong style={{ color:B.white }}>controllo inventariale + compliance + recupero capitale</strong>.<br/>
            Non "vi aiuto a svuotare il piazzale" — bensì "vi aiuto a vedere bene ciò che possedete."
          </div>
        </div>

        <div style={C.card}>
          <SecTitle icon={FileText} title="Clausole Contrattuali Raccomandate" color={B.blue} />
          {LEGAL.map((l,i)=>(
            <div key={i} style={{ display:"flex",gap:8,padding:"7px 0",borderTop:i>0?`1px solid ${B.border}`:"none",alignItems:"flex-start" }}>
              <CheckCircle size={14} color={B.teal} style={{ marginTop:1,flexShrink:0 }} />
              <div style={{ fontSize:12.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ALERT TABLE */}
      <div style={C.card}>
        <SecTitle icon={AlertTriangle} title="Alert Automatici — Regole Operative" color={B.amber} />
        <table>
          <thead><tr><th>Evento</th><th>Alert</th><th>Azione Richiesta</th></tr></thead>
          <tbody>
            {[
              {ev:"Deal a 30gg dalla scadenza",       al:"Email + Dashboard", az:"Accelerare o rinnovare"},
              {ev:"Macchina senza offerta da 45gg",   al:"Dashboard",         az:"Rivedere il prezzo"},
              {ev:"Partner senza vendite da 60gg",    al:"Email",             az:"Review performance partner"},
              {ev:"Offerta accettata",                al:"Email",             az:"Avviare consignment"},
            ].map((a,i)=>(
              <tr key={i}>
                <td>{a.ev}</td>
                <td><Bdg color={B.amber}>{a.al}</Bdg></td>
                <td style={{ color:B.gray }}>{a.az}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  PIANO 6 MESI
// ═══════════════════════════════════════════

function Piano() {
  const budgetTot = BUDGET.reduce((s,b)=>s+b.alloc,0);
  const budgetSpent = BUDGET.reduce((s,b)=>s+b.spent,0);
  const CUR_MONTH = 2;

  return (
    <div className="fu">
      {/* TIMELINE */}
      <div style={{ ...C.card,marginBottom:16 }}>
        <SecTitle icon={Calendar} title="Piano Operativo — 6 Mesi · Budget €10k" color={B.orange} />
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
          {PIANO.map(m=>(
            <div key={m.m} style={{ background:B.surface,borderRadius:10,padding:14,border:`1px solid ${m.m===CUR_MONTH?B.orange:B.border}`,borderTop:`2px solid ${m.done?B.green:m.m===CUR_MONTH?B.orange:B.border}` }}>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:7 }}>
                <div style={{ fontSize:12,fontWeight:700,color:m.done?B.green:m.m===CUR_MONTH?B.orange:B.gray }}>
                  M{m.m} {m.m===CUR_MONTH?"← ADESSO":""}
                </div>
                <div style={{ fontSize:11,color:B.amber,fontWeight:600 }}>{eur(m.budget)}</div>
              </div>
              <div style={{ fontSize:13,fontWeight:700,marginBottom:9,lineHeight:1.3 }}>{m.label}</div>
              {m.actions.map((a,i)=>(
                <div key={i} style={{ fontSize:11.5,color:B.gray,padding:"2px 0",display:"flex",alignItems:"center",gap:5 }}>
                  <span style={{ color:m.done?B.green:m.m===CUR_MONTH?B.orange:B.dim }}>•</span>{a}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16 }}>
        {/* BUDGET */}
        <div style={C.card}>
          <SecTitle icon={Euro} title={`Budget — Stato M${CUR_MONTH}`} color={B.green} />
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:12 }}>
            <div><div style={{ fontSize:22,fontWeight:800,color:B.amber }}>{eur(budgetSpent)}</div><div style={{ fontSize:11,color:B.gray }}>spesi</div></div>
            <div style={{ textAlign:"right" }}><div style={{ fontSize:22,fontWeight:800,color:B.green }}>{eur(budgetTot-budgetSpent)}</div><div style={{ fontSize:11,color:B.gray }}>rimanenti</div></div>
          </div>
          <Bar pct={pct(budgetSpent,budgetTot)} color={B.orange} h={8} />
          <div style={{ marginTop:14,display:"flex",flexDirection:"column",gap:9 }}>
            {BUDGET.map((b,i)=>(
              <div key={i}>
                <div style={{ display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4 }}>
                  <span style={{ color:B.gray }}>{b.icon} {b.item}</span>
                  <span style={{ color:b.spent>0?B.amber:B.dim }}>{eur(b.spent)} / {eur(b.alloc)}</span>
                </div>
                <Bar pct={pct(b.spent,b.alloc)} color={B.orange} h={4} />
              </div>
            ))}
          </div>
        </div>

        {/* KPI TABLE */}
        <div style={C.card}>
          <SecTitle icon={Target} title="KPI — Attuale vs Target" color={B.teal} />
          <table>
            <thead><tr><th>KPI</th><th>Attuale</th><th>Target M3</th><th>Target M6</th></tr></thead>
            <tbody>
              {KPI.map(k=>(
                <tr key={k.key}>
                  <td style={{ fontSize:12 }}>{k.label}</td>
                  <td style={{ fontWeight:700,color:B.orange }}>{k.unit==="€"?eur(k.cur):k.cur}</td>
                  <td style={{ color:B.amber }}>{k.unit==="€"?eur(k.m3):k.m3}</td>
                  <td style={{ color:B.green }}>{k.unit==="€"?eur(k.m6):k.m6}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* ROI */}
          <div style={{ marginTop:14,background:B.surface,borderRadius:10,padding:14 }}>
            <div style={{ fontSize:11,color:B.gray,textTransform:"uppercase",letterSpacing:.7,marginBottom:8 }}>Formula ROI del Pilot</div>
            <div style={{ fontSize:11.5,lineHeight:1.8 }}>
              <div style={{ color:B.green }}>+ Cassa diretta: incassi netti da vendita/asta</div>
              <div style={{ color:B.teal }}>+ Cassa evitata: acquisti/noleggi non necessari</div>
              <div style={{ color:B.blue }}>+ Costi ridotti: spazio, handling, inventari annuali</div>
              <div style={{ color:B.dim }}>− Costo pilot</div>
            </div>
            <div style={{ marginTop:10,padding:"10px 13px",background:B.dark,borderRadius:8,fontFamily:"monospace",fontSize:12.5,color:B.orange,lineHeight:1.7 }}>
              ROI = (Cassa↑ + Cassa evitata + Costi↓ − Costo) ÷ Costo
            </div>
          </div>
        </div>
      </div>

      {/* TECH STACK */}
      <div style={C.card}>
        <SecTitle icon={Cpu} title="Tech Stack — Fase 1 (Streamlit) → Fase 2 (React)" color={B.purple} />
        <table>
          <thead><tr><th>Componente</th><th>Tecnologia</th><th>Costo</th><th>Fase</th></tr></thead>
          <tbody>
            {TECH_STACK.map((t,i)=>(
              <tr key={i}>
                <td style={{ fontWeight:600 }}>{t.comp}</td>
                <td style={{ color:B.gray }}>{t.tech}</td>
                <td style={{ color:t.cost.includes("0")?B.green:B.amber,fontWeight:600 }}>{t.cost}</td>
                <td><Bdg color={t.phase==="1"?B.blue:B.purple}>Fase {t.phase}</Bdg></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop:14,fontSize:12,color:B.gray,lineHeight:1.6,padding:"12px 14px",background:B.surface,borderRadius:9 }}>
          <strong style={{ color:B.white }}>Costo mensile running:</strong> €0–50 (mesi 1-3) · €50–100 (da mese 4) ·
          <strong style={{ color:B.white }}> Integrazione dashboard React:</strong> chiama FastAPI via <code style={{ color:B.orange }}>fetch('/api/...')</code> — vedi note tecniche nel file di integrazione.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  SHARED COMPONENTS
// ═══════════════════════════════════════════

function SecTitle({icon:Icon,title,sub,color}) {
  return (
    <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:15 }}>
      <Icon size={16} color={color||B.orange} />
      <span style={{ fontSize:14,fontWeight:700 }}>{title}</span>
      {sub && <span style={{ fontSize:12,color:B.gray }}>{sub}</span>}
    </div>
  );
}

function Bdg({children,color}) {
  return (
    <span style={{ display:"inline-block",fontSize:10.5,fontWeight:600,color,background:`${color}20`,border:`1px solid ${color}44`,borderRadius:6,padding:"2px 7px" }}>
      {children}
    </span>
  );
}

function Chip({text,color,icon:Icon}) {
  return (
    <div style={{ background:`${color}20`,border:`1px solid ${color}44`,borderRadius:20,padding:"4px 10px",fontSize:11.5,color,display:"flex",alignItems:"center",gap:5 }}>
      {Icon && <Icon size={12} />} {text}
    </div>
  );
}

function Bar({pct:p,color,h=5}) {
  return (
    <div style={{ height:h,background:B.surface,borderRadius:4,overflow:"hidden" }}>
      <div style={{ width:Math.max(2,p)+"%",height:"100%",background:color,borderRadius:4,transition:"width .5s ease" }} />
    </div>
  );
}

function ValCard({label,sub,val,color}) {
  return (
    <div style={{ ...C.card,borderTop:`2px solid ${color}`,padding:16 }}>
      <div style={{ fontSize:10,color,fontWeight:700,textTransform:"uppercase",letterSpacing:.7,marginBottom:5 }}>{label}</div>
      <div style={{ fontSize:21,fontWeight:800 }}>{eur(val)}</div>
      <div style={{ fontSize:11,color:B.gray,marginTop:4 }}>{sub}</div>
    </div>
  );
}

function StatusBdg({status}) {
  const M = {
    completed:  {l:"Completato",     c:B.green  },
    in_progress:{l:"In corso",       c:B.orange },
    scheduled:  {l:"Programmato",    c:B.blue   },
  };
  const s = M[status]||{l:status,c:B.gray};
  return <Bdg color={s.c}>{s.l}</Bdg>;
}

// STYLE CONSTANTS
const C = {
  card:{ background:B.card, border:`1px solid ${B.border}`, borderRadius:14, padding:18 },
  inp: { padding:"9px 11px", background:B.surface, border:`1px solid ${B.border}`, borderRadius:8, color:B.white, fontSize:13 },
  btnOrange:{ display:"inline-flex",alignItems:"center",gap:6,padding:"10px 16px",background:`linear-gradient(135deg,${B.orange},${B.orangeDark})`,color:"#fff",border:"none",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",width:"100%" },
};
