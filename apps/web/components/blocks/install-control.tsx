"use client";

import { Check, ChevronDown, Copy } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import {
  DEFAULT_PACKAGE_MANAGER,
  PACKAGE_MANAGERS,
  PACKAGE_MANAGER_KEY,
  currentPackageManager,
  packageManagerCommands,
  type PackageManager,
} from "../../lib/package-manager";
import { installCommand } from "../../lib/registry";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { useAnnounce } from "../announcer";

const KEY =
  "relative inline-flex cursor-pointer items-center text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:z-[1] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

const COPIED_MS = 1600;

export interface InstallControlProps {
  /** Registry item path passed to `installCommand()`, e.g. "pro/dashboard-01". */
  item: string;
  /** Block title, used only to make the copy announcement specific. */
  title: string;
}

export function InstallControl({ item, title }: InstallControlProps) {
  const announce = useAnnounce();
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<PackageManager | null>(null);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commands = useMemo(
    () => packageManagerCommands((pm) => installCommand(item, pm)),
    [item],
  );
  const tail = `… ${commands.npm.replace(/^.*?shadcn@latest\s+/, "")}`;

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  useEffect(() => setChecked(currentPackageManager()), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const menu = menuRef.current;
    menu?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
  }, [open, checked]);

  function selectPm(pm: PackageManager) {
    try {
      localStorage.setItem(PACKAGE_MANAGER_KEY, pm);
    } catch {
      // Storage blocked; the choice still applies for this page view.
    }
    document.documentElement.dataset.pm = pm;
    setChecked(pm);
    setOpen(false);
    triggerRef.current?.focus();
  }

  async function copy() {
    const pm = currentPackageManager();
    try {
      await navigator.clipboard.writeText(commands[pm]);
      announce(`Copied the ${pm} install command for ${title}.`);
    } catch {
      // Clipboard unavailable (permissions/insecure context); nothing to undo.
      announce("Copy failed — the clipboard is unavailable.");
      return;
    }
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }

  function onOptionKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, index: number) {
    const options = menuRef.current?.querySelectorAll<HTMLElement>("[data-pm-option]");
    if (!options) return;
    const focus = (next: number) => {
      event.preventDefault();
      options[(next + options.length) % options.length]?.focus();
    };
    if (event.key === "ArrowDown") return focus(index + 1);
    if (event.key === "ArrowUp") return focus(index - 1);
    if (event.key === "Home") return focus(0);
    if (event.key === "End") return focus(options.length - 1);
  }

  return (
    <div
      className="relative flex h-8 min-w-0 shrink items-stretch rounded-md border border-border bg-background text-xs"
      ref={rootRef}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <button
              aria-expanded={open}
              aria-haspopup="menu"
              className={`${KEY} gap-1 rounded-s-md px-2 font-medium text-foreground`}
              onClick={() => {
                if (!open) setChecked(currentPackageManager());
                setOpen((value) => !value);
              }}
              ref={triggerRef}
              type="button"
            >
              <span className="sr-only">Package manager:</span>
              {PACKAGE_MANAGERS.map((pm) => (
                <svg aria-hidden="true" className={`pm-only pm-only-${pm} size-3.5 shrink-0`} key={pm}>
                  <use href={`#pm-icon-${pm}`} />
                </svg>
              ))}
              {PACKAGE_MANAGERS.map((pm) => (
                <span className={`pm-only pm-only-${pm}`} key={pm}>
                  {pm}
                </span>
              ))}
              <ChevronDown aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            </button>
          }
        />
        <TooltipContent>Change package manager</TooltipContent>
      </Tooltip>

      <span aria-hidden="true" className="w-px shrink-0 bg-border" />

      <code className="flex min-w-0 flex-1 items-center px-2 font-mono text-muted-foreground">
        <span className="block min-w-0 flex-1 truncate text-left" dir="rtl">
          <bdi>{tail}</bdi>
        </span>
      </code>

      <span aria-hidden="true" className="w-px shrink-0 bg-border" />

      <Tooltip
        onOpenChange={(isOpen) => {
          if (isOpen) setChecked(currentPackageManager());
        }}
      >
        <TooltipTrigger
          closeOnClick={false}
          render={
            <button
              className={`${KEY} w-8 shrink-0 justify-center rounded-e-md`}
              onClick={() => void copy()}
              type="button"
            >
              <span className="sr-only">Copy install command</span>
              <Copy aria-hidden="true" className={copied ? "hidden size-4" : "size-4"} strokeWidth={1.5} />
              <Check aria-hidden="true" className={copied ? "size-4" : "hidden size-4"} strokeWidth={1.5} />
            </button>
          }
        />
        <TooltipContent>{copied ? "Copied" : commands[checked ?? DEFAULT_PACKAGE_MANAGER]}</TooltipContent>
      </Tooltip>

      {/* Anchored under the TRIGGER (left), not the control's right edge. */}
      <div
        aria-label="Package manager"
        className="absolute top-full left-0 z-30 mt-1 min-w-[7rem] rounded-md border border-border bg-card p-1 shadow-[0_10px_24px_-6px_rgb(0_0_0/0.18),0_2px_6px_-2px_rgb(0_0_0/0.10)]"
        hidden={!open}
        ref={menuRef}
        role="menu"
      >
        {PACKAGE_MANAGERS.map((pm, index) => (
          <button
            aria-checked={checked === pm}
            className="group/opt flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left font-mono text-xs text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground aria-checked:font-medium aria-checked:text-foreground"
            data-pm-option={pm}
            key={pm}
            onClick={() => selectPm(pm)}
            onKeyDown={(event) => onOptionKeyDown(event, index)}
            role="menuitemradio"
            tabIndex={checked === pm ? 0 : -1}
            type="button"
          >
            <svg aria-hidden="true" className="size-3.5 shrink-0">
              <use href={`#pm-icon-${pm}`} />
            </svg>
            {pm}
            <Check
              aria-hidden="true"
              className="ml-auto size-3 shrink-0 opacity-0 group-aria-checked/opt:opacity-100"
              strokeWidth={2}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
