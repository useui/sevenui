"use client";

import * as React from "react";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  LifeBuoyIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/registry/base/ui/command";

type Article = {
  value: string;
  label: string;
  summary: string;
  keywords: string;
  minutes: number;
  steps: string[];
};

type Section = { value: string; items: Article[] };

const sections: Section[] = [
  {
    value: "Billing",
    items: [
      {
        value: "change-plan",
        label: "Upgrade or downgrade your plan",
        summary: "Plan changes are prorated to the day.",
        keywords: "pricing subscription seats prorate",
        minutes: 2,
        steps: [
          "Open Settings → Billing.",
          "Choose Change plan and pick the new tier.",
          "Review the prorated amount and confirm.",
        ],
      },
      {
        value: "vat-invoice",
        label: "Add a VAT number to invoices",
        summary: "Tax IDs appear on every invoice after you save them.",
        keywords: "tax receipt company eu",
        minutes: 1,
        steps: [
          "Open Settings → Billing → Invoice details.",
          "Enter your VAT number and company address.",
          "Past invoices can be regenerated from the invoice list.",
        ],
      },
    ],
  },
  {
    value: "Account & security",
    items: [
      {
        value: "two-factor",
        label: "Recover access without your 2FA device",
        summary: "Use a backup code or ask a workspace owner to reset.",
        keywords: "two factor authenticator lost phone login mfa",
        minutes: 3,
        steps: [
          "On the sign-in screen, choose Use a backup code.",
          "Enter one of the ten codes you saved during setup.",
          "No codes left? A workspace owner can reset 2FA from Members.",
        ],
      },
      {
        value: "sso",
        label: "Set up SAML single sign-on",
        summary: "Available on Business and Enterprise plans.",
        keywords: "okta azure google workspace saml login",
        minutes: 5,
        steps: [
          "Open Settings → Security → Single sign-on.",
          "Paste your identity provider's metadata URL.",
          "Test the connection before enforcing SSO for everyone.",
        ],
      },
    ],
  },
];

function matchesArticle(article: Article, query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const haystack =
    `${article.label} ${article.summary} ${article.keywords}`.toLowerCase();
  // Every word must appear somewhere, in any order.
  return words.every((word) => haystack.includes(word));
}

export default function Command12() {
  const [query, setQuery] = React.useState("");
  const [article, setArticle] = React.useState<Article | null>(null);
  const [feedback, setFeedback] = React.useState<"yes" | "no" | null>(null);
  const [ticket, setTicket] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  // Only move focus after a user action, never on the first render.
  const navigated = React.useRef(false);

  React.useEffect(() => {
    if (!navigated.current) return;
    // The article view and the search swap places, so hand focus to
    // whichever one just appeared instead of dropping it on the page.
    if (article) headingRef.current?.focus();
    else searchRef.current?.focus();
  }, [article]);

  function openArticle(next: Article) {
    navigated.current = true;
    setFeedback(null);
    setArticle(next);
  }

  return (
    <section
      aria-label="Help center"
      className="flex w-full max-w-sm flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm"
    >
      <header className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
        <LifeBuoyIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <h3 className="text-sm font-medium">How can we help?</h3>
      </header>

      {article ? (
        <div className="flex flex-col gap-3 p-4">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 self-start"
            onClick={() => {
              navigated.current = true;
              setArticle(null);
            }}
          >
            <ArrowLeftIcon aria-hidden="true" />
            Back to results
          </Button>
          <h4
            ref={headingRef}
            tabIndex={-1}
            className="text-base font-medium text-balance outline-none"
          >
            {article.label}
          </h4>
          <p className="text-sm text-muted-foreground">{article.summary}</p>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm marker:text-muted-foreground">
            {article.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="mt-1 flex items-center justify-between gap-2 border-t border-border pt-3">
            <p className="text-xs text-muted-foreground" aria-live="polite">
              {feedback === null
                ? "Did this answer your question?"
                : feedback === "yes"
                  ? "Thanks, glad it helped."
                  : "Sorry about that. We'll improve this article."}
            </p>
            <div className="flex gap-1">
              <Button
                variant={feedback === "yes" ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label="Yes, this helped"
                aria-pressed={feedback === "yes"}
                onClick={() => setFeedback("yes")}
              >
                <ThumbsUpIcon aria-hidden="true" />
              </Button>
              <Button
                variant={feedback === "no" ? "secondary" : "ghost"}
                size="icon-sm"
                aria-label="No, this did not help"
                aria-pressed={feedback === "no"}
                onClick={() => setFeedback("no")}
              >
                <ThumbsDownIcon aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Command
          items={sections}
          value={query}
          onValueChange={(next, details) => {
            if (details.reason === "item-press") return;
            setQuery(next);
            setTicket(null);
          }}
          filter={(item, value) => matchesArticle(item as Article, value)}
          className="rounded-none! bg-card p-2"
        >
          <CommandInput
            ref={searchRef}
            placeholder="Search guides, e.g. “lost 2FA phone”"
            aria-label="Search help articles"
          />
          <CommandList className="max-h-64">
            {(section: Section) => (
              <CommandGroup
                key={section.value}
                heading={section.value}
                items={section.items}
              >
                {(item: Article) => (
                  <CommandItem
                    key={item.value}
                    value={item}
                    onClick={() => openArticle(item)}
                    className="items-start"
                  >
                    <BookOpenIcon
                      className="mt-0.5 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <span className="flex min-w-0 flex-col">
                      <span>{item.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.summary}
                      </span>
                    </span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                      {item.minutes} min
                    </span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
          </CommandList>
          <CommandEmpty className="px-4 not-empty:py-5">
            <div className="flex flex-col items-center gap-3">
              <p className="text-muted-foreground text-pretty">
                No guide covers “{query.trim()}” yet.
              </p>
              {ticket ? (
                <p className="text-sm" role="status">
                  Ticket <span className="font-mono">{ticket}</span> opened.
                  We reply within 4 hours.
                </p>
              ) : (
                <Button size="sm" onClick={() => setTicket("SUP-20931")}>
                  <LifeBuoyIcon aria-hidden="true" />
                  Ask our support team
                </Button>
              )}
            </div>
          </CommandEmpty>
        </Command>
      )}
    </section>
  );
}
