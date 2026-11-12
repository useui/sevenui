// Which primitive flavour this run tests. The ui-sdk vitest project sets
// SEVENUI_FLAVOUR and aliases @/registry/base/ui/* to registry/ui-sdk/ui/*.
// Use these helpers only where the two flavours legitimately differ; a test
// that fails because a port is wrong is fixed in the port.
export const flavour: "base" | "ui-sdk" =
  process.env.SEVENUI_FLAVOUR === "ui-sdk" ? "ui-sdk" : "base";

export const isUiSdk = flavour === "ui-sdk";

/** Picks the expectation for the flavour under test. */
export function byFlavour<T>(expected: { base: T; "ui-sdk": T }): T {
  return expected[flavour];
}

/** The attribute a popup trigger carries while its popup is open. */
export const triggerOpenAttribute = byFlavour({
  base: "data-popup-open",
  "ui-sdk": "data-open",
});
