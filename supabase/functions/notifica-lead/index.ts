/**
 * Manda una mail quando arriva una nuova risposta al check-up.
 *
 * Viene chiamata da un Database Webhook di Supabase all'INSERT su
 * `survey_responses`. Il webhook usa pg_net, che parte in modo asincrono: se
 * questa funzione è lenta o rotta, il visitatore che compila il form non se ne
 * accorge e la risposta resta comunque salvata. La notifica è un di più, non
 * deve mai diventare un punto di rottura.
 *
 * Variabili richieste (Edge Functions → Secrets):
 *   RESEND_API_KEY    chiave di Resend
 *   NOTIFICA_A        destinatario, es. tu@azienda.it (più indirizzi separati da virgola)
 *   NOTIFICA_DA       mittente verificato su Resend, es. "Check-up <lead@tuodominio.it>"
 *   NOTIFICA_SECRET   stringa segreta, la stessa impostata come header nel webhook
 *   SITO_URL          opzionale, es. https://hr0-sparkle-connect.lovable.app
 *
 * Deploy con --no-verify-jwt: l'autorizzazione la fa l'header segreto, non un
 * JWT. Senza quel flag basterebbe la chiave pubblica del sito per riempirti la
 * casella di finte notifiche.
 */

type Lead = {
  id: string;
  created_at: string;
  nome: string;
  azienda: string;
  ruolo: string;
  email: string;
  telefono: string;
  dipendenti: string;
  settore: string;
  assumere_12m: string;
  momento_azienda: string;
  ruolo_aperto: string;
  ruolo_quale: string | null;
  urgenza: string | null;
  tempo_scoperto: string | null;
  prima_volta: string | null;
  chi_se_ne_occupa: string;
  frustrazioni: string[] | null;
  obiettivo_call: string | null;
  source: string | null;
  utm: Record<string, string> | null;
};

const BRAND = "#6B21FF";
const INK = "#0B1220";
const SOFT = "#4B5563";
const LINEA = "#E5E7EB";

/** I campi arrivano da un form pubblico: finiscono in HTML solo dopo questa. */
function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function telPulito(telefono: string): string {
  const solo = telefono.replace(/[^\d+]/g, "");
  if (solo.startsWith("+")) return solo;
  if (solo.startsWith("00")) return `+${solo.slice(2)}`;
  return `+39${solo}`;
}

function riga(etichetta: string, valore: string | null | undefined): string {
  if (!valore) return "";
  return `<tr>
    <td style="padding:6px 0;color:${SOFT};font-size:14px;">${esc(etichetta)}</td>
    <td style="padding:6px 0;color:${INK};font-size:14px;font-weight:600;text-align:right;">${esc(valore)}</td>
  </tr>`;
}

function blocco(titolo: string, righe: string): string {
  if (!righe.trim()) return "";
  return `
    <p style="margin:24px 0 4px;color:${SOFT};font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${esc(titolo)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${righe}</table>`;
}

function corpo(lead: Lead, sito: string): string {
  const tel = telPulito(lead.telefono);
  const campagna = lead.utm
    ? Object.entries(lead.utm)
        .map(([k, v]) => `${k.replace("utm_", "")}: ${v}`)
        .join(" · ")
    : null;

  return `<!doctype html>
<html lang="it"><body style="margin:0;padding:24px;background:#F6F5F1;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border:1px solid ${LINEA};border-radius:16px;">
    <tr><td style="padding:28px;">

      <p style="margin:0;color:${BRAND};font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">Nuovo check-up compilato</p>
      <h1 style="margin:8px 0 0;color:${INK};font-size:24px;line-height:1.2;">${esc(lead.azienda)}</h1>
      <p style="margin:4px 0 0;color:${SOFT};font-size:15px;">${esc(lead.nome)} · ${esc(lead.ruolo)}</p>

      <div style="margin:24px 0;">
        <a href="tel:${esc(tel)}" style="display:inline-block;background:${BRAND};color:#fff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 22px;border-radius:999px;">Chiama ${esc(lead.telefono)}</a>
      </div>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
        ${riga("Email", lead.email)}
        ${riga("Urgenza", lead.urgenza)}
        ${riga("Assunzioni previste (12 mesi)", lead.assumere_12m)}
      </table>

      ${blocco("Azienda", riga("Settore", lead.settore) + riga("Dipendenti", lead.dipendenti) + riga("Momento", lead.momento_azienda))}

      ${blocco(
        "La ricerca",
        riga("Ruolo aperto", lead.ruolo_aperto) +
          riga("Quale ruolo", lead.ruolo_quale) +
          riga("Scoperto da", lead.tempo_scoperto) +
          riga("Prima volta", lead.prima_volta) +
          riga("Chi se ne occupa", lead.chi_se_ne_occupa),
      )}

      ${blocco(
        "Cosa gli pesa",
        riga("Frustrazione", lead.frustrazioni?.length ? lead.frustrazioni.join(", ") : null) +
          riga("Vuole capire", lead.obiettivo_call) +
          riga("Provenienza", lead.source) +
          riga("Campagna", campagna),
      )}

      ${
        sito
          ? `<p style="margin:28px 0 0;padding-top:20px;border-top:1px solid ${LINEA};">
               <a href="${esc(sito)}/admin" style="color:${BRAND};font-size:14px;font-weight:600;">Aprilo in area riservata →</a>
             </p>`
          : ""
      }

    </td></tr>
  </table>
</body></html>`;
}

/**
 * Schiaccia il testo su una riga sola.
 *
 * Oggetto e reply-to diventano header del messaggio, e i loro valori arrivano
 * da un form la cui API di inserimento è pubblica: un a capo infilato lì
 * dentro è il modo classico di aggiungere header che non hai scritto tu.
 */
function unaRiga(v: string, max = 200): string {
  return v
    .replace(/[\r\n]+/g, " ")
    .trim()
    .slice(0, max);
}

/** Riga di riepilogo nell'oggetto: quello che si legge dalla lista mail. */
function oggetto(lead: Lead): string {
  const fretta = lead.urgenza === "Serviva ieri" ? "· URGENTE " : "";
  return unaRiga(`Nuovo lead ${fretta}— ${lead.azienda} (${lead.nome})`);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const segreto = Deno.env.get("NOTIFICA_SECRET");
  if (!segreto || req.headers.get("x-notifica-secret") !== segreto) {
    return new Response("Non autorizzato", { status: 401 });
  }

  const chiave = Deno.env.get("RESEND_API_KEY");
  const a = Deno.env.get("NOTIFICA_A");
  const da = Deno.env.get("NOTIFICA_DA");
  if (!chiave || !a || !da) {
    console.error("Mancano RESEND_API_KEY, NOTIFICA_A o NOTIFICA_DA fra i secrets.");
    return new Response("Configurazione incompleta", { status: 500 });
  }

  let lead: Lead;
  try {
    const payload = await req.json();
    lead = payload.record;
    if (!lead?.azienda) throw new Error("payload senza record");
  } catch (e) {
    console.error("Payload non valido:", e);
    return new Response("Payload non valido", { status: 400 });
  }

  const risposta = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${chiave}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: da,
      to: a.split(",").map((x) => x.trim()),
      reply_to: unaRiga(lead.email, 320),
      subject: oggetto(lead),
      html: corpo(lead, Deno.env.get("SITO_URL") ?? ""),
    }),
  });

  if (!risposta.ok) {
    const dettaglio = await risposta.text();
    console.error(`Resend ha rifiutato l'invio (${risposta.status}): ${dettaglio}`);
    return new Response("Invio fallito", { status: 502 });
  }

  return new Response("ok");
});
