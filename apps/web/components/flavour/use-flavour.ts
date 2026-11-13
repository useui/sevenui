"use client";

import * as React from "react";
import { DEFAULT_FLAVOUR, type Flavour, currentFlavour, subscribeFlavour } from "../../lib/flavour";

const serverFlavour = (): Flavour => DEFAULT_FLAVOUR;

/**
 * The page's flavour. Hydration renders the default, as the server did, and React re-renders straight
 * after with the value the pre-paint script put on <html>, so there is no hydration mismatch. Anything
 * that must be right at first paint (commands, source, notes) is server-rendered for every flavour and
 * switched by CSS instead; only the live previews need this hook.
 */
export function useFlavour(): Flavour {
  return React.useSyncExternalStore(subscribeFlavour, currentFlavour, serverFlavour);
}
