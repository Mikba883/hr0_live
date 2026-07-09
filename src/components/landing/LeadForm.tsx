import { useState, type FormEvent } from "react";

export function LeadForm({ ctaLabel }: { ctaLabel: string }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nome: "", azienda: "", contatto: "" });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: collegare Calendly / webhook
    console.log("lead", form);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-lg border border-brand/30 bg-info-bg p-6 text-center">
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
          onChange={(e) => setForm({ ...form, nome: e.target.value })}
          className="w-full rounded-md border border-hairline bg-white px-4 py-3 text-base outline-none focus:border-brand"
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
          onChange={(e) => setForm({ ...form, azienda: e.target.value })}
          className="w-full rounded-md border border-hairline bg-white px-4 py-3 text-base outline-none focus:border-brand"
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
          onChange={(e) => setForm({ ...form, contatto: e.target.value })}
          className="w-full rounded-md border border-hairline bg-white px-4 py-3 text-base outline-none focus:border-brand"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-brand px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
      >
        {ctaLabel}
      </button>
      <p className="text-center text-sm text-ink-soft">
        Nessuna newsletter, nessuno spam. Solo la call.
      </p>
    </form>
  );
}
