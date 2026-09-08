# Notifica email a ogni nuovo lead

Quando qualcuno completa il check-up, ti arriva una mail con nome, azienda, telefono
cliccabile e tutte le risposte, più il link diretto all'area riservata.

Come funziona, in una riga: all'inserimento della risposta il database chiama una
**Edge Function**, che manda la mail tramite **Resend**.

La chiamata parte in modo **asincrono** (`pg_net`): se il servizio email è lento o
rotto, il visitatore non se ne accorge e la risposta resta comunque salvata. La notifica
non può diventare un punto di rottura del form.

---

## 1. Account Resend e mittente

Registrati su [resend.com](https://resend.com) — piano gratuito, 3.000 mail al mese.

Poi scegli **da quale indirizzo** parte la mail. Due strade:

- **Per provare subito:** usa `onboarding@resend.dev` come mittente. Funziona senza
  configurare niente, ma Resend consegna **solo all'email del tuo account Resend**.
- **Per fare le cose per bene:** in **Domains → Add Domain** aggiungi il tuo dominio e
  inserisci i record DNS che ti mostra. Da lì puoi spedire da
  `lead@tuodominio.it` verso qualunque indirizzo.

Infine **API Keys → Create API Key**: copia la chiave, si vede una volta sola.

## 2. Metti i segreti su Supabase

**Edge Functions → Secrets** (oppure Project Settings → Edge Functions), e aggiungi:

| Nome              | Valore                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| `RESEND_API_KEY`  | la chiave copiata da Resend                                                     |
| `NOTIFICA_A`      | dove vuoi ricevere l'avviso. Più indirizzi separati da virgola                  |
| `NOTIFICA_DA`     | il mittente, es. `Check-up <lead@tuodominio.it>` oppure `onboarding@resend.dev` |
| `NOTIFICA_SECRET` | una stringa lunga a caso, inventata da te                                       |
| `SITO_URL`        | `https://hr0.it` (senza barra finale)                  |

Per `NOTIFICA_SECRET` va bene qualunque stringa lunga e casuale: è la password che il
database userà per farsi riconoscere dalla funzione. Non deve essere memorabile, deve
solo essere difficile da indovinare — **non riusarne una che usi altrove**.

## 3. Crea la Edge Function

**Edge Functions → Create a new function**, chiamala esattamente **`notifica-lead`**.

Nell'editor cancella l'esempio e incolla tutto il contenuto di
[`supabase/functions/notifica-lead/index.ts`](../supabase/functions/notifica-lead/index.ts).

Se ti viene chiesto se **verificare il JWT**, rispondi **no** / lascia la spunta tolta:
l'autorizzazione qui la fa l'header segreto del punto 4, non un token. Se il pannello
non ti dà la scelta non è un problema — il passo 4 gestisce anche quel caso.

Poi **Deploy**.

## 4. Crea il webhook

**Database → Webhooks → Create a new hook**:

- **Name:** `notifica_nuovo_lead`
- **Table:** `survey_responses` (schema `public`)
- **Events:** solo **Insert**
- **Type:** `HTTP Request` → metodo **POST**
- **URL:** `https://uqmznxisgcaljifwbbnq.supabase.co/functions/v1/notifica-lead`
- **HTTP Headers:** aggiungi queste due righe
  | Header | Valore |
  | --- | --- |
  | `x-notifica-secret` | la stessa stringa messa in `NOTIFICA_SECRET` |
  | `Authorization` | `Bearer <anon key>` — la chiave pubblica del progetto |

L'header `Authorization` serve solo nel caso la funzione sia stata pubblicata con la
verifica JWT attiva. Metterlo comunque non fa danno: la sicurezza vera sta in
`x-notifica-secret`, che solo tu e il webhook conoscete.

Salva.

## 5. Prova

Apri `/check-up` sul sito e compila il form fino in fondo. Entro pochi secondi la mail
deve arrivare.

---

## Se non arriva

Guarda i log: **Edge Functions → `notifica-lead` → Logs**. La funzione scrive un
messaggio esplicito per ogni motivo di fallimento.

**`401 Non autorizzato`** — l'header `x-notifica-secret` del webhook non coincide con il
secret `NOTIFICA_SECRET`. Di solito è uno spazio incollato per sbaglio in fondo.

**`500 Configurazione incompleta`** — manca uno fra `RESEND_API_KEY`, `NOTIFICA_A` e
`NOTIFICA_DA`. Dopo aver aggiunto un secret, **ripubblica la funzione**: i secrets
vengono letti all'avvio.

**`502 Invio fallito`** — Resend ha rifiutato. Il log riporta la sua risposta testuale.
Le due cause più comuni: il mittente `NOTIFICA_DA` non è su un dominio verificato,
oppure stai usando `onboarding@resend.dev` per scrivere a un indirizzo diverso da quello
del tuo account Resend.

**Nessun log, proprio niente** — il webhook non è scattato. Controlla in Database →
Webhooks che sia attivo sulla tabella giusta e sull'evento **Insert**. In Postgres,
`select * from net._http_response order by created desc limit 5;` mostra le ultime
chiamate uscite e il loro esito.

**La mail arriva ma finisce nello spam** — succede con `onboarding@resend.dev`. Si
risolve verificando il tuo dominio su Resend (punto 1).

---

## Cosa c'è dentro la mail

Oggetto: `Nuovo lead — Azienda (Nome)`, con `· URGENTE` in mezzo quando l'urgenza
dichiarata è "Serviva ieri", così lo riconosci dalla lista senza aprirlo.

Corpo: pulsante per chiamare, email, urgenza e assunzioni previste in evidenza, poi
tutte le altre risposte raggruppate e il link all'area riservata. Il **Rispondi** della
tua casella scrive direttamente al lead, perché il `reply-to` è impostato sulla sua
email.

Il testo scritto dal visitatore viene messo in HTML solo dopo essere stato neutralizzato:
un'azienda che si chiama `<script>` arriva come testo, non come codice.
