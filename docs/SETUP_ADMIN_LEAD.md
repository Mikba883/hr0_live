# Setup pagina lead — `/admin`

La pagina `/admin` ti fa vedere chi ha compilato il check-up, ti dice chi richiamare per
primo, e ti lascia portare avanti ogni trattativa fino a vinta o persa.

Prerequisito: la tabella `survey_responses` deve già esistere e ricevere le risposte
(vedi `SETUP_SUPABASE_SURVEY.md`).

> **Dopo questa guida, vai su `SETUP_CRM_AGENDA.md`**: aggiunge l'agenda delle cose
> da fare e lo storico delle azioni, cioè le due parti che rendono la pagina
> utilizzabile tutti i giorni invece che solo consultabile.

Serve una cosa in più: **decidere chi può leggere**. La chiave
`VITE_SUPABASE_PUBLISHABLE_KEY` è pubblica e visibile a chiunque apra il sito, quindi non
può servire per leggere i lead. La pagina usa un login vero (Supabase Auth) e il database
controlla che chi chiede i dati sia in un elenco di amministratori che decidi tu.

---

## 1. SQL — pipeline e permessi di lettura

**Supabase → SQL Editor → New query**, incolla, **Run**.

Questo blocco è **rilanciabile quante volte vuoi senza perdere dati**: aggiunge quello che
manca e lascia stare il resto. Se avevi già eseguito una versione precedente di questa
guida, rilancialo — porta lo schema all'ultima versione, incluso il passaggio da "Cliente"
a "Vinto".

> Nel blocco `insert into public.admin_users` **sostituisci `TUA-EMAIL@esempio.it`**
> con l'email con cui farai il login.

```sql
-- 1. Campi per gestire il lead nel tempo
alter table public.survey_responses
  add column if not exists stato text not null default 'nuovo',
  add column if not exists note text,
  add column if not exists contattato_at timestamptz,
  add column if not exists motivo_perdita text,
  add column if not exists prossimo_contatto date,
  add column if not exists chiuso_at timestamptz;

-- 2. Stati della pipeline.
--    Il vincolo va tolto PRIMA di rinominare, altrimenti l'update lo violerebbe.
alter table public.survey_responses
  drop constraint if exists survey_responses_stato_check;

update public.survey_responses set stato = 'vinto' where stato = 'cliente';

alter table public.survey_responses
  add constraint survey_responses_stato_check
  check (stato in ('nuovo', 'contattato', 'fissato', 'vinto', 'perso'));

-- 3. Indice sui follow-up aperti, per la vista "da richiamare"
create index if not exists survey_responses_prossimo_contatto_idx
  on public.survey_responses (prossimo_contatto)
  where prossimo_contatto is not null;

-- 4. Chi è amministratore
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Nessuno può leggere questa tabella dalle API: si consulta solo dalla dashboard.
alter table public.admin_users enable row level security;

insert into public.admin_users (email)
values ('TUA-EMAIL@esempio.it')
on conflict (email) do nothing;

-- 5. Il controllo "sei un admin?"
--    security definer: la funzione legge admin_users con i propri permessi,
--    altrimenti la RLS del punto 4 la bloccherebbe.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 6. Lettura e modifica riservate agli admin autenticati
grant select, update on public.survey_responses to authenticated;

drop policy if exists "admins can read survey" on public.survey_responses;
create policy "admins can read survey"
  on public.survey_responses
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can update survey" on public.survey_responses;
create policy "admins can update survey"
  on public.survey_responses
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
```

Deve rispondere **"Success. No rows returned"**.

La policy di inserimento pubblica creata nell'altra guida non viene toccata: il form
continua a funzionare per i visitatori.

## 2. Crea il tuo utente

**Supabase → Authentication → Users → Add user → Create new user.**

Usa la **stessa email** che hai messo in `admin_users`, scegli una password e attiva
**Auto Confirm User** (altrimenti resti in attesa di una mail di conferma).

## 3. Chiudi le iscrizioni libere

**Authentication → Sign In / Providers → Email**: disattiva **"Allow new users to sign up"**.

Non è strettamente necessario — chi si iscrivesse da solo non sarebbe comunque in
`admin_users` e non vedrebbe nessun lead — ma è la seconda serratura sulla stessa porta,
e costa un click.

---

## Come si usa

Vai su **`/admin`** e accedi. La pagina è `noindex,nofollow`: non finisce su Google.

### Il periodo comanda tutto

