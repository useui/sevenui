"use client";

import { SirenIcon } from "lucide-react";
import { type FormEvent, useState } from "react";

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
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

const severities = [
  {
    value: "sev1",
    label: "SEV1 · Critical",
    description: "Customer data at risk or the product is down for everyone.",
  },
  {
    value: "sev2",
    label: "SEV2 · Major",
    description: "A core flow is broken for a large share of customers.",
  },
  {
    value: "sev3",
    label: "SEV3 · Minor",
    description: "Degraded experience with a workaround available.",
  },
];

const services = [
  { value: "checkout-api", health: "down" },
  { value: "payments-worker", health: "degraded" },
  { value: "search-indexer", health: "healthy" },
  { value: "auth-gateway", health: "healthy" },
  { value: "notifications", health: "degraded" },
  { value: "web-storefront", health: "healthy" },
] as const;

const healthLabel = {
  down: "Failing health checks",
  degraded: "Elevated error rate",
  healthy: "Healthy",
};

const healthDot = {
  down: "bg-destructive",
  degraded: "bg-warning",
  healthy: "bg-success",
};

type Declared = { severity: string; services: string[]; startedAt: string };

export default function Questionnaire11() {
  const [severity, setSeverity] = useState<string | null>(null);
  const [affected, setAffected] = useState<string[]>([]);
  const [declared, setDeclared] = useState<Declared | null>(null);

  function toggleService(value: string, checked: boolean) {
    setAffected((current) =>
      checked ? [...current, value] : current.filter((item) => item !== value),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setDeclared({
      severity: String(data.get("severity")).toUpperCase(),
      services: data.getAll("services").map(String),
      startedAt: String(data.get("started-at")).replace("T", " "),
    });
  }

  function reset() {
    setDeclared(null);
    setSeverity(null);
    setAffected([]);
  }

  return (
    <div className="w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <SirenIcon aria-hidden="true" className="size-4 text-destructive" />
        <h3 className="shrink-0 text-sm font-medium">Declare an incident</h3>
        <span className="ms-auto truncate text-xs text-muted-foreground">
          <span className="max-sm:hidden">On call: </span>Priya Nair
        </span>
      </div>
      {declared ? (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-medium">INC-2291</span>
            <Badge variant="destructive">{declared.severity}</Badge>
            <span className="text-xs text-muted-foreground">
              started {declared.startedAt}
            </span>
          </div>
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Channel</dt>
            <dd className="font-mono">#inc-2291</dd>
            <dt className="text-muted-foreground">Services</dt>
            <dd className="font-mono break-words">
              {declared.services.join(", ")}
            </dd>
            <dt className="text-muted-foreground">Paged</dt>
            <dd>Priya Nair, Commerce on-call</dd>
          </dl>
          <Button variant="outline" size="sm" className="w-fit" onClick={reset}>
            Declare another
          </Button>
        </div>
      ) : (
        <Questionnaire onSubmit={handleSubmit} className="gap-0">
          <div className="flex flex-col gap-4 p-4">
            <QuestionnaireProgress />
            <QuestionnaireItem name="severity" required>
              <QuestionnaireTitle>How severe is it?</QuestionnaireTitle>
              <QuestionnaireDescription>
                Severity decides who gets paged and how often status updates go
                out.
              </QuestionnaireDescription>
              <QuestionnaireChoices>
                {severities.map((option) => (
                  <QuestionnaireChoice
                    key={option.value}
                    value={option.value}
                    onChange={(event) => setSeverity(event.target.value)}
                  >
                    <span className="font-medium">{option.label}</span>
                    <QuestionnaireChoiceDescription>
                      {option.description}
                    </QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>
                Pick a severity. You can change it later in the incident
                channel.
              </QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="services" multiple required>
              <QuestionnaireTitle>Which services are affected?</QuestionnaireTitle>
              <QuestionnaireDescription>
                Health comes from the last 5 minutes of checks.
              </QuestionnaireDescription>
              <QuestionnaireChoices className="sm:grid-cols-2">
                {services.map((service) => (
                  <QuestionnaireChoice
                    key={service.value}
                    value={service.value}
                    onChange={(event) =>
                      toggleService(service.value, event.target.checked)
                    }
                  >
                    <span className="font-mono text-[0.8125rem]">
                      {service.value}
                    </span>
                    <QuestionnaireChoiceDescription className="flex items-center gap-1.5 text-xs">
                      <span
                        aria-hidden="true"
                        className={`size-1.5 shrink-0 rounded-full ${healthDot[service.health]}`}
                      />
                      {healthLabel[service.health]}
                    </QuestionnaireChoiceDescription>
                  </QuestionnaireChoice>
                ))}
              </QuestionnaireChoices>
              <QuestionnaireError>Select at least one service.</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireItem name="started-at" required>
              <QuestionnaireTitle>When did it start?</QuestionnaireTitle>
              <QuestionnaireDescription>
                Your local time. Use the first alert, not when you noticed.
              </QuestionnaireDescription>
              <QuestionnaireInput
                type="datetime-local"
                aria-label="Incident start time"
                defaultValue="2026-09-25T14:05"
                className="font-mono"
              />
              <QuestionnaireError>Add a start time.</QuestionnaireError>
            </QuestionnaireItem>
          </div>
          <div className="flex flex-col gap-3 border-t bg-muted/40 px-4 py-3">
            <p
              aria-live="polite"
              className="min-h-[1lh] truncate font-mono text-xs text-muted-foreground"
            >
              {severity || affected.length > 0
                ? `draft: ${severity?.toUpperCase() ?? "SEV?"}${
                    affected.length ? ` · ${affected.join(", ")}` : ""
                  }`
                : "draft: nothing selected yet"}
            </p>
            <QuestionnaireActions>
              <QuestionnairePrevious size="sm" />
              <QuestionnaireNext size="sm" />
              <QuestionnaireSubmit size="sm" variant="destructive">
                Declare incident
              </QuestionnaireSubmit>
            </QuestionnaireActions>
          </div>
        </Questionnaire>
      )}
    </div>
  );
}
