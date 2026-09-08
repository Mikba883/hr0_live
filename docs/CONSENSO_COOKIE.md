# Consenso cookie — come funziona

Il sito non installa strumenti di profilazione finché il visitatore non li accetta. Questa
pagina spiega come è fatto il meccanismo, quali vincoli non sono negoziabili e cosa fare
quando si aggiunge un nuovo strumento di tracciamento.

> Questo documento descrive un'implementazione tecnica. Non sostituisce il parere di chi
> segue la privacy: i testi delle informative andrebbero fatti rileggere prima di
> considerarli definitivi.

---

## 1. Il quadro in breve

Il riferimento sono l'art. 122 del Codice Privacy, il GDPR e le
[Linee guida del Garante del 10 giugno 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876),
in vigore da gennaio 2022. In pratica:

- i cookie **tecnici** non richiedono consenso, solo informativa;
- i cookie **analitici di terza parte** e quelli di **profilazione** — su questo sito GA4 e
  il tag di Google Ads — richiedono un consenso preventivo, esplicito e revocabile, con
  categorie separate: chi accetta le statistiche non accetta con ciò la pubblicità;
- l'informativa deve descrivere **gli strumenti realmente installati**. Una cookie policy
  che elenca strumenti diversi da quelli in uso è peggio di una generica: documenta da sé
  che il presidio non è allineato alla realtà.

## 2. I pezzi

| File | Ruolo |
| --- | --- |
| `src/lib/consent.ts` | Stato della scelta: lettura, salvataggio, scadenza, notifiche |
| `src/lib/gtag.ts` | Bootstrap gtag.js condiviso fra Ads e GA4, e segnali Consent Mode |
| `src/lib/analytics.ts` | GA4: `trackEvent()`, l'unica via da cui passano gli eventi |
| `src/hooks/use-page-tracking.ts` | Monta scroll, permanenza e click su ogni pagina pubblica |
| `src/hooks/use-scroll-depth.ts` | Profondità di lettura, a soglie |
| `src/hooks/use-consent.ts` | Espone lo stato ai componenti React |
| `src/components/CookieBanner.tsx` | Il banner e il pannello per categoria |
| `src/lib/google-ads.ts` | Caricamento condizionato del tag Ads e invio conversioni |
| `src/routes/cookie.tsx` | L'informativa, con il pulsante di gestione preferenze |
| `src/components/landing/Footer.tsx` | Il link "Preferenze cookie" per la revoca |

La scelta è salvata nel `localStorage` alla chiave `hr0.cookie-consent`, con la data e la
versione dell'informativa. Non è un cookie: non deve viaggiare a ogni richiesta, e va letta
prima di decidere se caricare gtag.

## 3. Le regole che non vanno toccate

Sono vincoli delle linee guida, non scelte di design. Chi mette mano al banner dovrebbe
sapere quali sono:

- **"Accetta tutto" e "Rifiuta tutto" hanno lo stesso peso grafico.** Stessa dimensione,
  stesso colore, stesso contrasto. Rendere il rifiuto meno evidente dell'accettazione è il
  rilievo più ricorrente nei provvedimenti sanzionatori del Garante.
- **Non c'è una X di chiusura.** Chiudere non è decidere: un banner che sparisce senza una
  scelta finirebbe per valere come consenso implicito, che non è consenso.
- **Il banner non blocca la pagina.** Un muro che obbliga ad accettare per proseguire è un
  cookie wall, vietato.
- **Nessuna casella è pre-spuntata.** Il consenso è un atto positivo.
- **Il rifiuto è definitivo per sei mesi.** Non si ripropone il banner a chi ha già detto
  di no. Scaduti i sei mesi la scelta decade e il banner ricompare.
- **La revoca è facile quanto il consenso.** Da qui il link nel footer: senza, la cookie
  policy prometterebbe qualcosa che non esiste.

## 4. Consent Mode v2 e le due modalità

Google richiede il Consent Mode v2 per gli utenti dello Spazio economico europeo dal marzo
2024: senza, i dati di conversione non alimentano remarketing e modellazione. I segnali
`ad_storage`, `ad_user_data`, `ad_personalization` e `analytics_storage` partono tutti su
`denied` e passano a `granted` solo dopo l'accettazione.

La variabile `VITE_CONSENT_MODE` decide cosa succede *quando il consenso manca*:

| Valore | Comportamento senza consenso | In cambio |
| --- | --- | --- |
| `basic` (predefinito) | Non viene caricato niente. Nessuna richiesta a Google, nemmeno l'IP. | Di chi rifiuta non si misura nulla. |
| `advanced` | gtag si carica con tutti i segnali negati: nessun cookie, nessun identificatore, ma ping anonimi a Google. | Modellazione delle conversioni anche sui rifiuti; però una richiesta a terzi parte prima della scelta. |

**È una decisione giuridica prima che tecnica.** `advanced` è ciò che Google consiglia;
`basic` è la lettura più prudente dell'art. 122. Il default è `basic`: cambiarlo è una
scelta da prendere con chi segue la privacy, non una configurazione da ritoccare.

Per GA4 non esiste una modalità avanzata: senza consenso alle statistiche non c'è niente da
misurare, e i ping anonimi servono ad Ads, non ad Analytics.

### Le variabili

