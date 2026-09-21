"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  DEFAULT_PACKAGE_MANAGER,
  PACKAGE_MANAGER_KEY,
  PACKAGE_MANAGERS,
  currentPackageManager,
  isPackageManager,
  readPackageManager,
  type PackageManager,
} from "../lib/package-manager";

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function PackageManagerMenu() {
  const [checkedValue, setCheckedValue] = React.useState<PackageManager>(DEFAULT_PACKAGE_MANAGER);

  React.useEffect(() => {
    function onStorage(event: StorageEvent): void {
      if (event.key !== null && event.key !== PACKAGE_MANAGER_KEY) return;
      const next = readPackageManager(localStorage);
      document.documentElement.dataset.pm = next;
      setCheckedValue(next);
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function selectPm(pm: PackageManager): void {
    setCheckedValue(pm);
    document.documentElement.dataset.pm = pm;
    try {
      localStorage.setItem(PACKAGE_MANAGER_KEY, pm);
    } catch {
    }
  }

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) setCheckedValue(currentPackageManager());
      }}
    >
      <DropdownMenuTrigger
        className={cx(
          "inline-flex cursor-pointer items-center gap-1 rounded-sm px-1.5 py-1 font-mono text-xs font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted",
        )}
      >
        <span className="sr-only">Package manager:</span>
        {PACKAGE_MANAGERS.map((pm) => (
          <span key={pm} className={`pm-only pm-only-${pm}`}>
            {pm}
          </span>
        ))}
        <ChevronDownIcon aria-hidden="true" className="size-3 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup
          value={checkedValue}
          onValueChange={(next) => {
            if (isPackageManager(next)) selectPm(next);
          }}
        >
          {PACKAGE_MANAGERS.map((pm) => (
            <DropdownMenuRadioItem key={pm} value={pm} className="font-mono text-xs">
              {pm}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
