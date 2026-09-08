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

/** Carica gtag.js e registra la proprietà GA4. */
function loadGa4() {
  if (!GA4_ID) return;
  loadGtag(GA4_ID);
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
 * Invia un evento a GA4.
 *
 * Verifica il consenso da sé: è l'unico punto da cui passano gli eventi di
 * interazione, e le chiamate sono sparse per tutta l'interfaccia — affidarsi a
 * chi chiama significherebbe che basta una dimenticanza per tracciare qualcuno
 * che ha detto di no.
 *
 * I nomi degli eventi sono `snake_case` per convenzione GA4, e i parametri
 * vanno tenuti pochi e stabili: ognuno va poi registrato come dimensione
 * personalizzata nella proprietà per comparire nei report.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !GA4_ID) return;

  // Gli effetti dei componenti figli girano prima di quelli della radice: il
  // primo evento di una pagina può arrivare mentre la scelta salvata non è
  // ancora stata letta, e senza questo verrebbe scartato come se il consenso
  // non ci fosse. È idempotente.
  hydrateConsent();
  if (!getConsentSnapshot().decision?.analytics) return;

  if (!isConfigured(GA4_ID)) loadGa4();
  if (!window.gtag) return;

  window.gtag("event", name, { send_to: GA4_ID, ...params });
}
