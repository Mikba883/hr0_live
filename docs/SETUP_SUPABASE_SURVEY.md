# Setup Supabase — tabella `survey_responses`

Quando qualcuno completa il check-up su `/check-up`, le risposte vengono salvate in
una tabella su Supabase. Questa guida serve a creare quella tabella e a rileggere le
risposte dal **Table Editor**.

Il progetto usa un Supabase **esterno** (BYO): le migration non partono da sole, lo SQL
va incollato a mano una volta sola.

- Progetto: `hr0` — project ID `uqmznxisgcaljifwbbnq` (regione `eu-central-1`)
- Tabella: `public.survey_responses`
- Codice che scrive: `src/routes/check-up.tsx` → `salvaCheckUp()` in `src/lib/checkup.ts`

---

## 1. Crea (o ripara) la tabella

Vai su **Supabase → SQL Editor → New query**, incolla tutto il blocco qui sotto e premi
**Run**.

Lo script è sicuro da rilanciare quante volte vuoi: se la tabella esiste già non la
tocca, se le manca qualche colonna la aggiunge, e non cancella mai i dati.

```sql
-- 1. Tabella
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Blocco 1 — Chi sei
  nome text not null,
  azienda text not null,
  ruolo text not null,
  email text not null,
  telefono text not null,

  -- Blocco 2 — La tua azienda
  dipendenti text not null,
  settore text not null,
  assumere_12m text not null,
  momento_azienda text not null,

  -- Blocco 3 — La ricerca
  ruolo_aperto text not null,
  ruolo_quale text,
  urgenza text,
  tempo_scoperto text,
  prima_volta text,
  chi_se_ne_occupa text not null,
  frustrazioni text[] not null default '{}',

  -- Chiusura
  obiettivo_call text,
  orario_preferito text,

  -- Privacy + tracking
  consenso_privacy boolean not null default false,
  source text,
  utm jsonb
);

-- 2. Riparazione: aggiunge le colonne eventualmente mancanti
--    (utile se in passato avevi creato una versione parziale della tabella)
alter table public.survey_responses
  add column if not exists nome text,
  add column if not exists azienda text,
  add column if not exists ruolo text,
  add column if not exists email text,
  add column if not exists telefono text,
  add column if not exists dipendenti text,
  add column if not exists settore text,
  add column if not exists assumere_12m text,
  add column if not exists momento_azienda text,
  add column if not exists ruolo_aperto text,
  add column if not exists ruolo_quale text,
  add column if not exists urgenza text,
  add column if not exists tempo_scoperto text,
  add column if not exists prima_volta text,
  add column if not exists chi_se_ne_occupa text,
  add column if not exists frustrazioni text[] default '{}',
  add column if not exists obiettivo_call text,
  add column if not exists orario_preferito text,
  add column if not exists consenso_privacy boolean default false,
  add column if not exists source text,
  add column if not exists utm jsonb;

-- 3. Indice: le risposte più recenti in cima, senza rallentare il Table Editor
create index if not exists survey_responses_created_at_idx
  on public.survey_responses (created_at desc);

-- 4. Permessi Data API (PostgREST)
--    Anche `authenticated`: se apri il check-up nello stesso browser in cui sei
--    loggato su /admin, senza questo permesso la tua prova verrebbe rifiutata.
grant insert on public.survey_responses to anon, authenticated;
grant all on public.survey_responses to service_role;

-- 5. Sicurezza: chiunque può inviare il form, nessuno può leggere i lead dall'esterno
alter table public.survey_responses enable row level security;

drop policy if exists "public can insert survey" on public.survey_responses;
create policy "public can insert survey"
  on public.survey_responses
  for insert
  to anon, authenticated
  with check (true);
```

> **Perché nessuno può leggere:** la chiave `VITE_SUPABASE_PUBLISHABLE_KEY` è pubblica —
> chiunque apra il sito può leggerla dal browser. Per questo alla tabella diamo solo il
> permesso di **insert**: il form scrive, ma quella chiave non può tirare fuori i dati
> dei tuoi lead. Tu li leggi dal Table Editor, loggato col tuo account, dove la RLS non
> si applica.

---

## 2. Verifica che funzioni

### Controllo veloce (dalla dashboard)

**Table Editor → schema `public`** → deve comparire `survey_responses` con tutte le
colonne. Poi apri `/check-up` sul sito, compila il form fino in fondo: se ti porta alla
pagina `/grazie` senza errori, la riga è salvata. Torna sul Table Editor e premi
**Refresh**: la vedi in cima.

Se invece compare il messaggio _"Non sono riuscito a salvare le tue risposte"_, la
scrittura è fallita: sotto al messaggio c'è la **riga tecnica** che dice quale dei
guasti qui sotto è, e la stessa riga finisce nella console del browser (F12).

| Cosa leggi nella riga tecnica | Cosa fare |
| --- | --- |
| `PGRST205 · Could not find the table` | La tabella non esiste: esegui lo SQL del punto 1. |
| `PGRST204` / `column ... does not exist` | Allo schema manca una colonna: rilancia lo SQL del punto 1. |
| `42501` / `row-level security` | Mancano permesso o policy di insert: rilancia lo SQL del punto 1. |
| `Invalid API key` | La chiave pubblica su quell'ambiente è sbagliata o scaduta. |
| `Mancano VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY` | Le variabili non sono impostate sull'ambiente pubblicato (vedi in fondo). |

> **Il form scrive sempre come visitatore anonimo.** `src/lib/checkup.ts` chiama la Data
> API con la sola chiave pubblica invece di usare il client condiviso di
> `src/lib/supabase.ts`. Quel client tiene in memoria la sessione di chi ha fatto login
> su `/admin` e la allegherebbe anche a questa scrittura: la riga arriverebbe a Postgres
> come utente `authenticated` mentre la policy qui sopra parla di `anon`, e il check-up
> risulterebbe rotto solo per te, solo nel browser in cui sei loggato.

### Controllo dal terminale

In locale, con il `.env` compilato:

```bash
bun run check:supabase
```

Ti dice in chiaro se la tabella esiste, se i permessi sono impostati bene e se i dati
dei lead sono al sicuro. Con `--insert-test` prova anche una scrittura reale:

```bash
bun run check:supabase --insert-test
```

Inserisce una riga di prova con nome `TEST — verifica setup`, che puoi cancellare dal
Table Editor con due click.

---

## 3. Leggere le risposte

**Table Editor → `survey_responses`**, ordina per `created_at` decrescente per avere i
lead più recenti in cima. Le colonne utili per richiamare sono `nome`, `azienda`,
`telefono`, `email`, e `urgenza` per capire chi ha fretta.

Per esportare tutto in CSV: menu `⋯` in alto a destra della tabella → **Export data as
CSV**.

Se preferisci una lettura ragionata, in **SQL Editor** puoi lanciare:

```sql
select
  created_at,
  nome,
  azienda,
  telefono,
  email,
  ruolo_aperto,
  ruolo_quale,
  urgenza,
  frustrazioni,
  obiettivo_call
from public.survey_responses
order by created_at desc;
```

---

## Variabili d'ambiente

Sia il form (`src/lib/checkup.ts`) sia l'area riservata (`src/lib/supabase.ts`) leggono
due variabili dal `.env`, che **non** viene committato:

```
VITE_SUPABASE_URL=https://uqmznxisgcaljifwbbnq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
```

Le trovi in **Project Settings → API Keys**. Ricordati di impostarle anche
sull'ambiente di produzione (Lovable): senza, `/admin` non parte proprio e il check-up
si compila ma non salva, dicendotelo nella riga tecnica sotto l'errore.
