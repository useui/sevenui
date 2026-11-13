// The primitive flavour axis: every SevenUI primitive ships on Base UI (the default) and on UI SDK.
// Modelled on lib/package-manager.ts: the choice lives in localStorage and on <html data-flavour>,
// pages server-render every variant, and CSS (`.flavour-only-*` in app/globals.css) hides the others.
// Named "flavour", not "base": the theme customizer already owns `baseColor`/`BaseOption`.

export const FLAVOUR_KEY = "sevenui:flavour";

/** The query parameter a shared link uses to set the preference, e.g. `?flavour=ui-sdk`. */
export const FLAVOUR_PARAM = "flavour";

/** The attribute the pre-paint script sets on <html>. */
export const FLAVOUR_ATTR = "data-flavour";

export const FLAVOURS = ["base-ui", "ui-sdk"] as const;
export type Flavour = (typeof FLAVOURS)[number];

export const DEFAULT_FLAVOUR: Flavour = "base-ui";

export const FLAVOUR_LABELS: Record<Flavour, string> = {
  "base-ui": "Base UI",
  "ui-sdk": "UI SDK",
};

/** The exact UI SDK release the flavour is built and tested against (packages/registry/package.json pins it). */
export const UI_SDK_VERSION = "0.1.0-beta.1";

export const UI_SDK_HOME = "https://ui-sdk.dev";

/** A UI SDK component's React docs page; `entry` is the `@ui-sdk/react/<entry>` import. */
export const uiSdkDocsUrl = (entry: string): string => `${UI_SDK_HOME}/docs/react/components/${entry}`;

export const BASE_UI_DOCS_URL = "https://base-ui.com/react/overview/quick-start";

export function isFlavour(value: unknown): value is Flavour {
  return typeof value === "string" && (FLAVOURS as readonly string[]).includes(value);
}

export function currentFlavour(): Flavour {
  if (typeof document === "undefined") return DEFAULT_FLAVOUR;
  const value = document.documentElement.getAttribute(FLAVOUR_ATTR);
  return isFlavour(value) ? value : DEFAULT_FLAVOUR;
}

/** Fired on `document` whenever the flavour changes in this tab. */
export const FLAVOUR_EVENT = "sevenui:flavourchange";

/** Applies a flavour to the page and remembers it. */
export function setFlavour(flavour: Flavour): void {
  document.documentElement.setAttribute(FLAVOUR_ATTR, flavour);
  try {
    localStorage.setItem(FLAVOUR_KEY, flavour);
  } catch {
    // Storage blocked; the choice still applies for this page view.
  }
  // A shared `?flavour=` link set the choice on load; keep the address in step so a reload agrees.
  const url = new URL(window.location.href);
  if (url.searchParams.has(FLAVOUR_PARAM)) {
    url.searchParams.set(FLAVOUR_PARAM, flavour);
    window.history.replaceState(window.history.state, "", url);
  }
  document.dispatchEvent(new Event(FLAVOUR_EVENT));
}

/** Subscribes to flavour changes in this tab and in others (storage). */
export function subscribeFlavour(onChange: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== FLAVOUR_KEY) return;
    const next = event.newValue;
    document.documentElement.setAttribute(FLAVOUR_ATTR, isFlavour(next) ? next : DEFAULT_FLAVOUR);
    onChange();
  };
  document.addEventListener(FLAVOUR_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    document.removeEventListener(FLAVOUR_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * The registry item a flavour installs. Only primitives and their examples are flavoured; shared items
 * (`theme`, `sevenui-tokens`, `animations`) and Pro blocks are not, so callers pass `flavoured: false`.
 */
export function flavourItem(item: string, flavour: Flavour, flavoured = true): string {
  return flavoured && flavour === "ui-sdk" ? `ui-sdk/${item}` : item;
}

/** The registry JSON URL path of an item, e.g. `/r/ui-sdk/component/accordion-01.json`. */
export function registryJsonPath(item: string, flavour: Flavour, flavoured = true): string {
  return `/r/${flavourItem(item, flavour, flavoured)}.json`;
}
