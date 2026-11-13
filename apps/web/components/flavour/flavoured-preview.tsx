"use client";

import * as React from "react";
import { DEFAULT_FLAVOUR, type Flavour } from "../../lib/flavour";
import { type PreviewFolder, uiSdkPreviewFolders } from "./generated";
import { useFlavour } from "./use-flavour";

const folderPromises = new Map<string, Promise<PreviewFolder>>();

function loadFolder(folder: string): Promise<PreviewFolder> {
  let promise = folderPromises.get(folder);
  if (!promise) {
    const load = uiSdkPreviewFolders[folder];
    promise = load ? load() : Promise.reject(new Error(`No UI SDK previews for ${folder}`));
    // A failed chunk load may succeed on the next attempt (a flaky network), so it is not cached.
    promise.catch(() => folderPromises.delete(folder));
    folderPromises.set(folder, promise);
  }
  return promise;
}

function UiSdkExample({ folder, name }: { folder: string; name: string }) {
  const Example = React.use(loadFolder(folder)).default[name];
  if (!Example) throw new Error(`No UI SDK preview "${name}" in ${folder}`);
  return <Example />;
}

class PreviewBoundary extends React.Component<{ children: React.ReactNode; label: string }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`[ui-sdk preview] ${this.props.label}:`, error);
  }

  render() {
    if (this.state.failed) {
      return <p className="max-w-sm text-center text-muted-foreground text-sm">This example failed to render on UI SDK.</p>;
    }
    return this.props.children;
  }
}

/**
 * A live preview in the reader's flavour. The Base UI example arrives server-rendered as `children`; a UI SDK
 * reader gets it invisible at first paint (globals.css), then this swaps in the UI SDK example once its
 * folder's chunk loads. Only one of the two is ever mounted at a time.
 */
export function FlavouredPreview({
  children,
  folder,
  name,
  available,
}: {
  children: React.ReactNode;
  /** `<kind>/<primitive>`, e.g. `components/dialog`. */
  folder: string;
  /** The example's file name without extension, e.g. `dialog-01`. */
  name: string;
  /** False when the example has no UI SDK version yet. */
  available: boolean;
}) {
  const flavour = useFlavour();
  // The flavour on screen trails the chosen one through a transition: while the UI SDK chunk loads, React
  // keeps the Base UI example in place (invisible, so the frame keeps its size) instead of a fallback.
  const [shown, setShown] = React.useState<Flavour>(DEFAULT_FLAVOUR);
  React.useEffect(() => {
    React.startTransition(() => setShown(flavour));
  }, [flavour]);

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
        <PreviewBoundary label={`${folder}/${name}`}>
          <UiSdkExample folder={folder} name={name} />
        </PreviewBoundary>
      </div>
    );
  }

  // One boundary that already holds the Base UI example, so a transition keeps it on screen while the
  // UI SDK chunk loads (a boundary mounted mid-transition would show its fallback instead).
  return <React.Suspense fallback={<span className="sr-only">Loading the preview…</span>}>{content}</React.Suspense>;
}
