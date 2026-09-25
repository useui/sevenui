"use client";

import { usePathname } from "next/navigation";
import { useCallback } from "react";
import type { GalleryFamily } from "../lib/gallery";
import { useDrawer } from "./drawer-context";
import { DrawerShell } from "./drawer-shell";
import { GalleryNav } from "./gallery/nav";

export function SiteDrawer({
  primitivesHref,
  galleryFamilies,
}: {
  primitivesHref: string;
  galleryFamilies: GalleryFamily[];
}) {
  const { setOpen } = useDrawer();
  const pathname = usePathname();

  const isDocs = pathname === "/docs" || pathname.startsWith("/docs/");

  const isBlocks = pathname === "/blocks" || pathname.startsWith("/blocks/");

  const isGallery = pathname === "/components" || pathname.startsWith("/components/");

  const closeDrawer = useCallback(() => setOpen(false), [setOpen]);

  if (isDocs || isBlocks) return null;

  return (
    <DrawerShell
      primitivesHref={primitivesHref}
      tree={isGallery ? <GalleryNav families={galleryFamilies} onNavigate={closeDrawer} /> : undefined}
    />
  );
}
