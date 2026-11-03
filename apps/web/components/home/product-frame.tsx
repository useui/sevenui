"use client";

import "./product-frame.css";

import {
  ArrowUpIcon,
  CheckIcon,
  FolderKanbanIcon,
  InboxIcon,
  RotateCcwIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/base/ui/alert-dialog";
import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Kbd } from "@/registry/base/ui/kbd";
import { Label } from "@/registry/base/ui/label";
import {
  LayerCard,
  LayerCardDescription,
  LayerCardFooter,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";
import { Spinner } from "@/registry/base/ui/spinner";
import { Switch } from "@/registry/base/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";
import { cx } from "../../lib/cx";

const PROMPT = "Add a danger zone with a delete-workspace dialog.";

const STEPS = [
  { lead: "Searched registry for", code: "alert-dialog" },
  { lead: "Installed", code: "@sevenui/alert-dialog" },
  { lead: "Composing", code: "settings/danger-zone.tsx" },
] as const;

// Beats: 0 idle · 1 typing · 2 sent · 3..5 step i running (the one before it done) · 6 finished.
const SENT = 2;
const FIRST_STEP = 3;
const FINISHED = FIRST_STEP + STEPS.length;

const TYPE_MS = 34;
const STEP_MS = 1150;

type Density = "comfortable" | "compact";

/**
 * The home page's "Acme Inc" window. Every control in it is a real SevenUI
 * primitive; the agent transcript is a script that plays once when the frame
 * comes into view. The server renders the finished state, which is also what a
 * visitor who prefers reduced motion keeps.
 */
export function ProductFrame() {
  const [live, setLive] = React.useState(false);
  const [beat, setBeat] = React.useState(FINISHED);
  const [typed, setTyped] = React.useState(0);
  const [density, setDensity] = React.useState<Density>("comfortable");
  const [saved, setSaved] = React.useState(false);
  const [reduced, setReduced] = React.useState(false);
  const rootRef = React.useRef<HTMLElement>(null);
  const timers = React.useRef<number[]>([]);
  const ids = React.useId();

  const clear = React.useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const play = React.useCallback(() => {
    clear();
    setBeat(1);
    setTyped(0);
    let at = 0;
    const later = (ms: number, fn: () => void) => {
      at += ms;
      timers.current.push(window.setTimeout(fn, at));
    };
    for (let i = 1; i <= PROMPT.length; i++) later(TYPE_MS, () => setTyped(i));
    later(420, () => {
      setTyped(0);
      setBeat(SENT);
    });
    later(520, () => setBeat(FIRST_STEP));
    for (let b = FIRST_STEP + 1; b <= FINISHED; b++) later(STEP_MS, () => setBeat(b));
  }, [clear]);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (query.matches) {
      setReduced(true);
      setLive(true);
      return;
    }
    setBeat(0);
    setLive(true);

    const root = rootRef.current;
    if (!root) return;
    let started = false;
    const start = () => {
      if (started || document.hidden) return;
      started = true;
      play();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          if (document.hidden) document.addEventListener("visibilitychange", start, { once: true });
          else timers.current.push(window.setTimeout(start, 500));
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", start);
      clear();
    };
  }, [play, clear]);

  const finished = beat >= FINISHED;
  const stepState = (i: number) =>
    beat >= FIRST_STEP + i + 1 ? "done" : beat === FIRST_STEP + i ? "running" : "hidden";

  return (
    <figure
      aria-labelledby={`${ids}-caption`}
      className="m-0"
      data-density={density}
      data-nosnippet
      data-pf={live ? "live" : "ssr"}
      ref={rootRef}
    >
      <noscript
        // Without JS the finished state stays visible.
        // biome-ignore lint/security/noDangerouslySetInnerHtml: a static style string
        dangerouslySetInnerHTML={{
          __html: '<style>[data-pf="ssr"] .pf-reveal{opacity:1;transform:none}</style>',
        }}
      />
      <figcaption className="sr-only" id={`${ids}-caption`}>
        A demo workspace built from SevenUI primitives. An agent is asked to add a danger zone with a
        delete-workspace dialog, finds alert-dialog in the registry, installs it, and composes the new section
        into the settings form. The form controls, the density toggle and the delete dialog are real.
      </figcaption>
      <LayerCard className="[--layer-card-radius:1rem] [--layer-card-shadow:var(--elevation-highlight),var(--elevation-overlay)]">
        <LayerCardPanel className="grid overflow-hidden p-0 md:grid-cols-[minmax(0,1fr)_17rem] lg:min-h-[36.5rem] lg:grid-cols-[11.5rem_minmax(0,1fr)_18rem]">
          <Sidebar />

          <section aria-label="Workspace settings" className="min-w-0 px-5 py-5 sm:px-6 sm:py-6">
            <p aria-hidden="true" className="text-xs text-muted-foreground">
              Settings / Workspace
            </p>
            <p className="mt-3 text-xl font-[510] tracking-[-0.015em]">Workspace</p>
            <p className="mt-1 text-[0.8125rem] text-muted-foreground">
              How your workspace looks to members and agents.
            </p>

            <form
              className="mt-5"
              onReset={() => setSaved(false)}
              onSubmit={(event) => {
                event.preventDefault();
                setSaved(true);
              }}
            >
              <LayerCard size="sm">
                <LayerCardPanel className="py-1">
                  <Row label={<Label htmlFor={`${ids}-name`}>Name</Label>}>
                    <Input defaultValue="Acme Inc" id={`${ids}-name`} name="name" />
                  </Row>
                  <Row label={<Label htmlFor={`${ids}-url`}>URL</Label>}>
                    <Input defaultValue="acme.sevenui.app" id={`${ids}-url`} name="url" />
                  </Row>
                  <Row label={<span className="text-sm font-medium">Agent access</span>}>
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-[0.8125rem] text-foreground/85" id={`${ids}-prs`}>
                        Allow agents to open PRs
                      </span>
                      <Switch aria-labelledby={`${ids}-prs`} defaultChecked />
                    </span>
                  </Row>
                  <Row label={<span className="text-sm font-medium" id={`${ids}-density`}>Density</span>}>
                    <ToggleGroup
                      aria-labelledby={`${ids}-density`}
                      onValueChange={(next) => {
                        if (next.length > 0) setDensity(next[0] as Density);
                      }}
                      size="sm"
                      value={[density]}
                    >
                      <ToggleGroupItem className="px-2.5" value="comfortable">
                        Comfortable
                      </ToggleGroupItem>
                      <ToggleGroupItem className="px-2.5" value="compact">
                        Compact
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Row>
                </LayerCardPanel>
                <LayerCardFooter className="flex-wrap justify-between text-xs">
                  <span aria-live="polite">{saved ? "Saved just now" : "Last saved 2 min ago"}</span>
                  <span className="flex gap-2">
                    <Button size="sm" type="reset" variant="outline">
                      Cancel
                    </Button>
                    <Button size="sm" type="submit">
                      Save changes
                    </Button>
                  </span>
                </LayerCardFooter>
              </LayerCard>
            </form>

            <DangerZone shown={finished} />
          </section>

          <section
            aria-label="Agent panel (demo)"
            className="flex min-h-[20rem] min-w-0 flex-col border-t border-hairline md:border-t-0 md:border-l"
          >
            <div className="flex h-12 items-center justify-between gap-2 border-b border-hairline px-4 text-[0.8125rem]">
              <span className="font-medium">Agent</span>
              <span className="flex items-center gap-1.5">
                <Button
                  aria-label="Replay the agent demo"
                  className={cx("pf-reveal", (!live || reduced) && "hidden")}
                  data-shown={finished}
                  inert={!finished}
                  onClick={play}
                  size="xs"
                  variant="ghost"
                >
                  <RotateCcwIcon aria-hidden="true" />
                  Replay
                </Button>
                <Kbd aria-hidden="true">⌘J</Kbd>
              </span>
            </div>

            <ol className="flex flex-1 flex-col gap-3 p-4 text-[0.8125rem]">
              <li
                aria-hidden={beat < SENT}
                className="pf-reveal max-w-[88%] self-end rounded-[10px] bg-surface-raised px-3 py-2 text-foreground/90 shadow-[inset_0_0_0_1px_var(--hairline)]"
                data-shown={beat >= SENT}
              >
                {PROMPT}
              </li>
              {STEPS.map((step, i) => {
                const state = stepState(i);
                return (
                  <li
                    aria-hidden={state === "hidden"}
                    className="pf-reveal pf-step flex items-start gap-2 text-muted-foreground"
                    data-shown={state !== "hidden"}
                    data-state={state === "hidden" ? "done" : state}
                    key={step.code}
                  >
                    <span aria-hidden="true" className="mt-0.5 grid size-4 shrink-0 place-items-center">
                      <Spinner className="pf-icon pf-icon-run col-start-1 row-start-1 size-3.5" />
                      <span className="pf-icon pf-icon-done col-start-1 row-start-1 grid size-3.5 place-items-center rounded-full text-success shadow-[inset_0_0_0_1.5px_currentColor]">
                        <CheckIcon className="size-2.5" strokeWidth={3} />
                      </span>
                    </span>
                    <span className="min-w-0">
                      {step.lead}{" "}
                      <code className="rounded-[4px] bg-surface-panel px-1 py-px font-mono text-[0.71875rem] whitespace-nowrap text-foreground/90 shadow-[inset_0_0_0_1px_var(--hairline)]">
                        {step.code}
                      </code>
                    </span>
                  </li>
                );
              })}
              <li
                aria-hidden={!finished}
                className="pf-reveal text-foreground/90"
                data-shown={finished}
              >
                Added a Danger zone to Workspace. The delete button opens the new dialog.
              </li>
            </ol>

            <div
              aria-hidden="true"
              className="m-2.5 flex items-center gap-2 rounded-[10px] border border-hairline-strong bg-surface-inset py-2 pr-2 pl-3 text-[0.8125rem] shadow-inset"
            >
              <span className="min-w-0 flex-1 truncate">
                {typed > 0 ? (
                  <span className="text-foreground">
                    {PROMPT.slice(0, typed)}
                    <span className="pf-caret ml-px inline-block h-[1.05em] w-px translate-y-[0.15em] bg-foreground" />
                  </span>
                ) : (
                  <span className="text-muted-foreground">Ask the agent…</span>
                )}
              </span>
              <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
                <ArrowUpIcon className="size-3.5" />
              </span>
            </div>
          </section>
        </LayerCardPanel>
      </LayerCard>
    </figure>
  );
}

