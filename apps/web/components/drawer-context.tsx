"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Shared open state for the mobile nav drawer (`site-drawer.tsx`), read by
 * the header's nav-toggle button and by the drawer itself.
 *
 * Ported behaviour: Blume drove this off a single `data-blume-nav-open`
 * attribute on `<html>`, toggled by a delegated click handler in
 * `legacy-components/blume/Header.astro:150` and read by pure CSS in
 * `legacy-components/site-drawer.astro:38,48`. React has no shared global
 * attribute to toggle from two different components, so this becomes a
 * layout-level context instead — the root layout (Task 1.4) wraps the header
 * and the drawer in one `<DrawerProvider>`.
 */
interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <DrawerContext.Provider value={{ open, setOpen }}>{children}</DrawerContext.Provider>;
}

export function useDrawer(): DrawerContextValue {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }
  return context;
}