| Variabile | Effetto se assente |
| --- | --- |
| `VITE_GOOGLE_ADS_ID` | Nessun tag Ads, e la categoria marketing sparisce dal banner |
| `VITE_GOOGLE_ADS_CONVERSION_LABEL` | Nessuna conversione inviata |
| `VITE_GA4_ID` | Nessun GA4, e la categoria statistiche sparisce dal banner e dall'informativa |
| `VITE_CONSENT_MODE` | `basic` |

Le pagine legali e il banner leggono queste variabili: **se uno strumento non è
configurato, l'informativa non lo dichiara e il banner non ne chiede il consenso.**
L'informativa descrive così sempre l'ambiente in cui gira, invece di promettere o negare
cose in base a quando è stata scritta.

## 5. Gli eventi di interazione

Vanno a **GA4**, non a Google Ads. Il motivo è tecnico e vale la pena saperlo prima di
provare a spostarli: Ads conta solo gli eventi mappati su un'azione di conversione con la
sua etichetta. Mandargli uno scroll significherebbe creare un'azione di conversione per
ciascuno e vederseli sommare nella colonna "Conversioni", falsando ogni report e — se
l'azione finisse fra le principali — mandando Smart Bidding a cercare gente che scorre le
pagine invece di clienti.

Sono una ventina, dalle soglie di scroll e permanenza ai click su ogni elemento
interattivo, fino all'avanzamento e all'abbandono del check-up. **L'elenco completo, con i
parametri e le definizioni personalizzate da registrare nella proprietà, è in
[EVENTI_GA4.md](EVENTI_GA4.md).**

Tre accorgimenti che tengono i dati onesti e il volume basso:

- **Gli slider sono in debounce di 800 ms, per campo.** Un cursore trascinato emette un
  `change` a ogni pixel: mandarli tutti vorrebbe dire centinaia di eventi per sessione e i
  limiti di GA4 superati. Interessa il valore su cui la mano si ferma, non il percorso.
- **Lo scroll non si segnala se la pagina non scorre.** Su uno schermo alto una pagina
  corta si vede tutta da ferma: contarla come "letta al 90%" misurerebbe la finestra del
  browser, non l'interesse.
- **La permanenza è quella attiva**, con la finestra in primo piano. Il tempo trascorso
  misurerebbe quante schede tiene aperte la gente.

Il rapporto fra `form_start` e `form_abandon`, con il passo a cui quest'ultimo scatta, è la
curva di abbandono del questionario: con diciotto domande è il dato più utile che questi
eventi producono.

Ogni evento passa da `trackEvent()`, che **ricontrolla il consenso da sé**. Le chiamate
sono sparse per tutta l'interfaccia: se ognuna dovesse ricordarsi il controllo, basterebbe
una dimenticanza per tracciare chi ha detto di no.

## 6. Aggiungere un nuovo strumento di tracciamento

Quattro passaggi, e nessuno è saltabile:

1. **Aggiungi la categoria** in `ConsentChoice` (`src/lib/consent.ts`) se non ricade in una
   esistente, e la riga corrispondente nel pannello del banner.
2. **Carica lo strumento solo a consenso dato**, sul modello di `applyAdsConsent()`.
3. **Aggiorna la tabella** al punto 3 di `src/routes/cookie.tsx` con nome, dominio,
   finalità e durata reali.
4. **Alza `POLICY_VERSION`** in `src/lib/consent.ts`. Le scelte raccolte sull'informativa
   precedente decadono e il banner ricompare: un consenso prestato su un'informativa
   diversa da quella vigente non è informato, e quindi non è valido.

Il punto 4 è quello che si dimentica. Senza, chi aveva già accettato si ritrova un nuovo
strumento installato sulla base di un consenso che non lo riguardava.

## 7. Verifica

1. Finestra anonima, F12 → **Application → Local Storage**: `hr0.cookie-consent` non
   esiste e il banner è visibile.
2. **Network**, filtro `googletagmanager`: **nessuna richiesta**. Se `gtag/js` compare
   prima di aver accettato, il consenso non sta funzionando.
3. Clicca **Rifiuta tutto**: il banner sparisce, e in Network continua a non comparire
   nulla. Ricarica: il banner non torna.
4. Footer → **Preferenze cookie**: il pannello si riapre mostrando la scelta in vigore.
5. Attiva il marketing e salva: `gtag/js?id=AW-…` compare in Network.
5b. Con `VITE_GA4_ID` impostata, attiva le statistiche: scorri la pagina e premi una CTA,
   e in Network compaiono le chiamate a `google-analytics.com/g/collect`. Con le
   statistiche rifiutate non ne parte nessuna. La verifica evento per evento è al punto 4
   di [EVENTI_GA4.md](EVENTI_GA4.md).
6. Riapri le preferenze, disattiva il marketing e salva: la pagina si ricarica e i cookie
   `_gcl_*` spariscono (**Application → Cookies**).

## 8. Cosa resta aperto

- **Il footer non c'è su `/check-up` e `/grazie`.** Su quelle due pagine manca quindi il
  link "Preferenze cookie". Il banner e le informative restano raggiungibili, ma la revoca
  no: aggiungere il footer anche lì è una scelta di funnel, da fare consapevolmente.
- **`.env` è tracciato da git** pur essendo in `.gitignore`, perché era già stato
  committato. Oggi contiene solo chiavi pubbliche, ma la prima chiave segreta che ci
  finisce entra nella cronologia in chiaro.
- **I testi delle informative** vanno fatti rileggere da chi segue la privacy.
