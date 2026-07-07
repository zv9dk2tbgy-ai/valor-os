# Bowser · RTI Command Center

Company Operating System per il gruppo **Bowser Ltd / Rizzo Trading International (RTI) / Sichin / Bautechnik / Aste & Co / Nino 1940**, con integrazione del progetto **VALOR** (asset intelligence industriale) e del progetto immobiliare **Sichin / Chinotto Parking**.

Obiettivo: capire in 30 secondi quanta cassa c'è oggi, quanta ce ne sarà a 30/60/90/180 giorni, quali incassi accelerare, quali spese rinviare, quali asset monetizzare e quali decisioni prendere subito.

## Avvio

```bash
npm install
npm run dev       # sviluppo, http://localhost:5173
npm run build     # build di produzione in dist/
npm run preview   # anteprima della build
```

La app è una PWA: aperta da mobile si può aggiungere alla home screen.

## Architettura

```
index.html                  entry PWA (manifest, icone)
src/
  main.jsx                  bootstrap React
  App.jsx                   shell: header, navigazione a tab, routing moduli
  lib/
    theme.js                design token (colori, stili base, formattatori €/date)
    ui.jsx                  componenti condivisi: Card, KpiCard, Badge, EditableTable, Toggle, AlertBanner
    store.jsx               store dati centralizzato (Context + localStorage) + audit trail
    seed.js                 dati demo iniziali (solo cifre dal brief, flag demo:true)
    calc.js                 motore di proiezione cash flow e scenari
    csv.js                  import/export CSV e JSON
  modules/                  un file per modulo del menu
    Executive.jsx           KPI, alert, scenari, proiezione mensile, posizioni di cassa editabili
    CashFlow.jsx            vista mensile + tabella movimenti editabile
    Companies.jsx           anagrafica società
    BankDebt.jsx            finanziamenti/mutui, vista prima/dopo dicembre 2026
    IntercompanyLoans.jsx   prestiti infragruppo (es. Bowser → Sichin)
    RealEstate.jsx          progetti immobiliari (Chinotto Parking)
    ValorAssets.jsx         portafoglio asset + app legacy VALOR·SICAN OS integrata
    Rentals.jsx             affitti e noleggi, margini e scadenze
    DealPipeline.jsx        pipeline operazioni, ponderata per probabilità
    DueDiligence.jsx        checklist documentale
    DecisionBoard.jsx       decisioni urgenti per priorità/impatto cassa
    AICFO.jsx               assistente CFO a regole deterministiche
    Settings.jsx            backup JSON, import/export CSV, audit trail, reset demo
  legacy/
    SicanOS.jsx             la dashboard VALOR·SICAN OS originale, preservata intatta
```

### Persistenza

Tutti i dati vivono nel **localStorage del browser** (chiavi `bowser-rti-command-center-v1` e `bowser-rti-audit-v1`). Nessun server, nessun dato esce dal dispositivo. Conseguenze pratiche:

- fai regolarmente **Settings → Esporta backup JSON** (è anche il modo per spostare i dati tra dispositivi);
- gli allegati non sono caricabili come file: si referenziano via campo `file_url`;
- il passaggio a un backend condiviso (es. Supabase) è il candidato naturale della Fase 3.

### Regole di base (dal brief)

- **Nessun dato inventato**: i campi non noti restano vuoti con placeholder "da completare".
- **Tutto editabile**: ogni cifra e ogni campo si modifica inline nelle tabelle.
- I dati iniziali provengono dal brief del 07/07/2026 e sono marcati `demo: true` (reset da Settings).
- Ogni modifica è tracciata nell'**audit trail** (Settings), con raggruppamento delle digitazioni ravvicinate.

## Schema dati

