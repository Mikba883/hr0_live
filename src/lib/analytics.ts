import { analyticsConsentito, hydrateConsent } from "./consent";
import { initConsentMode, isConfigured, loadGtag, updateConsent } from "./gtag";
import { tracciamentoAbilitato } from "./site";

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

/**
 * Allinea GA4 alla scelta dell'utente. Idempotente.
 *
 * Senza banner il parametro non decide niente: `analyticsConsentito()` è già
 * `true` e GA4 parte comunque. Il controllo sta qui e non solo nel chiamante
 * perché questa funzione è l'unico punto che carica GA4, e una chiamata futura
 * che passasse `false` per distrazione spegnerebbe in silenzio la misurazione
 * dell'intero sito.
 */
export function applyAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined" || !GA4_ID) return;
  if (!tracciamentoAbilitato()) return;

  const attivo = granted || analyticsConsentito();

  initConsentMode();
  updateConsent({ analytics_storage: attivo ? "granted" : "denied" });

  // Nessuna modalità "advanced" qui: senza consenso alle statistiche non c'è
  // niente da misurare, e i ping anonimi servono ad Ads, non a GA4.
  if (attivo) loadGa4();
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
  if (!tracciamentoAbilitato()) return false;

  // Gli effetti dei componenti figli girano prima di quelli della radice: il
  // primo evento di una pagina può arrivare mentre la scelta salvata non è
  // ancora stata letta, e senza questo verrebbe scartato come se il consenso
  // non ci fosse. È idempotente, e senza banner non fa nulla.
  hydrateConsent();
  if (!analyticsConsentito()) return false;

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

/**
 * Click su una chiamata all'azione.
 *
 * Tutte le CTA passano di qui invece di comporre l'evento per conto proprio:
 * gli stessi quattro parametri, scritti allo stesso modo, sono la differenza
 * fra un report che si legge e quattro righe che dicono la stessa cosa con
 * nomi diversi.
 *
 * - `etichetta` — il testo del pulsante, ciò che riconoscerai fra sei mesi.
 * - `destinazione` — dove porta.
 * - `variante` — che tipo di CTA è: lo stile grafico (`primary`, `outline`,
 *   `ghost`) oppure la collocazione (`sticky-mobile`, `inline`). Serve a
 *   distinguere la barra fissa del telefono dal pulsante grande dell'hero, che
 *   hanno lo stesso testo e rendimenti diversissimi.
 * - `pagina` — aggiunta qui: lo stesso testo compare su landing diverse, e
 *   senza non sapresti quale sta convertendo.
 */
type CtaParams = {
  etichetta: string;
  destinazione: string;
  variante?: string;
} & Record<string, unknown>;

export function trackCtaClick(params: CtaParams) {
  trackEvent("cta_click", {
    pagina: typeof window === "undefined" ? "" : window.location.pathname,
    ...params,
  });
}

/**
 * Lead acquisito: la richiesta di check-up è stata salvata davvero.
 *
 * `generate_lead` è uno dei nomi raccomandati da GA4, non un'invenzione: usarlo
 * significa che la proprietà lo riconosce e lo si può marcare come conversione
 * ("evento chiave") dall'interfaccia, senza definizioni personalizzate.
 *
 * Mancava, ed era il buco più grosso: la conversione veniva mandata solo a
 * Google Ads, quindi in GA4 l'imbuto finiva sull'ultimo `form_submit` e il
 * confronto fra le due piattaforme era impossibile — l'unico numero che conta
 * esisteva in un solo posto. Vive accanto alla conversione Ads su `/grazie`,
 * non nel punto in cui si preme "invia": lì la risposta del server non è ancora
 * arrivata, e un errore di salvataggio conterebbe come lead.
 *
 * Il doppio invio lo evita `usePageTracking`, che monta questa pagina una volta
 * sola per navigazione; un ricaricamento manuale ne conta uno in più, ed è
 * accettabile in GA4 dove — a differenza di Ads — nessuna offerta ci si basa.
 */
export function trackLead(params?: Record<string, unknown>) {
  trackEvent("generate_lead", { modulo: "check-up", ...params });
}
