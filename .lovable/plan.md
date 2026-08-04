# Aggiungere un video al sito senza appesantire la build

## Obiettivo
Inserire un video promozionale/esplicativo in una delle landing page (`/costo`, `/metodo` o `/hr-esterno`) mantenendo l'output di pubblicazione sotto i limiti di Lovable (3 GB / 50.000 file).

## Stato attuale
La build attuale pesa circa 5,6 MB e 57 file. Il file più grande nel repo è `public/Photo.png` (3,2 MB). Non c'è nessun video caricato al momento.

## Soluzione consigliata
Usare il CDN **Lovable Assets** per ospitare il video: il file resta fuori dal repository, il codice punta a un URL stabile e la pubblicazione non si appesantisce. Alternativa: embed YouTube/Vimeo se il video è già online, ma comporta cookie e dipendenza da terze parti.

## Step del lavoro

1. **Ricevere il file video**
   - L'utente fornisce il video (path, dimensione, durata, formato attuale).
   - Se supera 5-8 MB, lo comprimiamo/converitiamo in MP4 H.264 720p/1080p prima di caricarlo.

2. **Caricamento su Lovable Assets**
   - Eseguire `lovable-assets create --file <path>`.
   - Salvare il puntatore `.asset.json` nel progetto (es. `src/assets/video-presentazione.mp4.asset.json`).
   - Cancellare il file binario originale dal repo dopo la creazione del puntatore.

3. **Inserimento nel sito**
   - Aggiungere una sezione video nella landing scelta (proposta: subito dopo l'hero di `/metodo` o come sezione "Come funziona").
   - Usare il tag HTML5 `<video>` con:
     - `controls`
     - `preload="metadata"`
     - `poster` opzionale (copertina statica)
     - `playsInline`
     - `muted` + `autoplay` + `loop` solo se deve partire da solo (es. hero senza audio)
   - Stilare con Tailwind per responsive: `w-full rounded-2xl max-w-4xl mx-auto`.
   - Per video sotto il fold: lazy-load con `loading="lazy"` sul poster o caricamento al click sulla copertina.

4. **Verifica**
   - Eseguire `bun run build` per confermare che l'output resti sotto i limiti.
   - Ricaricare il preview e controllare la riproduzione su desktop e mobile.
   - Pubblicare l'aggiornamento.

## Note tecniche
- Il CDN Lovable Assets serve il file a `/__l5e/assets-v1/{asset_id}/{filename}`: il puntatore `.asset.json` contiene l'URL da usare nel codice.
- Se si sceglie YouTube/Vimeo, implementare l'embed con iframe e aggiornare la pagina Cookie Policy.
- Non inserire il video in `public/` se è più di qualche MB: finirebbe nella build e nel repository.
