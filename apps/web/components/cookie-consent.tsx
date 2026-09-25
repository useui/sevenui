"use client";

import "vanilla-cookieconsent/dist/cookieconsent.css";
import { useEffect } from "react";
import * as CookieConsent from "vanilla-cookieconsent";

const GA_ID = "G-8702Z28SMN";
const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

type Gtag = (...args: unknown[]) => void;
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag };

/**
 * Defines the `gtag` queue and records Consent Mode v2 defaults (everything
 * denied). Nothing reaches Google until gtag.js is injected, which only
 * happens after the visitor opts in to analytics — so calls made before that
 * (e.g. docs feedback events) only sit in the local queue.
 */
function initGtag(): Gtag {
  const w = window as GtagWindow;
  if (w.gtag) return w.gtag;
  w.dataLayer = w.dataLayer || [];
  const gtag: Gtag = function gtag() {
    // gtag.js requires the `arguments` object itself, not a spread array.
    // biome-ignore lint/complexity/noArguments: required by gtag.js
    w.dataLayer?.push(arguments);
  };
  w.gtag = gtag;
  gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });
  return gtag;
}

let gaLoaded = false;

function grantAnalytics() {
  const gtag = initGtag();
  gtag("consent", "update", { analytics_storage: "granted" });
  // Production only: dev and preview builds never talk to Google.
  if (gaLoaded || process.env.NODE_ENV !== "production") return;
  gaLoaded = true;
  gtag("js", new Date());
  gtag("config", GA_ID);
  const script = document.createElement("script");
  script.async = true;
  script.src = GA_SRC;
  document.head.appendChild(script);
}

function denyAnalytics() {
  initGtag()("consent", "update", { analytics_storage: "denied" });
}

function syncAnalytics() {
  if (CookieConsent.acceptedCategory("analytics")) grantAnalytics();
  else denyAnalytics();
}

const config: CookieConsent.CookieConsentConfig = {
  // Bump when categories or their purposes change: every visitor is asked again.
  revision: 1,
  cookie: {
    name: "cc_cookie",
    expiresAfterDays: 182,
    sameSite: "Lax",
  },
  guiOptions: {
    consentModal: {
      layout: "box",
      position: "bottom right",
      equalWeightButtons: true,
      flipButtons: false,
    },
    preferencesModal: {
      layout: "box",
      equalWeightButtons: true,
      flipButtons: false,
    },
  },
  categories: {
    necessary: { enabled: true, readOnly: true },
    analytics: {
      autoClear: {
        cookies: [{ name: /^_ga_/ }, { name: "_ga" }],
        // gtag.js keeps running once loaded; a reload is the only way to stop it.
        reloadPage: true,
      },
    },
  },
  onConsent: syncAnalytics,
  onChange: syncAnalytics,
  language: {
    default: "en",
    translations: {
      en: {
        consentModal: {
          title: "Cookies on SevenUI",
          // Kept to two short lines on purpose: a longer paragraph out-sizes the page's own text and
          // becomes every first visit's Largest Contentful Paint, painted only after hydration.
          description: "Google Analytics runs only if you accept. Change it any time in the footer.",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          showPreferencesBtn: "Manage preferences",
          footer: '<a href="/privacy">Privacy policy</a>',
        },
        preferencesModal: {
          title: "Cookie preferences",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          savePreferencesBtn: "Save preferences",
          closeIconLabel: "Close",
          sections: [
            {
              description:
                'Choose which cookies SevenUI may use. Analytics stays off unless you turn it on. Details are in our <a href="/privacy">privacy policy</a>.',
            },
            {
              title: "Strictly necessary",
              description:
                "Keep you signed in and remember this choice. The site cannot work without them, so they are always on.",
              linkedCategory: "necessary",
              cookieTable: {
                headers: { name: "Cookie", purpose: "Purpose" },
                body: [
                  { name: "__session, __client_uat", purpose: "Clerk sign-in session (only once you sign in)" },
                  { name: "cc_cookie", purpose: "Stores your cookie choice for 6 months" },
                ],
              },
            },
            {
              title: "Analytics",
              description:
                "Google Analytics 4 tells us, in aggregate, which pages and components get used. No advertising, no profiles.",
              linkedCategory: "analytics",
              cookieTable: {
                headers: { name: "Cookie", purpose: "Purpose" },
                body: [
                  { name: "_ga", purpose: "Distinguishes visitors (up to 2 years)" },
                  { name: "_ga_*", purpose: "Keeps session state (up to 2 years)" },
                ],
              },
            },
          ],
        },
      },
    },
  },
};

export function CookieConsentBanner() {
  useEffect(() => {
    initGtag();
    void CookieConsent.run(config);
  }, []);
  return null;
}
