"use client";

import {
  createContext,
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

export type CustomizerOptions = {
  baseOptions: readonly BaseOption[];
  defaults: PresetValues;
  radiusOptions: readonly RadiusOption[];
  storageKey: string;
  themeOptions: readonly ThemeOption[];
};

type CustomizerValue = CustomizerOptions & {
  /** `null` until the stored preset has been read on the client. */
  config: PresetValues | null;
  dirty: boolean;
  open: boolean;
  reset: () => void;
  setOpen: (open: boolean) => void;
  /** The button that last opened the panel; focus returns to it on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  select: (field: PresetField, value: string) => void;
};

const CustomizerContext = createContext<CustomizerValue | null>(null);

/**
 * One reader and one panel for every customizer button on the page, so the toolbar buttons of
 * twenty block cards stay in step without each parsing localStorage.
 */
export function CustomizerStateProvider({
  baseOptions,
  children,
  defaults,
  radiusOptions,
  storageKey,
  themeOptions,
}: CustomizerOptions & { children: ReactNode }) {
  const [config, setConfig] = useState<PresetValues | null>(null);
  const [open, setOpen] = useState(false);
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
    const select = (field: PresetField, next: string) => {
      const write = (read: PresetReader) => {
        const updated: PresetValues = { ...read(window.localStorage), [field]: next };
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
      baseOptions,
      config,
      defaults,
      dirty,
      open,
      radiusOptions,
      reset,
      select,
      setOpen,
      storageKey,
      themeOptions,
      triggerRef,
    };
  }, [baseOptions, config, defaults, loadReader, open, radiusOptions, storageKey, themeOptions]);

  return <CustomizerContext.Provider value={value}>{children}</CustomizerContext.Provider>;
}

export function useCustomizer(): CustomizerValue {
  const value = useContext(CustomizerContext);
  if (!value) {
    throw new Error("useCustomizer must be used within a CustomizerProvider");
  }
  return value;
}
