"use client";

import dynamic from "next/dynamic";
import { useCustomizer } from "./customizer-state";

// The dock carries Dialog, Popover, Toolbar and RadioGroup; a docs page that never opens it
// should not pay for them.
const CustomizerDock = dynamic(() => import("./customizer-dock").then((mod) => mod.CustomizerDock), {
  ssr: false,
});

/** Mounts the page's one dock after the first hover, focus or press on a trigger. */
export function LazyCustomizerDock() {
  const { dockRequested, open } = useCustomizer();
  return dockRequested || open ? <CustomizerDock /> : null;
}
