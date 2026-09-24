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

const MIN_WIDTH = 360;
const MAX_WIDTH = 1440;

// Half the 16px hit zone: the handle straddles the box's live right edge.
const HANDLE_HALF = 8;
const KEY_STEP = 24;
const COPIED_MS = 1600;

const ICON =
  "size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const ALWAYS = `${ICON} inline-flex`;
const PRESET = `${ALWAYS} aria-pressed:bg-muted aria-pressed:text-foreground`;

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

  function borderDelta(): number {
    if (deltaRef.current !== null) return deltaRef.current;
    const box = boxRef.current;
    const iframe = iframeRef.current;
    if (!box || !iframe || iframe.clientWidth === 0) return 0;
    deltaRef.current = box.offsetWidth - iframe.clientWidth;
    return deltaRef.current;
  }

  function trackMax(): number {
    const wrapper = wrapperRef.current;
    if (!wrapper) return MAX_WIDTH;
    return Math.min(wrapper.getBoundingClientRect().width - borderDelta(), MAX_WIDTH);
  }

  function applyWidth(targetIframePx: number) {
    const box = boxRef.current;
    if (!box) return;
    const delta = borderDelta();
    const maxIframePx = trackMax();
    const floor = Math.min(MIN_WIDTH, maxIframePx);
    const clampedIframePx = Math.min(Math.max(targetIframePx, floor), maxIframePx);
    box.style.width = `${clampedIframePx + delta}px`;
    const handle = handleRef.current;
    if (handle) handle.style.left = `${clampedIframePx + delta - HANDLE_HALF}px`;
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    return gate.register(iframe, () => setSrc(previewUrl));
  }, [gate, previewUrl]);

  const releaseSlot = () => {
    const iframe = iframeRef.current;
    if (iframe) gate.release(iframe);
  };

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
        const box = boxRef.current;
        const handle = handleRef.current;
        if (box && handle) {
          handle.style.left = `${box.getBoundingClientRect().width - HANDLE_HALF}px`;
        }
      }
    });
    observer.observe(iframe);
    return () => observer.disconnect();
  }, []);

  function onHandlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const handle = handleRef.current;
    const box = boxRef.current;
    if (!handle || !box) return;
    handle.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      grabOffset: box.getBoundingClientRect().right - event.clientX,
    };
    setDragging(true);
    document.body.style.userSelect = "none";

    function onMove(moveEvent: PointerEvent) {
      const drag = dragRef.current;
      const wrapper = wrapperRef.current;
      if (!drag || !wrapper || moveEvent.pointerId !== drag.pointerId) return;
      const rect = wrapper.getBoundingClientRect();
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
    dragCleanup.current = stop;

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

  function applyFallback(on: boolean) {
    setFsFallback(on);
    setFullscreenLayout(on);
  }

  function enterFullscreen() {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (document.fullscreenEnabled) {
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

  useEffect(() => () => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
  }, []);

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
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), COPIED_MS);
  }

  function buildPrompt(): string {
    const pm = currentPackageManager();
    const preview = new URL(previewUrl, location.href).href;
    const lines: (string | null)[] = [
      `Add the SevenUI block "${title}" to this project.`,
      "",
      description || null,
      `Live preview: ${preview}`,
      "",
      "Install it with the shadcn CLI:",
      installCommand(installItem, pm),
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
      // biome-ignore lint/correctness/noSelfAssign: reassigning src reloads a cross-origin iframe
      iframe.src = iframe.src;
    }
    announce("Preview reloaded.");
  }

  const width = metrics?.width;
  const available = metrics?.available;
  const bucket = width === undefined ? "max" : presetBucket(width);
  const resizable = available === undefined || available > MIN_WIDTH;

  const presets = [
    { value: "384", tip: "Mobile — up to 384px", name: "Preview at mobile width, up to 384 pixels", Icon: Smartphone },
    { value: "768", tip: "Tablet — 385 to 1023px", name: "Preview at tablet width, 385 to 1023 pixels", Icon: Tablet },
    { value: "max", tip: "Desktop — 1024px and up", name: "Preview at desktop width, 1024 pixels and up", Icon: Monitor },
  ] as const;

  return (
    <div
      className="@container/card relative w-full rounded-xl bg-muted/30"
      data-block-preview=""
      data-fs={fsFallback ? "" : undefined}
      ref={wrapperRef}
      style={{ maxWidth: `calc(${MAX_WIDTH}px + 2px)` }}
    >
      <div className="flex h-11 items-center gap-2 rounded-t-xl border border-border bg-muted/30 px-3">
        {/* biome-ignore lint/a11y/useSemanticElements: a <fieldset> brings its own border and min-width into a toolbar row */}
        <div aria-label="Preview width" className="hidden shrink-0 items-center gap-1 @2xl/card:flex" role="group">
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
        {/* biome-ignore lint/a11y/useSemanticElements: a draggable, focusable splitter cannot be an <hr> */}
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
        <div className="overflow-hidden rounded-b-xl">
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
