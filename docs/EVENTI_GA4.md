# GA4 — eventi di interazione

Google Ads conta le conversioni: una sola, il check-up compilato, ed è descritta in
[GOOGLE_ADS.md](GOOGLE_ADS.md). Tutto il resto — scroll, permanenza, click, avanzamento del
questionario — va a **GA4**, che è fatto per ricevere eventi arbitrari.

Non è una preferenza. Ads conta solo gli eventi mappati su un'azione di conversione con la
sua etichetta: mandargli uno scroll significherebbe creare un'azione di conversione per
ciascuno e vederseli sommare nella colonna "Conversioni", falsando ogni report e — se
l'azione finisse fra le principali — mandando Smart Bidding a cercare gente che scorre le
pagine invece di clienti.

---

## 1. Senza `VITE_GA4_ID` non si raccoglie niente

È il primo passo e senza non serve nessuno degli altri: **finché la variabile non è
impostata, ogni `trackEvent()` è un no-op.** Il sito funziona identico, il banner non
mostra la categoria statistiche, e tutti gli eventi elencati qui sotto vanno nel vuoto
senza nessun errore da nessuna parte.

1. Crea la proprietà su **analytics.google.com** → Amministrazione → Crea → Proprietà.
   Flusso di dati **Web**, con l'URL del sito. Google restituisce un **ID misurazione** nella
   forma `G-XXXXXXXXXX` — è quello che serve, non l'ID proprietà numerico.
2. In **Vercel → Project → Settings → Environment Variables**, tipo **Config**, ambiente
   **Production** soltanto:

   ```
   VITE_GA4_ID=G-XXXXXXXXXX
   ```

   Solo Production, e **non** nel `.env` del repository: senza la variabile il codice non
   raccoglie niente, ed è così che le anteprime dei branch e il sito di prova su Lovable
   restano fuori dai dati. Metterla nel `.env` la darebbe a tutti gli ambienti, e su volumi
   bassi bastano dieci sessioni di prova per distorcere il quadro.

3. **Rifai il deploy** (Deployments → `⋯` → Redeploy). Le variabili `VITE_` vengono scritte
   dentro il JavaScript quando il sito viene costruito: salvarla non basta, Vercel non
   ricostruisce da solo.

Nel flusso di dati lascia acceso l'**Enhanced measurement** solo per `page_view`; scroll e
click li mandiamo noi con parametri più utili, e tenere entrambi produrrebbe due conteggi
per lo stesso gesto. In pratica: **disattiva "Scroll" e "Outbound clicks"** nelle
impostazioni del flusso.

## 2. Gli eventi

`page_view` a parte, sono tutti eventi personalizzati: GA4 li accetta senza configurazione,
ma i **parametri** vanno registrati (punto 3) per comparire nei report.

### Pagina

| Evento | Quando | Parametri |
| --- | --- | --- |
| `page_view` | A ogni pagina, comprese quelle raggiunte senza ricaricare | standard di GA4 |
| `scroll_depth` | Superato il 25/50/75/90% della pagina | `percentuale`, `pagina` |
| `time_on_page` | 10/30/60/180 secondi di permanenza attiva | `soglia`, `pagina` |
| `page_engagement` | All'uscita dalla pagina o al passaggio in secondo piano | `secondi_attivi`, `pagina` |

`page_engagement` è **incrementale**: chi esce e rientra ne manda più d'uno, ognuno con i
secondi di quel tratto. Nei report **va sommato**, non mediato — è lo stesso schema dello
`user_engagement` di GA4. Mandare ogni volta il totale cumulativo gonfierebbe la somma.

La permanenza è quella **attiva**: il cronometro si ferma quando la scheda finisce in
secondo piano. È la differenza fra "ha letto per tre minuti" e "ha lasciato la scheda
aperta mentre faceva altro".

### Click

