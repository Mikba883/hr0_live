import { useEffect } from "react";

import { trackEvent } from "@/lib/analytics";

/** Cosa conta come "qualcosa su cui si preme". */
const INTERATTIVI = "a, button, summary, [role='button']";

/**
 * Le etichette lunghe diventano dimensioni illeggibili, e GA4 tronca comunque.
 * Meglio decidere noi dove tagliare.
 */
const MAX_ETICHETTA = 60;

/**
 * Come chiamare questo elemento nei report, in ordine di affidabilità:
 * l'etichetta scritta apposta, quella per gli screen reader, il testo visibile.
 */
function etichettaDi(el: HTMLElement): string {
  const scelta = el.dataset.trackLabel ?? el.getAttribute("aria-label") ?? el.textContent ?? "";
  return scelta.replace(/\s+/g, " ").trim().slice(0, MAX_ETICHETTA);
}

/**
 * Un evento per ogni click su un elemento interattivo.
 *
 * Un solo listener delegato invece di un `onClick` su ogni pulsante. Non è
 * pigrizia: il tracciamento aggiunto a mano copre ciò che qualcuno si è
 * ricordato di annotare, e un pulsante aggiunto il mese prossimo non c'è. Qui
 * il caso normale è coperto per costruzione, e resta da annotare solo ciò che
 * merita un evento più ricco.
 *
 * Due vie d'uscita, entrambe valide anche su un antenato:
 *
 * - `data-track="manual"` — l'elemento manda già un evento suo (`cta_click`,
 *   `faq_open`, …). Senza questo un click ne produrrebbe due e ogni conteggio
 *   varrebbe il doppio.
 * - `data-no-track` — da non misurare affatto.
 *
 * In fase di cattura perché un `onClick` di React che ferma la propagazione
 * renderebbe il click invisibile a un listener in risalita.
 */
export function useClickTracking(attivo: boolean) {
  useEffect(() => {
    if (!attivo) return;

    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return;
      const el = e.target.closest(INTERATTIVI);
      if (!(el instanceof HTMLElement)) return;
      if (el.closest("[data-track='manual'], [data-no-track]")) return;

      const etichetta = etichettaDi(el);
      const destinazione = el instanceof HTMLAnchorElement ? el.getAttribute("href") : null;
      // Un'icona senza testo né etichetta e senza destinazione non è
      // riconoscibile in nessun report: meglio niente che una riga vuota.
      if (!etichetta && !destinazione) return;

      trackEvent("element_click", {
        etichetta: etichetta || destinazione,
        destinazione: destinazione ?? undefined,
        tipo: el.tagName.toLowerCase(),
        pagina: window.location.pathname,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [attivo]);
}
