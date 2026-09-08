import { ChevronDown } from "lucide-react";

import { trackEvent } from "@/lib/analytics";

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-white">
      {items.map((item, i) => (
        /*
          Quali domande vengono aperte è la lista delle obiezioni che frenano
          la vendita, in ordine di quanto pesano. Si segnala solo l'apertura:
          la chiusura è quasi sempre il gesto di aprirne un'altra, e
          raddoppierebbe gli eventi senza aggiungere niente.

          `data-track="manual"` copre anche il `summary`, che altrimenti il
          listener delegato conterebbe una seconda volta come click generico.
        */
        <details
          key={i}
          data-track="manual"
          onToggle={(e) => {
            if (!e.currentTarget.open) return;
            trackEvent("faq_open", {
              domanda: item.q,
              pagina: typeof window === "undefined" ? "" : window.location.pathname,
            });
          }}
          className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
        >
          <summary className="flex cursor-pointer items-start justify-between gap-4 text-base font-semibold text-ink">
            <span>{item.q}</span>
            <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-brand transition-transform group-open:rotate-180" />
          </summary>
          <p className="mt-3 text-ink-soft">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
