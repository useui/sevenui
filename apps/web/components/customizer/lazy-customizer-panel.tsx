"use client";

import dynamic from "next/dynamic";
import { useCustomizer } from "./customizer-state";

// The panel carries Dialog, RadioGroup, Switch and the specimen; a docs page that never opens it
// should not pay for them.
const CustomizerPanel = dynamic(() => import("./customizer-panel").then((mod) => mod.CustomizerPanel), {
  ssr: false,
});

/** Mounts the page's one panel after the first hover, focus or press on a trigger. */
export function LazyCustomizerPanel() {
  const { open, panelRequested } = useCustomizer();
  return panelRequested || open ? <CustomizerPanel /> : null;
}
