import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Target,
  MessagesSquare,
  BadgeEuro,
  Workflow,
  ShieldCheck,
  PiggyBank,
} from "lucide-react";
import { AnnouncementBar } from "@/components/landing/AnnouncementBar";
import { CostCalculator } from "@/components/landing/CostCalculator";
import { CtaButton } from "@/components/landing/CtaButton";
import { Card } from "@/components/landing/Card";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { Section, H2, Eyebrow } from "@/components/landing/Section";
import { LogoCloud } from "@/components/landing/LogoCloud";
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
  { icon: <Target />, t: "Cerchi «un commerciale», non competenze", d: "Arrivano CV fuori target." },
  { icon: <MessagesSquare />, t: "Colloqui-chiacchierata", d: "Assumi chi ti piace, non chi rende." },
  { icon: <BadgeEuro />, t: "Offerta fatta a occhio", d: "Il candidato buono rifiuta. O accetta e se ne va." },
];

const passi = [
  { n: "1", t: "Fotografiamo come assumi oggi", d: "Chi se ne occupa, con quali strumenti, con quali risultati." },
  { n: "2", t: "Quantifichiamo il costo nascosto", d: "Ruoli scoperti, assunzioni sbagliate, il tuo tempo: tutto in un numero." },
  { n: "3", t: "Ti do una lettura onesta", d: "Dove intervenire per primo. Se posso aiutarti te lo dico. Se non è il caso, te lo dico lo stesso." },
];

const fiducia = [
  { icon: <Workflow />, t: "Metodo, non CV a mucchi", d: "Job description a competenze, colloqui strutturati, scorecard.", highlight: false },
  { icon: <ShieldCheck />, t: "Garanzia di sostituzione", d: "Se la persona lascia entro 6 mesi, riattivo la ricerca senza costi. Il rischio non è sulle tue spalle.", highlight: true },
  { icon: <PiggyBank />, t: "Formazione quasi a costo zero", d: "Finanziabile con i Fondi Interprofessionali che già versi.", highlight: false },
];

const bioBadges = [
  "11+ anni in HR, selezione e organizzazione",
  "Collaborato con +24 realtà aziendali",
  "Garanzia di sostituzione su ogni inserimento",
];

const faq = [
  { q: "È davvero gratis? Dov'è la fregatura?", a: "È gratis perché è il mio modo di farmi conoscere. Se dal check-up emerge che posso esserti utile, ti farò una proposta. Se non emerge, ti sarai portato a casa i tuoi numeri. Fine." },
  { q: "Non ho tempo.", a: "30 minuti, in videocall, quando vuoi tu. Se passi anche solo 2 giorni al mese dietro ai CV, questi 30 minuti sono l'investimento con il miglior ritorno del tuo trimestre." },
  { q: "Faccio già col passaparola e funziona.", a: "Il passaparola non è gratis: lo paghi nei mesi di ruolo scoperto e nelle assunzioni sbagliate. Il check-up ti dice esattamente quanto. Poi decidi tu se è un prezzo accettabile." },
  { q: "Ho già provato con un'agenzia, malissimo.", a: "Ottimo, allora sai già cosa NON vuoi. Io non ti mando CV a mucchi: ti do un metodo e, se serve, lo eseguo con te." },
];

function CtaBlock({ dark = false }: { dark?: boolean }) {
  return (
    <div className="mx-auto mt-12 flex max-w-md flex-col items-center gap-3">
      <CtaButton href="/check-up">Prenota il check-up gratuito</CtaButton>
      <p className={`text-center text-sm ${dark ? "text-white/60" : "text-ink-soft"}`}>
        Nessuna newsletter · Nessun impegno · Rispondo io, non un commerciale
      </p>
    </div>
  );
}

