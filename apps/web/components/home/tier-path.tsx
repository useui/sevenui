export type Tier = { href: string; count: number; label: string; terms: string };

/** Primitive → Component → Block on one line; each stop links to its stage lower on the page. */
export function TierPath({ tiers, className }: { tiers: Tier[]; className?: string }) {
  return (
    <nav aria-label="The three tiers" className={className}>
      <ol className="grid grid-cols-1 sm:grid-cols-3">
        {tiers.map((tier, index) => (
          <li className="relative" key={tier.label}>
            <a
              className="group flex items-baseline justify-between gap-3 rounded-md py-2.5 pl-6 outline-offset-4 sm:flex-col sm:items-start sm:justify-start sm:gap-1 sm:pt-4 sm:pr-3 sm:pb-0 sm:pl-0"
              href={tier.href}
            >
              {/* The hairline: vertical below sm, horizontal from sm. */}
              <span
                aria-hidden
                className={
                  index < tiers.length - 1
                    ? "absolute top-[1.15rem] bottom-0 left-[3.5px] w-px bg-border sm:top-0 sm:right-0 sm:bottom-auto sm:left-0 sm:h-px sm:w-auto"
                    : "absolute top-0 left-[3.5px] h-[1.15rem] w-px bg-border sm:right-1/2 sm:left-0 sm:h-px sm:w-auto"
                }
              />
              {index > 0 ? (
                <span aria-hidden className="absolute top-0 left-[3.5px] h-[1.15rem] w-px bg-border sm:hidden" />
              ) : null}
              <span
                aria-hidden
                className="absolute top-[0.95rem] left-0 size-2 rounded-full border border-foreground bg-background transition-colors group-hover:bg-foreground sm:-top-[3.5px]"
              />
              <span className="text-[0.9375rem] font-medium text-foreground group-hover:underline">
                <span className="tabular-nums">{tier.count} </span>
                {tier.label}
              </span>
              <span className="text-xs text-muted-foreground">{tier.terms}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
