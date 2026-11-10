"use client";

import { usePathname } from "next/navigation";
import { isShellRoute } from "../lib/site-tabs";
import { DrawerShell } from "./drawer-shell";

/** The small-screen site menu. The shell sections (docs, components, blocks) bring their own sidebar drawer. */
export function SiteDrawer({ primitivesHref }: { primitivesHref: string }) {
  const pathname = usePathname();

  if (isShellRoute(pathname)) return null;

  return <DrawerShell primitivesHref={primitivesHref} />;
}
