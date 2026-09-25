"use client";

import * as React from "react";
import { RotateCcwIcon, SparklesIcon } from "lucide-react";

import { Bubble, BubbleContent } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";

const question = "How do I rotate an API key without downtime?";

const answer =
  "Create a second key first and deploy it alongside the old one. Once every service reads the new key, revoke the old key from Settings → API keys. Requests signed with either key keep working during the overlap.";

const words = answer.split(" ");

type Phase = "typing" | "streaming" | "done";

export default function Bubble08() {
  const [phase, setPhase] = React.useState<Phase>("typing");
  const [count, setCount] = React.useState(0);
  const [run, setRun] = React.useState(0);

  // Replays the typing indicator and word-by-word stream on every run.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `run` restarts the sequence
  React.useEffect(() => {
    setPhase("typing");
    setCount(0);
    let interval: number | undefined;
    const delay = window.setTimeout(() => {
      setPhase("streaming");
      interval = window.setInterval(() => {
        setCount((current) => {
          const next = current + 1;
          if (next >= words.length) {
            window.clearInterval(interval);
            setPhase("done");
          }
          return next;
        });
      }, 60);
    }, 1200);
    return () => {
      window.clearTimeout(delay);
      window.clearInterval(interval);
    };
  }, [run]);

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <Bubble align="end" variant="secondary">
        <BubbleContent>{question}</BubbleContent>
      </Bubble>
      <div className="flex gap-2.5">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <SparklesIcon aria-hidden="true" className="size-3.5" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {phase === "typing" ? (
            <Bubble variant="muted">
              <BubbleContent
                role="status"
                aria-label="Assistant is typing"
                className="flex h-9 items-center gap-1 px-3.5"
              >
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    aria-hidden="true"
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-1.5 animate-pulse rounded-full bg-muted-foreground motion-reduce:animate-none"
                  />
                ))}
              </BubbleContent>
            </Bubble>
          ) : (
            <Bubble
              variant="ghost"
              className="animate-in duration-300 fade-in-0 slide-in-from-bottom-1"
            >
              <BubbleContent aria-busy={phase === "streaming"}>
                <span className="sr-only">
                  {phase === "done" ? answer : ""}
                </span>
                <span aria-hidden="true">
                  {words.slice(0, count).join(" ")}
                  {phase === "streaming" ? (
                    <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse rounded-xs bg-foreground motion-reduce:animate-none" />
                  ) : null}
                </span>
              </BubbleContent>
            </Bubble>
          )}
          <div className="flex h-7 items-center">
            {phase === "done" ? (
              <Button
                variant="ghost"
                size="xs"
                className="-ml-2 text-muted-foreground animate-in fade-in-0"
                onClick={() => setRun((current) => current + 1)}
              >
                <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />
                Regenerate
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
