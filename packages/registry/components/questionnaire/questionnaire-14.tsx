"use client";

import { CheckIcon, UserMinusIcon } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

type Status = "unanswered" | "answered" | "skipped";

const steps = [
  { name: "member", label: "Teammate" },
  { name: "owner", label: "New owner" },
  { name: "timing", label: "Access" },
  { name: "cleanup", label: "Cleanup" },
];

const members = [
  {
    value: "leo",
    name: "Leo Martins",
    initials: "LM",
    role: "Admin",
    owns: "14 docs · 3 projects",
  },
  {
    value: "ana",
    name: "Ana Petrova",
    initials: "AP",
    role: "Editor",
    owns: "6 docs · 1 project",
  },
  {
    value: "tom",
    name: "Tom Okafor",
    initials: "TO",
    role: "Editor",
    owns: "22 docs · 5 projects",
  },
  {
    value: "mei",
    name: "Mei Tanaka",
    initials: "MT",
    role: "Viewer",
    owns: "No owned content",
  },
];

const timings = [
  {
    value: "now",
    label: "Remove access now",
    description: "Signs them out everywhere within a minute.",
  },
  {
    value: "end-of-day",
    label: "At the end of today",
    description: "Access ends at 6:00 PM workspace time.",
  },
  {
    value: "suspend",
    label: "Suspend, don't remove",
    description: "Keeps their seat and history. Restore anytime.",
  },
];

const cleanupTasks = [
  {
    value: "api-keys",
    label: "Revoke 2 personal API keys",
    description: "Integrations using them will stop working.",
  },
  {
    value: "shared-links",
    label: "Disable 5 public share links",
  },
  {
    value: "calendar",
    label: "Cancel their recurring meetings",
  },
];

type Summary = {
  member: string;
  owner: string;
  timing: string;
  cleanup: number;
};

function memberName(value: FormDataEntryValue | null) {
  return members.find((member) => member.value === value)?.name ?? "";
}

