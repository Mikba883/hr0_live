/**
 * "Fatto" — la finestra che chiude un'azione e ne apre subito un'altra.
 *
 * È il meccanismo che tiene in piedi tutto il resto. Nei CRM che funzionano
 * (Pipedrive, OnePageCRM) non esiste il gesto "segna come fatto" da solo:
 * completare un'azione ti mette davanti la domanda "e adesso?", perché è lì
 * che le trattative si perdono, non durante la telefonata.
 *
 * Si può rispondere "nessun altro passo", ma va detto esplicitamente: la
 * differenza fra una scelta e una dimenticanza è tutta qui.
 */

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { TIPI_MANUALI, type TipoAttivita } from "@/lib/attivita";
import { oggiISO, type Lead } from "@/lib/leads";

export type AzioneFatta = {
  tipo: TipoAttivita;
  descrizione: string | null;
  prossimaAzione: string | null;
  prossimoContatto: string | null;
};

/** `+3` → la data di fra tre giorni in `YYYY-MM-DD`, sul calendario locale. */
function fraGiorni(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const mese = String(d.getMonth() + 1).padStart(2, "0");
  const giorno = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mese}-${giorno}`;
}

const SCORCIATOIE: { label: string; giorni: number }[] = [
  { label: "Domani", giorni: 1 },
  { label: "Fra 3 giorni", giorni: 3 },
  { label: "Fra 1 settimana", giorni: 7 },
  { label: "Fra 2 settimane", giorni: 14 },
];

export function ModaleAzione({
  lead,
  onAnnulla,
  onConferma,
}: {
  lead: Lead;
  onAnnulla: () => void;
  onConferma: (azione: AzioneFatta) => void;
}) {
  const [tipo, setTipo] = useState<TipoAttivita>("chiamata");
  const [descrizione, setDescrizione] = useState("");
  const [prossimaAzione, setProssimaAzione] = useState("");
  const [quando, setQuando] = useState(fraGiorni(3));
  const [senzaSeguito, setSenzaSeguito] = useState(false);

  const invia = (e: FormEvent) => {
    e.preventDefault();
    onConferma({
      tipo,
      descrizione: descrizione.trim() || null,
      prossimaAzione: senzaSeguito ? null : prossimaAzione.trim() || null,
      prossimoContatto: senzaSeguito ? null : quando || null,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <form
        onSubmit={invia}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl text-ink">Cos'hai fatto</h2>
            <p className="mt-1 text-sm text-ink-soft">
              {lead.nome} · {lead.azienda}
            </p>
          </div>
          <button
            type="button"
            onClick={onAnnulla}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-surface hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {TIPI_MANUALI.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTipo(t.value)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                tipo === t.value
                  ? "border-brand bg-brand text-white"
                  : "border-hairline bg-white text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
            Com'è andata
          </span>
          <textarea
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            rows={3}
            placeholder="Non ha risposto. Richiamo giovedì mattina."
            className="mt-2 w-full resize-y rounded-xl border border-hairline bg-white p-3 text-sm outline-none focus:border-brand"
          />
        </label>

        {/* La metà che conta: la trattativa non esce da qui senza un seguito */}
        <div className="mt-5 rounded-xl border border-hairline bg-surface/60 p-4">
          <h3 className="text-sm font-bold text-ink">E adesso?</h3>

          {senzaSeguito ? (
            <p className="mt-2 text-sm text-ink-soft">
              Nessun altro passo. Il lead resta aperto ma sparisce dall'agenda: se la trattativa è
              finita, segnala come vinta o persa invece di lasciarla qui.
            </p>
          ) : (
            <>
              <input
                value={prossimaAzione}
                onChange={(e) => setProssimaAzione(e.target.value)}
                placeholder="Cosa devi fare — es. richiamare per fissare la call"
                className="mt-3 w-full rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm outline-none focus:border-brand"
              />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {SCORCIATOIE.map((s) => {
                  const data = fraGiorni(s.giorni);
                  return (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setQuando(data)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                        quando === data
                          ? "border-brand bg-info-bg text-brand"
                          : "border-hairline bg-white text-ink-soft hover:text-ink"
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
                <input
                  type="date"
                  value={quando}
                  min={oggiISO()}
                  onChange={(e) => setQuando(e.target.value)}
                  className="rounded-xl border border-hairline bg-white px-3 py-1.5 text-sm outline-none focus:border-brand"
                />
              </div>
            </>
          )}

          <button
            type="button"
            onClick={() => setSenzaSeguito((v) => !v)}
            className="mt-3 text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            {senzaSeguito ? "Fissa invece un prossimo passo" : "Non serve un altro passo"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onAnnulla}
            className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Registra
          </button>
        </div>
      </form>
    </div>
  );
}
