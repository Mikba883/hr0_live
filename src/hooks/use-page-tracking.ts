import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";

import { useConsent } from "@/hooks/use-consent";
import { useScrollDepth } from "@/hooks/use-scroll-depth";
import { useTimeOnPage } from "@/hooks/use-time-on-page";
import { trackPageView } from "@/lib/analytics";

/**
 * Tutto il tracciamento che vale per ogni pagina: visita, profondità di scroll,
 * permanenza.
 *
 * Sta in un hook solo, montato una volta nella radice, invece che pagina per
 * pagina. Il motivo è pratico: finché ogni route doveva ricordarsi di chiamare
 * `useScrollDepth`, quattro pagine su sette se ne erano dimenticate, e la cosa
 * non si vede — non c'è nessun errore, semplicemente quei dati non esistono.
 *
 * Il nome della pagina è il `pathname`. Non un'etichetta scritta a mano: quella
 * si può sbagliare, e un refuso separa in due righe di report gli stessi dati.
 *
 * `null` finché il tracciamento non è ammesso spegne davvero scroll e timer,
 * invece di lasciarli girare per produrre eventi che verrebbero scartati.
 */
export function usePageTracking() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { analytics } = useConsent();

  // L'area riservata è privata e noindex: non ha senso misurarne le visite, e
  // senza tracciamento non c'è consenso da chiedere.
  const pagina = analytics && !pathname.startsWith("/admin") ? pathname : null;

  /**
   * L'ultima pagina segnalata.
   *
   * Serve perché questo effetto dipende anche dal consenso, non solo dal
   * percorso: chi accetta il banner mentre è fermo su una pagina lo farebbe
   * girare una seconda volta, e la stessa visita risulterebbe doppia.
   */
  const inviata = useRef<string | null>(null);

  useEffect(() => {
    if (!pagina || inviata.current === pagina) return;
    inviata.current = pagina;
    trackPageView();
  }, [pagina]);

  useScrollDepth(pagina);
  useTimeOnPage(pagina);
}
