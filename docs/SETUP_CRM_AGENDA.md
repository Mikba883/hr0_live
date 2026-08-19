# Agenda e storico delle azioni — `/admin`

Questa è la parte che trasforma l'elenco dei lead in un CRM vero: sapere **cosa
devi fare oggi** e **cosa hai già fatto**.

Prerequisito: aver già eseguito `SETUP_ADMIN_LEAD.md` (la funzione `is_admin()`
creata lì viene usata anche qui).

---

## 1. SQL — la colonna e la tabella

**Supabase → SQL Editor → New query**, incolla, **Run**. È rilanciabile quante
volte vuoi senza perdere dati.

```sql
-- 1. Cosa devi fare al prossimo passo.
--    La data da sola ("14/08") è un promemoria muto: senza il "cosa", una
--    to-do list non ti fa risparmiare la fatica di ricostruire il contesto.
alter table public.survey_responses
  add column if not exists prossima_azione text;

-- 2. Lo storico: una riga per ogni cosa fatta.
--    È il modello che usano tutti i CRM, dai più semplici agli open source:
--    l'attività è agganciata al lead, con il tipo e il momento in cui è successa.
create table if not exists public.lead_attivita (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.survey_responses(id) on delete cascade,
  tipo text not null check (tipo in ('chiamata', 'whatsapp', 'email', 'incontro', 'nota', 'stato')),
  descrizione text,
  fatta_at timestamptz not null default now(),
  autore text
);

-- 3. Gli indici che servono alle due letture che fa la pagina:
--    lo storico di un lead, e il diario in ordine di tempo.
create index if not exists lead_attivita_lead_idx
  on public.lead_attivita (lead_id);

create index if not exists lead_attivita_fatta_idx
  on public.lead_attivita (fatta_at desc);

-- 4. Permessi: leggono e scrivono solo gli amministratori.
alter table public.lead_attivita enable row level security;

grant select, insert on public.lead_attivita to authenticated;

drop policy if exists "admins can read attivita" on public.lead_attivita;
create policy "admins can read attivita"
  on public.lead_attivita
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins can write attivita" on public.lead_attivita;
create policy "admins can write attivita"
  on public.lead_attivita
  for insert
  to authenticated
  with check (public.is_admin());
```

Deve rispondere **"Success. No rows returned"**.

> **Perché non c'è né update né delete.** Lo storico è un registro, non una
> lavagna: una telefonata fatta resta fatta. Poterla riscrivere a posteriori
> renderebbe inaffidabile l'unica cosa per cui esiste, cioè dirti com'è andata
> davvero. Se sbagli a registrare, aggiungi una nota che corregge.

La colonna `prossima_azione` non ha bisogno di permessi suoi: eredita la policy
di update di `survey_responses` creata in `SETUP_ADMIN_LEAD.md`.

Finché non lanci questo blocco, la pagina `/admin` continua a funzionare ma
avvisa in cima che lo storico non è attivo.

---

## 2. Com'è fatta la pagina adesso

Tre sezioni, in ordine di quanto spesso ti servono.

### Oggi

È la schermata da cui apri la giornata. Non è un elenco di contatti, è un elenco
di **cose da fare**, diviso in quattro blocchi:

- **In ritardo** — avevi detto che li avresti sentiti prima di oggi. In rosso.
- **Oggi** — il lavoro della giornata.
- **Senza prossimo passo** — trattative aperte che non compaiono in nessuna
  lista. È il blocco più importante della pagina: finché resta roba qui, stai
  perdendo lead senza accorgertene.
- **In arrivo** — già fissati, ancora in tempo. Parte chiuso, perché non chiede
  decisioni oggi.

Ogni riga dice **cosa** devi fare, non solo quando, e ha il tasto per chiamare.

### Lead

La vista che c'era prima, intatta: lista o pipeline con il trascinamento,
filtri per periodo, ricerca, export CSV e il pannello con tutte le risposte del
check-up. Qui si consulta e si cerca.

### Andamento

Quanti lead sono arrivati, quante azioni hai fatto e quante trattative hai
vinto — negli ultimi 14 giorni o negli ultimi 12 mesi. Sotto, il **diario**:
cos'hai fatto giorno per giorno, con nome e nota di ogni azione.

I numeri sono leggibili anche in tabella, con il link sopra il grafico.

---

## 3. Il meccanismo che tiene in piedi tutto

Il bottone **"Fatto"** non segna solo che hai fatto una cosa: ti chiede subito
**qual è il passo successivo** e quando.

Non è una scocciatura, è il punto. Nei CRM che funzionano non esiste il gesto
"segna come fatto" isolato, perché è esattamente lì che le trattative si
perdono: non durante la telefonata, ma nei tre secondi dopo, quando nessuno
decide cosa succede dopo.

Puoi rispondere "non serve un altro passo", ma devi dirlo. La differenza fra una
scelta e una dimenticanza è tutta qui — e quello che dimentichi finisce nel
blocco "senza prossimo passo", dove lo ritrovi.

---

## 4. I cinque numeri in cima

- **In pipeline** — trattative aperte.
- **Da richiamare** — scadute o in scadenza oggi. Da tenere a zero.
- **Senza prossimo passo** — aperte e invisibili. **Da tenere a zero.**
- **Vinti** — chiuse positivamente.
- **Conversione** — vinte sul totale delle chiuse.

Nella sezione **Lead** i numeri seguono il periodo scelto. In **Oggi** e
**Andamento** guardano invece tutti i lead: un periodo stretto nasconderebbe
proprio le trattative rimaste indietro, che sono quelle che devi vedere.
