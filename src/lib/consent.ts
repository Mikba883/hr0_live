/**
 * Stato del consenso ai cookie.
 *
 * Due categorie opzionali — `marketing` (il tag di Google Ads) e `analytics`
 * (GA4, che riceve gli eventi di interazione) — più i cookie tecnici, che non
 * sono una scelta e quindi non compaiono qui. Per aggiungerne una terza:
 * una chiave qui, una riga nel pannello del banner, una nella tabella
 * dell'informativa, e POLICY_VERSION alzata.
 *
 * La decisione sta nel `localStorage` e non in un cookie: non deve viaggiare
 * a ogni richiesta, e ci serve leggerla prima di decidere se caricare gtag.
 */

export type ConsentChoice = {
  marketing: boolean;
  analytics: boolean;
};

export type ConsentDecision = ConsentChoice & {
  /** Quando è stata espressa. È la prova del consenso: va conservata. */
  ts: string;
  /** Versione dell'informativa al momento della scelta (vedi POLICY_VERSION). */
  version: number;
};

const STORAGE_KEY = "hr0.cookie-consent";

/**
 * Da alzare quando cambiano gli strumenti di tracciamento o le categorie.
 *
 * Un consenso raccolto su un'informativa diversa da quella corrente non è più
 * informato: alzando il numero le scelte vecchie decadono e il banner ricompare.
 * Ritoccare la formattazione della pagina non conta — conta cosa viene
 * installato sul dispositivo di chi visita.
 *
 * 2 — aggiunta la categoria statistiche (GA4) per gli eventi di interazione.
 * 1 — solo marketing (Google Ads).
 */
const POLICY_VERSION = 2;

/**
 * Dopo sei mesi la scelta scade e il banner torna.
 *
 * Le linee guida del Garante (10 giugno 2021) vietano di riproporre il banner a
 * chi ha già deciso *prima* che siano passati sei mesi. Questa è la stessa
 * soglia usata al contrario: sotto i sei mesi non chiediamo più nulla.
 */
const MAX_AGE_MS = 182 * 24 * 60 * 60 * 1000;

type State = {
  /** `null` = nessuna scelta valida: il banner va mostrato. */
  decision: ConsentDecision | null;
  /** Riapertura manuale dal link "Preferenze cookie" del footer. */
  reopened: boolean;
};

/**
 * Lo snapshot è tenuto per riferimento perché `useSyncExternalStore` confronta
 * con `Object.is`: ricostruirlo a ogni lettura manderebbe React in loop.
 */
let state: State = { decision: null, reopened: false };
let hydrated = false;

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(next: State) {
  state = next;
  emit();
}

function readStored(): ConsentDecision | null {
  if (typeof window === "undefined") return null;

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // Safari in navigazione privata e i browser che bloccano lo storage
    // lanciano invece di restituire null. Nessuna scelta memorizzata: il banner
    // ricomparirà a ogni visita, ed è il comportamento prudente.
    return null;
  }
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ConsentDecision>;
    if (typeof parsed?.marketing !== "boolean") return null;
    if (typeof parsed?.analytics !== "boolean") return null;
    if (parsed.version !== POLICY_VERSION) return null;

    const ts = typeof parsed.ts === "string" ? parsed.ts : null;
    if (!ts) return null;
    const age = Date.now() - new Date(ts).getTime();
    if (!Number.isFinite(age) || age < 0 || age > MAX_AGE_MS) return null;

    return {
      marketing: parsed.marketing,
      analytics: parsed.analytics,
      ts,
      version: parsed.version,
    };
  } catch {
    return null;
  }
}

/**
 * Legge la scelta salvata. Da chiamare una volta sola, all'avvio dell'app.
 *
 * Separata dal resto perché durante il render sul server non esiste storage: il
 * primo render è sempre "nessuna decisione", e l'idratazione la corregge.
 */
export function hydrateConsent() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const decision = readStored();
  if (decision) setState({ decision, reopened: false });
}

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getConsentSnapshot(): State {
  return state;
}

/**
 * Snapshot lato server: sempre lo stesso oggetto, altrimenti React si lamenta
 * di uno snapshot instabile durante l'SSR.
 */
const SERVER_STATE: State = { decision: null, reopened: false };
export function getConsentServerSnapshot(): State {
  return SERVER_STATE;
}

/** Registra la scelta e la rende persistente. */
export function saveConsent(choice: ConsentChoice) {
  const decision: ConsentDecision = {
    marketing: choice.marketing,
    analytics: choice.analytics,
    ts: new Date().toISOString(),
    version: POLICY_VERSION,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(decision));
  } catch {
    // Se lo storage non è scrivibile la scelta vale comunque per questa
    // sessione: negarla del tutto sarebbe peggio che non ricordarla.
  }

  setState({ decision, reopened: false });
}

/** Riapre il pannello a chi ha già scelto (link "Preferenze cookie"). */
export function openConsentPreferences() {
  if (state.reopened) return;
  setState({ ...state, reopened: true });
}

/** Chiude il pannello riaperto senza toccare la scelta già memorizzata. */
export function closeConsentPreferences() {
  if (!state.reopened) return;
  setState({ ...state, reopened: false });
}
