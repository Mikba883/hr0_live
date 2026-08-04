import { createFileRoute } from "@tanstack/react-router";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { CostCalculator } from "@/components/landing/CostCalculator";
import { CtaButton } from "@/components/landing/CtaButton";
import { Card } from "@/components/landing/Card";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { Section, H2, Eyebrow } from "@/components/landing/Section";
import { StickyMobileCta } from "@/components/landing/StickyMobileCta";

export const Route = createFileRoute("/costo")({
  head: () => ({
    meta: [
      { title: "Quanto ti costa un'assunzione sbagliata? | Check-up gratuito" },
      { name: "description", content: "In 30 minuti calcoliamo il costo nascosto delle tue assunzioni: ruoli scoperti, persone sbagliate, tempo perso. Check-up gratuito." },
      { property: "og:title", content: "Quanto ti costa un'assunzione sbagliata?" },
      { property: "og:description", content: "Check-up gratuito di 30 minuti. Esci con i tuoi numeri, che lavoriamo insieme o no." },
      { property: "og:url", content: "https://hr0-sparkle-connect.lovable.app/costo" },
    ],
    links: [{ rel: "canonical", href: "https://hr0-sparkle-connect.lovable.app/costo" }],
  }),
  component: CostoPage,
});

const errori = [
  { t: "Cercare «un commerciale» invece di competenze precise", d: "Arrivano CV fuori target." },
  { t: "Colloqui-chiacchierata invece di interviste strutturate", d: "Si assume chi piace, non chi rende." },
  { t: "Offerta a occhio invece che sui valori di mercato", d: "Il candidato buono rifiuta, o accetta e se ne va." },
];

const passi = [
  { n: "1", t: "Fotografiamo come assumi oggi", d: "Chi se ne occupa, con quali strumenti, con quali risultati." },
  { n: "2", t: "Quantifichiamo il costo nascosto", d: "Ruoli scoperti, assunzioni sbagliate, il tuo tempo: tutto in un numero." },
  { n: "3", t: "Ti do una lettura onesta", d: "Dove intervenire per primo. Se posso aiutarti te lo dico. Se non è il caso, te lo dico lo stesso." },
];

const fiducia = [
  { t: "Lavoro sul metodo, non sui CV a mucchi", d: "Job description a competenze, colloqui strutturati, valutazione oggettiva con scorecard. Il processo che usano le multinazionali, tarato sulla tua PMI." },
  { t: "Garanzia di sostituzione", d: "Se il candidato inserito lascia entro 6 mesi, riattivo la ricerca senza costi aggiuntivi. Il rischio non è sulle tue spalle." },
  { t: "Formazione quasi a costo zero", d: "La componente formativa dei miei percorsi è finanziabile con i Fondi Interprofessionali. Soldi che la tua azienda ha già versato e che quasi certamente non sta usando." },
];

const faq = [
  { q: "È davvero gratis? Dov'è la fregatura?", a: "È gratis perché è il mio modo di farmi conoscere. Se dal check-up emerge che posso esserti utile, ti farò una proposta. Se non emerge, ti sarai portato a casa i tuoi numeri. Fine." },
  { q: "Non ho tempo.", a: "30 minuti, in videocall, quando vuoi tu. Se passi anche solo 2 giorni al mese dietro ai CV, questi 30 minuti sono l'investimento con il miglior ritorno del tuo trimestre." },
  { q: "Faccio già col passaparola e funziona.", a: "Il passaparola non è gratis: lo paghi nei mesi di ruolo scoperto e nelle assunzioni sbagliate. Il check-up ti dice esattamente quanto. Poi decidi tu se è un prezzo accettabile." },
  { q: "Ho già provato con un'agenzia, malissimo.", a: "Ottimo, allora sai già cosa NON vuoi. Io non ti mando CV a mucchi: ti do un metodo e, se serve, lo eseguo con te." },
];

