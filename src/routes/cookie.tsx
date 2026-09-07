import { createFileRoute, Link } from "@tanstack/react-router";

import { Footer } from "@/components/landing/Footer";
import { openConsentPreferences } from "@/lib/consent";
import { GOOGLE_ADS_ID } from "@/lib/google-ads";

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
    <>
      <main className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand">Cookie</p>
        <h1 className="mt-3 text-4xl leading-tight text-ink sm:text-5xl">Cookie Policy</h1>
        <p className="mt-4 text-sm text-ink-soft">Ultimo aggiornamento: 7 settembre 2026</p>

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
              I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell'utente, dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva. Accanto ai cookie esistono altri strumenti di tracciamento passivi (pixel, SDK, fingerprinting) e altre forme di memorizzazione locale, come il <em>localStorage</em> e il <em>sessionStorage</em> del browser, ai quali si applica la medesima disciplina.
            </p>
            <p className="mt-3">
              I cookie possono essere di prima parte, installati direttamente dal Titolare, o di terza parte, installati da soggetti diversi tramite risorse presenti sul sito.
            </p>
            <p className="mt-3">
              In base alla durata si distinguono in cookie di sessione, cancellati automaticamente alla chiusura del browser, e cookie persistenti, che restano memorizzati fino alla scadenza o alla cancellazione manuale.
            </p>
          </Section>

          <Section title="2. Tipologie di strumenti utilizzate su questo sito">
            <h3 className="text-lg font-semibold text-ink">2.1 Cookie tecnici — sempre attivi</h3>
            <p className="mt-3">
              Sono necessari al funzionamento del sito e all'erogazione dei servizi richiesti dall'utente. Ai sensi dell'art. 122 del Codice Privacy non richiedono il consenso preventivo, ma solo un'adeguata informativa.
            </p>
            <p className="mt-3">
              Su questo sito rientrano in questa categoria esclusivamente gli strumenti di prima parte che memorizzano la scelta espressa sul banner e che impediscono il doppio conteggio di una richiesta inviata, elencati al punto 3.
            </p>

            <h3 className="mt-8 text-lg font-semibold text-ink">2.2 Cookie analitici</h3>
            <p className="mt-3">
              <strong className="text-ink">Questo sito non utilizza strumenti di analisi statistica.</strong> Non è installato Google Analytics né alcuna piattaforma equivalente. La presente sezione è mantenuta per completezza: qualora in futuro venisse introdotto uno strumento analitico, la tabella al punto 3 e il banner verrebbero aggiornati di conseguenza e il consenso richiesto nuovamente.
            </p>

            <h3 className="mt-8 text-lg font-semibold text-ink">2.3 Cookie di profilazione e marketing</h3>
            <p className="mt-3">
              Servono a creare profili relativi all'utente e a inviare messaggi pubblicitari in linea con le preferenze manifestate durante la navigazione, oltre che a misurare l'efficacia delle campagne. Richiedono sempre il consenso libero, specifico, informato e inequivocabile dell'utente, che può essere revocato in qualsiasi momento.
            </p>
            <p className="mt-3">
              Su questo sito rientra in questa categoria <strong className="text-ink">il solo tag di Google Ads</strong>, utilizzato per misurare quali annunci pubblicitari conducono a una richiesta di check-up. <strong className="text-ink">Il tag non viene caricato finché l'utente non presta il proprio consenso</strong> tramite il banner.
            </p>
          </Section>

          <Section title="3. Elenco degli strumenti effettivamente presenti">
            <h3 className="mt-2 text-base font-semibold text-ink">
              Strumenti tecnici di prima parte — nessun consenso richiesto
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    <th className="py-3 pr-4 font-semibold text-ink">Nome</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Tipo</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Finalità</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Durata</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top font-mono text-xs">hr0.cookie-consent</td>
                    <td className="py-3 pr-4 align-top">localStorage, prima parte</td>
                    <td className="py-3 pr-4 align-top">
                      Memorizza la scelta espressa sul banner, per non riproporla a ogni pagina e per conservare la prova del consenso
                    </td>
                    <td className="py-3 pr-4 align-top">6 mesi</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top font-mono text-xs">google-ads-conversion-sent</td>
                    <td className="py-3 pr-4 align-top">sessionStorage, prima parte</td>
                    <td className="py-3 pr-4 align-top">
                      Impedisce che il ricaricamento della pagina di conferma invii due volte la stessa conversione. Presente solo se è stato prestato il consenso al marketing
                    </td>
                    <td className="py-3 pr-4 align-top">Sessione</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-8 text-base font-semibold text-ink">
              Cookie di profilazione di terza parte — previo consenso
            </h3>
            <p className="mt-3">
              I cookie seguenti vengono installati da Google Ireland Ltd. (Gordon House, Barrow Street, Dublino 4, Irlanda) esclusivamente dopo il consenso prestato sul banner. Le denominazioni e le durate sono quelle dichiarate da Google e possono variare nel tempo per decisione del fornitore: l'elenco aggiornato è consultabile nell'{" "}
              <a
                href="https://business.safety.google/adscookies/"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline"
              >
                informativa di Google sui cookie pubblicitari
              </a>
              .
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    <th className="py-3 pr-4 font-semibold text-ink">Nome</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Dominio</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Finalità</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Durata</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top font-mono text-xs">_gcl_au</td>
                    <td className="py-3 pr-4 align-top">Prima parte (hr0.it)</td>
                    <td className="py-3 pr-4 align-top">
                      Collega la visita al clic sull'annuncio per attribuire la conversione (Conversion Linker)
                    </td>
                    <td className="py-3 pr-4 align-top">90 giorni</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top font-mono text-xs">_gcl_aw, _gcl_dc</td>
                    <td className="py-3 pr-4 align-top">Prima parte (hr0.it)</td>
                    <td className="py-3 pr-4 align-top">
                      Installati solo se si arriva da un annuncio Google; conservano l'identificativo del clic
                    </td>
                    <td className="py-3 pr-4 align-top">90 giorni</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top font-mono text-xs">IDE</td>
                    <td className="py-3 pr-4 align-top">doubleclick.net</td>
                    <td className="py-3 pr-4 align-top">
                      Misurazione dell'efficacia degli annunci e associazione delle azioni compiute sul sito
                    </td>
                    <td className="py-3 pr-4 align-top">13 mesi</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top font-mono text-xs">test_cookie</td>
                    <td className="py-3 pr-4 align-top">doubleclick.net</td>
                    <td className="py-3 pr-4 align-top">
                      Verifica che il browser accetti i cookie
                    </td>
                    <td className="py-3 pr-4 align-top">15 minuti</td>
                  </tr>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top font-mono text-xs">NID</td>
                    <td className="py-3 pr-4 align-top">google.com</td>
                    <td className="py-3 pr-4 align-top">
                      Memorizza preferenze e informazioni per la personalizzazione degli annunci
                    </td>
                    <td className="py-3 pr-4 align-top">6 mesi</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="mt-8 text-base font-semibold text-ink">
              Contenuti di terza parte incorporati
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-hairline text-left">
                    <th className="py-3 pr-4 font-semibold text-ink">Servizio</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Fornitore</th>
                    <th className="py-3 pr-4 font-semibold text-ink">Funzione e trattamento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-hairline">
                    <td className="py-3 pr-4 align-top">YouTube</td>
                    <td className="py-3 pr-4 align-top">Google Ireland Ltd.</td>
                    <td className="py-3 pr-4 align-top">
                      Riproduzione del video di presentazione. Il video è incorporato in modalità
                      senza cookie (<span className="font-mono text-xs">youtube-nocookie.com</span>) e
                      viene caricato solo dopo che l'utente ha premuto play: fino a quel momento non
                      viene inviata alcuna richiesta a Google. La riproduzione non installa cookie di
                      profilazione, ma comporta la comunicazione a Google dell'indirizzo IP.{" "}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand underline"
                      >
                        Informativa
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 rounded-xl border border-hairline bg-surface p-5">
              <p className="text-sm font-semibold text-ink">Nessun altro strumento di terza parte</p>
              <p className="mt-2 text-sm">
                Il sito non utilizza pixel di Meta o LinkedIn, né mappe, widget social o piattaforme di
                chat. I caratteri tipografici sono ospitati direttamente sui nostri server e non
                caricati da Google Fonts: nessuna richiesta viene quindi inviata a terzi per la sola
                visualizzazione delle pagine.
              </p>
            </div>
          </Section>

          <Section title="4. Trasferimenti extra UE">
            <p>
              Il tag di Google Ads e l'eventuale riproduzione del video incorporato possono comportare il trasferimento di dati personali verso gli Stati Uniti. Google LLC aderisce al{" "}
              <a
                href="https://www.dataprivacyframework.gov/"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline"
              >
                EU-U.S. Data Privacy Framework
              </a>
              , oggetto della decisione di adeguatezza della Commissione europea del 10 luglio 2023; i trasferimenti avvengono inoltre sulla base delle Clausole Contrattuali Standard adottate dalla Commissione. Il titolare del trattamento europeo è Google Ireland Ltd.
            </p>
          </Section>

          <Section title="5. Come gestire o revocare il consenso">
            <h3 className="text-lg font-semibold text-ink">Tramite il banner del sito</h3>
            <p className="mt-3">
              Al primo accesso viene mostrato un banner che consente di accettare tutti i cookie, rifiutarli tutti o scegliere per singola categoria. Nessuna opzione è preselezionata e il banner non può essere chiuso senza esprimere una scelta: la semplice prosecuzione della navigazione non comporta alcun consenso. Fino a quel momento non viene installato alcuno strumento di profilazione.
            </p>
            <p className="mt-3">
              È possibile modificare o revocare in qualsiasi momento le preferenze espresse tramite il link <strong className="text-ink">"Preferenze cookie"</strong> presente nel footer del sito, oppure con il pulsante qui sotto. La revoca non pregiudica la liceità del trattamento effettuato prima della revoca stessa.
            </p>

            {GOOGLE_ADS_ID ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={openConsentPreferences}
                  className="inline-flex cursor-pointer items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Gestisci le preferenze sui cookie
                </button>
              </div>
            ) : null}

            <p className="mt-5">
              La scelta espressa viene conservata per sei mesi, decorsi i quali il banner viene nuovamente proposto. Il banner ricompare inoltre in caso di modifica degli strumenti di tracciamento utilizzati, poiché un consenso prestato su un'informativa diversa da quella vigente non può considerarsi informato.
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
