"use client";

import { ChevronUpIcon, MinusIcon, TicketIcon } from "lucide-react";
import { type FormEvent, useState } from "react";

import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup } from "@/registry/base/ui/bubble";
import { Button } from "@/registry/base/ui/button";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const topics = [
  { value: "billing", label: "Billing or invoices" },
  { value: "bug", label: "Something isn't working" },
  { value: "access", label: "I can't sign in" },
  { value: "other", label: "Something else" },
];

const urgencies = [
  {
    value: "blocked",
    label: "My team is blocked",
    description: "Routed to on-call. Reply within 1 hour.",
  },
  {
    value: "degraded",
    label: "It's slowing us down",
    description: "Reply within 4 business hours.",
  },
  {
    value: "question",
    label: "Just a question",
    description: "Reply within 1 business day.",
  },
];

type Ticket = { topic: string; urgency: string; reference: string };

export default function Questionnaire10() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [minimized, setMinimized] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setTicket({
      topic:
        topics.find((topic) => topic.value === data.get("topic"))?.label ?? "",
      urgency:
        urgencies.find((urgency) => urgency.value === data.get("urgency"))
          ?.description ?? "",
      reference: String(data.get("reference") ?? ""),
    });
  }

  return (
    <div
      className={`flex w-full max-w-sm flex-col overflow-hidden rounded-2xl border bg-background shadow-lg ${
        minimized ? "" : "h-[600px] sm:h-[520px]"
      }`}
    >
      <header
        className={`flex items-center gap-3 px-4 py-3 ${minimized ? "" : "border-b"}`}
      >
        <Avatar>
          <AvatarFallback>AS</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-sm font-medium">Acorn Support</h3>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-success" />
            Typically replies in under 2 hours
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={minimized ? "Expand chat" : "Minimize chat"}
          aria-expanded={!minimized}
          onClick={() => setMinimized((value) => !value)}
        >
          {minimized ? (
            <ChevronUpIcon aria-hidden="true" />
          ) : (
            <MinusIcon aria-hidden="true" />
          )}
        </Button>
      </header>
      <div
        hidden={minimized}
        role="log"
        aria-label="Support conversation"
        className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4"
      >
        <BubbleGroup>
          <Bubble variant="muted">
            <BubbleContent>
              Hi Sam! Three quick questions and I'll route you to the right
              person.
            </BubbleContent>
          </Bubble>
        </BubbleGroup>
        {ticket ? (
          <>
            <BubbleGroup>
              <Bubble align="end">
                <BubbleContent>
                  {ticket.topic} · {ticket.reference}
                </BubbleContent>
              </Bubble>
            </BubbleGroup>
            <div className="flex flex-col gap-2 rounded-xl border bg-card p-3 text-sm text-card-foreground">
              <p className="flex items-center gap-2 font-medium">
                <TicketIcon aria-hidden="true" className="size-4 text-muted-foreground" />
                Ticket ACR-4821 opened
              </p>
              <p className="text-muted-foreground">{ticket.urgency}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={() => setTicket(null)}
              >
                Edit request
              </Button>
            </div>
          </>
        ) : (
          <Questionnaire
            shortcuts="numbers"
            onSubmit={handleSubmit}
            className="shrink-0 gap-3 rounded-xl border bg-card p-3 text-card-foreground"
          >
            <QuestionnaireProgress className="text-[0.6875rem]" />
            <QuestionnaireItem name="topic" required className="gap-3">
              <QuestionnaireTitle className="text-sm">
                What do you need help with?
              </QuestionnaireTitle>
              <QuestionnaireChoices className="gap-1.5">
                {topics.map((topic) => (
                  <QuestionnaireChoice
                    key={topic.value}
                    value={topic.value}
                    className="min-h-10 py-2"
                  >
                    {topic.label}
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError className="mt-0" />
            </QuestionnaireItem>
            <QuestionnaireItem name="urgency" required className="gap-3">
              <QuestionnaireTitle className="text-sm">
                How much is this affecting you?
              </QuestionnaireTitle>
              <QuestionnaireChoices className="gap-1.5">
                {urgencies.map((urgency) => (
                  <QuestionnaireChoice
                    key={urgency.value}
                    value={urgency.value}
                    className="py-2"
                  >
                    {urgency.label}
                    <QuestionnaireChoiceDescription className="text-xs">
                      {urgency.description}
                    </QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError className="mt-0" />
            </QuestionnaireItem>
            <QuestionnaireItem name="reference" required className="gap-3">
              <QuestionnaireTitle className="text-sm">
                Which workspace is this about?
              </QuestionnaireTitle>
              <QuestionnaireDescription className="mt-1 text-xs">
                Find it under Settings → General.
              </QuestionnaireDescription>
              <QuestionnaireInput
                aria-label="Workspace URL"
                placeholder="acorn.app/northwind"
                autoComplete="off"
              />
              <QuestionnaireError className="mt-0">
                Add the workspace URL so we can look it up.
              </QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireActions className="sm:min-h-7">
              <QuestionnairePrevious size="sm" variant="ghost">
                Back
              </QuestionnairePrevious>
              <QuestionnaireNext size="sm" />
              <QuestionnaireSubmit size="sm">Open ticket</QuestionnaireSubmit>
            </QuestionnaireActions>
          </Questionnaire>
        )}
      </div>
    </div>
  );
}
