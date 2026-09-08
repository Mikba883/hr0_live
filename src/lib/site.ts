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
