/**
 * L'agenda: cosa devi fare adesso.
 *
 * È la schermata da cui si apre la giornata, e segue il principio comune a
 * tutti i CRM activity-based (Pipedrive, OnePageCRM): non conta l'elenco dei
 * contatti, conta la prossima azione. Un lead aperto senza prossima azione non
 * comparirebbe da nessuna parte, quindi ha un blocco tutto suo — "alla deriva" —
 * ed è il numero da tenere a zero.
 *
 * L'ordine dei blocchi è deliberato: prima quello che hai già lasciato indietro,
 * poi la giornata, poi i buchi, e solo alla fine ciò che è ancora in tempo.
 */

import { useState } from "react";
import { AlertTriangle, CalendarDays, Compass, Phone, Sun } from "lucide-react";
import {
  allaDeriva,
  dataBreve,
  eChiuso,
  followup,
  priorita,
  telPulito,
  type Lead,
} from "@/lib/leads";

export type Blocco = {
  chiave: string;
  titolo: string;
  spiegazione: string;
  leads: Lead[];
  tono: "allarme" | "oggi" | "attenzione" | "calmo";
};

/**
 * Divide i lead nei blocchi dell'agenda. Sta fuori dal componente perché è la
 * regola con cui decidi cosa fare per primo: deve restare leggibile senza
 * attraversare il markup.
 */
export function blocchiAgenda(leads: Lead[]): Blocco[] {
  const aperti = leads.filter((l) => !eChiuso(l.stato));
  const ordinaPerData = (a: Lead, b: Lead) =>
    (a.prossimo_contatto ?? "").localeCompare(b.prossimo_contatto ?? "");

  return [
    {
      chiave: "ritardo",
      titolo: "In ritardo",
      spiegazione: "Avevi detto che li avresti sentiti prima di oggi.",
      leads: aperti.filter((l) => followup(l) === "ritardo").sort(ordinaPerData),
      tono: "allarme",
    },
    {
      chiave: "oggi",
      titolo: "Oggi",
      spiegazione: "Il lavoro della giornata.",
      leads: aperti.filter((l) => followup(l) === "oggi"),
      tono: "oggi",
    },
    {
      chiave: "deriva",
      titolo: "Senza prossimo passo",
      spiegazione:
        "Trattative aperte che non hai messo in nessuna lista: se resta qualcosa qui, prima o poi lo perdi senza accorgertene.",
      leads: aperti
        .filter(allaDeriva)
        .sort((a, b) => priorita(b).score - priorita(a).score),
      tono: "attenzione",
    },
    {
      chiave: "futuro",
      titolo: "In arrivo",
      spiegazione: "Già fissati, ancora in tempo.",
      leads: aperti.filter((l) => followup(l) === "futuro").sort(ordinaPerData),
      tono: "calmo",
    },
  ];
}

const TONO: Record<Blocco["tono"], { bordo: string; icona: typeof Sun; colore: string }> = {
  allarme: { bordo: "border-danger/40", icona: AlertTriangle, colore: "text-danger" },
  oggi: { bordo: "border-brand/40", icona: Sun, colore: "text-brand" },
  attenzione: { bordo: "border-amber-300", icona: Compass, colore: "text-amber-700" },
  calmo: { bordo: "border-hairline", icona: CalendarDays, colore: "text-ink-soft" },
};

export function Agenda({
  leads,
  onApri,
  onFatto,
}: {
  leads: Lead[];
  onApri: (id: string) => void;
  onFatto: (lead: Lead) => void;
}) {
  const blocchi = blocchiAgenda(leads);

  if (blocchi.every((b) => b.leads.length === 0)) {
    return (
      <div className="mt-5 rounded-2xl border border-dashed border-hairline bg-white p-10 text-center">
        <p className="text-lg text-ink">Nessuna trattativa aperta.</p>
        <p className="mt-2 text-sm text-ink-soft">
          Quando arriva un lead dal check-up lo trovi qui, con il suo prossimo passo da fissare.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-5">
      {blocchi.map((b) => (
        <BloccoAgenda key={b.chiave} blocco={b} onApri={onApri} onFatto={onFatto} />
      ))}
    </div>
  );
}

function BloccoAgenda({
  blocco,
  onApri,
  onFatto,
}: {
  blocco: Blocco;
  onApri: (id: string) => void;
  onFatto: (lead: Lead) => void;
}) {
  // "In arrivo" parte chiuso: è l'unico blocco che non richiede una decisione
  // oggi, e tenerlo aperto ruberebbe attenzione a quelli che invece la vogliono.
  const [aperto, setAperto] = useState(blocco.chiave !== "futuro");

  if (blocco.leads.length === 0) return null;

  const t = TONO[blocco.tono];
  const Icona = t.icona;

  return (
    <section className={`rounded-2xl border bg-white ${t.bordo}`}>
      <button
        onClick={() => setAperto((v) => !v)}
        className="flex w-full items-start gap-3 p-5 text-left"
      >
        <Icona className={`mt-0.5 h-5 w-5 shrink-0 ${t.colore}`} />
        <div className="flex-1">
          <h2 className="flex items-center gap-2 text-lg text-ink">
            {blocco.titolo}
            <span className={`text-sm font-bold ${t.colore}`}>{blocco.leads.length}</span>
          </h2>
          <p className="mt-1 text-sm text-ink-soft">{blocco.spiegazione}</p>
        </div>
        <span className="text-sm font-semibold text-ink-soft">{aperto ? "nascondi" : "mostra"}</span>
      </button>

      {aperto && (
        <div className="border-t border-hairline">
          {blocco.leads.map((l) => (
            <RigaAzione
              key={l.id}
              lead={l}
              onApri={() => onApri(l.id)}
              onFatto={() => onFatto(l)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function RigaAzione({
  lead,
  onApri,
  onFatto,
}: {
  lead: Lead;
  onApri: () => void;
  onFatto: () => void;
}) {
  const p = priorita(lead);
  const tel = telPulito(lead.telefono);
  const stato = followup(lead);

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-5 py-4 last:border-b-0 hover:bg-surface/60">
      <button onClick={onApri} className="min-w-[180px] flex-1 text-left">
        <p className="flex flex-wrap items-center gap-2 font-semibold text-ink">
          {lead.nome}
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${p.chip}`}>
            {p.label}
          </span>
        </p>
        <p className="text-sm text-ink-soft">{lead.azienda}</p>

        {/* Il cuore della riga: cosa devi fare, non solo quando */}
        <p className="mt-1.5 text-sm text-ink">
          {lead.prossima_azione ? (
            <span className="font-semibold">{lead.prossima_azione}</span>
          ) : (
            <span className="text-ink-soft italic">Nessuna azione scritta — deciderla è il passo</span>
          )}
          {lead.prossimo_contatto && (
            <span className={stato === "ritardo" ? "text-danger" : "text-ink-soft"}>
              {" · "}
              {stato === "ritardo" ? "scaduta il " : ""}
              {dataBreve(lead.prossimo_contatto)}
            </span>
          )}
        </p>
      </button>

      <div className="flex shrink-0 items-center gap-2">
        <a
          href={`tel:${tel}`}
          title={`Chiama ${lead.telefono}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline text-ink-soft transition-colors hover:bg-surface hover:text-ink"
        >
          <Phone className="h-4 w-4" />
        </a>
        <button
          onClick={onFatto}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Fatto
        </button>
      </div>
    </div>
  );
}
