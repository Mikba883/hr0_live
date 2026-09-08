import { createFileRoute, Link } from "@tanstack/react-router";

import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — HR0" },
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
    <>
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">
          Privacy Policy
        </p>
        <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">
          Informativa sul trattamento dei dati personali
        </h1>
        <p className="mt-4 text-sm text-ink-soft">
          Ultimo aggiornamento: 4 agosto 2026
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-ink-soft">
          <p>
            La presente informativa è resa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 ("GDPR")
            e descrive le modalità di trattamento dei dati personali degli utenti che consultano questo sito web
            e utilizzano i servizi offerti.
          </p>

          <Section title="1. Titolare del trattamento">
            <p>Il Titolare del trattamento è:</p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li><strong className="text-ink">Denominazione:</strong> HR0 — Michele Baroni</li>
              <li><strong className="text-ink">Email di contatto:</strong>{" "}
                <a href="mailto:info@hr0.it" className="text-brand underline">info@hr0.it</a>
              </li>
            </ul>
            <p className="mt-3">
              Il Titolare non ha nominato un Responsabile della Protezione dei Dati (DPO), non ricorrendone i presupposti di legge di cui all'art. 37 GDPR.
            </p>
          </Section>

          <Section title="2. Tipologie di dati raccolti">
            <h3 className="text-lg font-semibold text-ink">2.1 Dati forniti volontariamente dall'utente</h3>
            <p className="mt-3">
              Attraverso i moduli di contatto, la richiesta di consulenza o la prenotazione di una call presenti sul sito, raccogliamo:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>nome e cognome;</li>
              <li>indirizzo email;</li>
              <li>numero di telefono;</li>
              <li>nome dell'azienda e ruolo ricoperto;</li>
              <li>eventuali informazioni contenute nel campo messaggio libero.</li>
            </ul>
            <p className="mt-3">
              L'invio facoltativo, esplicito e volontario di comunicazioni agli indirizzi di contatto del Titolare comporta l'acquisizione dell'indirizzo del mittente e dei dati eventualmente inseriti nel messaggio.
            </p>

            <h3 className="mt-8 text-lg font-semibold text-ink">2.2 Dati di navigazione</h3>
            <p className="mt-3">
              I sistemi informatici e le procedure software preposte al funzionamento di questo sito acquisiscono, nel corso del loro normale esercizio, alcuni dati personali la cui trasmissione è implicita nell'uso dei protocolli di comunicazione di Internet: indirizzi IP, nomi a dominio, indirizzi URI/URL delle risorse richieste, orario della richiesta, metodo utilizzato, dimensione del file ottenuto, codice di stato della risposta, tipo di browser e sistema operativo.
            </p>
            <p className="mt-3">
              Questi dati sono utilizzati al solo fine di ricavare informazioni statistiche anonime sull'uso del sito e per controllarne il corretto funzionamento; vengono cancellati immediatamente dopo l'elaborazione. Potrebbero essere utilizzati per l'accertamento di responsabilità in caso di ipotetici reati informatici ai danni del sito.
            </p>

            <h3 className="mt-8 text-lg font-semibold text-ink">2.3 Cookie e strumenti di tracciamento</h3>
            <p className="mt-3">
              Per informazioni dettagliate sui cookie utilizzati, si rinvia alla{" "}
              <Link to="/cookie" className="text-brand underline">Cookie Policy</Link>.
            </p>
          </Section>

          <Section title="3. Finalità e basi giuridiche del trattamento">
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    <th className="py-3 pr-4 font-semibold text-ink">Finalità</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Base giuridica (art. 6 GDPR)</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Conferimento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4">Rispondere alle richieste di contatto e di informazioni</td>
                    <td className="py-3 pr-4">Misure precontrattuali su richiesta dell'interessato — art. 6.1.b</td>
                    <td className="py-3 pr-4">Necessario</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4">Fissare e gestire la call diagnostica / appuntamenti</td>
                    <td className="py-3 pr-4">Misure precontrattuali — art. 6.1.b</td>
                    <td className="py-3 pr-4">Necessario</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4">Esecuzione del contratto e gestione del rapporto professionale</td>
                    <td className="py-3 pr-4">Contratto — art. 6.1.b</td>
                    <td className="py-3 pr-4">Necessario</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4">Adempimenti fiscali, contabili e di legge</td>
                    <td className="py-3 pr-4">Obbligo legale — art. 6.1.c</td>
                    <td className="py-3 pr-4">Obbligatorio</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4">Invio di newsletter e comunicazioni commerciali</td>
                    <td className="py-3 pr-4">Consenso — art. 6.1.a</td>
                    <td className="py-3 pr-4">Facoltativo, revocabile</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4">Cookie analitici e di profilazione di terze parti</td>
                    <td className="py-3 pr-4">Consenso — art. 6.1.a</td>
                    <td className="py-3 pr-4">Facoltativo, revocabile</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Difesa di un diritto in sede giudiziaria</td>
                    <td className="py-3 pr-4">Legittimo interesse — art. 6.1.f</td>
                    <td className="py-3 pr-4">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Il conferimento dei dati contrassegnati come necessari è indispensabile per dare seguito alla richiesta: il mancato conferimento comporta l'impossibilità di rispondere o di erogare il servizio.
            </p>
          </Section>

          <Section title="4. Modalità del trattamento">
            <p>
              Il trattamento è effettuato con strumenti informatici e telematici, con logiche strettamente correlate alle finalità indicate e con misure tecniche e organizzative adeguate a garantire la sicurezza, l'integrità e la riservatezza dei dati (art. 32 GDPR), tra cui connessione cifrata HTTPS, controllo degli accessi e limitazione del personale autorizzato.
            </p>
            <p className="mt-3">
              I dati non sono soggetti a processi decisionali automatizzati né a profilazione produttiva di effetti giuridici sull'interessato.
            </p>
          </Section>

          <Section title="5. Periodo di conservazione">
            <ul className="list-disc space-y-1 pl-5">
              <li><strong className="text-ink">Richieste di contatto non seguite da rapporto:</strong> 24 mesi dall'ultimo contatto.</li>
              <li><strong className="text-ink">Dati relativi a clienti e rapporti contrattuali:</strong> 10 anni dalla conclusione del rapporto, per obblighi civilistici e fiscali.</li>
              <li><strong className="text-ink">Dati per newsletter e marketing:</strong> fino a revoca del consenso o disiscrizione.</li>
              <li><strong className="text-ink">Dati raccolti tramite cookie:</strong> secondo le durate indicate nella Cookie Policy.</li>
            </ul>
            <p className="mt-3">
              Al termine dei periodi indicati i dati sono cancellati o resi anonimi in modo irreversibile.
            </p>
          </Section>

          <Section title="6. Destinatari dei dati">
            <p>
              I dati possono essere comunicati a soggetti che trattano dati per conto del Titolare in qualità di Responsabili del trattamento ex art. 28 GDPR, regolarmente nominati:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>fornitore di hosting e infrastruttura del sito;</li>
              <li>fornitore del servizio di posta elettronica;</li>
              <li>piattaforma di prenotazione appuntamenti;</li>
              <li>piattaforma di email marketing;</li>
              <li>consulenti fiscali, contabili e legali;</li>
              <li>Google Ireland Ltd., per la misurazione delle conversioni delle campagne pubblicitarie e per le statistiche di utilizzo del sito, in entrambi i casi previo consenso dell'interessato e limitatamente alle categorie che ha accettato.</li>
            </ul>
            <p className="mt-3">
              I dati non sono in alcun caso diffusi né ceduti a terzi per finalità di marketing autonomo.
            </p>
          </Section>

          <Section title="7. Trasferimento dei dati extra UE">
            <p>
              Alcuni fornitori possono avere sede o server al di fuori dello Spazio Economico Europeo. In tal caso il trasferimento avviene esclusivamente in presenza di adeguate garanzie ai sensi del Capo V del GDPR: decisione di adeguatezza della Commissione Europea (ad esempio il EU-U.S. Data Privacy Framework) oppure Clausole Contrattuali Standard, unitamente a misure supplementari ove necessario.
            </p>
          </Section>

          <Section title="8. Diritti dell'interessato">
            <p>
              In qualsiasi momento l'utente può esercitare i diritti previsti dagli artt. 15-22 GDPR:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>accesso ai propri dati personali e alle informazioni sul trattamento;</li>
              <li>rettifica dei dati inesatti o integrazione di quelli incompleti;</li>
              <li>cancellazione dei dati ("diritto all'oblio"), nei casi previsti;</li>
              <li>limitazione del trattamento;</li>
              <li>portabilità dei dati in formato strutturato e leggibile da dispositivo automatico;</li>
              <li>opposizione al trattamento fondato sul legittimo interesse;</li>
              <li>revoca del consenso in qualsiasi momento, senza pregiudicare la liceità del trattamento effettuato prima della revoca.</li>
            </ul>
            <p className="mt-3">
              Le richieste vanno inviate a{" "}
              <a href="mailto:info@hr0.it" className="text-brand underline">info@hr0.it</a>.
              Il Titolare risponde senza ingiustificato ritardo e comunque entro un mese dal ricevimento.
            </p>
            <p className="mt-3">
              L'interessato ha inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali (Piazza Venezia 11, 00187 Roma —{" "}
              <a
                href="https://www.garanteprivacy.it"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline"
              >
                www.garanteprivacy.it
              </a>
              ) o all'autorità di controllo dello Stato membro di residenza.
            </p>
          </Section>

          <Section title="9. Link a siti terzi">
            <p>
              Il sito può contenere collegamenti a siti web di terze parti. Il Titolare non risponde del trattamento dei dati effettuato da tali siti, per i quali si invita a consultare le rispettive informative.
            </p>
          </Section>

          <Section title="10. Modifiche alla presente informativa">
            <p>
              Il Titolare si riserva di modificare o aggiornare la presente informativa, anche in conseguenza di variazioni normative. Le modifiche sono efficaci dalla pubblicazione su questa pagina; si invita a consultarla periodicamente facendo riferimento alla data di ultimo aggiornamento indicata in apertura.
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
      <Footer />
    </>
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