| Evento | Quando | Parametri |
| --- | --- | --- |
| `cta_click` | Click su un invito all'azione | `etichetta`, `destinazione`, `pagina`, `variante` |
| `element_click` | Click su qualsiasi altro elemento interattivo | `etichetta`, `destinazione`, `tipo`, `pagina` |
| `faq_open` | Apertura di una domanda frequente | `domanda`, `pagina` |
| `consent_choice` | Scelta sul banner cookie | `via`, `marketing`, `analytics` |

`variante` distingue le CTA che hanno lo stesso testo ma non lo stesso rendimento:
`primary` / `outline` / `ghost` sono gli stili del pulsante, `sticky-mobile` è la barra
fissa del telefono, `inline` un link dentro una frase, `calcolatore` il pulsante in fondo
al calcolatore (che porta anche `totale_calcolato`, la cifra che l'utente aveva davanti).

`element_click` arriva da un solo listener delegato, quindi **copre anche i pulsanti che
verranno aggiunti in futuro** senza che nessuno debba ricordarsene. Per escludere un
elemento: `data-no-track`. Per lasciarlo a un evento più ricco: `data-track="manual"`.

**Di `consent_choice` arriva solo metà del quadro, ed è giusto così.** Chi rifiuta le
statistiche non può essere misurato: sarebbe esattamente la cosa che ha appena negato. **Il
tasso di accettazione complessivo non è ricavabile da qui**, né da nessun altro evento. Ciò
che si legge è il rapporto fra chi concede le statistiche e chi concede anche il marketing:
quanta parte del traffico Google Ads riesce davvero a vedere.

### Moduli

Ogni evento porta `modulo`, che oggi vale `check-up` (il questionario) o `lead` (il modulo
breve, che però non è montato in nessuna pagina — vedi il commento in `LeadForm.tsx`).
Senza, i due imbuti si sommerebbero in uno che non descrive nessuno dei due.

| Evento | Quando | Parametri |
| --- | --- | --- |
| `form_start` | Prima interazione con un campo | `modulo` |
| `form_step` | Domanda superata | `modulo`, `passo`, `totale`, `domanda` |
| `form_back` | Click su "Indietro" | `modulo`, `passo`, `domanda` |
| `form_error` | La validazione blocca l'avanzamento | `modulo`, `passo`, `domanda`, `errore` |
| `form_abandon` | Uscita a compilazione iniziata e non inviata | `modulo`, `passo`, `totale`, `domanda`, `secondi` |
| `form_submit` | Invio riuscito | `modulo`, `secondi` |
| `form_submit_error` | Invio fallito | `modulo`, `dettaglio` |

Tre cose che vale la pena sapere prima di leggere questi numeri:

- **`form_start` scatta alla prima interazione con un campo**, non alla prima risposta
  valida. Chi scrive il nome, ci ripensa e se ne va ha cominciato a compilare: contarlo solo
  dopo un "Continua" riuscito nasconderebbe l'abbandono più precoce, che è quello che costa
  di più.
- **`form_abandon` non scatta quando la scheda passa in secondo piano.** Chi apre la posta
  per copiarsi un indirizzo e torna a finire non ha abbandonato niente. In cambio qualche
  chiusura da telefono sfugge: è il compromesso scelto, perché un falso abbandono rovina
  proprio la risposta che l'evento deve dare.
- **`form_step` dice il passo superato**, non quello mostrato.

### Video e calcolatore

| Evento | Quando | Parametri |
| --- | --- | --- |
| `video_play` / `video_pause` / `video_resume` | Comandi sul video | `video_id`, `titolo` |
| `calculator_start` | Prima regolazione del calcolatore | — |
| `calculator_adjust` | Cursore fermo da 800 ms | `campo`, `valore` |

Gli slider sono in **debounce di 800 ms per campo**: un cursore trascinato emette un
`change` a ogni pixel, e mandarli tutti significherebbe centinaia di eventi per sessione.
Interessa il valore su cui la mano si ferma, non il percorso.

## 3. Registra i parametri, o nei report non li vedi

Gli eventi arrivano comunque, ma **un parametro non registrato non compare in nessun
report**: lo vedi solo in DebugView e nell'export BigQuery. Vanno registrati una volta sola,
in **Amministrazione → Definizioni personalizzate**, con **ambito Evento**.

I nomi a sinistra sono liberi: sono le etichette che leggerai nei report. Quelli a destra
no, devono combaciare con il codice.

**Dimensioni personalizzate** (Crea dimensione personalizzata → Ambito: Evento)

| Nome dimensione | Parametro evento |
| --- | --- |
| Pagina | `pagina` |
| Etichetta | `etichetta` |
| Destinazione | `destinazione` |
| Variante CTA | `variante` |
| Tipo elemento | `tipo` |
| Soglia scroll | `percentuale` |
| Soglia permanenza | `soglia` |
| Modulo | `modulo` |
| Passo | `passo` |
| Domanda | `domanda` |
| Errore | `errore` |
| Dettaglio errore | `dettaglio` |
| Campo calcolatore | `campo` |
| Video | `video_id` |
| Titolo video | `titolo` |
| Via consenso | `via` |
| Consenso marketing | `marketing` |
| Consenso statistiche | `analytics` |

**Metriche personalizzate** (Crea metrica personalizzata → Ambito: Evento, Unità: Standard)

| Nome metrica | Parametro evento |
| --- | --- |
| Secondi | `secondi` |
| Secondi attivi | `secondi_attivi` |
| Domande totali | `totale` |
| Valore calcolatore | `valore` |
| Totale calcolato | `totale_calcolato` |

Dimensione o metrica non è indifferente e **non si può cambiare idea a metà**: sullo stesso
nome di parametro GA4 accetta una registrazione sola. Una dimensione serve a raggruppare
("quanti eventi per ogni passo"), una metrica a sommare e mediare ("quanti secondi in
media"). È il motivo per cui la soglia di `time_on_page` si chiama `soglia` e non
`secondi`: `secondi` è già la durata vera di `form_submit` e `form_abandon`, e i due usi si
sarebbero esclusi a vicenda.

I limiti della proprietà sono 50 dimensioni e 50 metriche con ambito evento: qui se ne
usano 18 e 5, quindi c'è margine, ma non registrare parametri "per sicurezza".

## 4. Verifica

1. Con `VITE_GA4_ID` impostata e il sito ripubblicato, apri il sito in finestra anonima.
   **Prima di accettare il banner non deve partire niente**: F12 → Network, filtro
   `google-analytics`, zero richieste. Se `collect` compare lo stesso, il consenso non sta
   funzionando.
2. Accetta le statistiche. In GA4 → Amministrazione → **DebugView** (serve l'estensione
   *Google Analytics Debugger*, oppure aggiungi `?debug_mode=1` all'indirizzo).
3. Ripercorri il sito e controlla che arrivino, in quest'ordine: `page_view`, `scroll_depth`
   scorrendo, `time_on_page` dopo dieci secondi, `cta_click` premendo una CTA.
4. Naviga verso un'altra pagina **senza ricaricare** (un link del footer): deve arrivare un
   secondo `page_view`, e gli eventi successivi devono riportare la pagina nuova. È il caso
   che prima si perdeva del tutto.
5. Apri `/check-up`, scrivi una lettera nel primo campo e **chiudi la scheda**: devono
   arrivare `form_start` e `form_abandon` con `passo: 1`.
6. Completa il check-up fino a `/grazie`: `form_submit` con i secondi impiegati, un
   `page_view` per `/grazie`, e la conversione Google Ads.

I parametri compaiono nei report standard **24-48 ore dopo** essere stati registrati, e solo
per i dati raccolti da lì in avanti: le definizioni personalizzate non sono retroattive.
Registrale prima di far girare traffico a pagamento.

## 5. Portare questi eventi su Google Ads

Quando GA4 raccoglie da qualche settimana, gli eventi possono essere importati in Ads:
**Obiettivi → Conversioni → + Nuova azione → Importa → Google Analytics 4**.

Da fare con una regola sola, ma tassativa: importali come **secondari**, in
"Osservazione". Le conversioni secondarie non entrano nella colonna Conversioni e **non
guidano Smart Bidding**: servono a costruire i pubblici per il remarketing e a leggere il
percorso. L'unica conversione principale resta il check-up compilato.

Un `form_start` o uno `scroll_depth` promosso a conversione principale insegna alle campagne
a cercare persone che iniziano moduli e scorrono pagine. Ne troverà moltissime, la colonna
Conversioni si riempirà, e i lead diminuiranno.

## 6. Come è fatto

| File | Ruolo |
| --- | --- |
| `src/lib/analytics.ts` | `trackEvent()`, `trackPageView()`, `trackCtaClick()` — l'unica via da cui passano gli eventi |
| `src/lib/gtag.ts` | Bootstrap gtag.js condiviso con Google Ads, e segnali Consent Mode |
| `src/hooks/use-page-tracking.ts` | Monta tutto il tracciamento di pagina, una volta, in `__root.tsx` |
| `src/hooks/use-scroll-depth.ts` | Profondità di scroll |
| `src/hooks/use-time-on-page.ts` | Permanenza attiva |
| `src/hooks/use-click-tracking.ts` | Listener delegato per i click |

Quattro decisioni che sembrano dettagli e non lo sono:

**Il `page_view` lo mandiamo noi.** GA4 è configurato con `send_page_view: false`, perché il
`config` di gtag ne manda uno solo al caricamento dello script: con la navigazione
client-side ogni pagina raggiunta senza ricaricare — `/grazie` compresa, cioè quella che
conclude il funnel — non ne vedrebbe nessuno. Il `set` che precede l'evento aggiorna la
pagina corrente anche per gli eventi che seguono, altrimenti uno scroll su `/grazie`
risulterebbe avvenuto sulla pagina di partenza.

**Il tracciamento di pagina sta nella radice, non nelle route.** Finché ogni pagina doveva
ricordarsi di chiamare `useScrollDepth`, quattro su sette se n'erano dimenticate — e la
cosa non si vede: nessun errore, semplicemente quei dati non esistono.

**Il nome della pagina è il `pathname`,** non un'etichetta scritta a mano che un refuso può
sdoppiare in due righe di report.

**Senza consenso gli hook ricevono `null`** e non attaccano né listener né timer, invece di
girare a vuoto per produrre eventi che verrebbero scartati.

## 7. Aggiungere un evento

`trackEvent("nome_evento", { … })` da `src/lib/analytics.ts`, e basta: il consenso è
ricontrollato lì dentro, non serve verificarlo nel chiamante. Poi, perché serva a qualcosa:

1. Nomi in `snake_case`, parametri **pochi e stabili**. Ogni parametro nuovo è una
   definizione da registrare a mano nella proprietà.
2. **Riusa i nomi di parametro esistenti** (`pagina`, `etichetta`, `passo`, …) invece di
   coniarne di simili: `page` accanto a `pagina` significa due dimensioni che dicono la
   stessa cosa e nessun report che le mette insieme.
3. Aggiorna la tabella al punto 2 e, se il parametro è nuovo, quella al punto 3.
4. **Se cambia ciò che viene registrato dell'utente, aggiorna l'informativa** — il punto 2.2
   di `src/routes/cookie.tsx` e la riga del banner. Non serve invece alzare
   `POLICY_VERSION`: quella riguarda gli *strumenti* installati sul dispositivo, e finché
   resta GA4 a raccogliere per la stessa finalità diagnostica il consenso già dato copre
   anche gli eventi nuovi. Alzarla farebbe ricomparire il banner a tutti per niente.

## 8. Consenso

Il tag parte solo dopo un consenso esplicito alle statistiche. Il meccanismo — banner,
Consent Mode v2, revoca, scadenza a sei mesi — è in [CONSENSO_COOKIE.md](CONSENSO_COOKIE.md).