La riga di filtri in alto (Sempre / Oggi / 7 / 30 / 90 giorni / Date scelte) governa
**anche i quattro numeri in cima**. Così "conversione 40%" vuol dire sempre "in questo
periodo", e i conti tornano invece di mescolare mesi diversi.

### I quattro numeri

- **In pipeline** — trattative ancora aperte, cioè né vinte né perse.
- **Da richiamare** — quelle con un prossimo contatto scaduto o previsto per oggi. È il
  numero da tenere a zero.
- **Vinti** — chiusi positivamente nel periodo.
- **Conversione** — vinti sul totale delle chiuse. Con zero chiuse mostra `—`, perché una
  percentuale su nessun dato sarebbe solo rumore.

### Le due viste

**Lista** — colonna di lead a sinistra, scheda completa a destra. Ordinabile per data,
per priorità o per **da richiamare** (i più scaduti in cima).

**Pipeline** — cinque colonne, una per stato. **Trascini la scheda da una colonna
all'altra** per far avanzare la trattativa. Cliccandola si apre il dettaglio in un
pannello laterale.

### Cambiare stato

Due modi, stesso risultato:

1. **Trascinamento** nella vista Pipeline.
2. **I bottoni "A che punto sei"** nel dettaglio del lead.

Il flusso è _Da contattare → Contattato → Call fissata → Vinto / Perso_, ma non sei
obbligato a rispettarlo: salta o torna indietro quando serve.

Quello che il sistema tiene in ordine da solo:

- alla prima uscita da "Da contattare" registra la **data del primo contatto**;
- chiudendo (vinto o perso) registra la **data di chiusura** e toglie il promemoria, così
  una trattativa chiusa non ti risulta più "da richiamare";
- **riaprendo** un lead chiuso cancella data di chiusura e motivo, perché tornerebbero
  falsi.

### Perché l'hai perso

Segnando **Perso** si apre una domanda secca con sei motivi (non risponde più, fuori
target, budget, concorrente, tempi, ha risolto internamente) più "Altro". È l'unica
differenza fra un archivio di lead morti e un dato che ti dice dove ti si inceppa la
trattativa. Il motivo finisce anche nell'export CSV.

### Prossimo contatto

Nel dettaglio di ogni trattativa aperta puoi segnare **la data del prossimo passo**. Da
quel momento:

- se la data è passata, il lead è marcato **in ritardo** in rosso, in lista e in pipeline;
- se è oggi, è marcato **Oggi**;
- il contatore "Da richiamare" li conta entrambi;
- l'ordinamento "Da richiamare" te li mette in cima.

### Export CSV

Scarica quello che stai guardando — periodo, ricerca e filtri compresi — con separatore
`;` e BOM, così Excel in italiano lo apre già diviso in colonne. Include stato, priorità,
motivo di perdita, date di contatto e chiusura, note e campagna di provenienza.

### La priorità

Non è un'opinione: è la somma di tre risposte date dal lead stesso — quanto gli serve la
persona (`urgenza`), quante ne deve assumere entro l'anno (`assumere_12m`), e se ha già
una posizione scoperta (`ruolo_aperto`). Il calcolo sta in `src/lib/leads.ts`, funzione
`priorita()`: se cambi le opzioni del form, aggiorna anche i pesi lì.

---

## Se qualcosa non torna

**"Setup non completato"** — la funzione `is_admin()` non esiste ancora: esegui il blocco
SQL del punto 1.

**"Accesso non autorizzato"** — hai fatto login ma la tua email non è in `admin_users`.
Controlla che sia scritta identica a quella dell'utente Auth:

```sql
select * from public.admin_users;
```

**Login rifiutato** — l'utente non esiste o non è confermato. Da Authentication → Users
puoi ricrearlo con Auto Confirm attivo.

**"Modifica non salvata"** cambiando stato — manca la policy di update, oppure stai
provando uno stato fuori dal vincolo `survey_responses_stato_check`. Rilancia il blocco
SQL del punto 1.

**Zero lead ma la tabella è piena** — probabilmente manca `grant select ... to
authenticated` o la policy di lettura: rilancia il blocco SQL del punto 1.

---

## Cosa non c'è (ancora)

Non c'è uno **storico dei passaggi di stato**: sai quando un lead è stato contattato la
prima volta e quando è stato chiuso, ma non l'intera sequenza con le date. Se serve, si
aggiunge con una tabella `lead_eventi` scritta a ogni cambio di stato.

Non ci sono **più utenti con permessi diversi**: chiunque sia in `admin_users` vede e
modifica tutto.
