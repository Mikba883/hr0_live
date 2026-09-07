/**
 * Scarica i font da Google e li salva in `public/fonts`, generando
 * `src/fonts.css` con le `@font-face` che puntano alle copie locali.
 *
 * Serve a non caricare i font da `fonts.googleapis.com`: quella richiesta manda
 * l'IP di ogni visitatore a Google prima di qualunque consenso. Serviti da noi
 * non esce nulla verso terzi, e spariscono un DNS + TLS dal percorso critico.
 *
 *   bun scripts/fetch-fonts.ts
 *
 * Da rilanciare solo se cambiano le famiglie o i pesi qui sotto. I file
 * scaricati vanno committati: il build non ha accesso a internet.
 */
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";

/**
 * Google serve un font variabile unico per l'intero intervallo di pesi, ma solo
 * se lo si chiede con la sintassi `500..900`. Chiedendo `500;600;700` si
 * ottengono cinque `@font-face` che puntano tutte allo stesso file: cinque
 * copie identiche sul disco e cinque righe di CSS per un font solo.
 */
const FAMILIES = [
  { name: "Archivo", weights: "500..900" },
  { name: "Inter", weights: "400..700" },
];

/** Il sito è in italiano: cirillico, greco e vietnamita sarebbero peso morto. */
const SUBSETS = new Set(["latin", "latin-ext"]);

/**
 * Senza uno user agent da browser recente Google risponde con `truetype`, che
 * pesa il triplo del woff2.
 */
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const OUT_DIR = "public/fonts";
const CSS_PATH = "src/fonts.css";

const query = FAMILIES.map((f) => `family=${f.name}:wght@${f.weights}`).join("&");
const url = `https://fonts.googleapis.com/css2?${query}&display=swap`;

await mkdir(OUT_DIR, { recursive: true });

const res = await fetch(url, { headers: { "User-Agent": UA } });
if (!res.ok) throw new Error(`Google Fonts ha risposto ${res.status} per ${url}`);
const css = await res.text();

type Face = {
  family: string;
  weight: string;
  subset: string;
  file: string;
  unicodeRange: string;
};

// Ogni @font-face è preceduta da un commento col nome del subset.
const faces: Face[] = [];
const blocks = css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g);

for (const [, subset, block] of blocks) {
  if (!SUBSETS.has(subset)) continue;

  const family = /font-family:\s*'([^']+)'/.exec(block)?.[1];
  const weight = /font-weight:\s*([\d\s]+);/.exec(block)?.[1].trim();
  const src = /url\((https:\/\/[^)]+)\)/.exec(block)?.[1];
  const unicodeRange = /unicode-range:\s*([^;]+);/.exec(block)?.[1].trim();
  if (!family || !weight || !src || !unicodeRange) {
    throw new Error(`@font-face non riconosciuta (subset ${subset}):\n${block}`);
  }

  const file = `${family.toLowerCase()}-${subset}.woff2`;
  const font = await fetch(src, { headers: { "User-Agent": UA } });
  if (!font.ok) throw new Error(`Download fallito (${font.status}): ${src}`);
  await writeFile(`${OUT_DIR}/${file}`, Buffer.from(await font.arrayBuffer()));

  faces.push({ family, weight, subset, file, unicodeRange });
}

if (faces.length === 0) throw new Error("Nessuna @font-face trovata: la risposta di Google è cambiata?");

faces.sort((a, b) => a.family.localeCompare(b.family) || a.subset.localeCompare(b.subset));

const header = [
  "/*",
  " * Generato da scripts/fetch-fonts.ts — non modificare a mano.",
  " *",
  " * Font serviti da noi e non da fonts.googleapis.com, così nessuna richiesta",
  " * parte verso terzi prima del consenso. Sono font variabili: un file copre",
  " * tutto l'intervallo di pesi dichiarato.",
  " */",
  "",
].join("\n");

const body = faces
  .map((f) =>
    [
      "@font-face {",
      `  font-family: "${f.family}";`,
      "  font-style: normal;",
      `  font-weight: ${f.weight};`,
      "  font-display: swap;",
      `  src: url("/fonts/${f.file}") format("woff2");`,
      `  unicode-range: ${f.unicodeRange};`,
      "}",
    ].join("\n"),
  )
  .join("\n\n");

await writeFile(CSS_PATH, `${header}${body}\n`);

const files = await readdir(OUT_DIR);
const orfani = files.filter((f) => f.endsWith(".woff2") && !faces.some((x) => x.file === f));
for (const f of orfani) await rm(`${OUT_DIR}/${f}`);

console.log(`${faces.length} @font-face → ${CSS_PATH}`);
for (const f of faces) console.log(`  ${f.family} ${f.weight} (${f.subset}) → ${f.file}`);
if (orfani.length) console.log(`Rimossi ${orfani.length} file non più referenziati.`);
