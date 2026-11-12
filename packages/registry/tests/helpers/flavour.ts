import { waitFor } from "@testing-library/react";
import type { UserEvent } from "@testing-library/user-event";
import { expect } from "vitest";

// Which primitive flavour this run tests. The ui-sdk vitest project sets
// SEVENUI_FLAVOUR and aliases @/registry/base/ui/* to registry/ui-sdk/ui/*.
// Use these helpers only where the two flavours legitimately differ, and say
// why at the helper; a test that fails because a port is wrong is fixed in
// the port.
export const flavour: "base" | "ui-sdk" =
  process.env.SEVENUI_FLAVOUR === "ui-sdk" ? "ui-sdk" : "base";

export const isUiSdk = flavour === "ui-sdk";

/** Picks the expectation for the flavour under test. */
export function byFlavour<T>(expected: { base: T; "ui-sdk": T }): T {
  return expected[flavour];
}

/**
 * Asserts a closed popup is gone. Base UI unmounts it; UI SDK keeps some
 * closed content in the page with `hidden` (a tooltip stays mounted so its
 * trigger's aria-describedby always resolves).
 */
export function expectClosed(element: Element | null) {
  if (!isUiSdk) {
    expect(element).toBeNull();
    return;
  }
  expect(element === null || element.closest("[hidden]") !== null).toBe(true);
}

/**
 * Moves the pointer off an element. UI SDK keeps a hover popup open until the
 * pointer moves somewhere else (so it can travel onto the popup); a real
 * pointer always does, user-event's unhover alone does not.
 */
export async function movePointerAway(user: UserEvent, element: Element) {
  await user.unhover(element);
  if (isUiSdk) {
    await user.pointer({ target: document.body, coords: { clientX: 500, clientY: 500 } });
  }
}

/**
 * Waits for an opened popup to take focus before keys are pressed. UI SDK
 * moves focus (and, in a listbox, the highlight) into the popup a moment
 * after it opens; keys pressed before that race it. Base UI needs no wait.
 */
export async function waitForPopupFocus(popup: Element) {
  if (!isUiSdk) return;
  await waitFor(() => expect(popup.contains(document.activeElement)).toBe(true));
}
