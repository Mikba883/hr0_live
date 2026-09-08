/**
 * Bootstrap condiviso di gtag.js.
 *
 * Google Ads e GA4 sono due prodotti diversi ma un solo script: gtag.js va
 * caricato una volta sola, poi ogni prodotto si registra con un `config` sul
 * proprio ID. Tenere qui il caricamento evita che i due moduli si pestino i
 * piedi iniettando lo script due volte.
 *
 * Nessuna funzione di questo file decide se caricare: quella scelta spetta al
 * consenso, e sta in `google-ads.ts` e `analytics.ts`.
 */

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SCRIPT_ID = "gtag-js";

let consentModeReady = false;
const configurati = new Set<string>();

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
    analytics_storage: "denied",
    // Mezzo secondo di attesa prima di inviare qualsiasi cosa, il tempo che il
    // banner legga la scelta già memorizzata e la applichi.
    wait_for_update: 500,
  });
}

/** Aggiorna uno o più segnali di consenso. */
export function updateConsent(signals: Record<string, "granted" | "denied">) {
  if (typeof window === "undefined") return;
  initConsentMode();
  window.gtag?.("consent", "update", signals);
}

/**
 * Carica gtag.js (una volta sola) e registra il prodotto con questo ID.
 *
 * Chiamarla due volte con lo stesso ID non fa niente; con ID diversi aggiunge
 * solo un `config`, perché lo script è già in pagina.
 */
export function loadGtag(id: string) {
  if (typeof window === "undefined" || !id) return;

  initConsentMode();
  if (!window.gtag) return;

  if (!document.getElementById(SCRIPT_ID)) {
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);
    window.gtag("js", new Date());
  }

  if (configurati.has(id)) return;
  configurati.add(id);
  window.gtag("config", id);
}

/** `true` se il prodotto con questo ID è stato registrato. */
export function isConfigured(id: string) {
  return configurati.has(id);
}
