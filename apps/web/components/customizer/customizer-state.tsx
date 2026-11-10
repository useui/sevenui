"use client";

import {
  createContext,
  type MouseEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { PRESET_CHANGE_EVENT } from "../preset-scope-attr";

export type PresetValues = {
  baseColor: string;
  radius: string;
  theme: string;
  version: number;
};

export type PresetField = "baseColor" | "radius" | "theme";

type PresetReader = (storage: Pick<Storage, "getItem">) => PresetValues;

export type ThemeOption = { label: string; swatch: string; value: string };
export type BaseOption = { ink: string; label: string; swatch: string; value: string };
export type RadiusOption = { glyph: string; label: string; value: string };
/** A curated combination: one pick sets all three axes. */
export type LookOption = { baseColor: string; label: string; radius: string; theme: string; value: string };

export type CustomizerOptions = {
  baseOptions: readonly BaseOption[];
  defaults: PresetValues;
  looks: readonly LookOption[];
  radiusOptions: readonly RadiusOption[];
  storageKey: string;
  themeOptions: readonly ThemeOption[];
};

/** Lives here, not in the dock, so a trigger can name the dock without importing it. */
export const CUSTOMIZER_DOCK_ID = "theme-customizer-dock";

type CustomizerValue = CustomizerOptions & {
  /** Writes several axes in one step, so a look or a shuffle is one storage write and one repaint. */
  apply: (values: Partial<Record<PresetField, string>>) => void;
  /** `null` until the stored preset has been read on the client. */
  config: PresetValues | null;
  dirty: boolean;
  open: boolean;
  /** True once a trigger has been hovered, focused or pressed: the cue to load and mount the dock. */
  dockRequested: boolean;
  /** True while the page shows at least one preview toolbar, which is when the launcher is worth showing. */
  hasPreviews: boolean;
  /** Called by each preview toolbar's trigger on mount; returns the matching unregister. */
  registerPreview: () => () => void;
  requestDock: () => void;
  reset: () => void;
  setOpen: (open: boolean) => void;
  /** The button that last opened the dock; focus returns to it on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  select: (field: PresetField, value: string) => void;
};

const CustomizerContext = createContext<CustomizerValue | null>(null);

/**
 * One reader and one dock for every customizer trigger on the page, so the toolbar buttons of
 * twenty block cards stay in step without each parsing localStorage.
 */
export function CustomizerStateProvider({
  baseOptions,
  children,
  defaults,
  looks,
  radiusOptions,
  storageKey,
  themeOptions,
}: CustomizerOptions & { children: ReactNode }) {
  const [config, setConfig] = useState<PresetValues | null>(null);
  const [open, setOpen] = useState(false);
  const [dockRequested, setDockRequested] = useState(false);
  const requestDock = useCallback(() => setDockRequested(true), []);
  const [previewCount, setPreviewCount] = useState(0);
  const registerPreview = useCallback(() => {
    setPreviewCount((count) => count + 1);
    return () => setPreviewCount((count) => count - 1);
  }, []);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const readerRef = useRef<PresetReader | null>(null);
  const readerPromiseRef = useRef<Promise<PresetReader | null> | null>(null);

  const loadReader = useCallback(() => {
    readerPromiseRef.current ??= import("@sevenui/presets/schema").then(
      ({ readPresetConfig }) => {
        readerRef.current = readPresetConfig;
        return readPresetConfig;
      },
      () => {
        readerPromiseRef.current = null;
        return null;
      },
    );
    return readerPromiseRef.current;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadReader().then((read) => {
      if (read && !cancelled) setConfig(read(window.localStorage));
    });
    // Another tab changed the preset.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      const read = readerRef.current;
      if (read) setConfig(read(window.localStorage));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [loadReader, storageKey]);

  const value = useMemo<CustomizerValue>(() => {
    const apply = (values: Partial<Record<PresetField, string>>) => {
      const write = (read: PresetReader) => {
        const updated: PresetValues = { ...read(window.localStorage), ...values };
        window.localStorage.setItem(storageKey, JSON.stringify(updated));
        setConfig(updated);
        window.dispatchEvent(new Event(PRESET_CHANGE_EVENT));
      };
      const read = readerRef.current;
      if (read) {
        write(read);
        return;
      }
      void loadReader().then((loaded) => {
        if (loaded) write(loaded);
      });
    };

    const select = (field: PresetField, next: string) => apply({ [field]: next });

    const reset = () => {
      window.localStorage.removeItem(storageKey);
      setConfig(defaults);
      window.dispatchEvent(new Event(PRESET_CHANGE_EVENT));
    };

    const dirty =
      config !== null &&
      (Object.keys(defaults) as (keyof PresetValues)[]).some(
        (field) => field !== "version" && config[field] !== defaults[field],
      );

    return {
      apply,
      baseOptions,
      config,
      defaults,
      dirty,
      dockRequested,
      hasPreviews: previewCount > 0,
      looks,
      open,
      radiusOptions,
      registerPreview,
      requestDock,
      reset,
      select,
      setOpen,
      storageKey,
      themeOptions,
      triggerRef,
    };
  }, [
    baseOptions,
    config,
    defaults,
    dockRequested,
    loadReader,
    looks,
    open,
    previewCount,
    radiusOptions,
    registerPreview,
    requestDock,
    storageKey,
    themeOptions,
  ]);

  return <CustomizerContext.Provider value={value}>{children}</CustomizerContext.Provider>;
}

export function useCustomizer(): CustomizerValue {
  const value = useContext(CustomizerContext);
  if (!value) {
    throw new Error("useCustomizer must be used within a CustomizerProvider");
  }
  return value;
}

/**
 * What makes a button a customizer trigger: it toggles the page's one dock, starts loading the dock
 * on the first sign of intent, and takes focus back when the dock closes.
 */
export function useCustomizerTrigger() {
  const { config, open, requestDock, setOpen, triggerRef } = useCustomizer();
  return {
    "aria-controls": open ? CUSTOMIZER_DOCK_ID : undefined,
    "aria-expanded": open,
    "aria-label":
      config === null
        ? "Customize theme"
        : `Customize theme — ${config.theme} theme, ${config.baseColor} base color, ${config.radius} radius`,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      triggerRef.current = event.currentTarget;
      requestDock();
      setOpen(!open);
    },
    // Intent to open: start loading the dock so it is mounted, closed, before the click.
    onFocus: requestDock,
    onPointerEnter: requestDock,
    type: "button" as const,
  };
}
