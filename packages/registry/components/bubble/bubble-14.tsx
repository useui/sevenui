"use client";

import * as React from "react";
import {
  BotIcon,
  CheckIcon,
  CopyIcon,
  GitPullRequestIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const errorLog = `TypeError: Cannot read properties of undefined (reading 'id')
    at getSession (src/lib/auth.ts:42:28)`;

const patch = `- const userId = session.user.id;
+ if (!session?.user) return null;
+ const userId = session.user.id;`;

type Feedback = "up" | "down" | null;

export default function Bubble14() {
  const [copied, setCopied] = React.useState(false);
  const [applied, setApplied] = React.useState(false);
  const [feedback, setFeedback] = React.useState<Feedback>(null);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copyPatch() {
    try {
      await navigator.clipboard.writeText(patch);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section
      aria-label="Debug assistant"
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground"
    >
      <Bubble align="end" variant="outline" className="max-w-[90%]">
        <BubbleContent className="rounded-2xl rounded-br-md">
          <p className="mb-2">Login breaks for invited users. Any idea?</p>
          <pre className="rounded-lg bg-muted px-2.5 py-2 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-destructive">
            {errorLog}
          </pre>
        </BubbleContent>
      </Bubble>

      <div className="flex gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-background">
          <BotIcon aria-hidden className="size-4" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Bubble variant="ghost">
            <BubbleContent>
              Invited users have a session before they finish onboarding, so{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                session.user
              </code>{" "}
              is still empty. Guard it before reading the id:
            </BubbleContent>
          </Bubble>

          <figure className="overflow-hidden rounded-lg border bg-background">
            <figcaption className="flex items-center justify-between gap-2 border-b bg-muted/50 py-1 pr-1 pl-3 font-mono text-xs text-muted-foreground">
              <span className="truncate">src/lib/auth.ts</span>
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label={copied ? "Copied" : "Copy patch"}
                onClick={copyPatch}
              >
                {copied ? <CheckIcon aria-hidden /> : <CopyIcon aria-hidden />}
              </Button>
            </figcaption>
            <pre className="overflow-x-auto px-3 py-2 font-mono text-xs leading-relaxed">
              {patch.split("\n").map((line) => (
                <span
                  key={line}
                  className={
                    line.startsWith("+")
                      ? "block text-success"
                      : "block text-destructive"
                  }
                >
                  {line}
                </span>
              ))}
            </pre>
          </figure>

          <div className="flex flex-wrap items-center gap-1">
            <Button
              size="sm"
              disabled={applied}
              onClick={() => setApplied(true)}
            >
              {applied ? (
                <CheckIcon aria-hidden data-icon="inline-start" />
              ) : (
                <GitPullRequestIcon aria-hidden data-icon="inline-start" />
              )}
              {applied ? "Applied to branch" : "Apply fix"}
            </Button>
            <fieldset className="min-w-0 ml-auto flex gap-0.5">
              <legend className="sr-only">Rate this answer</legend>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Helpful"
                      aria-pressed={feedback === "up"}
                      className="aria-pressed:bg-muted aria-pressed:text-foreground"
                      onClick={() =>
                        setFeedback(feedback === "up" ? null : "up")
                      }
                    />
                  }
                >
                  <ThumbsUpIcon aria-hidden />
                </TooltipTrigger>
                <TooltipContent>Helpful</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Not helpful"
                      aria-pressed={feedback === "down"}
                      className="aria-pressed:bg-muted aria-pressed:text-foreground"
                      onClick={() =>
                        setFeedback(feedback === "down" ? null : "down")
                      }
                    />
                  }
                >
                  <ThumbsDownIcon aria-hidden />
                </TooltipTrigger>
                <TooltipContent>Not helpful</TooltipContent>
              </Tooltip>
            </fieldset>
          </div>
          <p
            className="text-xs text-muted-foreground empty:hidden"
            aria-live="polite"
          >
            {feedback ? "Thanks — this helps tune future answers." : ""}
          </p>
        </div>
      </div>
    </section>
  );
}
