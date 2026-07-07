// Initial demo dataset — every figure below comes from the founder's brief (07/07/2026).
// Nothing here is invented: fields the brief didn't specify are left null / "da completare".
// Every record carries demo:true so the UI can flag it and the user can reset back to this
// baseline at any time from Settings.

export const seedCompanies = [
  { id: "co-bowser", name: "Bowser Ltd", country: null, type: "Holding / finanziaria", tax_id: null, status: "attiva", notes: "Capogruppo, veicolo di finanziamento infragruppo.", demo: true },
  { id: "co-rti", name: "Rizzo Trading International LLC (RTI)", country: null, type: "Operativa", tax_id: null, status: "attiva", notes: null, demo: true },
  { id: "co-sichin", name: "Sichin S.r.l.", country: "Italia", type: "Immobiliare", tax_id: null, status: "attiva", notes: "Titolare progetto Chinotto Parking.", demo: true },
  { id: "co-bautechnik", name: "Bautechnik S.r.l.", country: "Italia", type: "Operativa", tax_id: null, status: "attiva", notes: null, demo: true },
  { id: "co-aste", name: "Aste & Co S.r.l.", country: "Italia", type: "Operativa / aste", tax_id: null, status: "attiva", notes: null, demo: true },
  { id: "co-nino1940", name: "Nino 1940 S.r.l.", country: "Italia", type: "Operativa", tax_id: null, status: "attiva", notes: null, demo: true },
  { id: "co-personale", name: "Personale (fondatore)", country: null, type: "Persona fisica", tax_id: null, status: "attiva", notes: "Usata per impegni personali (mutuo, spese autorizzate).", demo: true },
];

export const seedCashPositions = [
  { id: "cp-1", company_id: "co-sichin", label: "Saldo conto corrente", amount: 12000, as_of_date: "2026-07-07", source: "Brief utente", reliability: "da riconciliare", notes: "Da riconciliare con estratto conto.", demo: true },
  { id: "cp-2", company_id: "co-sichin", label: "Debiti immediati", amount: -6000, as_of_date: "2026-07-07", source: "Brief utente", reliability: "da dettagliare", notes: "Fornitori / scadenze immediate, dettaglio da completare.", demo: true },
];

export const seedBankObligations = [
  { id: "bo-1", company_id: "co-rti", lender: "MPS", description: "Finanziamento MPS RTI", monthly_payment: 3097.15, final_due_date: "2026-12-31", residual_debt: null, interest_rate: null, status: "attivo", notes: "Si esaurisce a fine 2026: -€3.097/mese di impegno da gennaio 2027.", demo: true },
  { id: "bo-2", company_id: "co-rti", lender: null, description: "Prestito RTI (tasso variabile)", monthly_payment: 2186.70, final_due_date: "2028-09-30", residual_debt: null, interest_rate: null, status: "attivo", notes: "Rata stimata, variabile.", demo: true },
  { id: "bo-3", company_id: "co-bautechnik", lender: null, description: "Finanziamento Bautechnik", monthly_payment: 1424.72, final_due_date: "2029-07-31", residual_debt: null, interest_rate: null, status: "attivo", notes: null, demo: true },
  { id: "bo-4", company_id: "co-personale", lender: null, description: "Mutuo personale", monthly_payment: 477.64, final_due_date: null, residual_debt: null, interest_rate: null, status: "attivo", notes: "Lungo termine, scadenza finale da completare.", demo: true },
  { id: "bo-5", company_id: "co-rti", lender: "Telepass", description: "Telepass", monthly_payment: 200, final_due_date: null, residual_debt: null, interest_rate: null, status: "variabile", notes: "Stima, ricorrente.", demo: true },
  { id: "bo-6", company_id: "co-rti", lender: "American Express", description: "Carta Amex", monthly_payment: 1800, final_due_date: null, residual_debt: null, interest_rate: null, status: "variabile", notes: "Stima, variabile e gestibile al ribasso.", demo: true },
];

