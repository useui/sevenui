"use client";

import * as React from "react";

import { CheckIcon, ChevronDownIcon, UndoIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Progress } from "@/registry/base/ui/progress";

type Task = {
  id: string;
  title: string;
  description: string;
  action: string;
  estimate: string;
};

const tasks: Task[] = [
  {
    id: "profile",
    title: "Create your store profile",
    description: "Add a store name, logo, and support email.",
    action: "Edit profile",
    estimate: "2 min",
  },
  {
    id: "product",
    title: "Add your first product",
    description:
      "Upload photos, set a price, and choose how much stock you have on hand.",
    action: "Add product",
    estimate: "5 min",
  },
  {
    id: "payments",
    title: "Connect a payout account",
    description:
      "Link a bank account so sales are paid out every Friday. Verification usually takes one business day.",
    action: "Connect bank",
    estimate: "4 min",
  },
  {
    id: "shipping",
    title: "Set shipping rates",
    description:
      "Offer flat-rate, free-over-threshold, or live carrier rates for domestic and international orders.",
    action: "Configure shipping",
    estimate: "3 min",
  },
  {
    id: "domain",
    title: "Connect a custom domain",
    description:
      "Point shop.yourbrand.com at your store. We handle the SSL certificate for you.",
    action: "Add domain",
    estimate: "6 min",
  },
];

export default function Collapsible14() {
  const [done, setDone] = React.useState<string[]>(["profile", "product"]);
  const [openId, setOpenId] = React.useState<string | null>("payments");

  const completed = tasks.filter((task) => done.includes(task.id));
  const remaining = tasks.filter((task) => !done.includes(task.id));
  const percent = Math.round((completed.length / tasks.length) * 100);

  function complete(id: string) {
    const next = remaining.find((task) => task.id !== id);
    setDone((current) => [...current, id]);
    setOpenId(next ? next.id : null);
  }

  function reopen(id: string) {
    setDone((current) => current.filter((item) => item !== id));
    setOpenId(id);
  }

  return (
    <section
      aria-labelledby="collapsible-14-title"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-5 text-card-foreground"
    >
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 id="collapsible-14-title" className="font-semibold">
            Get your store ready to sell
          </h3>
          <span className="shrink-0 text-sm whitespace-nowrap text-muted-foreground tabular-nums">
            {completed.length} of {tasks.length}
          </span>
        </div>
        <Progress value={percent} aria-label="Setup progress" />
      </header>

      {remaining.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 px-4 py-6 text-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon aria-hidden="true" className="size-4" />
          </span>
          <p className="font-medium">Your store is ready to launch</p>
          <p className="text-sm text-muted-foreground">
            Publish it whenever you are ready. You can change any of these later
            in Settings.
          </p>
          <Button size="sm" className="mt-2">
            Launch store
          </Button>
        </div>
      ) : (
        <ol className="flex flex-col gap-2">
          {remaining.map((task) => (
            <li key={task.id}>
              <Collapsible
                open={openId === task.id}
                onOpenChange={(open) => setOpenId(open ? task.id : null)}
                className="rounded-lg border data-open:border-ring/40 data-open:bg-muted/30"
              >
                <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <span
                    aria-hidden="true"
                    className="size-4 shrink-0 rounded-full border-2 border-muted-foreground/40 group-data-panel-open:border-primary"
                  />
                  <span className="flex-1 text-sm font-medium">
                    {task.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {task.estimate}
                  </span>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-180"
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-col gap-3 px-3 pb-3 pl-10">
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm">{task.action}</Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => complete(task.id)}
                      >
                        Mark as done
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ol>
      )}

      {completed.length > 0 && (
        <Collapsible className="border-t pt-3">
          <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-1 text-left text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
            <ChevronDownIcon
              aria-hidden="true"
              className="size-4 -rotate-90 transition-transform group-data-panel-open:rotate-0"
            />
            {completed.length} completed
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="flex flex-col gap-1 pt-2">
              {completed.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-3 rounded-md px-1 py-1"
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <CheckIcon aria-hidden="true" className="size-3" />
                  </span>
                  <span className="flex-1 text-sm text-muted-foreground line-through decoration-muted-foreground/50">
                    {task.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Mark "${task.title}" as not done`}
                    onClick={() => reopen(task.id)}
                  >
                    <UndoIcon aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )}
    </section>
  );
}
