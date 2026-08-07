export const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_ID as string | undefined;
export const GOOGLE_ADS_CONVERSION_LABEL = import.meta.env
  .VITE_GOOGLE_ADS_CONVERSION_LABEL as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Carica gtag.js una sola volta (client-side). */
export function loadGoogleAds() {
  if (typeof window === "undefined" || !GOOGLE_ADS_ID) return;
  if (document.getElementById("gtag-google-ads")) return;

  const s = document.createElement("script");
  s.id = "gtag-google-ads";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(s);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
}

/** Invia la conversione Google Ads (es. lead completato). */
export function trackAdsConversion(params?: { value?: number; currency?: string }) {
  if (typeof window === "undefined") return;
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_LABEL || !window.gtag) return;

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    value: params?.value ?? 1.0,
    currency: params?.currency ?? "EUR",
  });
}
