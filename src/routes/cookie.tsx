import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cookie")({
  head: () => ({
    meta: [
      { title: "Cookie Policy — HR0" },
      { name: "description", content: "Informativa sui cookie e strumenti di tracciamento utilizzati sul sito." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CookiePage,
});

function CookiePage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand">Cookie</p>
      <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">Cookie Policy</h1>
      <p className="mt-4 text-sm text-ink-soft">Ultimo aggiornamento: 4 agosto 2026</p>

      <div className="mt-12 space-y-10 text-base leading-relaxed text-ink-soft">
        <p>
          La presente Cookie Policy è resa ai sensi dell'art. 122 del D.Lgs. 196/2003 (Codice Privacy), delle Linee guida del Garante per la protezione dei dati personali in materia di cookie e altri strumenti di tracciamento del 10 giugno 2021 e del Regolamento (UE) 2016/679 (GDPR).
        </p>
        <p>
          <strong className="text-ink">Titolare del trattamento:</strong> HR0 — Michele Baroni —{" "}
          <a href="mailto:info@hr0.it" className="text-brand underline">info@hr0.it</a>.
          Per il trattamento dei dati personali in generale si rinvia alla{" "}
          <Link to="/privacy" className="text-brand underline">Privacy Policy</Link>.
        </p>

        <Section title="1. Cosa sono i cookie">
          <p>
            I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell'utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva. Accanto ai cookie esistono altri strumenti di tracciamento passivi (pixel, SDK, fingerprinting) ai quali si applica la medesima disciplina.
          </p>
          <p className="mt-3">
            I cookie possono essere di prima parte, installati direttamente dal Titolare, o di terza parte, installati da soggetti diversi tramite risorse presenti sul sito.
          </p>
          <p className="mt-3">
            In base alla durata si distinguono in cookie di sessione, cancellati automaticamente alla chiusura del browser, e cookie persistenti, che restano memorizzati fino alla scadenza o alla cancellazione manuale.
          </p>
        </Section>

        <Section title="2. Tipologie di cookie utilizzate">
          <h3 className="text-lg font-semibold text-ink">2.1 Cookie tecnici — sempre attivi</h3>
          <p className="mt-3">
            Sono necessari al funzionamento del sito e all'erogazione dei servizi richiesti dall'utente. Ai sensi dell'art. 122 del Codice Privacy non richiedono il consenso preventivo, ma solo un'adeguata informativa.
          </p>
          <p className="mt-3">
            Comprendono: cookie di navigazione e di sessione, cookie di bilanciamento del carico, cookie che memorizzano le preferenze espresse tramite il banner sul consenso, cookie di sicurezza contro attacchi e abusi.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-ink">2.2 Cookie analitici</h3>
          <p className="mt-3">
            Servono a raccogliere informazioni aggregate sul numero di visitatori e sul modo in cui il sito viene utilizzato.
          </p>
          <p className="mt-3">
            Sono equiparati ai cookie tecnici — e quindi esenti da consenso — solo se predisposti e utilizzati direttamente dal Titolare del sito, con IP anonimizzato e senza incrocio con altre elaborazioni o trasmissione a terzi. In tutti gli altri casi, in particolare per gli strumenti analitici di terze parti, è richiesto il consenso preventivo.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-ink">2.3 Cookie di profilazione e marketing</h3>
          <p className="mt-3">
            Servono a creare profili relativi all'utente e a inviare messaggi pubblicitari in linea con le preferenze manifestate durante la navigazione, oltre che a misurare l'efficacia delle campagne. Richiedono sempre il consenso libero, specifico, informato e inequivocabile dell'utente, che può essere revocato in qualsiasi momento.
          </p>
        </Section>

        <Section title="3. Elenco dei cookie e degli strumenti di tracciamento">
          <p>
            (Compila questa tabella con gli strumenti realmente installati sul sito. Puoi ricavare l'elenco esatto dal pannello del tuo gestore del consenso o ispezionando il sito con gli strumenti per sviluppatori del browser. Le righe qui sotto sono esempi da adattare o eliminare.)
          </p>

          <h3 className="mt-6 text-base font-semibold text-ink">Cookie tecnici</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="py-3 pr-4 font-semibold text-ink">Nome</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Fornitore</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Finalità</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Durata</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline">
                  <td className="py-3 pr-4">cookie_consent</td>
                  <td className="py-3 pr-4">Prima parte</td>
                  <td className="py-3 pr-4">Memorizza le preferenze espresse sul banner cookie</td>
                  <td className="py-3 pr-4">6 mesi</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 pr-4">__session</td>
                  <td className="py-3 pr-4">Prima parte</td>
                  <td className="py-3 pr-4">Mantiene la sessione di navigazione</td>
                  <td className="py-3 pr-4">Sessione</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold text-ink">Cookie analitici di terza parte — previo consenso</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="py-3 pr-4 font-semibold text-ink">Nome</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Fornitore</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Finalità</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Durata</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Informativa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline">
                  <td className="py-3 pr-4">_ga, _ga_*</td>
                  <td className="py-3 pr-4">Google Ireland Ltd.</td>
                  <td className="py-3 pr-4">Statistiche di utilizzo del sito (Google Analytics 4)</td>
                  <td className="py-3 pr-4">14 mesi</td>
                  <td className="py-3 pr-4">Link</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold text-ink">Cookie di profilazione di terza parte — previo consenso</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="py-3 pr-4 font-semibold text-ink">Nome</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Fornitore</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Finalità</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Durata</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Informativa</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline">
                  <td className="py-3 pr-4">_fbp, fr</td>
                  <td className="py-3 pr-4">Meta Platforms Ireland Ltd.</td>
                  <td className="py-3 pr-4">Misurazione campagne e retargeting pubblicitario</td>
                  <td className="py-3 pr-4">3 mesi</td>
                  <td className="py-3 pr-4">Link</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 pr-4">li_sugr, bcookie</td>
                  <td className="py-3 pr-4">LinkedIn Ireland Unlimited Company</td>
                  <td className="py-3 pr-4">Insight Tag, misurazione campagne e retargeting</td>
                  <td className="py-3 pr-4">6 mesi</td>
                  <td className="py-3 pr-4">Link</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="mt-6 text-base font-semibold text-ink">Servizi di terza parte con possibile installazione di cookie</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[500px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-hairline text-left">
                  <th className="py-3 pr-4 font-semibold text-ink">Servizio</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Fornitore</th>
                  <th className="py-3 pr-4 font-semibold text-ink">Funzione sul sito</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-hairline">
                  <td className="py-3 pr-4">[Piattaforma di prenotazione]</td>
                  <td className="py-3 pr-4">[Fornitore]</td>
                  <td className="py-3 pr-4">Prenotazione della call diagnostica</td>
                </tr>
                <tr className="border-b border-hairline">
                  <td className="py-3 pr-4">[Piattaforma email marketing]</td>
                  <td className="py-3 pr-4">[Fornitore]</td>
                  <td className="py-3 pr-4">Iscrizione alla newsletter</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="4. Trasferimenti extra UE">
          <p>
            Alcuni fornitori di terza parte possono trattare i dati al di fuori dello Spazio Economico Europeo. Tali trasferimenti avvengono sulla base di decisioni di adeguatezza della Commissione Europea (ad esempio il EU-U.S. Data Privacy Framework) o di Clausole Contrattuali Standard, come indicato nelle rispettive informative linkate in tabella.
          </p>
        </Section>

        <Section title="5. Come gestire o revocare il consenso">
          <h3 className="text-lg font-semibold text-ink">Tramite il banner del sito</h3>
          <p className="mt-3">
            Al primo accesso viene mostrato un banner che consente di accettare tutti i cookie, rifiutarli tutti o personalizzare le scelte per singola categoria. La chiusura del banner tramite l'apposito comando non comporta alcun consenso.
          </p>
          <p className="mt-3">
            È possibile modificare o revocare in qualsiasi momento le preferenze espresse cliccando sul link "Preferenze cookie" presente nel footer di ogni pagina. La revoca non pregiudica la liceità del trattamento effettuato prima della revoca stessa.
          </p>

          <h3 className="mt-8 text-lg font-semibold text-ink">Tramite le impostazioni del browser</h3>
          <p className="mt-3">
            L'utente può bloccare o cancellare i cookie direttamente dal proprio browser. Si segnala che la disabilitazione dei cookie tecnici può compromettere il corretto funzionamento del sito.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer" className="text-brand underline">Google Chrome</a>
            </li>
            <li>
              <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox-desktop" target="_blank" rel="noreferrer" className="text-brand underline">Mozilla Firefox</a>
            </li>
            <li>
              <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noreferrer" className="text-brand underline">Safari</a>
            </li>
            <li>
              <a href="https://support.microsoft.com/it-it/microsoft-edge/eliminare-i-cookie-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noreferrer" className="text-brand underline">Microsoft Edge</a>
            </li>
          </ul>
        </Section>

        <Section title="6. Diritti dell'utente">
          <p>
            L'utente può esercitare in ogni momento i diritti previsti dagli artt. 15-22 GDPR — accesso, rettifica, cancellazione, limitazione, portabilità, opposizione e revoca del consenso — scrivendo a{" "}
            <a href="mailto:info@hr0.it" className="text-brand underline">info@hr0.it</a>,
            oltre al diritto di proporre reclamo al Garante per la protezione dei dati personali ({" "}
            <a href="https://www.garanteprivacy.it" target="_blank" rel="noreferrer" className="text-brand underline">www.garanteprivacy.it</a>
            ).
          </p>
          <p className="mt-3">
            Il dettaglio completo dei diritti e delle modalità di esercizio è riportato nella{" "}
            <Link to="/privacy" className="text-brand underline">Privacy Policy</Link>.
          </p>
        </Section>

        <Section title="7. Modifiche alla presente policy">
          <p>
            La presente Cookie Policy può essere aggiornata in conseguenza dell'introduzione di nuovi strumenti di tracciamento o di variazioni normative. Si invita a consultare periodicamente questa pagina, verificando la data di ultimo aggiornamento indicata in apertura.
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
