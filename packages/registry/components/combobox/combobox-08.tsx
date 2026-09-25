"use client";

import * as React from "react";
import { PackageIcon, SearchIcon } from "lucide-react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import { InputGroupAddon } from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import { Spinner } from "@/registry/base/ui/spinner";

type Package = {
  value: string;
  label: string;
  description: string;
  downloads: string;
};

// Stands in for a remote search endpoint.
const catalog: Package[] = [
  { value: "zod", label: "zod", description: "TypeScript-first schema validation", downloads: "31.2M" },
  { value: "date-fns", label: "date-fns", description: "Modern date utility library", downloads: "24.8M" },
  { value: "zustand", label: "zustand", description: "Small, fast state management", downloads: "6.1M" },
  { value: "react-hook-form", label: "react-hook-form", description: "Performant forms with easy validation", downloads: "9.4M" },
  { value: "recharts", label: "recharts", description: "Charts built on React and D3", downloads: "3.2M" },
  { value: "dayjs", label: "dayjs", description: "2kB immutable date library", downloads: "22.5M" },
  { value: "swr", label: "swr", description: "React hooks for data fetching", downloads: "3.9M" },
  { value: "valibot", label: "valibot", description: "Modular schema library", downloads: "1.7M" },
  { value: "embla-carousel", label: "embla-carousel", description: "Lightweight carousel engine", downloads: "2.4M" },
  { value: "clsx", label: "clsx", description: "Tiny utility for className strings", downloads: "38.9M" },
];

const popular = catalog.slice(0, 4);

function searchCatalog(query: string) {
  const needle = query.trim().toLowerCase();
  return catalog.filter(
    (item) =>
      item.label.includes(needle) ||
      item.description.toLowerCase().includes(needle),
  );
}

export default function Combobox08() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<Package[]>(popular);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (query.trim() === "") {
      setResults(popular);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timeout = window.setTimeout(() => {
      setResults(searchCatalog(query));
      setLoading(false);
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const status = loading
    ? "Searching packages"
    : query.trim() === ""
      ? "Showing popular packages"
      : `${results.length} ${results.length === 1 ? "package" : "packages"} found`;

  return (
    <div className="grid w-full max-w-sm gap-2">
      <Label htmlFor="combobox-08-package">Add dependency</Label>
      <Combobox
        items={results}
        filter={null}
        onInputValueChange={setQuery}
      >
        <ComboboxInput
          id="combobox-08-package"
          placeholder="Search the registry"
          className="w-full"
          aria-busy={loading}
          showTrigger={false}
          showClear
        >
          <InputGroupAddon align="inline-start">
            {loading ? (
              <Spinner aria-hidden="true" />
            ) : (
              <SearchIcon aria-hidden="true" />
            )}
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent>
          {query.trim() === "" ? (
            <p className="px-2.5 pt-2 pb-1 text-xs text-muted-foreground">
              Popular this week
            </p>
          ) : null}
          <ComboboxEmpty className="flex-col items-center gap-1 py-6">
            <span className="font-medium text-foreground">No packages for “{query}”</span>
            <span>Check the spelling or search by what it does.</span>
          </ComboboxEmpty>
          <ComboboxList
            className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
          >
            {(item: Package) => (
              <ComboboxItem key={item.value} value={item} className="items-start gap-2.5 py-1.5">
                <PackageIcon aria-hidden="true" className="mt-0.5 text-muted-foreground" />
                <span className="grid min-w-0 flex-1 leading-tight">
                  <span className="truncate font-medium">{item.label}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.description}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {item.downloads}
                </span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <p aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}
