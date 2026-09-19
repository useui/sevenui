import Script from "next/script";

const GA_ID = "G-8702Z28SMN";

// Two scripts today, both gated on NODE_ENV === "production" (the App Router
// equivalent of Blume's `import.meta.env.PROD`). The gate is preserved:
// without it, local development writes into the live property. The timing
// shift (afterInteractive rather than async-in-head) changes nothing
// measurable — GA4's enhanced measurement tracks history changes itself,
// which is why Blume's own Analytics.astro adds SPA pageview capture for
// PostHog and not for GA4.
//
// Vercel preview deployments run with NODE_ENV=production, so GA4 loads on
// previews — exactly as it does today, since `import.meta.env.PROD` was also
// true there. This is parity, not a regression.
//
// Nothing else in Analytics.astro comes along: `analytics.vercel` is not
// enabled and PostHog is not configured (§14.5, §14.7).
export function Analytics() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
