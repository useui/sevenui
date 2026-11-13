"use client";

import * as React from "react";
import { DEFAULT_FLAVOUR, type Flavour } from "../../lib/flavour";
import { type PreviewFolder, uiSdkPreviewFolders } from "./generated";
import { useFlavour } from "./use-flavour";

// One load per folder chunk, shared by every preview of that folder. A failed load stays cached as failed:
// React re-renders a suspended transition, so a cache that forgot the failure started a new request on every
// render and the rejection never reached the error boundary (a request loop behind an empty box). A retry is
// explicit instead: the notice's button, or the browser coming back online, drops the failed entry and
// tells that folder's previews to render again.
type FolderLoad = { promise: Promise<PreviewFolder>; failed: boolean };
const loads = new Map<string, FolderLoad>();
/** Failed attempts per folder, so a retry that fails again while online can point at a reload. */
const failures = new Map<string, number>();
const retryListeners = new Map<string, Set<() => void>>();

/** The folder's chunk did not arrive (offline, blocked, or gone after a redeploy), as opposed to an example
 * that threw while rendering. */
class FolderLoadError extends Error {
  constructor(folder: string, cause: unknown) {
    super(`The UI SDK previews for ${folder} did not load`, { cause });
    this.name = "FolderLoadError";
  }
}

function loadFolder(folder: string, importer?: () => Promise<PreviewFolder>): Promise<PreviewFolder> {
  let load = loads.get(folder);
  if (!load) {
    const importFolder = importer ?? uiSdkPreviewFolders[folder];
    const promise = importFolder ? importFolder() : Promise.reject(new Error(`No UI SDK previews for ${folder}`));
    const entry: FolderLoad = {
      promise: promise.catch((cause: unknown) => {
        throw new FolderLoadError(folder, cause);
      }),
      failed: false,
    };
    entry.promise.catch(() => {
      entry.failed = true;
      failures.set(folder, (failures.get(folder) ?? 0) + 1);
    });
    loads.set(folder, entry);
    load = entry;
  }
  return load.promise;
}

function retryFolder(folder: string): void {
  if (!loads.get(folder)?.failed) return;
  loads.delete(folder);
  for (const listener of retryListeners.get(folder) ?? []) listener();
}

function onRetry(folder: string, listener: () => void): () => void {
  const set = retryListeners.get(folder) ?? new Set();
  retryListeners.set(folder, set);
  set.add(listener);
  return () => {
    set.delete(listener);
  };
}

// Back online: every failed folder tries again by itself.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    for (const [folder, load] of loads) if (load.failed) retryFolder(folder);
  });
}

// One preview per failed folder announces the failure; the others show the same notice silently, so a
// gallery page whose chunk failed does not read out a dozen identical alerts.
const announcers = new Map<string, string>();

function UiSdkExample({
  folder,
  name,
  importFolder,
}: {
  folder: string;
  name: string;
  importFolder?: () => Promise<PreviewFolder>;
}) {
  const Example = React.use(loadFolder(folder, importFolder)).default[name];
  if (!Example) throw new Error(`No UI SDK preview "${name}" in ${folder}`);
  return <Example />;
}

const BUTTON =
  "cursor-pointer rounded-md border border-border bg-background px-2 py-0.5 font-medium text-foreground text-xs hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid disabled:cursor-default disabled:opacity-60";

/** Shown when the UI SDK chunk did not load: the Base UI preview stays usable, with a notice and a retry. */
function LoadFailure({
  children,
  folder,
  retrying,
  onRetryClick,
}: {
  children: React.ReactNode;
  folder: string;
  retrying: boolean;
  onRetryClick: () => void;
}) {
  const id = React.useId();
  // The live region is mounted empty and filled a moment later: text inserted into a region that is
  // already in the page is what screen readers reliably announce.
  const [live, setLive] = React.useState<"none" | "empty" | "filled">("none");
  React.useEffect(() => {
    if (announcers.has(folder)) return;
    announcers.set(folder, id);
    setLive("empty");
    return () => {
      if (announcers.get(folder) === id) announcers.delete(folder);
    };
  }, [folder, id]);
  React.useEffect(() => {
    if (live !== "empty") return;
    const timer = window.setTimeout(() => setLive("filled"), 150);
    return () => window.clearTimeout(timer);
  }, [live]);
  const [online, setOnline] = React.useState(true);
  React.useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  // A retry that failed again while online usually means the site was redeployed after this page loaded,
  // so its old chunk is gone: only a reload brings the new one.
  const suggestReload = online && (failures.get(folder) ?? 0) > 1;
  const message = online
    ? "The UI SDK preview did not load, so this is the Base UI one."
    : "You are offline, so this is the Base UI preview. The UI SDK one loads when you are back online.";

  return (
    <div className="flex flex-col items-center gap-4" data-preview-flavour="ui-sdk-fallback">
      {children}
      {live !== "none" && (
        <p className="sr-only" role="alert">
          {live === "filled" ? `UI SDK previews: ${message}` : null}
        </p>
      )}
      <div className="flex max-w-sm flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-balance text-center text-muted-foreground text-xs leading-5">
        <span>
          {message}
          {suggestReload && " If the site was updated since you opened this page, reload it."}
        </span>
        {online && (
          <button aria-busy={retrying} className={BUTTON} disabled={retrying} onClick={onRetryClick} type="button">
            {retrying ? "Loading…" : "Try again"}
          </button>
        )}
        {suggestReload && (
          <button className={BUTTON} onClick={() => window.location.reload()} type="button">
            Reload page
          </button>
        )}
      </div>
    </div>
  );
}