function Row({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-hairline py-[calc(var(--panel-pad,1.125rem)*0.6)] last:border-b-0 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center sm:gap-4">
      <div className="text-muted-foreground [&_label]:text-muted-foreground [&>span]:text-muted-foreground">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function DangerZone({ shown }: { shown: boolean }) {
  return (
    <div aria-hidden={!shown} className="pf-reveal mt-4" data-shown={shown} inert={!shown}>
      <LayerCard size="sm" tone="destructive">
        <LayerCardHeader>
          <LayerCardTitle>Danger zone</LayerCardTitle>
          <LayerCardDescription className="text-xs">
            Deleting the workspace removes its projects for every member.
          </LayerCardDescription>
        </LayerCardHeader>
        <LayerCardPanel className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[0.8125rem]">Delete this workspace</span>
          <AlertDialog>
            <AlertDialogTrigger render={<Button size="sm" variant="destructive" />}>
              Delete workspace
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Acme Inc?</AlertDialogTitle>
                <AlertDialogDescription>
                  This is the dialog the agent just composed. In this demo nothing is deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </LayerCardPanel>
      </LayerCard>
    </div>
  );
}

const NAV = [
  { label: "Inbox", icon: InboxIcon, count: "4" },
  { label: "Projects", icon: FolderKanbanIcon },
  { label: "Members", icon: UsersIcon },
];
const SETTINGS = ["Workspace", "Billing", "API keys", "Agents"];

/** Decorative: the window's own navigation, not the page's. */
function Sidebar() {
  return (
    <div aria-hidden="true" className="hidden border-r border-hairline px-2.5 py-3 text-[0.8125rem] text-muted-foreground lg:block">
      <div className="flex items-center gap-2 px-1.5 pt-1 pb-3 font-[510] text-foreground">
        <span className="grid size-5 place-items-center rounded-[6px] bg-foreground text-[0.6875rem] font-semibold text-background">
          A
        </span>
        Acme Inc
      </div>
      {NAV.map((item) => (
        <div className="flex h-(--item-h) items-center gap-2 rounded-md px-2" key={item.label}>
          <item.icon className="size-3.5" />
          <span className="flex-1">{item.label}</span>
          {item.count ? <Kbd>{item.count}</Kbd> : null}
        </div>
      ))}
      <p className="mx-2 mt-4 mb-1.5 font-mono text-[0.6875rem] tracking-[0.04em] uppercase">Settings</p>
      {SETTINGS.map((label) => (
        <div
          className={cx(
            "flex h-(--item-h) items-center rounded-md px-2",
            label === "Workspace" &&
              "bg-surface-raised text-foreground shadow-[inset_0_0_0_1px_var(--hairline)]",
          )}
          key={label}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
