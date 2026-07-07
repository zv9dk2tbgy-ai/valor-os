import { useState } from "react";
import {
  LayoutDashboard, CalendarRange, Building2, Landmark, ArrowRightLeft, Home,
  Package, KeyRound, Briefcase, FileText, ListChecks, Bot, Settings as SettingsIcon, Layers, AlertTriangle,
} from "lucide-react";
import { B } from "./lib/theme.js";
import { StoreProvider, useStore } from "./lib/store.jsx";
import Executive from "./modules/Executive.jsx";
import CashFlow from "./modules/CashFlow.jsx";
import Companies from "./modules/Companies.jsx";
import BankDebt from "./modules/BankDebt.jsx";
import IntercompanyLoans from "./modules/IntercompanyLoans.jsx";
import RealEstate from "./modules/RealEstate.jsx";
import ValorAssets from "./modules/ValorAssets.jsx";
import Rentals from "./modules/Rentals.jsx";
import DealPipeline from "./modules/DealPipeline.jsx";
import DueDiligence from "./modules/DueDiligence.jsx";
import DecisionBoard from "./modules/DecisionBoard.jsx";
import AICFO from "./modules/AICFO.jsx";
import Settings from "./modules/Settings.jsx";

const NAV = [
  { id: "executive", label: "Home / Executive", icon: LayoutDashboard, Component: Executive },
  { id: "cashflow", label: "Cash Flow", icon: CalendarRange, Component: CashFlow },
  { id: "companies", label: "Società", icon: Building2, Component: Companies },
  { id: "bankdebt", label: "Banche & Finanziamenti", icon: Landmark, Component: BankDebt },
  { id: "intercompany", label: "Prestiti infragruppo", icon: ArrowRightLeft, Component: IntercompanyLoans },
  { id: "realestate", label: "Progetti immobiliari", icon: Home, Component: RealEstate },
  { id: "valor", label: "VALOR Assets", icon: Package, Component: ValorAssets },
  { id: "rentals", label: "Affitti & Noleggi", icon: KeyRound, Component: Rentals },
  { id: "deals", label: "Deal Pipeline", icon: Briefcase, Component: DealPipeline },
  { id: "dd", label: "Due Diligence", icon: FileText, Component: DueDiligence },
  { id: "decisions", label: "Decision Board", icon: ListChecks, Component: DecisionBoard },
  { id: "aicfo", label: "AI CFO", icon: Bot, Component: AICFO },
  { id: "settings", label: "Settings", icon: SettingsIcon, Component: Settings },
];

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

function Shell() {
  const [tab, setTab] = useState("executive");
  const { data } = useStore();
  const Active = NAV.find((n) => n.id === tab)?.Component || Executive;

  const highPriorityOpen = data.decisions.filter((d) => d.priority === "alta" && d.status !== "completata" && d.status !== "annullata").length;

  return (
    <div style={{ minHeight: "100vh", background: B.dark, color: B.white, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
      <style>{`
        @keyframes fu { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fu { animation:fu .3s ease both; }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:${B.card}}
        ::-webkit-scrollbar-thumb{background:${B.border};border-radius:3px}
        input,select,textarea{outline:none;font-family:inherit}
        input::placeholder,textarea::placeholder{color:${B.dim}}
        table{border-collapse:collapse;width:100%}
        th{font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;color:${B.gray};font-weight:600;padding:9px 10px;text-align:left;white-space:nowrap}
        td{padding:7px 10px;font-size:12.5px;vertical-align:middle}
        tbody tr{border-top:1px solid ${B.border}}
        button{font-family:inherit}
        html,body{overflow-x:hidden;max-width:100%}
        @media print {
          .app-topbar { display:none !important; }
        }
      `}</style>

      <div className="app-topbar" style={{ background: B.card, borderBottom: `1px solid ${B.border}`, position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 0 8px", flexWrap: "wrap", rowGap: 8 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg,${B.gold},${B.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Layers size={22} color="#0B0C10" />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: 0.2, whiteSpace: "nowrap" }}>Bowser · RTI Command Center</div>
              <div style={{ fontSize: 10, color: B.gray, letterSpacing: 1.1, textTransform: "uppercase" }}>Company Operating System — Bowser / RTI / Sichin / VALOR</div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {highPriorityOpen > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: B.red, background: `${B.red}18`, border: `1px solid ${B.red}44`, borderRadius: 20, padding: "5px 10px", whiteSpace: "nowrap" }}>
                  <AlertTriangle size={11} /> {highPriorityOpen} decisioni urgenti
                </div>
              )}
              <div style={{ fontSize: 11, color: B.dim, background: B.surface, borderRadius: 8, padding: "5px 10px", whiteSpace: "nowrap" }}>Luglio 2026</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 1, overflowX: "auto" }}>
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "10px 13px", background: "none", border: "none", cursor: "pointer",
                  borderBottom: tab === n.id ? `2px solid ${B.gold}` : "2px solid transparent",
                  color: tab === n.id ? B.white : B.gray, fontSize: 12.5, fontWeight: tab === n.id ? 700 : 400, whiteSpace: "nowrap",
                }}
              >
                <n.icon size={14} color={tab === n.id ? B.gold : B.dim} />
                {n.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "22px 20px 60px" }}>
        <Active />
      </div>
    </div>
  );
}
