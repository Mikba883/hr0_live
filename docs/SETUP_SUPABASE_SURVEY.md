# Setup Supabase — Tabella `survey_responses`

Il progetto usa Supabase **esterno** (BYO), quindi le migration non partono in automatico. Copia questo SQL nel tuo progetto Supabase → **SQL Editor → New query → Run**.

```sql
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

-- Grants Data API (PostgREST)
grant insert on public.survey_responses to anon;
grant all on public.survey_responses to service_role;

-- RLS: chiunque può inviare, nessuno può leggere via API pubblica
alter table public.survey_responses enable row level security;

drop policy if exists "public can insert survey" on public.survey_responses;
create policy "public can insert survey"
  on public.survey_responses
  for insert
  to anon
  with check (true);
```

Per leggere le risposte usa il **Table Editor** di Supabase (loggato con il tuo account, la RLS non si applica).
