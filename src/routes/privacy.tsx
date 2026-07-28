import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Informativa Privacy — Check-up Assunzioni" },
      {
        name: "description",
        content:
          "Informativa sul trattamento dei dati personali ai sensi del Regolamento (UE) 2016/679 (GDPR).",
      },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">
        Privacy
      </p>
      <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">
        Informativa sul trattamento dei dati personali
      </h1>
      <p className="mt-4 text-sm text-ink-soft">
        Resa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 ("GDPR").
      </p>
      <p className="mt-2 text-sm text-ink-soft">
        Ultimo aggiornamento: 28 luglio 2026
      </p>

      <div className="mt-12 space-y-10 text-base leading-relaxed text-ink-soft">
        <Section title="1. Titolare del trattamento">
          <p>
            Il Titolare del trattamento è <strong className="text-ink">[Nome / Ragione sociale]</strong>,
            con sede in <strong className="text-ink">[Indirizzo]</strong>, P.IVA/CF{" "}
            <strong className="text-ink">[codice]</strong>.
          </p>
          <p>
            Per ogni richiesta relativa ai tuoi dati puoi scriverci a{" "}
            <a href="mailto:[email@dominio.it]" className="text-brand underline">
              [email@dominio.it]
            </a>
            .
          </p>
        </Section>

        <Section title="2. Dati trattati">
          <p>Tramite il form di check-up raccogliamo:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>dati identificativi e di contatto: nome, cognome, email aziendale, numero di telefono;</li>
            <li>dati aziendali: ragione sociale, ruolo, settore, dimensione, momento aziendale;</li>
            <li>informazioni sulle esigenze di assunzione dichiarate volontariamente nel form;</li>
            <li>dati tecnici di navigazione: pagina di provenienza e parametri UTM della campagna.</li>
          </ul>
        </Section>

        <Section title="3. Finalità e base giuridica">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-ink">Ricontatto e gestione della richiesta</strong> —
              per fissare la call di check-up e rispondere alle tue domande. Base giuridica:
              esecuzione di misure precontrattuali su tua richiesta (art. 6.1.b GDPR).
            </li>
            <li>
              <strong className="text-ink">Obblighi di legge</strong> — conservazione dei
              dati per adempimenti fiscali, contabili e di legge (art. 6.1.c GDPR).
            </li>
            <li>
              <strong className="text-ink">Legittimo interesse</strong> — sicurezza della
              piattaforma, prevenzione di abusi e analisi aggregate anonime (art. 6.1.f GDPR).
            </li>
          </ul>
          <p className="mt-3">
            Non inviamo newsletter e non facciamo profilazione automatizzata sui tuoi dati.
          </p>
        </Section>

        <Section title="4. Conferimento dei dati">
          <p>
            Il conferimento dei dati contrassegnati come obbligatori è necessario per essere
            ricontattato. Il mancato conferimento rende impossibile evadere la richiesta.
          </p>
        </Section>

        <Section title="5. Destinatari e responsabili">
          <p>
            I dati possono essere trattati da soggetti autorizzati e da fornitori esterni
            nominati Responsabili del trattamento (art. 28 GDPR), tra cui:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Supabase Inc. — hosting e database delle risposte del form;</li>
            <li>fornitore di hosting/CDN della landing page;</li>
            <li>fornitore di posta elettronica utilizzato per il ricontatto.</li>
          </ul>
          <p className="mt-3">
            I dati non sono diffusi né ceduti a terzi per finalità di marketing autonomo.
          </p>
        </Section>

        <Section title="6. Trasferimento extra-UE">
          <p>
            Alcuni fornitori possono trattare i dati anche al di fuori dello Spazio Economico
            Europeo. In tal caso il trasferimento avviene sulla base di garanzie adeguate
            previste dagli artt. 44 e ss. GDPR (Clausole Contrattuali Standard adottate dalla
            Commissione UE).
          </p>
        </Section>

        <Section title="7. Conservazione">
          <p>
            I dati raccolti tramite il form sono conservati per il tempo strettamente necessario
            a gestire la tua richiesta e, se non si instaura un rapporto contrattuale, per un
            massimo di <strong className="text-ink">24 mesi</strong> dall'ultimo contatto utile,
            salvo diverso termine imposto da obblighi di legge.
          </p>
        </Section>

        <Section title="8. Diritti dell'interessato">
          <p>In ogni momento hai diritto di:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>accedere ai tuoi dati (art. 15);</li>
            <li>chiederne la rettifica (art. 16) o la cancellazione (art. 17);</li>
            <li>ottenere la limitazione del trattamento (art. 18);</li>
            <li>opporti al trattamento (art. 21);</li>
            <li>ricevere i dati in formato strutturato / portabilità (art. 20);</li>
            <li>revocare in qualsiasi momento il consenso, senza pregiudicare la liceità del trattamento precedente.</li>
          </ul>
          <p className="mt-3">
            Per esercitare i tuoi diritti scrivi a{" "}
            <a href="mailto:[email@dominio.it]" className="text-brand underline">
              [email@dominio.it]
            </a>
            . Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei
            dati personali (
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noreferrer"
              className="text-brand underline"
            >
              garanteprivacy.it
            </a>
            ).
          </p>
        </Section>

        <Section title="9. Cookie">
          <p>
            Il sito utilizza esclusivamente cookie tecnici necessari al funzionamento. Non
            usiamo cookie di profilazione. Per il dettaglio consulta la{" "}
            <Link to="/cookie" className="text-brand underline">
              cookie policy
            </Link>
            .
          </p>
        </Section>
      </div>

      <div className="mt-16 border-t border-hairline pt-8">
        <Link
          to="/check-up"
          className="text-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          ← Torna al check-up
        </Link>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink sm:text-2xl">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
