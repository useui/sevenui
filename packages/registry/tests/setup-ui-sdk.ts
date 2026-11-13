import { configure } from "@testing-library/react";
import "./setup";
import { installDevChecks } from "./helpers/ui-sdk-dev-checks";

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}
globalThis.__UI_SDK_STRICT__ = true;

// UI SDK's accessible-name checks run on a timer (300ms for a select,
// combobox or command input). Each one still pending when a test ends runs
// then, before cleanup, so an unnamed control fails on every machine rather
// than only on one slow enough to reach the timer (see the helper).
installDevChecks();

// UI SDK announces toasts and field errors through visually hidden live
// regions ([data-ui-sdk-announcer]) that it fills about 100ms later and never
// clears. Text queries skip them, as they skip <script> and <style>: a test
// that checks a toast or an error is gone must not depend on finishing before
// the announcement lands, which a loaded machine does not.
configure({ defaultIgnore: "script, style, [data-ui-sdk-announcer]" });

// jsdom has some of these without the parts UI SDK needs, so assign rather
// than `??=` (see @ui-sdk/react docs, Testing > jsdom).
// jsdom hides every [popover] and has no top layer. Only a popover UI SDK has
// shown is made visible, so closed content left in the page stays hidden and
// cannot pass for an open popup.
HTMLElement.prototype.showPopover = function (this: HTMLElement) {
  this.setAttribute("data-test-popover-open", "");
};
HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
  this.removeAttribute("data-test-popover-open");
};
Element.prototype.getAnimations = () => [];
Element.prototype.scrollIntoView = () => {};
Element.prototype.checkVisibility = () => true;
Element.prototype.getClientRects = () => [] as unknown as DOMRectList;
document.elementFromPoint = () => null;
document.elementsFromPoint = () => [];
document.head.append(
  Object.assign(document.createElement("style"), {
    textContent: "[popover][data-test-popover-open] { display: block !important }",
  }),
);
