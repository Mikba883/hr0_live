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

import { CONSENSO_RICHIESTO } from "./site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const SCRIPT_ID = "gtag-js";

let consentModeReady = false;
let jsInizializzato = false;
const configurati = new Set<string>();

/**
 * Prepara `dataLayer` e imposta lo stato di consenso predefinito.
 *
 * Non fa nessuna richiesta di rete: scrive soltanto in un array in memoria. I
 * segnali `default` devono trovarsi nel `dataLayer` *prima* che gtag.js venga
 * eseguito, altrimenti il tag parte già in stato consentito e la scelta arriva
 * troppo tardi. Per questo si chiama all'avvio dell'app, non al consenso.
 *
 * Senza banner i segnali partono già concessi. Non è un dettaglio ridondante
 * con l'`update` che arriva subito dopo: un `default` negato fa partire gtag
 * in modalità senza cookie, e i primi eventi — `page_view` compreso, che su
 * questo sito parte in un effetto React, cioè nei primi millisecondi —
 * verrebbero inviati senza identificatore e non si aggancerebbero alla
 * sessione. Il `wait_for_update` cade con essi: nessuna scelta da attendere.
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

  if (!CONSENSO_RICHIESTO) {
    window.gtag("consent", "default", {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    });
    return;
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
 * Carica gtag.js per questo prodotto e lo registra con il suo ID.
 *
 * **Uno script per ogni ID, non uno solo condiviso.** Il primo tentativo
 * caricava `gtag/js` una volta sola con l'ID del primo prodotto che si
 * registrava, dando per scontato che poi bastasse un `config` per gli altri.
 * Non è così: `gtag/js?id=X` restituisce il contenitore di X e delle
 * destinazioni collegate a X. Un `config` su un ID che quel contenitore non
 * conosce **non produce niente e non segnala niente** — il `dataLayer` si
 * riempie di eventi che nessuno consuma.
 *
 * Costava caro proprio qui: Ads e GA4 sono due account distinti e non
 * collegati, e il contenitore di Ads è per giunta vuoto (Google risponde 200
 * con 9 kB invece di oltre 100), quindi GA4 agganciato a quello non è mai
 * partito. Sono richieste separate perché sono prodotti separati.
 *
 * `params` sono le impostazioni del `config` di quell'ID soltanto: il
 * `dataLayer` è condiviso, la configurazione no.
 */
export function loadGtag(id: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !id) return;

  initConsentMode();
  if (!window.gtag) return;

  if (configurati.has(id)) return;
  configurati.add(id);

  const elemento = `${SCRIPT_ID}-${id}`;
  if (!document.getElementById(elemento)) {
    const s = document.createElement("script");
    s.id = elemento;
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(s);

    // `js` marca l'istante di partenza del dataLayer: serve una volta sola per
    // pagina, e gli script caricati dopo lo trovano già in coda.
    if (!jsInizializzato) {
      jsInizializzato = true;
      window.gtag("js", new Date());
    }
  }

  window.gtag("config", id, params ?? {});
}

/** `true` se il prodotto con questo ID è stato registrato. */
export function isConfigured(id: string) {
  return configurati.has(id);
}