export const seedIntercompanyLoans = [
  { id: "ic-1", lender_company_id: "co-bowser", borrower_company_id: "co-sichin", amount: 20000, date: null, causale: "Copertura fabbisogno residuo target Chinotto Parking (€310k).", contract_ref: null, addendum_number: null, status: "da formalizzare", repayment_due: null, interest: null, notes: "Finanziamento possibile, non ancora erogato.", demo: true },
];

export const seedProjects = [
  {
    id: "pr-chinotto", company_id: "co-sichin", name: "Chinotto Parking", type: "immobiliare",
    address: null, foglio: null, mappale: null, particella: null, subalterno: null,
    description: "Realizzazione e vendita posti auto, progetto Sichin.",
    num_posti_auto: null, unita_collegate: null,
    stato_urbanistico: "da completare", stato_catastale: "da completare",
    stato_lavori: "da completare", stato_vendite: "Posti auto venduti", stato_rogiti: "In attesa di rogito notarile",
    target_amount: 310000, bonifici_eseguiti: 179217.86, fabbisogno_residuo: 130782.14,
    expected_revenue: 266000, received_revenue: null,
    technical_costs: 30000, company_costs: null, notarial_costs: null,
    expected_margin: null,
    missing_documents: "Data certa rogito notarile posti auto.",
    legal_risk: "da valutare", technical_risk: "da valutare", commercial_risk: "da valutare",
    next_action: "Confermare data incasso DCS e programmare i rogiti dei posti auto.",
    notes: null, demo: true,
  },
];

export const seedCashFlowItems = [
  { id: "cfi-1", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "entrata", category: "Vendita immobiliare", description: "Incasso DCS", amount: 106000, due_date: null, actual_date: null, status: "previsto", probability: null, source: "Brief utente 07/07/2026", responsible: null, notes: "Data da programmare. Probabilità da stimare (il motore usa 50% come default neutro).", simulateOff: false, demo: true },
  { id: "cfi-2", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "entrata", category: "Vendita immobiliare", description: "Incasso posti auto (rogiti)", amount: 160000, due_date: null, actual_date: null, status: "previsto", probability: null, source: "Brief utente 07/07/2026", responsible: null, notes: "Posti auto venduti, in attesa di rogito notarile. Probabilità da stimare (default neutro 50%).", simulateOff: false, demo: true },
  { id: "cfi-3", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "uscita", category: "Professionisti", description: "Rata Arch. Colombo / Studio Associati (1/6)", amount: 5000, due_date: "2026-09-30", actual_date: null, status: "previsto", probability: 100, source: "Brief utente 07/07/2026", responsible: null, notes: null, simulateOff: false, demo: true },
  { id: "cfi-4", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "uscita", category: "Professionisti", description: "Rata Arch. Colombo / Studio Associati (2/6)", amount: 5000, due_date: "2026-10-31", actual_date: null, status: "previsto", probability: 100, source: "Brief utente 07/07/2026", responsible: null, notes: null, simulateOff: false, demo: true },
  { id: "cfi-5", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "uscita", category: "Professionisti", description: "Rata Arch. Colombo / Studio Associati (3/6)", amount: 5000, due_date: "2026-11-30", actual_date: null, status: "previsto", probability: 100, source: "Brief utente 07/07/2026", responsible: null, notes: null, simulateOff: false, demo: true },
  { id: "cfi-6", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "uscita", category: "Professionisti", description: "Rata Arch. Colombo / Studio Associati (4/6)", amount: 5000, due_date: "2026-12-31", actual_date: null, status: "previsto", probability: 100, source: "Brief utente 07/07/2026", responsible: null, notes: null, simulateOff: false, demo: true },
  { id: "cfi-7", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "uscita", category: "Professionisti", description: "Rata Arch. Colombo / Studio Associati (5/6)", amount: 5000, due_date: "2027-01-31", actual_date: null, status: "previsto", probability: 100, source: "Brief utente 07/07/2026", responsible: null, notes: null, simulateOff: false, demo: true },
  { id: "cfi-8", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "uscita", category: "Professionisti", description: "Rata Arch. Colombo / Studio Associati (6/6)", amount: 5000, due_date: "2027-02-28", actual_date: null, status: "previsto", probability: 100, source: "Brief utente 07/07/2026", responsible: null, notes: null, simulateOff: false, demo: true },
  { id: "cfi-9", company_id: "co-personale", project_id: null, asset_id: null, type: "uscita", category: "Spese personali autorizzate", description: "Vacanza agosto", amount: 6000, due_date: "2026-08-31", actual_date: null, status: "da approvare", probability: 100, source: "Brief utente 07/07/2026", responsible: null, notes: "Budget massimo — importo simulabile on/off.", simulateOff: false, demo: true },
  { id: "cfi-10", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, type: "entrata", category: "Finanziamento infragruppo", description: "Finanziamento Bowser → Sichin (ic-1)", amount: 20000, due_date: null, actual_date: null, status: "da formalizzare", probability: null, source: "Brief utente 07/07/2026", responsible: null, notes: "Collegato a IntercompanyLoan ic-1. Probabilità da stimare (default neutro 50%).", simulateOff: false, demo: true },
];

