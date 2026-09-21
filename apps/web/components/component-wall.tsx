import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import registry from "../../../packages/registry/registry.json";

const SPECIAL_NAMES: Record<string, string> = {
  "input-otp": "Input OTP",
};

const displayName = (name: string) =>
  SPECIAL_NAMES[name] ??
  name
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const components = registry.items.filter((item) => item.type === "registry:ui").map((item) => item.name);

export function ComponentWall({ primitivesHref }: { primitivesHref: string }) {
  return (
    <div className="overflow-hidden">
      <nav aria-label="All primitives" className="-me-px -mb-px grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {components.map((name, i) => (
          <Link
            className="group flex items-baseline justify-between gap-2 border-e border-b border-border px-4 py-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            href={`/docs/components/${name}`}
            key={name}
          >
            <span className="truncate">{displayName(name)}</span>
            <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums transition-colors group-hover:text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
          </Link>
        ))}
        <Link
          className="group flex items-center justify-between gap-2 border-e border-b border-border bg-muted/40 px-4 py-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
          href={primitivesHref}
        >
          <span className="truncate">Browse all primitives</span>
          <ArrowRightIcon aria-hidden="true" className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </div>
  );
}
