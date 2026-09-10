import { useSyncExternalStore } from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent";
import { CONSENSO_RICHIESTO } from "@/lib/site";

/**
 * Espone la scelta sui cookie ai componenti.
 *
 * Sul server, e al primo render dopo l'idratazione, `decision` è sempre `null`:
 * il markup generato deve combaciare con quello del client, e sul server lo
 * storage non esiste. `hydrateConsent()` in `__root.tsx` legge la scelta subito
 * dopo, e chi ha già deciso non vede comparire il banner.
 */
export function useConsent() {
  const { decision, reopened } = useSyncExternalStore(
    subscribeConsent,
    getConsentSnapshot,
    getConsentServerSnapshot,
  );

  return {
    decision,
    /**
     * Il tag di Google Ads può partire.
     *
     * La stessa regola di `marketingConsentito`, ma ricavata da `decision`
     * appena letta dallo store invece che dallo stato del modulo: durante il
     * render si legge lo snapshot che React ha in mano, altrimenti il valore
     * potrebbe non corrispondere a quello con cui il componente è stato
     * disegnato.
     */
    marketing: !CONSENSO_RICHIESTO || (decision?.marketing ?? false),
    /** GA4 può partire. Stessa regola. */
    analytics: !CONSENSO_RICHIESTO || (decision?.analytics ?? false),
    /**
     * Serve una scelta, o l'utente ha riaperto le preferenze.
     *
     * Con il banner spento è sempre `false`: `decision` resta `null` — nessuno
     * ha scelto niente — e senza questo controllo il banner comparirebbe a
     * ogni visita, che è l'opposto di quel che si vuole qui.
     */
    shouldAsk: CONSENSO_RICHIESTO && (decision === null || reopened),
    /** Il pannello è stato riaperto da chi aveva già scelto. */
    reopened,
  };
}