| Entità | Campi principali |
|---|---|
| `Company` | name, country, type, tax_id, status, notes |
| `CashPosition` | company_id, label, amount, as_of_date, source, reliability |
| `BankObligation` | company_id, lender, description, monthly_payment, final_due_date, residual_debt, interest_rate, status |
| `CashFlowItem` | company_id, project_id, asset_id, type (entrata/uscita), category, description, amount, due_date, actual_date, status, probability, source, responsible, notes, simulateOff |
| `IntercompanyLoan` | lender_company_id, borrower_company_id, amount, date, causale, contract_ref, addendum_number, status, repayment_due, interest |
| `Project` | company_id, name, type, dati catastali, stati (urbanistico/catastale/lavori/vendite/rogiti), target_amount, bonifici_eseguiti, fabbisogno_residuo, expected_revenue, costi, rischi, next_action |
| `Asset` | valor_id, original_code, company_id, category, make, model, serial_number, vin, location, condition, book_value, estimated_value, quick_sale_value, rental_value_monthly, monetization_strategy, status, data_completeness |
| `RentalContract` | asset_id, company_id, customer, contract_type, monthly_fee, deposit, start/end_date, payment_status, arrears, maintenance_costs, renewal_status |
| `Deal` | company_id, project_id, counterparty, country, gross_value, expected_margin, probability, expected_close_date, stage, compliance_status, missing_documents, next_action, responsible |
| `Document` | company_id, project_id, asset_id, name, category, status, issue_date, expiry_date, file_url, responsible |
| `Decision` | company_id, project_id, title, description, priority, cash_impact, risk_if_delayed, deadline, status, responsible |

## Motore di proiezione e scenari (`lib/calc.js`)

Proiezione mensile luglio–dicembre 2026 (estendibile al 2027): apertura = somma delle posizioni di cassa; ogni mese somma entrate/uscite con data prevista più le rate bancarie ricorrenti fino alla loro scadenza finale.

- **Conservativo** — solo incassi confermati/incassati o con probabilità ≥ 90%, con slittamento prudenziale di 45 giorni; tutte le uscite contano sempre.
- **Realistico** — incassi con probabilità ≥ 50%, date come pianificate.
- **Ottimistico** — tutti gli incassi con probabilità > 0 (incluso il potenziale della pipeline).

Le voci **senza data prevista non entrano nella proiezione**: vengono mostrate in un bucket "da programmare" con alert dedicato — è il sistema che chiede una data, non la inventa. Il flag `simulateOff` esclude temporaneamente una voce per simulare scenari.

L'**health score** (0–100) penalizza saldi minimi negativi o sottili e incassi critici non programmati; premia chiusure positive a fine periodo.

L'**AI CFO** è un motore di regole deterministico (nessuna chiamata esterna): "posso permettermi questa spesa?", "quanto devo incassare entro X?", simulatore di ritardi incassi (30/60/90 giorni, con data ipotetica per le voci senza data), rate in scadenza, società che assorbono cassa, incassi da accelerare.

## Roadmap

- **Fase 1 — Cash flow + società + banche + Chinotto** ✅
  Store, Executive, Cash Flow Center, Società, Banche, Prestiti infragruppo, Chinotto Parking, Decision Board, scenari, alert, health score.
- **Fase 2 — VALOR assets + affitti/noleggi** ✅ (struttura completa, portafoglio da popolare)
  Moduli VALOR Assets (con app SICAN OS legacy integrata), Affitti & Noleggi, Deal Pipeline, import/export CSV.
- **Fase 3 — AI CFO + due diligence + automazioni** ◐
  Fatto: AI CFO a regole, Due Diligence room, audit trail. Prossimi passi naturali: backend condiviso multi-dispositivo (Supabase), upload allegati, notifiche scadenze, collegamento automatico Deal→CashFlowItem, AI CFO con LLM su dati reali.

## Nota su valor-v4

Il repository `valor-v4` contiene un export HTML statico ("VALOR — Global Asset Intelligence") non sviluppabile come sorgente: questo repo (`valor-os`) è la base di sviluppo del Command Center.
