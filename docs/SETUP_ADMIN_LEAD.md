# Setup pagina lead — `/admin`

La pagina `/admin` ti fa vedere chi ha compilato il check-up, ti dice chi
richiamare per primo e ti lascia segnare a che punto sei con ognuno.

Prerequisito: la tabella `survey_responses` deve già esistere e ricevere le risposte
(vedi `SETUP_SUPABASE_SURVEY.md`).

Serve una cosa sola in più: **decidere chi può leggere**. La chiave `VITE_SUPABASE_PUBLISHABLE_KEY`
è pubblica e visibile a chiunque apra il sito, quindi non può servire per leggere i lead.
La pagina usa un login vero (Supabase Auth) e il database controlla che chi chiede i dati
sia in un elenco di amministratori che decidi tu.

---

## 1. SQL — campi di gestione e permessi di lettura

**Supabase → SQL Editor → New query**, incolla, **Run**. Anche questo è rilanciabile
quante volte vuoi senza perdere dati.

> Nel blocco `insert into public.admin_users` **sostituisci `TUA-EMAIL@esempio.it`**
> con l'email con cui farai il login.

```sql
-- 1. Campi per gestire il lead nel tempo
alter table public.survey_responses
  add column if not exists stato text not null default 'nuovo',
  add column if not exists note text,
  add column if not exists contattato_at timestamptz;

alter table public.survey_responses
  drop constraint if exists survey_responses_stato_check;
alter table public.survey_responses
  add constraint survey_responses_stato_check
  check (stato in ('nuovo', 'contattato', 'fissato', 'cliente', 'perso'));

-- 2. Chi è amministratore
create table if not exists public.admin_users (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Nessuno può leggere questa tabella dalle API: si consulta solo dalla dashboard.
alter table public.admin_users enable row level security;

insert into public.admin_users (email)
values ('TUA-EMAIL@esempio.it')
on conflict (email) do nothing;

-- 3. Il controllo "sei un admin?"
--    security definer: la funzione legge admin_users con i propri permessi,
--    altrimenti la RLS del punto 2 la bloccherebbe.
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

-- 4. Lettura e modifica riservate agli admin autenticati
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

Nota su cosa resta invariato: la policy di inserimento pubblica creata nell'altra guida
non viene toccata, quindi il form continua a funzionare per i visitatori.

## 2. Crea il tuo utente

**Supabase → Authentication → Users → Add user → Create new user.**

Usa la **stessa email** che hai messo in `admin_users`, scegli una password e attiva
**Auto Confirm User** (altrimenti resti in attesa di una mail di conferma).

## 3. Chiudi le iscrizioni libere

**Authentication → Sign In / Providers → Email**: disattiva **"Allow new users to sign up"**.

Non è strettamente necessario — un utente che si iscrivesse da solo non sarebbe comunque
in `admin_users` e non vedrebbe nessun lead — ma è la seconda serratura sulla stessa porta,
e costa un click.

---

## Come si usa

Vai su **`/admin`** e accedi. La pagina è `noindex,nofollow`: non finisce su Google.

**In alto, la fotografia:** lead totali, quanti sono ancora da contattare, quanti sono
arrivati negli ultimi 7 giorni, quanti hanno priorità alta.

**La priorità** non è un'opinione: è la somma di tre risposte date dal lead stesso —
quanto gli serve la persona (`urgenza`), quante ne deve assumere entro l'anno
(`assumere_12m`), e se ha già una posizione scoperta (`ruolo_aperto`). Il calcolo sta in
`src/lib/leads.ts`, funzione `priorita()`: se cambi le opzioni del form, aggiorna anche
i pesi lì. Ordinando per **Priorità** hai in cima chi ha più senso chiamare oggi.

**Ogni lead** si apre a destra con tutte le risposte, e in testa i tre pulsanti per
agire: telefono, WhatsApp, email.

**Gli stati** servono a non perdere il filo: _Da contattare → Contattato → Call fissata →
Cliente / Perso_. La prima volta che esci da "Da contattare", il sistema registra da solo
la data del primo contatto. Le **note** sono tue e restano attaccate al lead.

**Export CSV** scarica quello che stai vedendo in quel momento — filtri e ricerca
compresi — con separatore `;` e BOM, così Excel in italiano lo apre già diviso in colonne.

---

## Se qualcosa non torna

**"Accesso non autorizzato"** — hai fatto login ma la tua email non è in `admin_users`.
Controlla che sia scritta identica a quella dell'utente Auth:

```sql
select * from public.admin_users;
```

**Login rifiutato** — l'utente non esiste o non è confermato. Da
Authentication → Users puoi ricrearlo con Auto Confirm attivo.

**Zero lead ma la tabella è piena** — il login è passato e l'email è in `admin_users`,
ma probabilmente manca la `grant select ... to authenticated` o la policy di lettura:
rilancia il blocco SQL del punto 1.
