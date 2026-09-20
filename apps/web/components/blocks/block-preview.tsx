"use client";

import {
  ArrowUpRight,
  Check,
  Link2,
  Maximize2,
  Monitor,
  RotateCw,
  Smartphone,
  Sparkles,
  Tablet,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { currentPackageManager } from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { useAnnounce } from "./blocks-announcer";
import { useBlockLoadGate } from "./blocks-load-gate";
import { InstallControl } from "./install-control";

/**
 * The live half of one gallery card: a re-sizable preview frame with a
 * visible "track" showing the frame's original extent as it is narrowed — a
 * plain bg-muted/30 tint, no outline of its own. (An earlier version traced
 * the track's edge with a broken/segmented border, but with the toolbar now a
 * full-track bar and the handle sitting outside the box, that outline just
 * collided with those corners and no longer carried its own meaning; the bar
 * + framed box + external handle already make the track's extent obvious
 * geometrically, so the tint alone is enough.) The toolbar (width presets,
 * the frame actions, and the install control) is attached to the top of the
 * track and spans its FULL width — it does not re-size with the frame, only
 * the framed box below it does. The drag handle sits OUTSIDE that box, in the
 * track's own vacated area to its right, tracking the box's live edge.
 *
 * Ported from `legacy-components/block-frame.astro`, whose ~828-line
 * document-level delegated script this replaces. That script was delegated
 * for one reason its own comments state: the alternative in Astro was a React
 * island per control, which on a six-card category page is 54 of them. React
 * has no such cost, so the per-card half of that script is simply per-card
 * state here. The two genuinely page-wide halves did NOT come along: the
 * loading queue is `blocks-load-gate.tsx` and the live region is
 * `blocks-announcer.tsx`, both mounted once by the /blocks layout.
 *
 * The iframe is INTERACTIVE by deliberate product decision (it reverses an
 * earlier a11y-motivated "inert" choice, since accepted by the owner): click
 * inputs, toggle pricing tabs, type into OTP slots, right in the gallery.
 * Because a cross-document iframe can swallow pointermove during a drag
 * (setPointerCapture does not reliably retarget across that boundary in every
 * engine), `app/globals.css`'s /blocks section suppresses the iframe's
 * pointer-events for exactly the duration of a drag, driven by the same
 * `data-dragging` flag this component toggles on the iframe's wrapper.
 *
 * The handle is authored BEFORE the box in source order even though it renders
 * to the box's right. Tab order follows the DOM, and the iframe is a full
 * application — with the handle last, reaching the control that re-sizes a
 * preview meant tabbing through the entire preview first, six times over on a
 * category page. Its position is set entirely from `left`, so moving it in
 * source changes nothing visually.
 *
 * SOURCE OF TRUTH FOR EVERY WIDTH MEASUREMENT (readout, aria-value*, preset
 * bucketing, the min/max clamp) is the IFRAME's own content width, not the
 * box's border-box width — the box is border-box with a border on every side,
 * so its rendered width is always a couple of pixels wider than what actually
 * renders inside it. Measuring that delta once at runtime (rather than
 * hardcoding "2") is what makes "1024px" in the badge mean the block genuinely
 * renders at 1024.
 *
 * WHY THE WIDTH ITSELF IS NOT REACT STATE. `applyWidth` writes
 * `box.style.width` directly, exactly as the Astro script did, and a
 * ResizeObserver on the IFRAME reconciles the readout, the separator's
 * aria-value*, the handle's position and the presets' pressed state
 * afterwards. That observer is also why a state-driven width would be the
 * wrong shape: it has to fire for triggers React never sees — a browser or
 * viewport resizing event, and a shrinking track clamping the box through its
 * own max-width — and it fires once on initial observe, covering the
 * first-paint reading for free. Only the observer writes state, so a drag
 * costs one style write per pointermove and at most one render per observed
 * change. React's own DOM diffing supplies what the source's `setAttr` helper
 * supplied by hand: an aria-value* attribute is only written when its value
 * actually changed, which is what keeps a screen reader from re-announcing
 * the separator on every observer tick.
 *
 * Every sr-only name below is ONE template literal rather than text with
 * `{title}` spliced into the middle of it. The rendered characters are
 * identical; the difference is that React's SSR writer separates two adjacent
 * text children with an empty HTML comment, and a single expression is a
 * single text node with no separator. `components/blocks/category-card.tsx`
 * set the precedent for exactly this, for exactly this reason: production
 * emits the bare text, and a comment marker in six accessible names per card
 * is an undeclared difference for nothing.
 */

// Single source of truth for the re-sizing bounds, expressed in IFRAME width
// (not box width). The client converts them to the equivalent box width using
// the runtime-measured border delta below; the exact box-to-iframe offset
// cannot be known at build time. MIN_WIDTH is a FLOOR THIS COMPONENT ENFORCES,
// deliberately not a CSS `min-width` on the box: `min-width` beats `max-width`
// in the cascade, so below a ~408px viewport the box rendered 360px inside a
// ~312px track — clipping the preview's right edge and flinging the handle
// past the card, which gave every phone a horizontal scrollbar. The clamp in
// `applyWidth` already computes the correct bound against the live track.
// The same three numbers define the preset/active-range boundaries: mobile
// <= 384, tablet 385-1023, desktop >= 1024 (up to the 1440 cap) — all
// iframe-width ranges.
const MIN_WIDTH = 360;
const MAX_WIDTH = 1440;

// Half the 16px hit zone: the handle straddles the box's live right edge.
const HANDLE_HALF = 8;
const KEY_STEP = 24;
const COPIED_MS = 1600;

// Shared geometry for every icon control in the toolbar. Selected state is
// styled off `aria-pressed` alone — matching the theme dock — rather than a
// mirrored `data-active` attribute. Two sources of truth for one state is how
// the visible half stays working while the ARIA half silently rots.
//
// Deliberately carries NO display utility: the tiered controls below compose
// `hidden @sm/card:inline-flex` onto it, and a baked-in `inline-flex` would
// sit in the same cascade layer as `hidden` — where source order in the class
// attribute counts for nothing and the generated stylesheet's order decides.
// `inline-flex` won that race, so every tiered control rendered at every width.
const ICON =
  "size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ALWAYS = `${ICON} inline-flex`;
const PRESET = `${ALWAYS} aria-pressed:bg-muted aria-pressed:text-foreground`;

/**
 * Which preset's range contains this width: mobile <= 384, tablet 385-1023,
 * desktop >= 1024. Matches each button's own preset value so the caller can
 * compare directly.
 */
function presetBucket(width: number): "384" | "768" | "max" {
  if (width <= 384) return "384";
  if (width <= 1023) return "768";
  return "max";
}

export interface BlockPreviewProps {
  /** The card's anchor id, which the permalink button copies. */
  name: string;
  title: string;
  /** Repeated into the agent prompt; the visible copy lives on the card. */
  description: string;
  height: number;
  /** Registry item id passed to `installCommand()`, e.g. "pro/dashboard-01". */
  installItem: string;
  /** iframe src + "open in new tab" target. */
  previewUrl: string;
  /** GitHub source link; the control is not rendered when absent. */
  sourceUrl?: string;
}

export function BlockPreview({
  name,
  title,
  description,
  height,
  installItem,
  previewUrl,
  sourceUrl,
}: BlockPreviewProps) {
  const announce = useAnnounce();
  const gate = useBlockLoadGate();

  const wrapperRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const deltaRef = useRef<number | null>(null);
  const dragRef = useRef<{ pointerId: number; grabOffset: number } | null>(null);
  const dragCleanup = useRef<(() => void) | null>(null);
  const prevWidthRef = useRef<string | null>(null);
  const fullscreenRef = useRef(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [src, setSrc] = useState<string>();
  const [metrics, setMetrics] = useState<{ width: number; available: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [fsFallback, setFsFallback] = useState(false);
  const [flash, setFlash] = useState<"prompt" | "permalink" | null>(null);

  // The box is border-box with a border on every side, so its own rendered
  // width is always a set few px wider than the iframe's real content width
  // inside it. Measured once per card (rather than hardcoding "2") so every
  // width computation is exact regardless of the box's actual border-width,
  // and cached so a hot drag loop does not re-read layout on every pointermove.
  // Not cached while the iframe has no layout yet — a zero clientWidth would
  // freeze a nonsense delta for the life of the card.
  function borderDelta(): number {
    if (deltaRef.current !== null) return deltaRef.current;
    const box = boxRef.current;
    const iframe = iframeRef.current;
    if (!box || !iframe || iframe.clientWidth === 0) return 0;
    deltaRef.current = box.offsetWidth - iframe.clientWidth;
    return deltaRef.current;
  }

  // The widest iframe this track can currently show, honouring both the item's
  // own cap and what the track physically offers. Shared by the clamp and the
  // observer so `aria-valuemax` can never disagree with the enforced bound.
  function trackMax(): number {
    const wrapper = wrapperRef.current;
    if (!wrapper) return MAX_WIDTH;
    return Math.min(wrapper.getBoundingClientRect().width - borderDelta(), MAX_WIDTH);
  }

  // Re-size the box so the IFRAME lands at exactly targetIframePx, clamped to
  // [MIN_WIDTH, MAX_WIDTH] (iframe-width bounds) and to whatever width the
  // track can actually offer the iframe once the border delta is subtracted.
  // When the track is narrower than the floor, the track wins — the box must
  // never render wider than the space it has.
  function applyWidth(targetIframePx: number) {
    const box = boxRef.current;
    if (!box) return;
    const delta = borderDelta();
    const maxIframePx = trackMax();
    const floor = Math.min(MIN_WIDTH, maxIframePx);
    const clampedIframePx = Math.min(Math.max(targetIframePx, floor), maxIframePx);
    box.style.width = `${clampedIframePx + delta}px`;
    // Keep the straddling handle glued to the box edge synchronously — the
    // ResizeObserver reconciles a tick later, but during a fast drag this is
    // what keeps the handle from visibly trailing the edge.
    const handle = handleRef.current;
    if (handle) handle.style.left = `${clampedIframePx + delta - HANDLE_HALF}px`;
  }

  // ---------------------------------------------------------------------------
  // Preview loading
  // ---------------------------------------------------------------------------
  // No `src` until the shared queue says so, and no `loading="lazy"` either —
  // the gate's IntersectionObserver decides, and lazy would additionally
  // re-arm itself on any later attribute write.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    return gate.register(iframe, () => setSrc(previewUrl));
  }, [gate, previewUrl]);

  const releaseSlot = () => {
    const iframe = iframeRef.current;
    if (iframe) gate.release(iframe);
  };

  // ---------------------------------------------------------------------------
  // Measurement
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width);
        const available = Math.round(trackMax());
        setMetrics((previous) =>
          previous && previous.width === width && previous.available === available
            ? previous
            : { width, available },
        );
        // Keep the external handle straddling the box's live right edge (half
        // over the border, half over the track) — it is a sibling positioned
        // in the frame region, so nothing moves it automatically.
        const box = boxRef.current;
        const handle = handleRef.current;
        if (box && handle) {
          handle.style.left = `${box.getBoundingClientRect().width - HANDLE_HALF}px`;
        }
      }
    });
    observer.observe(iframe);
    // Disconnecting on unmount is what the Astro script needed an
    // `astro:before-swap` listener for: a ResizeObserver holds STRONG
    // references to its targets, so without it every gallery navigation pinned
    // another page's worth of detached iframes in memory.
    return () => observer.disconnect();
    // Mount-only: every value this effect reads is a ref, and one observer
    // per card for that card's whole lifetime is the intent.
  }, []);

  // ---------------------------------------------------------------------------
  // Drag
  // ---------------------------------------------------------------------------
  // Listeners go on `document`, not on the handle itself. Pointer capture
  // retargets the events to the handle, but the capture is exactly what a
  // cross-document iframe can break; a document listener still sees the event
  // either way.
  //
  // They are bound SYNCHRONOUSLY, inside the pointerdown handler, rather than
  // from an effect keyed on `dragging`. An effect runs one scheduler task
  // later, and the pointer has usually already moved by then, so the first
  // pointermove of every drag was being dropped — the Astro source bound these
  // at document scope once and permanently, and never had the gap. Binding
  // here also closes a leak the effect shape had: `userSelect` is set on the
  // same line that starts the drag, so the thing that clears it must be
  // reachable from an unmount that happens before any pointerup, which
  // `dragCleanup` below is and an effect cleanup keyed on state was not.
  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const handle = handleRef.current;
    const box = boxRef.current;
    if (!handle || !box) return;
    handle.setPointerCapture(event.pointerId);
    // Remember where on the handle the user grabbed relative to the box's
    // right edge, so the edge follows the pointer without the initial jump a
    // raw clientX mapping would cause on a straddling handle.
    dragRef.current = {
      pointerId: event.pointerId,
      grabOffset: box.getBoundingClientRect().right - event.clientX,
    };
    // State only drives `data-dragging`, which the stylesheet reads to
    // suppress the iframe's pointer-events. pointerdown is a discrete event,
    // so this flushes synchronously and the suppression lands before the next
    // pointermove — which is the whole point of the flag.
    setDragging(true);
    document.body.style.userSelect = "none";

    function onMove(moveEvent: PointerEvent) {
      const drag = dragRef.current;
      const wrapper = wrapperRef.current;
      if (!drag || !wrapper || moveEvent.pointerId !== drag.pointerId) return;
      const rect = wrapper.getBoundingClientRect();
      // The pointer drives the box's right edge, preserving the grab point on
      // the straddling handle; convert to the equivalent iframe target by
      // removing the border delta.
      const targetBoxPx = moveEvent.clientX + drag.grabOffset - rect.left;
      applyWidth(targetBoxPx - borderDelta());
    }

    function end(endEvent: PointerEvent) {
      const drag = dragRef.current;
      if (!drag || endEvent.pointerId !== drag.pointerId) return;
      const current = handleRef.current;
      if (current?.hasPointerCapture(endEvent.pointerId)) {
        current.releasePointerCapture(endEvent.pointerId);
      }
      dragRef.current = null;
      setDragging(false);
      stop();
    }

    function stop() {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", end);
      document.removeEventListener("pointercancel", end);
      document.body.style.userSelect = "";
      dragCleanup.current = null;
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
    // A drag that is still live when this card unmounts has to be able to undo
    // both halves of what pointerdown did.
    dragCleanup.current = stop;

    // preventDefault suppresses text selection, but it also suppresses the
    // focus the press would otherwise give the handle — which is why the arrow
    // keys did nothing after a mouse drag. Focus it explicitly.
    event.preventDefault();
    handle.focus();
  }

  useEffect(() => () => dragCleanup.current?.(), []);

  function onHandleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const currentIframePx = iframe.getBoundingClientRect().width;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      applyWidth(currentIframePx + (event.key === "ArrowRight" ? KEY_STEP : -KEY_STEP));
    } else if (event.key === "Home") {
      event.preventDefault();
      applyWidth(MIN_WIDTH);
    } else if (event.key === "End") {
      event.preventDefault();
      applyWidth(Number.POSITIVE_INFINITY);
    }
  }

  // ---------------------------------------------------------------------------
  // Full screen, in two flavours
  // ---------------------------------------------------------------------------
  // requestFullscreen goes on the WRAPPER, not the iframe: only the fullscreen
  // element and its descendants render, so promoting the iframe alone would
  // take the toolbar with it. The iframe node is never moved either —
  // inserting an <iframe> elsewhere creates a new nested navigable, throwing
  // away the preview's state and paying a fresh load.
  //
  // `allowfullscreen` is deliberately absent from the iframe: the spec checks
  // the node document of the element being promoted, which is this document.
  // Only a call from INSIDE the frame would need the permissions-policy grant.

  // Releasing the pinned box width is what stops a card that was left on the
  // 384px preset from opening as a letterboxed strip. Stashing it first is
  // what lets the card come back exactly as the reader left it. The CSS
  // deliberately does NOT force the box's width instead: the UA's `!important`
  // rules apply only to the fullscreen element itself, and pinning the box
  // back with another `!important` would make the width presets silently inert
  // in full screen, since `applyWidth` writes an ordinary style value.
  function setFullscreenLayout(on: boolean) {
    const box = boxRef.current;
    if (box) {
      if (on) {
        prevWidthRef.current = box.style.width;
        box.style.width = "";
      } else {
        box.style.width = prevWidthRef.current ?? "";
        prevWidthRef.current = null;
      }
    }
    fullscreenRef.current = on;
    setFullscreen(on);
  }

  // iPhone has no Fullscreen API (WebKit #212934, WONTFIX; iOS supports it on
  // iPad only), so this plain overlay is not a rare fallback — it is every
  // iPhone. It does not make the rest of the page inert, so background content
  // stays reachable by screen reader; Escape and the toolbar's own button are
  // the ways out.
  function applyFallback(on: boolean) {
    setFsFallback(on);
    setFullscreenLayout(on);
  }

  function enterFullscreen() {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (document.fullscreenEnabled) {
      // Must stay synchronous with the click — awaiting anything first spends
      // the transient activation.
      wrapper.requestFullscreen().catch(() => applyFallback(true));
      return;
    }
    applyFallback(true);
  }

  function exitFullscreen() {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (document.fullscreenElement === wrapper) {
      void document.exitFullscreen();
    } else {
      applyFallback(false);
    }
  }

  // Fires for the button, for Escape, and for the browser's own full-screen UI
  // alike — the one place that reconciles layout with the actual state.
  useEffect(() => {
    const onChange = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const on = document.fullscreenElement === wrapper;
      if (on !== fullscreenRef.current) setFullscreenLayout(on);
    };
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
    // Mount-only: refs and state setters, both stable.
  }, []);

  // The overlay flavour locks page scrolling and answers Escape itself; the
  // Fullscreen API flavour gets both from the UA. Unmounting while the overlay
  // is up restores scrolling, which the Astro version needed an explicit
  // `astro:before-swap` reset for.
  useEffect(() => {
    if (!fsFallback) return;
    document.documentElement.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      applyFallback(false);
      wrapperRef.current?.querySelector<HTMLElement>("[data-fullscreen-button]")?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
    // `fsFallback` alone: `applyFallback` reads refs and state setters only.
  }, [fsFallback]);

  // ---------------------------------------------------------------------------
  // Toolbar actions
  // ---------------------------------------------------------------------------
  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

  // Visible confirmation for a copy control: swap its idle icon for the check
  // and flash "Copied" in place of the tooltip's hint. Both revert together.
  // `announce()` covers the non-visual half; this covers the half a sighted
  // user actually watches for. The accessible name never changes, because
  // swapping it to "Copied" destroys the button's name for anyone who tabs
  // back to it later.
  async function copy(text: string, message: string, which: "prompt" | "permalink") {
    try {
      await navigator.clipboard.writeText(text);
      announce(message);
    } catch {
      // Clipboard unavailable (permissions/insecure context); nothing to undo.
      announce("Copy failed — the clipboard is unavailable.");
      return;
    }
    setFlash(which);
    // Re-copying before the flash ends restarts it rather than letting the
    // first timer cut the second confirmation short.
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), COPIED_MS);
  }

  // The prompt is assembled client-side so the preview link is absolute
  // against whatever origin the page is actually served from, and so the
  // command matches the reader's own package manager. No block source is
  // included — the point is to tell an agent how to install the block
  // correctly, not to hand it the paid files.
  function buildPrompt(): string {
    const pm = currentPackageManager();
    const preview = new URL(previewUrl, location.href).href;
    // `null` marks a line that may not exist; "" is a blank line the prompt
    // wants. Filtering on `!== ""` collapsed every paragraph break into one
    // wall of text.
    const lines: (string | null)[] = [
      `Add the SevenUI block "${title}" to this project.`,
      "",
      description || null,
      `Live preview: ${preview}`,
      "",
      "Install it with the shadcn CLI:",
      installCommand(installItem, pm),
      "",
      "components.json must declare the registry first:",
      '  "registries": { "@sevenui": "https://sevenui.dev/r/{name}.json" }',
      "",
      "Rules when integrating it:",
      "- SevenUI is built on Base UI, not Radix. Use the primitives the CLI writes",
      "  under the project's ui directory; do not add @radix-ui packages.",
      "- Tailwind CSS v4: there is no tailwind.config.js, theme values live in CSS",
      "  via @theme.",
      "- The block reads theme tokens (--primary, --muted, --radius, …). Map it onto",
      "  the tokens this project already defines; do not hardcode colors or radii.",
      "- Keep the block's own markup structure; restyle through tokens instead.",
    ];
    return lines.filter((line): line is string => line !== null).join("\n");
  }

  function refresh() {
    const iframe = iframeRef.current;
    if (!iframe?.src) return;
    // reload() is initiated from INSIDE the frame, so it never re-runs the
    // "process the iframe attributes" steps — which is what makes the two
    // obvious alternatives wrong. Re-assigning `src` re-arms loading and can
    // silently skip an offscreen frame, and appending a cache-buster produces
    // a NEW url, which pushes an entry onto the PARENT's history.
    try {
      const view = iframe.contentWindow!;
      const y = view.scrollY;
      iframe.addEventListener(
        "load",
        () => {
          try {
            view.scrollTo(0, y);
          } catch {
            // The reloaded document may not be reachable; the reload still happened.
          }
        },
        { once: true },
      );
      view.location.reload();
    } catch {
      iframe.src = iframe.src;
    }
    announce("Preview reloaded.");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const width = metrics?.width;
  const available = metrics?.available;
  // The presets live in the TOOLBAR, a sibling of the frame. Before the first
  // observer tick there is nothing to bucket, and "max" is what the frame is
  // actually at — which is also what the server renders.
  const bucket = width === undefined ? "max" : presetBucket(width);
  // Dragging cannot do anything when the track has nothing to give back. An
  // explicit `display` rather than the `hidden` attribute, because the handle
  // carries a flexbox display utility, which outranks the UA's
  // `[hidden] { display: none }`.
  const resizable = available === undefined || available > MIN_WIDTH;

  const presets = [
    { value: "384", tip: "Mobile — up to 384px", name: "Preview at mobile width, up to 384 pixels", Icon: Smartphone },
    { value: "768", tip: "Tablet — 385 to 1023px", name: "Preview at tablet width, 385 to 1023 pixels", Icon: Tablet },
    { value: "max", tip: "Desktop — 1024px and up", name: "Preview at desktop width, 1024 pixels and up", Icon: Monitor },
  ] as const;

  return (
    // `@container/card` (not a viewport breakpoint) drives the toolbar's tiers
    // below: this track is ~684px at a 1024px viewport but ~312px at 360px, so
    // a `lg:`-style rule would describe the wrong box entirely. Keep the
    // containment declaration HERE and leave [data-resize-frame]'s own
    // `relative` alone — Chrome 129 removed the implicit containing block
    // `container-type` used to create, and the handle is absolutely positioned
    // against the frame.
    //
    // `data-block-preview` is this component's CSS scope, standing in for the
    // `data-astro-cid-*` attribute Astro generated; every rule in the /blocks
    // section of `app/globals.css` is written under it.
    <div
      className="@container/card relative w-full rounded-xl bg-muted/30"
      data-block-preview=""
      data-fs={fsFallback ? "" : undefined}
      ref={wrapperRef}
      style={{ maxWidth: `calc(${MAX_WIDTH}px + 2px)` }}
    >
      {/* A set h-11 rather than padding + wrapping: the previous wrapping bar
          meant that once the control set outgrew the track, `justify-between`
          applied PER LINE — a lone trailing control slammed to one edge — and
          the bar's height, and so every card's height, changed with the
          breakpoint. Controls now drop out at containment tiers instead, in
          reverse order of how often they are needed. `display: none` takes
          them out of the accessibility tree and the tab order for free, with
          none of the focus-loss window an overflow menu opens up.

          The tier thresholds are budgeted against the INSTALL CONTROL, not
          just against the icons. It is the only shrinkable item in the bar
          (everything else is shrink-0), so it absorbs any deficit alone, and
          its natural width is ~355px. Tiering on the icons alone put `@lg` at
          512 and `@xl` at 576 — widths where that 355px had not been earned
          yet — so each tier boundary made the bar TIGHTER as the window got
          WIDER: the command field dropped 377->266px at `@lg` and 329->258px
          at `@xl`, its global minimum. `@2xl` (672) and `@3xl` (768) clear
          355px on the far side of every boundary, so each tier is now a net
          gain. A 1024px viewport is the case to keep in mind: the 260px
          sidebar appears there and the track falls to 684px, which must still
          land in a tier the install control fits in. */}
      <div className="flex h-11 items-center gap-2 rounded-t-xl border border-border bg-muted/30 px-3">
        <div aria-label="Preview width" className="hidden shrink-0 items-center gap-1 @2xl/card:flex" role="group">
          {/* The labels carry the RANGE each preset is pressed for, not the
              single width it snaps to — the button stays pressed anywhere in
              its bucket, so "768px" was describing a state the control never
              has on its own. The hints are drawn by the registry's own
              Tooltip, one Provider in the /blocks layout. They were `title`
              before, which the UA draws for free but only after its own
              ~500ms-1s delay that no author can shorten; then a bespoke
              page-level tip node, which existed only to avoid one island per
              button. Both reasons that beat the original tooltip spans still
              hold and are still met: the tip is portalled, so no ancestor can
              clip it, and it is purely decorative — the accessible name is the
              sr-only span on each control, unchanged, and Base UI's tooltip
              adds neither `role="tooltip"` nor `aria-describedby`. WCAG 1.4.13
              is satisfied rather than side-stepped: Escape dismisses it, and
              it is not hoverable away. */}
          {presets.map(({ value, tip, name: label, Icon }) => (
            <Tooltip key={value}>
              <TooltipTrigger
                render={
                  <button
                    aria-pressed={bucket === value}
                    className={PRESET}
                    onClick={() =>
                      applyWidth(value === "max" ? Number.POSITIVE_INFINITY : Number(value))
                    }
                    type="button"
                  >
                    <span className="sr-only">{label}</span>
                    <Icon aria-hidden="true" className="size-4" strokeWidth={1.5} />
                  </button>
                }
              />
              <TooltipContent>{tip}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1">
          {/* The icon pair is the install control's confirmation pattern,
              reused: the display utility swaps between the two icons and the
              accessible name never changes, so the result is announced through
              the live region rather than by mutating the button's name under
              anyone tabbed to it. These two copied silently before — only the
              install command confirmed, which made the other two feel broken.

              `closeOnClick={false}` on both copy triggers is load-bearing, not
              tidying. Base UI's TooltipTrigger defaults it to `true` and wires
              it to `useDismiss({ referencePress })`, so pressing the button
              dismisses its own tooltip — and the "Copied" text below would
              then be swapped into a popup that is already closing, i.e. never
              seen. The Astro source hit the same wall from the other side: it
              dismissed the tip in a capture-phase click listener and then had
              to re-open it (`showTipIfActive`) on the flash text. Keeping the
              popup open is the same outcome without the round trip. Only the
              two COPY controls opt out; every other toolbar control still
              dismisses on click, which is what should happen when a click
              navigates or promotes the frame out from under the tip. */}
          <Tooltip>
            <TooltipTrigger
              closeOnClick={false}
              render={
                <button
                  className={`${ICON} hidden @3xl/card:inline-flex`}
                  onClick={() =>
                    void copy(buildPrompt(), `Copied an agent prompt for ${title}.`, "prompt")
                  }
                  type="button"
                >
                  <span className="sr-only">{`Copy a prompt describing ${title} for an AI coding agent`}</span>
                  <Sparkles
                    aria-hidden="true"
                    className={flash === "prompt" ? "hidden size-4" : "size-4"}
                    strokeWidth={1.5}
                  />
                  <Check
                    aria-hidden="true"
                    className={flash === "prompt" ? "size-4" : "hidden size-4"}
                    strokeWidth={1.5}
                  />
                </button>
              }
            />
            <TooltipContent>{flash === "prompt" ? "Copied" : "Copy prompt for an AI agent"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              closeOnClick={false}
              render={
                <button
                  className={`${ICON} hidden @3xl/card:inline-flex`}
                  onClick={() =>
                    void copy(
                      `${location.origin}${location.pathname}#${name}`,
                      `Copied a link to ${title}.`,
                      "permalink",
                    )
                  }
                  type="button"
                >
                  <span className="sr-only">{`Copy a link to ${title}`}</span>
                  <Link2
                    aria-hidden="true"
                    className={flash === "permalink" ? "hidden size-4" : "size-4"}
                    strokeWidth={1.5}
                  />
                  <Check
                    aria-hidden="true"
                    className={flash === "permalink" ? "size-4" : "hidden size-4"}
                    strokeWidth={1.5}
                  />
                </button>
              }
            />
            <TooltipContent>{flash === "permalink" ? "Copied" : "Copy link to this block"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <button className={`${ICON} hidden @sm/card:inline-flex`} onClick={refresh} type="button">
                  <span className="sr-only">{`Reload the ${title} preview`}</span>
                  <RotateCw aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </button>
              }
            />
            <TooltipContent>Reload preview</TooltipContent>
          </Tooltip>

          {/* A toggle, so it reports pressed state rather than changing its
              name: the same control is how you leave full screen again. */}
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  aria-pressed={fullscreen}
                  className={`${ICON} hidden @sm/card:inline-flex aria-pressed:bg-muted aria-pressed:text-foreground`}
                  data-fullscreen-button=""
                  onClick={() => (fullscreen ? exitFullscreen() : enterFullscreen())}
                  type="button"
                >
                  <span className="sr-only">{`Show ${title} full screen`}</span>
                  <Maximize2 aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </button>
              }
            />
            <TooltipContent>Full screen</TooltipContent>
          </Tooltip>

          {/* Renamed from "Open full-screen preview": with a real full-screen
              control one row over, two differently-behaving buttons shared a
              name — and screen-reader users only ever got this one's, since
              the old tooltip was aria-hidden. */}
          <Tooltip>
            <TooltipTrigger
              render={
                <a className={ALWAYS} href={previewUrl} rel="noopener noreferrer" target="_blank">
                  <span className="sr-only">{`Open the ${title} preview in a new tab`}</span>
                  <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
                </a>
              }
            />
            <TooltipContent>Open in new tab</TooltipContent>
          </Tooltip>

          {sourceUrl && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <a className={ALWAYS} href={sourceUrl} rel="noopener noreferrer" target="_blank">
                    <span className="sr-only">{`View the ${title} source on GitHub`}</span>
                    <svg aria-hidden="true" className="size-4" fill="currentColor" viewBox="0 0 16 16">
                      <path
                        clipRule="evenodd"
                        d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
                        fillRule="evenodd"
                      />
                    </svg>
                  </a>
                }
              />
              <TooltipContent>View source on GitHub</TooltipContent>
            </Tooltip>
          )}

          <InstallControl item={installItem} title={title} />
        </div>
      </div>

      <div className="relative" data-resize-frame="">
        {/* Authored before the box so keyboard users reach it without first
            traversing the whole preview application; `left` alone decides
            where it renders, so moving it in source changes nothing visually.
            It lives OUTSIDE the clip layer below so its straddling half is
            never shaved.

            The resting `left` is an ordinary style prop even though `applyWidth`
            writes `style.left` on this same element imperatively. React writes
            only the style properties whose VALUE changed between renders, and
            this string never changes, so no re-render can undo the position a
            drag just wrote — the same arrangement the box below already relies
            on for its own `width`. */}
        <div
          aria-label="Resize preview"
          aria-orientation="vertical"
          aria-valuemax={available}
          aria-valuemin={available === undefined ? MIN_WIDTH : Math.min(MIN_WIDTH, available)}
          aria-valuenow={width}
          aria-valuetext={width === undefined ? undefined : `${width} pixels`}
          className="group absolute top-1/2 z-10 flex h-12 w-4 -translate-y-1/2 cursor-ew-resize touch-none items-center justify-center outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          data-resize-handle=""
          onKeyDown={onHandleKeyDown}
          onPointerDown={onHandlePointerDown}
          ref={handleRef}
          role="separator"
          style={{ left: "calc(100% - 0.5rem)", display: resizable ? undefined : "none" }}
          tabIndex={resizable ? 0 : -1}
        >
          <span
            aria-hidden="true"
            className="h-12 w-1.5 rounded-full bg-border transition-colors group-hover:bg-foreground/30 group-focus-visible:bg-foreground/50"
          />
        </div>
        {/* Clip layer: rounds and clips the track area's outer bottom corners.
            The box inside keeps SQUARE corners, so when it is narrowed its
            inner bottom-right corner meets the track with a flat edge (no
            orphaned rounding mid-track); at the track's own edges this layer
            clips both the box and the underlay ring to the shared rounded
            silhouette. */}
        <div className="overflow-hidden rounded-b-xl">
          {/* Track outline: a decorative OVERLAY ring framing the full track
              area, painted ABOVE the box (z-10, no pointer events). At full
              width it traces the exact same 1px perimeter as the box's own
              border — including the rounded bottom corners the square-cornered
              box cannot draw once the clip layer shaves them — so the eye reads
              one continuous edge. Narrowed, the ring frames the vacated area
              while the box's own border draws the inner edge. Never affects the
              box's geometry or the width math. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-b-xl border border-t-0 border-border"
          />
          <div
            className="relative overflow-hidden border border-t-0 border-border bg-background"
            data-resize-box=""
            ref={boxRef}
            style={{ width: "100%", maxWidth: "100%" }}
          >
            <div className="relative" data-dragging={dragging ? "true" : undefined} data-preview-wrap="">
              <iframe
                className="w-full"
                onError={releaseSlot}
                onLoad={releaseSlot}
                ref={iframeRef}
                src={src}
                style={{ height: `${height}px` }}
                title={`${title} preview`}
              />
              <span
                className="pointer-events-none absolute top-2 right-2 z-10 rounded bg-foreground px-1.5 py-0.5 font-mono text-xs text-background tabular-nums opacity-0 transition-opacity duration-150"
                data-width-readout=""
              >
                {width === undefined ? "100%" : `${width}px`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
