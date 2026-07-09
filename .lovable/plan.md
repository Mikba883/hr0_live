# Landing Pages "Check-up Assunzioni"

Costruisco due landing page indipendenti in italiano (`/costo` e `/metodo`), niente homepage, niente menu, una sola azione per pagina: prenotare la call. Stack: TanStack Start + React + Tailwind v4 (già presenti nel progetto).

## Struttura file

```text
src/routes/
  __root.tsx              (aggiorno: meta base, font Inter, rimuovo og:image placeholder)
  index.tsx               (redirect a /costo — evita 404 sulla root)
  costo.tsx               (landing angolo economico)
  metodo.tsx              (landing angolo processo)
  privacy.tsx             (placeholder)
  cookie.tsx              (placeholder)
src/components/landing/
  Hero.tsx
  CtaButton.tsx
  Section.tsx
  Card.tsx
  Faq.tsx                 (accordion via <details>/<summary>)
  LeadForm.tsx            (3 campi + stato "Richiesta ricevuta")
  StickyMobileCta.tsx     (appare dopo lo scroll oltre hero)
  Footer.tsx              (minimale: nome/P.IVA/Privacy/Cookie)
  CostCalculator.tsx      (solo /costo, stato React, formula live)
  ProcessTimeline.tsx     (solo /metodo, 6 step)
src/styles.css            (aggiungo token colore + Inter via @theme)
```

Font Inter caricato con `<link>` nell'head del root (regola Tailwind v4: mai `@import` remoto in CSS).

## Design system (in `src/styles.css` via `@theme`)

- `--color-background: #FAFAFA`
- `--color-foreground: #1A1A1A`
- `--color-accent: #1E5AA8` (CTA, icone, numeri chiave)
- `--color-danger: #D32F2F` (solo numeri di costo su /costo)
- `--color-border: #E5E5E5`
- `--font-sans: "Inter", system-ui, sans-serif` — pesi 400 e 600
- Bottoni CTA: pieni blu, testo bianco, `rounded-md`, full-width mobile, microcopy sotto
- Card: bordo grigio sottile, nessuna ombra pesante
- H1: 48px desktop / 32px mobile, body 18px, line-height generosa

## Pagina `/costo`

Head: title "Quanto ti costa un'assunzione sbagliata? | Check-up gratuito", meta description + og:title/description coerenti, canonical self-referencing, `og:type: website`. Niente og:image.

Sezioni nell'ordine, con i testi ESATTI dal copy:
1. Hero + CTA "Calcola il tuo costo nascosto →" (smooth scroll al calcolatore)
2. `CostCalculator` — 4 slider controllati:
   - RAL 25.000–80.000 (step 5.000, default 40.000)
   - Mesi scoperti 1–12 (default 4)
   - Assunzioni sbagliate 0–5 (default 1)
   - Giorni/mese 0–6 (default 2)
   - Formule: `scoperto = RAL*1.5/12*mesi`, `sbagliate = n*RAL*0.35`, `tempo = giorni*12*500`
   - Totale annuo in rosso 56px, formato `it-IT` con `€`, aggiornato in tempo reale. Sotto: le 3 voci separate + frase + CTA "Voglio capire come ridurlo →" → scroll al form
3. Agitazione — H2 + paragrafo + 3 card errori tipici
4. Soluzione — H2 + 3 step orizzontali numerati + blockquote
5. Fiducia — H2 + 3 card (metodo / garanzia 6 mesi / fondi)
6. FAQ accordion (4 domande)
7. CTA finale — H2 + scarsità reale "max 4 a settimana" + `LeadForm`

## Pagina `/metodo`

Head: title "Assumere senza agenzie: impara il metodo | Check-up gratuito" + meta/og coerenti + canonical self.

Sezioni:
1. Hero + CTA "Scopri il metodo — check-up gratuito →" → scroll al form
2. Le 3 opzioni attuali — 3 card + frase ponte
3. La quarta via — H2 + paragrafo + 3 card risultati + `ProcessTimeline` verticale con i 6 titoli
4. Fondi Interprofessionali — H2 + paragrafi + box azzurro chiaro con 💡
5. Per chi è / non è — due colonne ✅/❌
6. FAQ accordion (4 domande)
7. CTA finale — H2 + `LeadForm`

## Componenti condivisi — comportamenti

- **`CtaButton`**: `<a href="#form">` con smooth scroll via CSS (`html { scroll-behavior: smooth }`) — no JS libraries
- **`LeadForm`**: campi Nome/Cognome, Azienda, Email o telefono. `onSubmit` → stato locale mostra "Richiesta ricevuta — ti ricontatto entro 24 ore". Nel codice lascio un commento `// TODO: collegare Calendly / webhook` per il futuro
- **`Faq`**: `<details><summary>` nativo, accessibile, zero JS
- **`StickyMobileCta`**: `IntersectionObserver` sull'hero — quando esce dal viewport, mostra barra fissa `bottom-0` con bottone "Prenota il check-up gratuito" (solo `md:hidden`)
- **`Footer`**: `[NOME ATTIVITÀ]`, `P.IVA [XXXXXXXXX]`, link a `/privacy` e `/cookie` (placeholder). Nessun sitemap, nessun link esterno

## Fuori scopo (esplicito)

- Nessuna integrazione Supabase / backend — il form è client-only con placeholder di conferma
- Nessuna homepage, nessuna nav, nessun popup / exit intent / countdown
- Nessuna immagine (solo icone `lucide-react` già installato)
- Privacy/Cookie: solo pagine placeholder con titolo e testo "Contenuto da inserire"

## Dettagli tecnici

- Route file naming TanStack: `src/routes/costo.tsx` → `createFileRoute("/costo")`, idem `/metodo`, `/privacy`, `/cookie`
- `src/routes/index.tsx`: componente minimo che fa `throw redirect({ to: "/costo" })` nel `beforeLoad`, così la root non è una pagina morta ma non c'è "homepage" visibile
- `routeTree.gen.ts` rigenerato automaticamente dal plugin Vite — non lo tocco a mano
- Font Inter: `<link rel="preconnect">` + `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap">` dentro `head().links` del root