export const seedDecisions = [
  { id: "dec-1", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, title: "Confermare data incasso DCS (€106.000)", description: "Serve una data certa per pianificare la cassa H2 2026.", priority: "alta", cash_impact: 106000, risk_if_delayed: "Slitta la copertura del fabbisogno residuo (€130.782).", deadline: null, status: "aperta", responsible: null, demo: true },
  { id: "dec-2", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, title: "Fissare la data dei rogiti posti auto (€160.000)", description: "Posti auto già venduti, manca la data di rogito notarile.", priority: "alta", cash_impact: 160000, risk_if_delayed: "Incasso rinviato, tensione di cassa in autunno.", deadline: null, status: "aperta", responsible: null, demo: true },
  { id: "dec-3", company_id: "co-bowser", project_id: "pr-chinotto", asset_id: null, title: "Deliberare il finanziamento infragruppo Bowser → Sichin (€20.000)", description: "Formalizzare addendum e bonifico se necessario per coprire il fabbisogno.", priority: "media", cash_impact: 20000, risk_if_delayed: "Sichin resta sotto target senza copertura alternativa.", deadline: null, status: "aperta", responsible: null, demo: true },
  { id: "dec-4", company_id: "co-personale", project_id: null, asset_id: null, title: "Validare il budget vacanza agosto (max €6.000)", description: "Verificare sostenibilità rispetto al target di dicembre 2026 prima di prenotare.", priority: "media", cash_impact: -6000, risk_if_delayed: null, deadline: null, status: "aperta", responsible: null, demo: true },
  { id: "dec-5", company_id: "co-rti", project_id: null, asset_id: null, title: "Rivedere Amex / Telepass per ridurre il burn mensile", description: "Amex (~€1.800/mese) è descritta come variabile e gestibile al ribasso.", priority: "bassa", cash_impact: null, risk_if_delayed: null, deadline: null, status: "aperta", responsible: null, demo: true },
];

export const seedDocuments = [
  { id: "doc-1", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, name: "Rogito notarile posti auto", category: "notarile", status: "in attesa", issue_date: null, expiry_date: null, file_url: null, responsible: null, notes: "Collegato a €160.000 di incasso atteso.", demo: true },
  { id: "doc-2", company_id: "co-sichin", project_id: "pr-chinotto", asset_id: null, name: "Riscontro DCS su data incasso", category: "commerciale", status: "da completare", issue_date: null, expiry_date: null, file_url: null, responsible: null, notes: null, demo: true },
];

export const seedAssets = [];
export const seedRentalContracts = [];
export const seedDeals = [];

export const SEED = {
  companies: seedCompanies,
  cashPositions: seedCashPositions,
  bankObligations: seedBankObligations,
  intercompanyLoans: seedIntercompanyLoans,
  projects: seedProjects,
  cashFlowItems: seedCashFlowItems,
  decisions: seedDecisions,
  documents: seedDocuments,
  assets: seedAssets,
  rentalContracts: seedRentalContracts,
  deals: seedDeals,
};
