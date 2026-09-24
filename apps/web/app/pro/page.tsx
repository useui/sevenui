import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownIcon, ArrowRightIcon, CheckIcon, KeyRoundIcon, XIcon } from "lucide-react";
import { loadCatalog } from "../../components/home/registry-data";
import { JsonLd } from "../../components/json-ld";
import { BlockCover } from "../../components/pro/block-cover";
import { BuyLink } from "../../components/pro/buy-link";
import { SetupSteps } from "../../components/pro/setup-steps";
import { pageMetadata } from "../../lib/metadata";
import { requirePageMeta } from "../../lib/page-meta";
import { FAQ } from "./faq";

// The Pro manifest is read at render time; match its 300 s ISR window.
export const revalidate = 300;

const ROUTE = "/pro";

const CHECKOUT_URL = "https://buy.polar.sh/polar_cl_EFc9Cc5sEoAjEz4MBrNwWu5UWgdnAMC0cRwyT2n1aZF";

/** Every row traces to /terms §3, §5 and §6. */
const TERMS: { label: string; value: string }[] = [
  { label: "License", value: "Lifetime. No subscription, nothing to renew." },
  { label: "Seats", value: "One developer. A team buys one license per developer." },
  { label: "Projects", value: "Unlimited — personal, commercial, and client work." },
  { label: "Catalog", value: "Every Block, including the ones released after you buy." },
  { label: "Key", value: "Issued the moment checkout completes, kept in your account." },
  { label: "Refund", value: "Full refund within 14 days, no reason needed." },
];

const ALLOWED = [
  "Use Pro Blocks in as many personal and commercial projects as you like.",
  "Change them freely and ship them inside your own apps and sites.",
  "Build client work with them, including projects you hand over to the client.",
  "Ship compiled or deployed applications that contain Pro Blocks.",
];

const NOT_ALLOWED = [
  "Redistribute, resell, or publish the Pro source — in a public repo, a template, a course, or a starter kit.",
  "Use the Pro code to build a competing component library, block collection, UI kit, or registry.",
  "Share your license key or account with anyone outside your license.",
];


