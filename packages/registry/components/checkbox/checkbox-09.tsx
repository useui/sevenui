"use client";

import { useId, useState } from "react";
import { CookieIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";

const categories = [
  {
    id: "necessary",
    title: "Strictly necessary",
    description:
      "Sign-in, security, and your cart. The site can't work without these.",
    vendors: 2,
    locked: true,
  },
  {
    id: "functional",
    title: "Functional",
    description: "Remember your language, region, and recently viewed items.",
    vendors: 3,
    locked: false,
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Anonymous page views that show us which features get used.",
    vendors: 4,
    locked: false,
  },
  {
    id: "marketing",
    title: "Marketing",
    description: "Measure ad campaigns and show you relevant offers elsewhere.",
    vendors: 11,
    locked: false,
  },
];

const optional = categories
  .filter((category) => !category.locked)
  .map((category) => category.id);

export default function Checkbox09() {
  const id = useId();
  const [allowed, setAllowed] = useState<string[]>(["functional"]);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  function save(next: string[]) {
    setAllowed(next);
    setSavedMessage(
      next.length === 0
        ? "Only necessary cookies are on."
        : `Saved. ${next.length} of ${optional.length} optional categories on.`,
    );
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground shadow-lg"
    >
      <div className="flex items-start gap-3 p-4">
        <CookieIcon
          aria-hidden="true"
          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
        />
        <div>
          <h2 id={`${id}-title`} className="text-sm font-medium">
            Cookie preferences
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Choose what Fieldnote may store in your browser. You can change
            this any time from the footer.
          </p>
        </div>
      </div>

      <ul className="border-y border-border">
        {categories.map((category) => {
          const checkboxId = `${id}-${category.id}`;
          return (
            <li
              key={category.id}
              className="flex items-start gap-3 border-b border-border px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <label
                    htmlFor={checkboxId}
                    className="cursor-pointer text-sm font-medium data-[locked=true]:cursor-default"
                    data-locked={category.locked}
                  >
                    {category.title}
                  </label>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {category.locked
                      ? "Always on"
                      : `${category.vendors} vendors`}
                  </span>
                </div>
                <p
                  id={`${checkboxId}-description`}
                  className="mt-0.5 text-xs text-muted-foreground"
                >
                  {category.description}
                </p>
              </div>
              <Checkbox
                id={checkboxId}
                aria-describedby={`${checkboxId}-description`}
                className="mt-0.5"
                checked={category.locked || allowed.includes(category.id)}
                disabled={category.locked}
                onCheckedChange={(checked) => {
                  setSavedMessage(null);
                  setAllowed((current) =>
                    checked
                      ? [...current, category.id]
                      : current.filter((value) => value !== category.id),
                  );
                }}
              />
            </li>
          );
        })}
      </ul>

      <div className="p-4">
        <p
          aria-live="polite"
          className="text-xs text-muted-foreground not-empty:mb-3"
        >
          {savedMessage}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => save([])}>
            Reject all
          </Button>
          <Button variant="outline" onClick={() => save(allowed)}>
            Save choices
          </Button>
          <Button onClick={() => save(optional)}>Accept all</Button>
        </div>
      </div>
    </section>
  );
}