export default function Questionnaire14() {
  const [current, setCurrent] = useState(steps[0].name);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [leaving, setLeaving] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);

  const currentIndex = steps.findIndex((step) => step.name === current);

  function trackStatus(name: string) {
    return (status: Status) =>
      setStatuses((previous) => ({ ...previous, [name]: status }));
  }

  function canVisit(index: number) {
    if (index <= currentIndex) return true;
    return steps
      .slice(0, index)
      .every((step) => statuses[step.name] && statuses[step.name] !== "unanswered");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSummary({
      member: memberName(data.get("member")),
      owner: memberName(data.get("owner")),
      timing:
        timings.find((timing) => timing.value === data.get("timing"))?.label ??
        "",
      cleanup: data.getAll("cleanup").length,
    });
  }

  function reset() {
    setSummary(null);
    setStatuses({});
    setLeaving(null);
    setOwner(null);
    setCurrent(steps[0].name);
  }

  if (summary) {
    return (
      <div className="flex w-full max-w-2xl flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground">
        <div className="flex items-center gap-2">
          <UserMinusIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          <h3 className="font-medium">{summary.member} is being offboarded</h3>
        </div>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
          <dt className="text-muted-foreground">Content moves to</dt>
          <dd>{summary.owner}</dd>
          <dt className="text-muted-foreground">Access</dt>
          <dd>{summary.timing}</dd>
          <dt className="text-muted-foreground">Cleanup</dt>
          <dd>
            {summary.cleanup > 0
              ? `${summary.cleanup} ${summary.cleanup === 1 ? "task" : "tasks"} queued`
              : "Nothing extra"}
          </dd>
        </dl>
        <p className="text-sm text-muted-foreground">
          We emailed a copy of this summary to the workspace owners.
        </p>
        <Button variant="outline" size="sm" className="w-fit" onClick={reset}>
          Offboard someone else
        </Button>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-2xl overflow-hidden rounded-xl border bg-card text-card-foreground sm:grid-cols-[180px_minmax(0,1fr)]">
      <nav
        aria-label="Offboarding steps"
        className="hidden border-e bg-muted/40 p-4 sm:block"
      >
        <h3 className="mb-4 px-2 text-sm font-medium">Offboard teammate</h3>
        <ol className="flex flex-col gap-1">
          {steps.map((step, index) => {
            const status = statuses[step.name];
            const done =
              index !== currentIndex &&
              (status === "answered" || status === "skipped");
            const active = index === currentIndex;
            return (
              <li key={step.name}>
                <button
                  type="button"
                  disabled={!canVisit(index)}
                  aria-current={active ? "step" : undefined}
                  onClick={() => setCurrent(step.name)}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-start text-sm text-muted-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-[current=step]:bg-background aria-[current=step]:font-medium aria-[current=step]:text-foreground aria-[current=step]:shadow-xs"
                >
                  <span
                    aria-hidden="true"
                    data-done={done ? "" : undefined}
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.6875rem] tabular-nums data-done:border-primary data-done:bg-primary data-done:text-primary-foreground"
                  >
                    {done ? <CheckIcon className="size-3" /> : index + 1}
                  </span>
                  {step.label}
                  {status === "skipped" && (
                    <span className="sr-only">(skipped)</span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <Questionnaire
        item={current}
        onItemChange={setCurrent}
        onSubmit={handleSubmit}
        className="p-5"
      >
        <QuestionnaireProgress className="sm:hidden" />
        <QuestionnaireItem
          name="member"
          required
          onStatusChange={trackStatus("member")}
        >
          <QuestionnaireTitle>Who is leaving the workspace?</QuestionnaireTitle>
          <QuestionnaireDescription>
            Northwind Studio · 4 of 12 seats shown
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            {members.map((member) => (
              <QuestionnaireChoice
                key={member.value}
                value={member.value}
                onChange={(event) => {
                  const value = event.target.value;
                  setLeaving(value);
                  // Someone who is leaving can't receive their own content.
                  if (owner === value) setOwner(null);
                }}
                className="items-center [&>[data-slot=questionnaire-choice-indicator]]:translate-y-0"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar size="sm" className="max-sm:hidden">
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{member.name}</span>
                    <QuestionnaireChoiceDescription className="text-xs sm:truncate">
                      {member.owns}
                    </QuestionnaireChoiceDescription>
                  </span>
                  <Badge variant="outline" className="ms-auto">
                    {member.role}
                  </Badge>
                </span>
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>Choose the teammate who is leaving.</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem
          name="owner"
          required
          onStatusChange={trackStatus("owner")}
        >
          <QuestionnaireTitle>Who should own their work?</QuestionnaireTitle>
          <QuestionnaireDescription>
            Docs, projects, and automations transfer with edit history intact.
          </QuestionnaireDescription>
          <QuestionnaireChoices className="sm:grid-cols-2">
            {members.map((member) => (
              <QuestionnaireChoice
                key={member.value}
                value={member.value}
                checked={owner === member.value}
                onChange={(event) => setOwner(event.target.value)}
                disabled={member.value === leaving}
                className="items-center [&>[data-slot=questionnaire-choice-indicator]]:translate-y-0"
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{member.name}</span>
                </span>
                {member.value === leaving && (
                  <QuestionnaireChoiceDescription className="text-xs">
                    Leaving
                  </QuestionnaireChoiceDescription>
                )}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>Pick someone to receive their content.</QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireItem
          name="timing"
          required
          onStatusChange={trackStatus("timing")}
        >
          <QuestionnaireTitle>When should their access end?</QuestionnaireTitle>
          <QuestionnaireChoices>
            {timings.map((timing) => (
              <QuestionnaireChoice key={timing.value} value={timing.value}>
                {timing.label}
                <QuestionnaireChoiceDescription>
                  {timing.description}
                </QuestionnaireChoiceDescription>
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError />
        </QuestionnaireItem>
        <QuestionnaireItem
          name="cleanup"
          multiple
          onStatusChange={trackStatus("cleanup")}
        >
          <QuestionnaireTitle>Clean up anything else?</QuestionnaireTitle>
          <QuestionnaireDescription>
            Optional. Skip to leave these as they are.
          </QuestionnaireDescription>
          <QuestionnaireChoices>
            {cleanupTasks.map((task) => (
              <QuestionnaireChoice key={task.value} value={task.value}>
                {task.label}
                {task.description && (
                  <QuestionnaireChoiceDescription>
                    {task.description}
                  </QuestionnaireChoiceDescription>
                )}
              </QuestionnaireChoice>
            ))}
          </QuestionnaireChoices>
          <QuestionnaireError>
            Pick at least one task, or choose Skip &amp; finish.
          </QuestionnaireError>
        </QuestionnaireItem>
        <QuestionnaireActions>
          <QuestionnairePrevious />
          <QuestionnaireSkip>Skip &amp; finish</QuestionnaireSkip>
          <QuestionnaireNext />
          <QuestionnaireSubmit variant="destructive">
            Offboard teammate
          </QuestionnaireSubmit>
        </QuestionnaireActions>
      </Questionnaire>
    </div>
  );
}
