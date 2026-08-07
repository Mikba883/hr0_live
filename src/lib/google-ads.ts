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

const SCRIPT_ID = "gtag-google-ads";
const SENT_KEY = "google-ads-conversion-sent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Carica gtag.js una sola volta (client-side). */
export function loadGoogleAds() {
  if (typeof window === "undefined" || !GOOGLE_ADS_ID) return;
  if (document.getElementById(SCRIPT_ID)) return;

  const s = document.createElement("script");
  s.id = SCRIPT_ID;
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GOOGLE_ADS_ID)}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
}

/**
 * Invia la conversione Google Ads (es. lead completato).
 *
 * Chiama `loadGoogleAds()` invece di dare il tag per presente: in React gli
 * effetti dei componenti figli girano prima di quelli della radice, quindi
 * quando la pagina di ringraziamento invia la conversione il tag caricato dal
 * root non esiste ancora. È idempotente, quindi chiamarla qui non duplica
 * nulla.
 *
 * Un ricaricamento della pagina di ringraziamento non deve valere una seconda
 * conversione: la marchiamo per la sessione. È la prima rete; la seconda è
 * l'impostazione "Conteggio: Una" lato Google Ads.
 */
export function trackAdsConversion(params?: { value?: number; currency?: string }) {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_LABEL) return;
  if (sessionStorage.getItem(SENT_KEY)) return;

  loadGoogleAds();
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
  sessionStorage.setItem(SENT_KEY, "1");
}