function CostoPage() {
  return (
    <main className="bg-surface pb-24 md:pb-0">
      <AnnouncementBar tag="NUOVO">
        Solo 4 check-up gratuiti a settimana ·{" "}
        <a href="/check-up" className="text-brand underline underline-offset-2">Prenota il tuo posto</a>
      </AnnouncementBar>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden px-5 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(107,33,255,0.08),transparent_65%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr] md:gap-14">
          <div className="text-center md:text-left">
            <Eyebrow>Per titolari e amministratori di PMI</Eyebrow>
            <h1 className="text-[40px] leading-[1.05] sm:text-[56px] md:text-[62px] text-ink">
              Un'assunzione sbagliata ti costa fino a{" "}
              <span className="text-danger">18.000€</span>.
            </h1>
            <p className="mx-auto mt-7 max-w-xl text-lg text-ink-soft sm:text-xl md:mx-0">
              Ruoli scoperti, persone che se ne vanno, il tuo tempo bruciato tra
              CV e colloqui. In 30 minuti calcoliamo insieme il tuo costo
              nascosto.
            </p>
            <div className="mt-8 flex max-w-md flex-col items-center gap-3 md:items-start">
              <CtaButton href="/check-up">Prenota il check-up gratuito</CtaButton>
              <p className="text-sm text-ink-soft">
                30 min · Nessun impegno · Numeri tuoi da tenere
              </p>
            </div>
            <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
              {[
                "11+ anni di esperienza",
                "+24 realtà aziendali",
                "6 mesi garanzia sostituzione",
              ].map((t) => (
                <li key={t} className="inline-flex items-center gap-2 text-sm text-ink-soft">
                  <Check className="h-4 w-4 shrink-0 text-brand" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-3 rotate-3 rounded-[28px] bg-info-bg" aria-hidden />
            <div className="relative overflow-hidden rounded-[24px] border border-hairline bg-white shadow-[0_24px_60px_-30px_rgba(20,20,40,0.35)]">
              <img
                src="/calculator-hero.png"
                alt="Calcolatore del costo nascosto delle assunzioni"
                className="aspect-square w-full object-cover"
              />
              <div className="border-t border-hairline p-5">
                <p className="text-sm font-semibold text-ink">Il tuo costo nascosto</p>
                <p className="mt-1 text-sm text-ink-soft">
                  In 30 minuti trasformiamo i numeri della tua azienda in una stima concreta.
                </p>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-hairline bg-white px-4 py-3 shadow-lg sm:block">
              <p className="display text-2xl text-danger">18.000€</p>
              <p className="text-xs text-ink-soft">per ogni assunzione sbagliata</p>
            </div>
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

      {/* Chi fa il check-up */}
      <Section className="bg-white border-t border-hairline !py-14 sm:!py-16">
        <div className="grid items-center gap-8 md:grid-cols-[220px_1fr] lg:grid-cols-[260px_1fr] lg:gap-12">
          <div className="relative mx-auto w-full max-w-[220px] md:mx-0">
            <div className="absolute -inset-2 rotate-2 rounded-2xl bg-info-bg" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-hairline bg-white shadow-lg">
              <img
                src="/Photo.png"
                alt="Michele Baroni, consulente HR per PMI"
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0">
            <Eyebrow>Chi fa il check-up</Eyebrow>
            <p className="mt-4 text-lg text-ink-soft">
              Sono <span className="font-semibold text-ink">Michele Baroni</span>: 11 anni
              tra <span className="font-semibold text-ink">Accenture</span> e ricerche di
              personale come partner freelance di{" "}
              <span className="font-semibold text-ink">Bain &amp; Company</span>. Oggi porto
              quel metodo nelle PMI — e il check-up lo faccio io, di persona.
            </p>
            <ul className="mt-5 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {bioBadges.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm font-semibold text-ink">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* Logo aziende */}
      <Section className="bg-info-bg border-t border-hairline !py-14 sm:!py-16">
        <div className="text-center">
          <Eyebrow>Social proof</Eyebrow>
          <H2 className="text-ink">Aziende con cui ho collaborato</H2>
        </div>
        <div className="mt-8">
          <LogoCloud size="lg" />
        </div>
      </Section>

      {/* Agitazione */}
      <Section className="bg-white border-t border-hairline">
        <div className="grid gap-10 md:grid-cols-[3fr_2fr] md:items-center">
          <div>
            <H2>
              Le aziende che crescono hanno un metodo strutturato per la
              selezione del personale.
            </H2>
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
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {errori.map((e) => (
            <Card key={e.t} title={e.t} icon={e.icon}>{e.d}</Card>
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
        <CtaBlock />
      </Section>

      {/* Fiducia */}
      <Section className="bg-white border-t border-hairline">
        <H2>Non sono un'agenzia. E questo cambia tutto.</H2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {fiducia.map((f) => (
            <Card key={f.t} title={f.t} icon={f.icon} highlight={f.highlight}>
              {f.d}
            </Card>
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
        <CtaBlock dark />
      </Section>

      <Footer />
      <StickyMobileCta />
    </main>
  );
}
