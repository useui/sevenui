"use client";

import * as React from "react";
import { LayerCard, LayerCardHeader, LayerCardPanel } from "@/registry/base/ui/layer-card";
import { FlavourSwitch } from "../flavour/flavour-switch";
import { LAYER_FRAME_LG, LAYER_TAB, LAYER_TOOLBAR, LAYER_WINDOW } from "../layer-frame";

const TABS = [
  { value: "preview", label: "Preview" },
  { value: "code", label: "Code" },
] as const;

type Tab = (typeof TABS)[number]["value"];

/**
 * True once the reader has opened, hovered or focused the Code tab. A lazily loaded code pane
 * (see lazy-code.tsx) waits for it, so the source is fetched only for examples someone looks at.
 */
export const CodeWantedContext = React.createContext(false);

export function DemoTabs({
  code,
  preview,
  heading,
  actions,
  label = "Example view",
  className,
  detached = false,
  flavoured = false,
}: {
  code: React.ReactNode;
  preview: React.ReactNode;
  heading?: React.ReactNode;
  /** When set, the tabs move into a toolbar above the preview with these controls on its right. */
  actions?: React.ReactNode;
  /** Accessible name for the tablist; the gallery passes the example title. */
  label?: string;
  className?: string;
  /** The docs look: a larger tray radius for the single demo that heads a primitive page. */
  detached?: boolean;
  /** Shows the site-wide flavour switch in the toolbar: the preview, code and install follow it. */
  flavoured?: boolean;
}) {
  const [tab, setTab] = React.useState<Tab>("preview");
  const [codeWanted, setCodeWanted] = React.useState(false);
  const wantCode = () => setCodeWanted(true);
  const id = React.useId();
  const tabRefs = React.useRef<Record<Tab, HTMLButtonElement | null>>({ preview: null, code: null });

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const at = TABS.findIndex((entry) => entry.value === tab);
    let next: number;
    if (event.key === "ArrowRight") next = (at + 1) % TABS.length;
    else if (event.key === "ArrowLeft") next = (at - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;
    event.preventDefault();
    const value = TABS[next].value;
    if (value === "code") wantCode();
    setTab(value);
    tabRefs.current[value]?.focus();
  };

  const tablist = (
    <div
      aria-label={label}
      className="flex shrink-0 gap-1 p-0.5 text-sm font-medium"
      onKeyDown={onKeyDown}
      role="tablist"
    >
      {TABS.map((entry) => (
        <button
          aria-controls={`${id}-${entry.value}`}
          aria-selected={tab === entry.value}
          className={LAYER_TAB}
          id={`${id}-${entry.value}-tab`}
          key={entry.value}
          onClick={() => {
            if (entry.value === "code") wantCode();
            setTab(entry.value);
          }}
          onFocus={entry.value === "code" ? wantCode : undefined}
          onPointerEnter={entry.value === "code" ? wantCode : undefined}
          ref={(node) => {
            tabRefs.current[entry.value] = node;
          }}
          role="tab"
          tabIndex={tab === entry.value ? 0 : -1}
          type="button"
        >
          {entry.label}
        </button>
      ))}
    </div>
  );

  const panels = (
    <>
      <div aria-labelledby={`${id}-preview-tab`} hidden={tab !== "preview"} id={`${id}-preview`} role="tabpanel">
        {preview}
      </div>
      <div aria-labelledby={`${id}-code-tab`} hidden={tab !== "code"} id={`${id}-code`} role="tabpanel">
        <CodeWantedContext.Provider value={codeWanted}>{code}</CodeWantedContext.Provider>
      </div>
    </>
  );

  // One frame for both looks: the tabs and actions are the tray's header chrome and the active pane is its
  // panel. No overflow clipping on the tray, so the install and package-manager menus drop out of it.
  if (actions !== undefined) {
    return (
      <div className={className}>
        {heading}
        <LayerCard className={`${heading === undefined ? "" : "mt-3"} ${detached ? LAYER_FRAME_LG : ""}`}>
          <LayerCardHeader className={LAYER_TOOLBAR}>
            {tablist}
            {flavoured && <FlavourSwitch className="hidden @xl/toolbar:inline-flex" />}
            <div className="ml-auto flex min-w-0 items-center gap-1">{actions}</div>
          </LayerCardHeader>
          <LayerCardPanel className={LAYER_WINDOW}>{panels}</LayerCardPanel>
        </LayerCard>
      </div>
    );
  }

  return (
    <div className={className}>
      {heading}
      <LayerCard className={heading === undefined ? undefined : "mt-3"}>
        <LayerCardHeader className={`${LAYER_TOOLBAR} justify-end`}>{tablist}</LayerCardHeader>
        <LayerCardPanel className={LAYER_WINDOW}>{panels}</LayerCardPanel>
      </LayerCard>
    </div>
  );
}
