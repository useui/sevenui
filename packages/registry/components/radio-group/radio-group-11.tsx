"use client";

import * as React from "react";
import { GitMergeIcon, Undo2Icon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

type Strategy = "merge" | "squash" | "rebase";

const strategies: {
  value: Strategy;
  label: string;
  description: string;
  action: string;
  done: string;
}[] = [
  {
    value: "merge",
    label: "Create a merge commit",
    description: "Keeps all 3 commits and adds a merge commit on main.",
    action: "Merge pull request",
    done: "Merged into main with a merge commit.",
  },
  {
    value: "squash",
    label: "Squash and merge",
    description: "Combines all 3 commits into one commit on main.",
    action: "Squash and merge",
    done: "Squashed into one commit on main.",
  },
  {
    value: "rebase",
    label: "Rebase and merge",
    description: "Replays all 3 commits on top of main, no merge commit.",
    action: "Rebase and merge",
    done: "Rebased onto main, no merge commit.",
  },
];

const branchCommits = [
  { sha: "a41c9e2", message: "Add CSV export endpoint" },
  { sha: "7d03b18", message: "Stream rows instead of buffering" },
  { sha: "e5f2a07", message: "Fix header order in export" },
];

// The commits that land on main for each strategy, newest first.
const results: Record<
  Strategy,
  { sha: string; message: string; merge?: boolean }[]
> = {
  merge: [
    {
      sha: "c90b4d1",
      message: "Merge branch 'billing-export' into main",
      merge: true,
    },
    ...branchCommits.slice().reverse(),
  ],
  squash: [{ sha: "f18e6c3", message: "Add billing CSV export" }],
  rebase: branchCommits
    .slice()
    .reverse()
    .map((commit, index) => ({
      message: commit.message,
      sha: ["3b7e0a9", "96d1f4c", "0ea52b8"][index],
    })),
};

export default function RadioGroup11() {
  const [strategy, setStrategy] = React.useState<Strategy>("squash");
  const [merged, setMerged] = React.useState(false);
  const selected =
    strategies.find((item) => item.value === strategy) ?? strategies[0];
  const history = results[strategy];

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setMerged(true);
      }}
      className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-col gap-1">
        <h3 id="radio-group-11-title" className="text-sm font-semibold">
          Merge billing-export into main
        </h3>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {merged
            ? selected.done
            : "billing-export is 3 commits ahead. All checks have passed."}
        </p>
      </div>
      <RadioGroup
        aria-labelledby="radio-group-11-title"
        value={strategy}
        onValueChange={(value) => setStrategy(value as Strategy)}
        disabled={merged}
        className="gap-3"
      >
        {strategies.map((item) => (
          <Label
            key={item.value}
            className="cursor-pointer items-start gap-3 font-normal has-data-disabled:cursor-default"
          >
            <RadioGroupItem value={item.value} className="mt-px" />
            <span className="flex flex-col gap-1">
              <span className="font-medium">{item.label}</span>
              <span className="text-xs leading-snug text-muted-foreground">
                {item.description}
              </span>
            </span>
          </Label>
        ))}
      </RadioGroup>
      <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
        <p
          id="radio-group-11-preview"
          className="text-xs font-medium text-muted-foreground"
        >
          Resulting history on main
        </p>
        <ol
          aria-labelledby="radio-group-11-preview"
          aria-live="polite"
          className="flex flex-col"
        >
          {history.map((commit, index) => (
            <li key={commit.sha} className="group/commit flex gap-3">
              <span
                aria-hidden="true"
                className="flex w-3 flex-col items-center"
              >
                <span
                  className={
                    commit.merge
                      ? "mt-1 size-3 shrink-0 rounded-full border-2 border-primary bg-card"
                      : "mt-1 size-3 shrink-0 rounded-full bg-primary"
                  }
                />
                {index < history.length - 1 ? (
                  <span className="w-px flex-1 bg-border" />
                ) : null}
              </span>
              <span className="flex min-w-0 flex-1 items-baseline justify-between gap-3 pb-2.5 text-sm group-last/commit:pb-0">
                <span className="truncate">{commit.message}</span>
                <code className="shrink-0 font-mono text-xs text-muted-foreground">
                  {commit.sha}
                </code>
              </span>
            </li>
          ))}
        </ol>
      </div>
      {merged ? (
        // Distinct keys stop React from reusing the submit button's node, which
        // would otherwise turn this click into a second form submit.
        <Button
          key="revert"
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setMerged(false)}
        >
          <Undo2Icon aria-hidden="true" />
          Revert merge
        </Button>
      ) : (
        <Button key="merge" type="submit" className="w-full">
          <GitMergeIcon aria-hidden="true" />
          {selected.action}
        </Button>
      )}
    </form>
  );
}
