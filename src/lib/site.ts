/**
 * L'indirizzo pubblico del sito.
 *
 * Sta in un posto solo perché la ripetizione ci era già costata: i `canonical`
 * e gli `og:url` di tre pagine hanno continuato a puntare al dominio di
 * anteprima di Lovable anche dopo il passaggio a hr0.it, dicendo a Google che
 * la versione ufficiale di quelle pagine era da un'altra parte. Un valore
 * scritto in sei posti è un valore che la prossima volta verrà cambiato in
 * cinque.
 *
 * È una costante e non una variabile d'ambiente di proposito: un `canonical`
 * sbagliato non si nota, e un dominio che cambia da solo a seconda di dove il
 * sito è costruito farebbe indicizzare le anteprime.
 */
export const SITO_URL = "https://hr0.it";

/** L'indirizzo assoluto di una pagina, per `canonical` e `og:url`. */
export function urlAssoluto(percorso: string) {
  return `${SITO_URL}${percorso}`;
}

/**
 * I domini su cui il tracciamento è autorizzato a partire.
 *
 * Il `.env` con gli ID di Google è tracciato da git, quindi ogni anteprima di
 * branch se lo porta dietro e carica gli stessi tag del sito vero. Non è
 * un'ipotesi: la diagnostica di Google Ads ha rilevato il tag su 29 domini —
 * una ventina di anteprime Lovable, tre deploy Vercel, due progetti vecchi e,
 * unico legittimo, `www.hr0.it`. Ogni check-up completato su una di quelle
 * pagine è una conversione vera che entra nei dati con cui Smart Bidding
 * decide dove spendere.
 *
 * Spostare gli ID nel pannello di Vercel non risolverebbe: la configurazione
 * Vite passa da `@lovable.dev/vite-tanstack-config`, che fa una propria
 * iniezione delle `VITE_*`, e una variabile che esiste solo là non arriva mai a
 * `import.meta.env`. La separazione va fatta qui.
 */
const DOMINI_TRACCIAMENTO = new Set(["hr0.it", "www.hr0.it"]);

/**
 * `true` solo sul dominio di produzione, letto a ogni chiamata.
 *
 * È una funzione e non una costante di modulo perché il valore dipende da
 * `window`: valutato una volta sola al primo import varrebbe `false` durante il
 * render sul server e `true` dopo l'idratazione, e React sostituirebbe l'intero
 * albero segnalando una mancata corrispondenza. Chi la usa la chiama dentro la
 * funzione che deve decidere, mai al livello del modulo.
 */
export function tracciamentoAbilitato(): boolean {
  if (typeof window === "undefined") return false;
  return DOMINI_TRACCIAMENTO.has(window.location.hostname);
}

/**
 * Se il sito debba chiedere il consenso prima di attivare i tag di Google.
 *
 * **Oggi è `false` per scelta del titolare del sito.** Con `false` il banner
 * non compare, GA4 e Google Ads partono al primo caricamento di ogni pagina, e
 * ogni evento viene misurato per tutti i visitatori.
 *
 * Perché sia una costante e non una rimozione del codice: la scelta è
 * giuridica, non tecnica, e le scelte giuridiche cambiano. Con `true` tornano
 * banner, gate sul consenso e link "Preferenze cookie" esattamente com'erano —
 * l'intera macchina è ancora qui, non è stata smontata. Cancellarla avrebbe
 * reso il ritorno un lavoro di mezza giornata invece di una riga.
 *
 * Da sapere prima di lasciarlo su `false`: l'art. 122 del Codice Privacy
 * subordina al consenso preventivo l'archiviazione di informazioni sul
 * dispositivo dell'utente per finalità diverse da quelle strettamente
 * tecniche, e i cookie di Google Ads e GA4 rientrano fra quelle. Il testo
 * delle pagine `/cookie` e `/privacy` segue questa costante e descrive quel
 * che accade davvero in entrambi i casi.
 */
export const CONSENSO_RICHIESTO = false;