function CostoPage() {
  return (
    <main className="bg-surface pb-24 md:pb-0">
      <AnnouncementBar tag="NUOVO">
        Solo 4 check-up gratuiti a settimana ·{" "}
        <a href="/check-up" className="text-brand underline underline-offset-2">Prenota il tuo posto</a>
      </AnnouncementBar>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden px-5 pt-20 pb-20 sm:pt-32 sm:pb-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(107,33,255,0.08),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-5xl text-center">
          <Eyebrow>Per titolari e amministratori di PMI</Eyebrow>
          <h1 className="text-[40px] leading-[1.05] sm:text-[56px] md:text-[68px] text-ink">
            Un'assunzione sbagliata ti costa fino a{" "}
            <span className="text-danger">18.000€</span>.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-ink-soft sm:text-xl">
            Ruoli scoperti, persone che se ne vanno, il tuo tempo bruciato tra CV
            e colloqui. In 30 minuti calcoliamo insieme il tuo costo nascosto —
            gratis.
          </p>
          <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
            <CtaButton href="#calcolatore">Calcola il tuo costo →</CtaButton>
            <p className="text-sm text-ink-soft">
              30 min · Nessun impegno · Numeri tuoi da tenere
            </p>
          </div>
        </div>
      </section>

      {/* Calcolatore */}
      <Section>
        <H2>Fai due conti, adesso</H2>
        <p className="mt-4 max-w-2xl text-lg text-ink-soft">
          Non fidarti di me. Fidati dei tuoi numeri. Muovi i cursori:
        </p>
        <div className="mt-8">
          <CostCalculator />
        </div>
      </Section>

      {/* Agitazione */}
      <Section className="bg-white border-t border-hairline">
        <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-center">
          <div>
            <H2>Non è colpa tua. È che nessuno ti ha mai dato un metodo.</H2>
            <div className="mt-6 space-y-4 text-lg text-ink-soft">
              <p>
                Il 90% delle PMI assume così: passaparola, un annuncio online,
                colloqui «a sensazione», offerta fatta a occhio. Funziona — finché
                non funziona più.
              </p>
              <p>
                Poi la posizione resta scoperta 4 mesi. Oppure la persona giusta
                rifiuta l'offerta. Oppure quella assunta se ne va dopo 90 giorni e si
                ricomincia da capo, con la ricerca da rifare e la formazione buttata.
              </p>
              <p>
                L'agenzia ti chiede il 25% della RAL per tre CV presi da
                LinkedIn. Io ti chiudo il ruolo — e ti lascio il metodo per non
                richiamarla mai più.
              </p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rotate-2 rounded-2xl bg-info-bg" aria-hidden />
            <div className="relative rounded-2xl border border-hairline bg-white p-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-soft">
                Il conto tipico di una PMI
              </p>
              <dl className="mt-5 space-y-5">
                <div>
                  <dt className="display text-4xl text-danger">4 mesi</dt>
                  <dd className="mt-1 text-sm text-ink-soft">di ruolo scoperto, in media</dd>
                </div>
                <div>
                  <dt className="display text-4xl text-danger">18.000€</dt>
                  <dd className="mt-1 text-sm text-ink-soft">per ogni assunzione sbagliata</dd>
                </div>
                <div>
                  <dt className="display text-4xl text-danger">20-25%</dt>
                  <dd className="mt-1 text-sm text-ink-soft">della RAL in fee, a ogni ricerca in agenzia</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {errori.map((e) => (
            <Card key={e.t} title={e.t}>{e.d}</Card>
          ))}
        </div>
      </Section>

      {/* Soluzione */}
      <Section>
        <H2>Il Check-up Assunzioni: 30 minuti per vedere dove perdi soldi</H2>
        <p className="mt-4 max-w-3xl text-lg text-ink-soft">
          Non è una call di vendita travestita. È una diagnosi vera, con un
          metodo preciso:
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {passi.map((p) => (
            <div key={p.n} className="rounded-2xl border border-hairline bg-white p-6">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-semibold text-white">
                {p.n}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-ink">{p.t}</h3>
              <p className="text-ink-soft">{p.d}</p>
            </div>
          ))}
        </div>
        <blockquote className="mt-10 border-l-4 border-brand pl-6 text-xl italic text-ink">
          «Alla fine della call hai i tuoi numeri nero su bianco. Sono tuoi, te
          li tieni comunque — che lavoriamo insieme o no.»
        </blockquote>
      </Section>

      {/* Fiducia */}
      <Section className="bg-white border-t border-hairline">
        <H2>Non sono un'agenzia. E questo cambia tutto.</H2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {fiducia.map((f) => (
            <Card key={f.t} title={f.t}>{f.d}</Card>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section>
        <H2>Le domande che ti stai facendo</H2>
        <div className="mt-8">
          <Faq items={faq} />
        </div>
      </Section>

      {/* CTA finale */}
      <Section className="bg-ink">
        <div className="mx-auto max-w-2xl text-center">
          <H2 className="text-white">Scopri il tuo numero. Poi decidi.</H2>
          <p className="mt-4 text-lg text-white/70">
            Prendo massimo 4 check-up a settimana, perché li faccio io
            personalmente e li preparo uno per uno.
          </p>
        </div>
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4">
          <CtaButton href="/check-up">Prenota il tuo check-up gratuito →</CtaButton>
          <p className="text-sm text-white/60">
            2 minuti di survey · Ti richiamo entro 48 ore
          </p>
        </div>
      </Section>

      <Footer />
      <StickyMobileCta />
    </main>
  );
}
