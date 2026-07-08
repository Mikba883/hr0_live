
# Progetto vuoto "hr0"

Preparo uno scheletro pulito, senza abilitare Lovable Cloud (collegherai tu GitHub e Supabase esterni).

## Cosa faccio

1. Aggiorno `src/routes/index.tsx` rimuovendo il placeholder e mettendo una landing minimale con titolo "hr0".
2. Aggiorno `src/routes/__root.tsx` con metadati SEO base:
   - title: "hr0"
   - description, og:title, og:description, twitter:card coerenti

## Cosa NON faccio

- Nessuna chiamata a `supabase--enable` (niente Lovable Cloud).
- Nessuna integrazione GitHub via connector (collegamento repo esterno lo fai dal menu +.
- Nessuna dipendenza aggiunta, nessuna tabella, nessuna auth.

## Dopo l'approvazione

Ti indicherò i passi manuali:
- Menu + → GitHub → Connect project (per il repo esterno)
- Integrazione Supabase esterno: aggiungerai tu le variabili `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` e il client quando vorrai iniziare a usarlo.
