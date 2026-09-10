# Google Ads — tag e conversione del check-up

Il sito carica il tag di Google (gtag.js) sulle pagine pubbliche **solo dopo che il
visitatore ha accettato i cookie di marketing**, e segnala una conversione quando qualcuno
arriva su `/grazie`, cioè quando la risposta al check-up è stata salvata davvero — non
quando preme il pulsante di invio.

**Finché le variabili non sono impostate non viene caricato niente** e il sito si comporta
come se Google Ads non esistesse. Lo stesso vale finché manca il consenso: vedi
[CONSENSO_COOKIE.md](CONSENSO_COOKIE.md).

---

## 1. L'azione di conversione su Google Ads

**Obiettivi → Conversioni → Riepilogo → + Nuova azione di conversione → Sito web →
"Aggiungi manualmente un'azione di conversione".**

- **Categoria:** Invio di modulo per lead
- **Nome:** `Check-up compilato`
- **Conteggio:** **Una** — lo stesso lead che ricarica la pagina non è un secondo lead
- **Passaggio 1 dello snippet:** **Caricamento pagina** (non "Clic")

Dallo snippet che Google mostra alla fine servono due valori:

```js
gtag("event", "conversion", { send_to: "AW-1234567890/AbCdEfGhIjKlMnOp" });
//                                      └── ID ────┘ └── etichetta ───┘
```

Lo snippet **non va incollato da nessuna parte**: il codice è già nel sito.

## 2. Le variabili

Le variabili vanno nel **`.env` del repository**, non nel pannello di Vercel: la
configurazione Vite di questo progetto passa da `@lovable.dev/vite-tanstack-config`, che
fa una propria "VITE_* env injection", e una variabile che esiste solo su Vercel non
arriva a `import.meta.env`. Vedi il commento in testa al `.env` e il punto 1 di
[EVENTI_GA4.md](EVENTI_GA4.md).

```
VITE_GOOGLE_ADS_ID=AW-1234567890
VITE_GOOGLE_ADS_CONVERSION_LABEL=AbCdEfGhIjKlMnOp
VITE_GOOGLE_ADS_LEAD_VALUE=250        # opzionale
VITE_CONSENT_MODE=basic               # opzionale: basic (default) | advanced
```

Copiale, non riscriverle a mano: in quelle etichette `O` e `0`, `l` e `I` si somigliano, e
un carattere sbagliato non produce nessun errore — semplicemente non arriva mai una
conversione.

**Poi commit e push.** Le variabili `VITE_` vengono scritte dentro il JavaScript quando il
sito viene costruito, non lette a ogni visita.

### Le anteprime ereditano le chiavi, ma non caricano più i tag

Il `.env` è tracciato da git, quindi ce l'hanno anche le anteprime dei branch e il sito di
prova. Per un periodo questo è bastato a far partire i tag ovunque: la diagnostica di
Google Ads aveva rilevato `AW-…` su **29 domini** — una ventina di anteprime Lovable, tre
deploy Vercel, due progetti vecchi e, unico legittimo, `www.hr0.it`.

La separazione è ora nel codice: `tracciamentoAbilitato()` in [`src/lib/site.ts`](../src/lib/site.ts)
autorizza `hr0.it` e `www.hr0.it`, e le quattro funzioni che possono parlare con Google —
`applyAdsConsent`, `trackAdsConversion`, `applyAnalyticsConsent`, `ga4Pronto` — escono
subito altrove. Su un'anteprima il banner compare e la scelta si salva, ma nessuno script
viene iniettato e nessuna conversione parte.

**Per aggiungere un dominio** (un secondo sito che deve condividere lo stesso account
Ads) si tocca solo `DOMINI_TRACCIAMENTO`. Il controllo va chiamato dentro le funzioni e
mai al livello del modulo: dipende da `window`, e una costante calcolata all'import
varrebbe `false` sul server e `true` dopo l'idratazione, facendo saltare il confronto a
React.

Spostare le chiavi su Vercel non sarebbe comunque servito — là non vengono lette affatto.

Sono variabili pubbliche, finiscono nel JavaScript della pagina: per un ID di conversione
va bene. **Non aggiungere mai lì chiavi segrete** (Resend, `service_role` di Supabase) —
il file `.env` di questo repository è tracciato da git e finirebbero committate in chiaro.

### Il valore del lead

`VITE_GOOGLE_ADS_LEAD_VALUE` è facoltativa. Se la imposti, ogni conversione viene inviata
con quel valore in euro; se la lasci vuota non mandiamo nessun valore e Google usa quello
configurato nell'azione di conversione.

Vale la pena metterla solo se il numero è ragionato — margine medio di un cliente ×
percentuale di lead che diventano clienti. Un valore inventato peggiora le decisioni di
Smart Bidding invece di migliorarle.

## 3. Collega l'obiettivo alle campagne

Se Google ti avvisa che _"Invio modulo per i lead non è un obiettivo predefinito a livello
di account"_, prendilo sul serio: finché l'obiettivo non è collegato, le conversioni
vengono registrate ma **non finiscono nella colonna Conversioni e Smart Bidding non
ottimizza su di esse**.

