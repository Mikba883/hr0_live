import { ChevronDown } from "lucide-react";

export type FaqItem = { q: string; a: string };

export function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-white">
      {items.map((item, i) => (
        <details key={i} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
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
