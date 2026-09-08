import { useSyncExternalStore } from "react";

import {
  getConsentServerSnapshot,
  getConsentSnapshot,
  subscribeConsent,
} from "@/lib/consent";

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
    /** Il consenso al marketing è dato. */
    marketing: decision?.marketing ?? false,
    /** Il consenso alle statistiche è dato. */
    analytics: decision?.analytics ?? false,
    /** Serve una scelta, o l'utente ha riaperto le preferenze. */
    shouldAsk: decision === null || reopened,
    /** Il pannello è stato riaperto da chi aveva già scelto. */
    reopened,
  };
}
