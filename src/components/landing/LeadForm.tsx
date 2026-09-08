import { useRef, useState, type FormEvent } from "react";

import { trackEvent } from "@/lib/analytics";

/** Come si chiama questo modulo nei report. Vedi `MODULO` in `check-up.tsx`. */
const MODULO = "lead";

/**
 * Modulo di contatto breve.
 *
 * **Oggi non è montato in nessuna pagina, e l'invio non arriva da nessuna
 * parte**: il `submit` scrive in console e mostra la conferma, ma il contatto
 * si perde. Finché il TODO qui sotto non è risolto, mettere questo componente
 * in una pagina significa raccogliere richieste e buttarle.
 *
 * Gli eventi ci sono lo stesso, con `modulo: "lead"` a separarli da quelli del
 * check-up: il giorno che verrà collegato, sarà già misurato.
 */
export function LeadForm({ ctaLabel }: { ctaLabel: string }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", azienda: "", contatto: "" });
  const iniziato = useRef(false);
  const inizio = useRef(0);

  /**
   * Alla prima interazione con un campo, non all'invio: la differenza fra i
   * due è quanta gente comincia a scrivere e ci rinuncia.
   */
  const aggiorna = (campo: keyof typeof form, valore: string) => {
    if (!iniziato.current) {
      iniziato.current = true;
      inizio.current = Date.now();
      trackEvent("form_start", { modulo: MODULO });
    }
    setForm((f) => ({ ...f, [campo]: valore }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: collegare Calendly / webhook
    console.log("lead", form);
    trackEvent("form_submit", {
      modulo: MODULO,
      secondi: inizio.current ? Math.round((Date.now() - inizio.current) / 1000) : 0,
    });
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-brand/30 bg-info-bg p-6 text-center">
        <p className="text-lg font-semibold text-ink">Richiesta ricevuta</p>
        <p className="mt-1 text-ink-soft">Ti ricontatto entro 24 ore.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" id="form">
      <div>
        <label htmlFor="nome" className="mb-1 block text-sm font-semibold text-ink">
          Nome e cognome
        </label>
        <input
          id="nome"
          required
          value={form.nome}
          onChange={(e) => aggiorna("nome", e.target.value)}
          className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="azienda" className="mb-1 block text-sm font-semibold text-ink">
          Azienda
        </label>
        <input
          id="azienda"
          required
          value={form.azienda}
          onChange={(e) => aggiorna("azienda", e.target.value)}
          className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base outline-none focus:border-brand"
        />
      </div>
      <div>
        <label htmlFor="contatto" className="mb-1 block text-sm font-semibold text-ink">
          Email o telefono
        </label>
        <input
          id="contatto"
          required
          value={form.contatto}
          onChange={(e) => aggiorna("contatto", e.target.value)}
          className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-full bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        {ctaLabel}
      </button>
      <p className="text-center text-sm text-ink-soft">
        Nessuna newsletter, nessuno spam. Solo la call.
      </p>
    </form>
  );
}