const H2 = "text-3xl font-semibold tracking-[-0.035em] text-balance sm:text-4xl";
const LEAD = "max-w-[62ch] leading-relaxed text-pretty text-muted-foreground";
const QUIET_LINK =
  "inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-foreground/30 underline-offset-[5px] transition-colors hover:decoration-foreground";

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`;

export async function generateMetadata(): Promise<Metadata> {
  const meta = await requirePageMeta(ROUTE, "app/pro/page.tsx");
  return pageMetadata(ROUTE, meta.title, meta.description);
}

export default async function ProPage() {
  const catalog = await loadCatalog();
  const categories = catalog.groups.flatMap((group) => group.categories);
  const named = ["dashboard", "auth", "pricing", "product-detail"]
    .map((id) => categories.find((category) => category.id === id)?.label.toLowerCase())
    .filter((label) => label !== undefined);

  return (
    <main className="sv-page" id="content">
      <section aria-labelledby="pro-title" className="border-b border-border">
        <div className="l-row grid grid-cols-1 gap-12 px-6 pt-14 pb-14 sm:px-8 sm:pt-20 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:pt-24">
          <div className="flex flex-col">
            <h1
              className="text-[2.5rem] leading-[1.02] font-semibold tracking-[-0.04em] text-balance sm:text-6xl lg:text-[4.25rem]"
              id="pro-title"
            >
              Every Pro Block, for $99 once.
            </h1>
            <p className={`${LEAD} mt-6 text-lg`}>
              <span className="tabular-nums">{catalog.blockCount}</span> finished sections and pages across{" "}
              <span className="tabular-nums">{catalog.categoryCount}</span> categories
              {named.length > 0 ? ` — ${named.join(", ")} and more —` : ""}{" "}
              built on the same Base UI primitives as the free registry and installed with the same shadcn CLI.
            </p>
            <p className={`${LEAD} mt-4 text-lg`}>
              Launch price: $99 instead of the regular $249. The license you buy today covers every Block released
              after it.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-7 gap-y-3">
              <a className={QUIET_LINK} href="#catalog">
                Browse the catalog
                <ArrowDownIcon aria-hidden="true" className="size-4" />
              </a>
              <a className={QUIET_LINK} href="#setup">
                How the key works
                <ArrowDownIcon aria-hidden="true" className="size-4" />
              </a>
              <a className={QUIET_LINK} href="#faq">
                Questions
                <ArrowDownIcon aria-hidden="true" className="size-4" />
              </a>
            </div>
            <table className="mt-12 w-full border-t border-border text-sm max-lg:hidden lg:mt-auto">
              <caption className="sr-only">What the catalog holds today, by group</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Group</th>
                  <th scope="col">Categories</th>
                  <th scope="col">Blocks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {catalog.groups.map((group) => (
                  <tr key={group.id}>
                    <th className="py-3 pe-4 text-start font-medium whitespace-nowrap" scope="row">
                      <a className="hover:underline" href={`#group-${group.id}`}>
                        {group.label}
                      </a>
                    </th>
                    <td className="py-3 pe-4 text-muted-foreground">
                      <span className="line-clamp-1">
                        {group.categories.map((category) => category.label).join(", ")}
                      </span>
                    </td>
                    <td className="py-3 text-end whitespace-nowrap text-muted-foreground tabular-nums">
                      {plural(group.items.length, "Block", "Blocks")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="scroll-mt-24 self-start overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-[0_1px_2px_color-mix(in_oklab,var(--foreground)_5%,transparent),0_24px_48px_-28px_color-mix(in_oklab,var(--foreground)_30%,transparent)] dark:shadow-none"
            id="order"
          >
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
              <h2 className="text-sm font-semibold">SevenUI Pro license</h2>
              <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-xs text-muted-foreground">
                Launch price
              </span>
            </div>
            <div className="px-5 pt-5 pb-4">
              <p className="flex items-baseline gap-2.5">
                <span className="text-5xl font-semibold tracking-[-0.04em] tabular-nums">$99</span>
                <span className="text-xl text-muted-foreground tabular-nums line-through decoration-1">
                  <span className="sr-only">Regular price </span>$249
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">One payment, at the launch price.</p>
            </div>
            <dl className="divide-y divide-border border-y border-border text-sm">
              {TERMS.map((term) => (
                <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 px-5 py-2.5" key={term.label}>
                  <dt className="text-muted-foreground">{term.label}</dt>
                  <dd className="text-pretty">{term.value}</dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-1 gap-3 px-5 pt-5 pb-5">
              <BuyLink checkoutUrl={CHECKOUT_URL} />
              <p className="text-xs leading-relaxed text-pretty text-muted-foreground">
                Checkout runs on Polar, the merchant of record, which handles tax and your invoice. By buying you agree
                to the{" "}
                <Link className="text-foreground underline underline-offset-4" href="/terms">
                  Terms
                </Link>
                .
              </p>
            </div>
            <Link
              className="flex items-center gap-2.5 border-t border-border bg-muted/40 px-5 py-3 text-sm transition-colors hover:bg-muted"
              href="/account"
            >
              <KeyRoundIcon aria-hidden="true" className="size-4 text-muted-foreground" />
              <span>
                Already bought? <span className="underline underline-offset-4">Your key is in your account.</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="catalog-title" className="scroll-mt-16 border-b border-border" id="catalog">
        <div className="l-row px-6 pt-16 sm:px-8 sm:pt-24">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-14">
            <h2 className={H2} id="catalog-title">
              The catalog, as it stands today.
            </h2>
            <p className={`${LEAD} lg:max-w-[46ch]`}>
                {plural(catalog.blockCount, "Block", "Blocks")} in{" "}
                {plural(catalog.categoryCount, "category", "categories")}. Every cover is a screenshot of a real Block;
                open a category to preview each one.
              </p>
          </div>

          <div className="mt-6 flex flex-col">
            {catalog.groups.map((group) => (
              <section
                aria-labelledby={`group-${group.id}`}
                className="scroll-mt-16 border-t border-border py-10 sm:py-12"
                key={group.id}
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="text-xl font-semibold tracking-[-0.025em]" id={`group-${group.id}`}>
                    <Link className="hover:underline" href={`/blocks/${group.id}`}>
                      {group.label}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                  <p className="text-sm text-muted-foreground tabular-nums sm:ml-auto">
                    {plural(group.items.length, "Block", "Blocks")} ·{" "}
                    {plural(group.categories.length, "category", "categories")}
                  </p>
                </div>
                <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
                  {group.categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        className="group block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                        href={`/blocks/${group.id}/${category.id}`}
                      >
                        <BlockCover
                          alt=""
                          className="rounded-lg border border-border transition-[border-color,box-shadow] duration-200 group-hover:border-foreground/35 group-hover:shadow-[0_12px_28px_-16px_color-mix(in_oklch,var(--foreground)_30%,transparent)]"
                          cover={category.cover}
                        />
                        <span className="mt-3 flex items-baseline justify-between gap-3">
                          <span className="text-[0.9375rem] font-medium group-hover:underline">{category.label}</span>
                          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                            {plural(category.items.length, "Block", "Blocks")}
                          </span>
                        </span>
                        <span className="mt-1 line-clamp-2 block text-sm leading-snug text-muted-foreground">
                          {category.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="setup-title" className="scroll-mt-16 border-b border-border" id="setup">
        <div className="l-row grid grid-cols-1 gap-10 px-6 py-16 sm:px-8 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
          <div>
            <h2 className={H2} id="setup-title">
              Your key is the only new thing.
            </h2>
            <p className={`${LEAD} mt-4`}>
              Pro Blocks install from the same @sevenui registry as the free tiers. The shadcn CLI sends your key as a
              bearer token; everything
              after that works exactly like the free primitives — source in your repo, yours to change. Three steps, once
              per project.
            </p>
          </div>
          <SetupSteps />
        </div>
      </section>

      <section aria-labelledby="license-title" className="border-b border-border">
        <div className="l-row px-6 py-16 sm:px-8 sm:py-24">
          <h2 className={H2} id="license-title">
            What the license lets you do.
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <h3 className="text-sm font-semibold">You can</h3>
              <ul className="mt-4 grid grid-cols-1 gap-3.5">
                {ALLOWED.map((line) => (
                  <li className="flex gap-3 text-[0.9375rem] leading-relaxed text-pretty" key={line}>
                    <CheckIcon aria-hidden="true" className="mt-1 size-4 shrink-0 text-success" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">You can't</h3>
              <ul className="mt-4 grid grid-cols-1 gap-3.5">
                {NOT_ALLOWED.map((line) => (
                  <li className="flex gap-3 text-[0.9375rem] leading-relaxed text-pretty" key={line}>
                    <XIcon aria-hidden="true" className="mt-1 size-4 shrink-0 text-muted-foreground" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link className={`${QUIET_LINK} mt-7`} href="/terms">
                Read the full terms
                <ArrowRightIcon aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="scroll-mt-16 border-b border-border" id="faq">
        <div className="l-row">
          <div className="px-6 pt-16 pb-10 sm:px-8 sm:pt-24">
            <h2 className={H2} id="faq-title">
              Questions, answered plainly.
            </h2>
          </div>
          <dl className="divide-y divide-border border-t border-border">
            {FAQ.map((entry) => (
              <div
                className="grid grid-cols-1 gap-2 px-6 py-6 sm:px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-14"
                key={entry.q}
              >
                <dt className="text-[0.9375rem] font-medium">{entry.q}</dt>
                <dd className="max-w-[62ch] text-[0.9375rem] leading-relaxed text-pretty text-muted-foreground">
                  {entry.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="close-title">
        <div className="l-row flex flex-col gap-8 px-6 py-20 sm:px-8 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-4xl font-semibold tracking-[-0.04em] text-balance sm:text-5xl" id="close-title">
              $249, now $99.
            </h2>
            <p className={`${LEAD} mt-4`}>The full lifetime license at the launch price.</p>
          </div>
          <div className="w-full sm:max-w-sm">
            <BuyLink checkoutUrl={CHECKOUT_URL} primary={false} />
            <p className="mt-3 text-center text-xs text-muted-foreground">Refundable within 14 days.</p>
          </div>
        </div>
      </section>
      <JsonLd route={ROUTE} />
    </main>
  );
}
