import { getConsentSnapshot } from "./consent";

export const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined;
export const GOOGLE_ADS_CONVERSION_LABEL = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL as
  | string
  | undefined;

/**
 * Valore da attribuire a un lead, opzionale (es. `250`).
 *
 * Se non è impostata non mandiamo nessun valore e Google usa quello
 * configurato nell'azione di conversione. Meglio un numero deciso in un posto
 * solo che una cifra inventata qui dentro.
 */
const LEAD_VALUE = import.meta.env.VITE_GOOGLE_ADS_LEAD_VALUE as string | undefined;

/**
 * Come si comporta il tag quando il consenso marketing manca.
 *
 * - `basic` (predefinito): finché non c'è consenso non viene caricato niente.
 *   Nessuna richiesta a Google, nessun dato, nemmeno l'indirizzo IP. È la
 *   lettura più aderente all'art. 122 del Codice Privacy.
 * - `advanced`: gtag viene caricato subito con tutti i segnali su `denied`.
 *   Non scrive cookie né identificatori, ma manda a Google dei ping anonimi
 *   che alimentano la modellazione delle conversioni — si misura qualcosa
 *   anche di chi rifiuta. È l'assetto che Google consiglia; in cambio una
 *   richiesta verso terzi parte comunque prima della scelta.
 *
 * La differenza è giuridica prima che tecnica: va decisa con chi segue la
 * privacy, non qui dentro. Nel dubbio resta `basic`.
 */
const CONSENT_MODE = (import.meta.env.VITE_CONSENT_MODE as string | undefined) === "advanced"
  ? "advanced"
  : "basic";

const SCRIPT_ID = "gtag-google-ads";
const SENT_KEY = "google-ads-conversion-sent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let consentModeReady = false;

/**
 * Prepara `dataLayer` e imposta lo stato di consenso predefinito.
 *
 * Non fa nessuna richiesta di rete: scrive soltanto in un array in memoria. I
 * segnali `default` devono trovarsi nel `dataLayer` *prima* che gtag.js venga
 * eseguito, altrimenti il tag parte già in stato consentito e la scelta arriva
 * troppo tardi. Per questo si chiama all'avvio dell'app, non al consenso.
 */
export function initConsentMode() {
  if (typeof window === "undefined" || consentModeReady) return;
  consentModeReady = true;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
  }

  window.gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    // Non c'è analytics sul sito. Lo dichiariamo negato lo stesso: se un domani
    // viene aggiunto, parte spento invece che acceso per dimenticanza.
    analytics_storage: "denied",
    // Mezzo secondo di attesa prima di inviare qualsiasi cosa, il tempo che il
    // banner legga la scelta già memorizzata e la applichi.
    wait_for_update: 500,
  });
}

/** Carica gtag.js una sola volta (client-side). */
function loadTag() {
  if (typeof window === "undefined" || !GOOGLE_ADS_ID) return;
  if (document.getElementById(SCRIPT_ID)) return;

  initConsentMode();
  if (!window.gtag) return;

  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`;
  document.head.appendChild(s);

  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
}

/**
 * Allinea il tag alla scelta dell'utente. Idempotente.
 *
 * Con il consenso: segnali su `granted` e tag caricato. Senza: in `basic` non
 * viene caricato nulla, in `advanced` il tag parte con i `default` negati già
 * impostati da `initConsentMode`.
 *
 * Una revoca non scarica il tag già in pagina — non si può disfare uno script
 * eseguito. Aggiorna i segnali, così Google smette di usare i cookie, e il
 * pannello ricarica la pagina per ripulire quello che resta.
 */
export function applyAdsConsent(granted: boolean) {
  if (typeof window === "undefined" || !GOOGLE_ADS_ID) return;

  initConsentMode();
  if (!window.gtag) return;

  if (granted) {
    window.gtag("consent", "update", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
    loadTag();
    return;
  }

  window.gtag("consent", "update", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (CONSENT_MODE === "advanced") loadTag();
}

/**
 * Invia la conversione Google Ads (es. lead completato).
 *
 * Verifica il consenso da sé invece di fidarsi del chiamante: è l'unico punto
 * del codice che manda un evento a Google, e un domani potrebbe chiamarlo
 * qualcuno che si dimentica il controllo. In modalità `advanced` l'evento parte
 * anche senza consenso, ma senza cookie né identificatori — è esattamente ciò
 * che quella modalità significa.
 *
 * Non dà per scontato che il tag sia già in pagina: in React gli effetti dei
 * componenti figli girano prima di quelli della radice, quindi quando la pagina
 * di ringraziamento invia la conversione il tag caricato dal root non esiste
 * ancora.
 *
 * Un ricaricamento della pagina di ringraziamento non deve valere una seconda
 * conversione: la marchiamo per la sessione. È la prima rete; la seconda è
 * l'impostazione "Conteggio: Una" lato Google Ads.
 */
export function trackAdsConversion(params?: { value?: number; currency?: string }) {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_LABEL) return;
  if (!getConsentSnapshot().decision?.marketing && CONSENT_MODE !== "advanced") return;

  try {
    if (sessionStorage.getItem(SENT_KEY)) return;
  } catch {
    // Storage non leggibile: meglio una conversione in più che nessuna. Il
    // conteggio "Una" lato Google Ads resta la rete di sicurezza.
  }

  loadTag();
  if (!window.gtag) return;

  const valore = params?.value ?? (LEAD_VALUE ? Number(LEAD_VALUE) : undefined);
  const payload: Record<string, unknown> = {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
  };
  if (valore !== undefined && Number.isFinite(valore)) {
    payload.value = valore;
    payload.currency = params?.currency ?? "EUR";
  }

  window.gtag("event", "conversion", payload);

  try {
    sessionStorage.setItem(SENT_KEY, "1");
  } catch {
    /* vedi sopra */
  }
}
