import "./setup";

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}
globalThis.__UI_SDK_STRICT__ = true;

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
