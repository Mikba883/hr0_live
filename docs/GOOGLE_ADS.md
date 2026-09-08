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

Su **Lovable**, nelle variabili d'ambiente del progetto:

```
VITE_GOOGLE_ADS_ID=AW-1234567890
VITE_GOOGLE_ADS_CONVERSION_LABEL=AbCdEfGhIjKlMnOp
VITE_GOOGLE_ADS_LEAD_VALUE=250        # opzionale
VITE_CONSENT_MODE=basic               # opzionale: basic (default) | advanced
```

Copiale, non riscriverle a mano: in quelle etichette `O` e `0`, `l` e `I` si somigliano, e
un carattere sbagliato non produce nessun errore — semplicemente non arriva mai una
conversione.

**Poi ripubblica il sito.** Le variabili `VITE_` vengono lette quando il sito viene
costruito, non a ogni visita: senza un nuovo deploy non cambia niente.

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

1. Sul sito, F12 → **Network**, filtra `googletagmanager`. **Prima di accettare il banner
   non deve comparire niente**: se `gtag/js` si carica lo stesso, il consenso non sta
   funzionando. Accetta e la richiesta `gtag/js?id=AW-…` compare.
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

## Consenso cookie

Il tag parte solo dopo un consenso esplicito, raccolto dal banner. Il meccanismo — banner,
Consent Mode v2, revoca, scadenza a sei mesi — è descritto in
[CONSENSO_COOKIE.md](CONSENSO_COOKIE.md).

Quello che serve sapere qui: `loadGoogleAds()` non esiste più. Al suo posto c'è
`applyAdsConsent(granted)`, che il root chiama con la scelta memorizzata e il banner
richiama a ogni cambio. Chiamare direttamente il caricamento del tag, aggirando quella
funzione, significa installare cookie di profilazione senza consenso.