class PreviewBoundary extends React.Component<
  { children: React.ReactNode; label: string; fallback: (error: unknown) => React.ReactNode },
  { error: unknown; failed: boolean }
> {
  state = { error: undefined as unknown, failed: false };

  static getDerivedStateFromError(error: unknown) {
    return { error, failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[ui-sdk preview] ${this.props.label}:`, error);
  }

  render() {
    return this.state.failed ? this.props.fallback(this.state.error) : this.props.children;
  }
}

/**
 * A live preview in the reader's flavour. The Base UI example arrives server-rendered as `children`; a UI SDK
 * reader gets it invisible at first paint (globals.css), then this swaps in the UI SDK example once its
 * folder's chunk loads. If the chunk does not load, the Base UI example is shown with a notice and a retry.
 */
export function FlavouredPreview({
  children,
  folder,
  name,
  available,
  importFolder,
}: {
  children: React.ReactNode;
  /** `<kind>/<primitive>`, e.g. `components/dialog`. */
  folder: string;
  /** The example's file name without extension, e.g. `dialog-01`. */
  name: string;
  /** False when the example has no UI SDK version yet. */
  available: boolean;
  /**
   * Loads a folder that is not in the generated map, e.g. a page's own composition. Defaults to the map's
   * entry for `folder`; the first load of a folder is cached under its name, so keep `folder` unique.
   */
  importFolder?: () => Promise<PreviewFolder>;
}) {
  const flavour = useFlavour();
  // The flavour on screen trails the chosen one through a transition: while the UI SDK chunk loads, React
  // keeps the Base UI example in place (invisible, so the frame keeps its size) instead of a fallback.
  const [shown, setShown] = React.useState<Flavour>(DEFAULT_FLAVOUR);
  // The Suspense boundary that transition needs is added only once the flavour first differs from the
  // default. React's server renderer may send a boundary's content in a hidden element that a script
  // reveals, so a boundary in the server render left every preview invisible without JavaScript. The
  // boundary is committed around the Base UI example first; the transition starts on the next run.
  const [bounded, setBounded] = React.useState(false);
  React.useEffect(() => {
    if (!bounded) {
      if (flavour !== DEFAULT_FLAVOUR) setBounded(true);
      return;
    }
    React.startTransition(() => setShown(flavour));
  }, [flavour, bounded]);

  // A retry remounts the boundary in a transition, so the notice and the Base UI example stay on screen
  // until the new attempt either renders or fails again.
  const [attempt, setAttempt] = React.useState(0);
  const [retrying, startRetry] = React.useTransition();
  React.useEffect(() => onRetry(folder, () => startRetry(() => setAttempt((n) => n + 1))), [folder]);

  let content: React.ReactNode;
  if (shown === "base-ui") {
    content = <div data-preview-flavour="base-ui">{children}</div>;
  } else if (!available) {
    content = (
      <p className="max-w-sm text-balance text-center text-muted-foreground text-sm">
        This example has no UI SDK version yet. Switch to Base UI to see it live.
      </p>
    );
  } else {
    content = (
      <div data-preview-flavour="ui-sdk">
        <PreviewBoundary
          fallback={(error) =>
            error instanceof FolderLoadError ? (
              <LoadFailure folder={folder} onRetryClick={() => retryFolder(folder)} retrying={retrying}>
                {children}
              </LoadFailure>
            ) : (
              <p className="max-w-sm text-center text-muted-foreground text-sm" role="alert">
                This example failed to render on UI SDK.
              </p>
            )
          }
          key={attempt}
          label={`${folder}/${name}`}
        >
          <UiSdkExample folder={folder} importFolder={importFolder} name={name} />
        </PreviewBoundary>
      </div>
    );
  }

  // Until then nothing can suspend: the content is the Base UI example, server-rendered as plain markup.
  if (!bounded) return content;
  // One boundary that already holds the Base UI example, so a transition keeps it on screen while the
  // UI SDK chunk loads (a boundary mounted mid-transition would show its fallback instead).
  return <React.Suspense fallback={<span className="sr-only">Loading the preview…</span>}>{content}</React.Suspense>;
}
