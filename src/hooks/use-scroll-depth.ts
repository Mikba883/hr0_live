import { useEffect, useRef } from "react";

import { trackEvent } from "@/lib/analytics";

/** Soglie in percentuale della pagina. Ognuna viene segnalata una volta sola. */
const SOGLIE = [25, 50, 75, 90] as const;

/**
 * Quanto in basso è arrivato chi legge la pagina.
 *
 * Due accorgimenti che tengono l'evento onesto invece di gonfiarlo:
 *
 * **Se la pagina non scorre, non si segnala niente.** Su uno schermo alto una
 * pagina corta è visibile tutta senza muovere un dito: contarla come "letta al
 * 90%" significherebbe misurare la dimensione della finestra, non l'interesse.
 *
 * **Le soglie superate si segnalano tutte insieme.** Chi salta in fondo con
 * `Fine` supera 25, 50 e 75 senza passarci sopra: registrarle è corretto,
 * perché la soglia dice fin dove è arrivato, non cosa ha letto. Per lo stesso
 * motivo la misura iniziale non è sprecata: chi arriva con un'ancora nell'URL
 * parte già a metà pagina.
 *
 * Il listener è passivo e legge la posizione dentro un `requestAnimationFrame`:
 * durante lo scroll `scroll` può scattare decine di volte al secondo, e
 * leggere `scrollHeight` a ogni colpo forza il browser a ricalcolare il layout.
 *
 * Con `pagina` a `null` non fa niente: è così che il tracciamento resta spento
 * finché manca il consenso, invece di restare in ascolto per eventi che
 * verrebbero scartati comunque.
 */
export function useScrollDepth(pagina: string | null) {
  const raggiunte = useRef<Set<number>>(new Set());
  const inCoda = useRef(false);

  useEffect(() => {
    if (!pagina) return;
    raggiunte.current = new Set();

    const misura = () => {
      inCoda.current = false;

      const scrollabile = document.documentElement.scrollHeight - window.innerHeight;
      // Meno di mezzo schermo di scorrimento: la pagina si vede quasi tutta
      // da ferma, la profondità non significa niente.
      if (scrollabile < window.innerHeight / 2) return;

      // Quanto della distanza scorribile è stato effettivamente percorso: 0 in
      // cima, 100 in fondo. Misurare invece dove arriva il *bordo inferiore*
      // della finestra farebbe scattare 25 e 50 al caricamento, senza che
      // nessuno abbia mosso un dito — misurerebbe l'altezza dello schermo.
      const percentuale = (window.scrollY / scrollabile) * 100;

      for (const soglia of SOGLIE) {
        if (percentuale < soglia || raggiunte.current.has(soglia)) continue;
        raggiunte.current.add(soglia);
        trackEvent("scroll_depth", { percentuale: soglia, pagina });
      }
    };

    const onScroll = () => {
      if (inCoda.current) return;
      inCoda.current = true;
      requestAnimationFrame(misura);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Una misura iniziale: chi arriva con un'ancora nell'URL parte già a metà.
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [pagina]);
}