Da **Obiettivi → Riepilogo** puoi impostarlo come obiettivo predefinito dell'account,
oppure selezionarlo a mano in ogni campagna. Fallo **prima che le campagne inizino a
spendere**.

## 4. Verifica

1. Su `https://hr0.it` (non su un'anteprima: fuori dai domini di produzione non parte
   niente per disegno), F12 → **Network**, filtra `googletagmanager`. Con il banner
   disattivato `gtag/js?id=AW-…` **deve comparire subito, senza fare niente**. Con
   `CONSENSO_RICHIESTO = true` invece non deve comparire nulla prima di aver accettato: se
   si carica lo stesso, il consenso non sta funzionando.
2. Compila il check-up fino a `/grazie` e cerca una chiamata a `googleadservices` o
   `google.com/pagead`.
3. Su Google Ads lo stato dell'azione passa da **Inattivo** a **Attivo**. Può volerci
   qualche ora.

**"Inattivo" prima della prima conversione è normale**, non è un errore da riparare: vuol
dire soltanto che Google non ha ancora ricevuto dati da quell'azione.

Lo strumento **Tag Assistant** (`tagassistant.google.com`) mostra la stessa cosa in modo
più leggibile.

---

## Come è fatto

Tutto in `src/lib/google-ads.ts`:

- **`initConsentMode()`** — prepara il `dataLayer` e scrive i segnali di consenso su
  `denied`. Non fa richieste di rete. Chiamata da `__root.tsx` per prima, perché quei
  segnali devono precedere l'esecuzione di gtag.js: dopo sarebbe troppo tardi.
- **`applyAdsConsent(granted)`** — allinea il tag alla scelta. Con il consenso porta i
  segnali a `granted` e carica lo script; senza, in `basic` non carica niente. Chiamata da
  `__root.tsx` con la scelta memorizzata, saltando `/admin` — l'area riservata è privata e
  non ha senso mandarne le visite a Google — e da `CookieBanner` a ogni cambio.
- **`trackAdsConversion()`** — chiamata da `grazie.tsx`. Ricontrolla il consenso da sé.

Tre dettagli che sembrano piccoli e non lo sono:

**L'ordine degli effetti.** In React gli effetti dei componenti figli girano _prima_ di
quelli della radice: quando `/grazie` invia la conversione, il tag caricato dal root non
esiste ancora. Per questo `trackAdsConversion()` carica il tag da sé, in modo idempotente.
Senza questo la conversione andrebbe persa in silenzio — e un ritardo a tempo non basta,
perché chi chiude la pagina prima che scada non viene contato.

**Il consenso che arriva dopo.** Chi atterra su `/grazie` senza aver ancora scelto vede il
banner proprio lì. L'effetto di `grazie.tsx` dipende quindi dal consenso, non gira una
volta sola: se l'accettazione arriva dopo, la conversione parte in quel momento.

**Il doppio conteggio.** Un refresh della pagina di ringraziamento rimanderebbe l'evento,
quindi la conversione viene marcata nel `sessionStorage`. È la prima rete; la seconda è
l'impostazione "Conteggio: Una" del punto 1. Servono entrambe.

---

## Gli altri eventi non sono conversioni

Scroll, permanenza, click e avanzamento del questionario vanno a **GA4**, non qui: vedi
[EVENTI_GA4.md](EVENTI_GA4.md). Ads conta solo gli eventi mappati su un'azione di
conversione, e creare un'azione per ciascuno significherebbe vederseli sommare nella colonna
"Conversioni".

Quando GA4 raccoglie da qualche settimana quegli eventi si possono importare
(**Obiettivi → Conversioni → + Nuova azione → Importa → Google Analytics 4**), ma **come
conversioni secondarie, in "Osservazione"**: alimentano i pubblici per il remarketing senza
guidare Smart Bidding. Un `form_start` promosso a conversione principale insegna alle
campagne a cercare persone che iniziano moduli: ne troverà moltissime, la colonna
Conversioni si riempirà, e i lead diminuiranno. **L'unica conversione principale resta il
check-up compilato.**

---

## Consenso cookie

> [!WARNING]
> **Oggi il banner è disattivato** (`CONSENSO_RICHIESTO = false` in `src/lib/site.ts`): il
> tag di Google Ads parte al primo caricamento di ogni pagina e la conversione viene
> inviata per ogni check-up completato, senza consenso preventivo. La tabella di cosa
> cambia fra i due stati è in [CONSENSO_COOKIE.md](CONSENSO_COOKIE.md).

Con `CONSENSO_RICHIESTO = true` il tag parte solo dopo un consenso esplicito, raccolto dal
banner. Il meccanismo — banner, Consent Mode v2, revoca, scadenza a sei mesi — è descritto
in [CONSENSO_COOKIE.md](CONSENSO_COOKIE.md).

Quello che serve sapere qui: `loadGoogleAds()` non esiste più. Al suo posto c'è
`applyAdsConsent(granted)`, che il root chiama con lo stato in vigore e il banner — quando
c'è — richiama a ogni cambio. Chiamare direttamente il caricamento del tag, aggirando
quella funzione, salta insieme al consenso anche il filtro sui domini di produzione: il tag
finirebbe sulle anteprime, ed è già costato dati veri inquinati.
