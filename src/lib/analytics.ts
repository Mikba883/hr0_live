import { getConsentSnapshot, hydrateConsent } from "./consent";
import { initConsentMode, isConfigured, loadGtag, updateConsent } from "./gtag";

/**
 * Eventi di interazione (GA4).
 *
 * Perché GA4 e non Google Ads: Ads conta solo gli eventi mappati su un'azione
 * di conversione con la sua etichetta. Mandargli uno scroll o il movimento di
 * uno slider vorrebbe dire creare un'azione di conversione per ciascuno e
 * vederseli sommare nella colonna "Conversioni", falsando ogni report. GA4 è
 * fatto per ricevere eventi arbitrari; Ads per contare conversioni.
 *
 * **Senza `VITE_GA4_ID` non viene caricato niente** e ogni `trackEvent` è un
 * no-op: il sito funziona identico, gli eventi vanno nel vuoto. È voluto —
 * così questo codice può stare in produzione prima che la proprietà GA4 esista.
 */
export const GA4_ID = import.meta.env.VITE_GA4_ID as string | undefined;

/**
 * Carica gtag.js e registra la proprietà GA4.
 *
 * `send_page_view: false` perché il `page_view` lo mandiamo noi da
 * `usePageTracking`. Il `config` ne manderebbe uno solo al caricamento dello
 * script: questo è un sito a navigazione client-side, e le pagine raggiunte
 * senza ricaricare — `/grazie` su tutte — non ne vedrebbero mai uno. Lasciando
 * entrambi, la pagina d'ingresso ne conterebbe due.
 */
function loadGa4() {
  if (!GA4_ID) return;
  loadGtag(GA4_ID, { send_page_view: false });
}

/** Allinea GA4 alla scelta dell'utente. Idempotente. */
export function applyAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined" || !GA4_ID) return;

  initConsentMode();
  updateConsent({ analytics_storage: granted ? "granted" : "denied" });

  // Nessuna modalità "advanced" qui: senza consenso alle statistiche non c'è
  // niente da misurare, e i ping anonimi servono ad Ads, non a GA4.
  if (granted) loadGa4();
}

/**
 * Consenso verificato e tag pronto: `true` se si può inviare.
 *
 * Il consenso si controlla qui e non nel chiamante: le chiamate sono sparse
 * per tutta l'interfaccia, e affidarsi a chi chiama significherebbe che basta
 * una dimenticanza per tracciare qualcuno che ha detto di no.
 */
function ga4Pronto(): boolean {
  if (typeof window === "undefined" || !GA4_ID) return false;

  // Gli effetti dei componenti figli girano prima di quelli della radice: il
  // primo evento di una pagina può arrivare mentre la scelta salvata non è
  // ancora stata letta, e senza questo verrebbe scartato come se il consenso
  // non ci fosse. È idempotente.
  hydrateConsent();
  if (!getConsentSnapshot().decision?.analytics) return false;

  if (!isConfigured(GA4_ID)) loadGa4();
  return !!window.gtag;
}

/**
 * Invia un evento a GA4.
 *
 * I nomi degli eventi sono `snake_case` per convenzione GA4, e i parametri
 * vanno tenuti pochi e stabili: ognuno va poi registrato come dimensione
 * personalizzata nella proprietà per comparire nei report.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!ga4Pronto()) return;
  window.gtag!("event", name, { send_to: GA4_ID, ...params });
}

/**
 * Segnala che è stata vista una nuova pagina.
 *
 * Il `set` prima dell'evento non è ridondante: aggiorna la pagina corrente per
 * *tutti* gli eventi successivi. Senza, uno scroll o un click su `/grazie`
 * risulterebbero avvenuti sulla pagina da cui si è partiti, perché per gtag la
 * pagina resta quella letta al caricamento dello script.
 */
export function trackPageView() {
  if (!ga4Pronto()) return;
  window.gtag!("set", {
    page_location: window.location.href,
    page_title: document.title,
  });
  window.gtag!("event", "page_view", { send_to: GA4_ID });
}
