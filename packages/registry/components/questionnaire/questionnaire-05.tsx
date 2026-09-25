"use client";

import * as React from "react";
import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";

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

const FREE_EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
];

function isPersonalEmail(value: string) {
  const domain = value.split("@")[1]?.trim().toLowerCase();
  return domain ? FREE_EMAIL_DOMAINS.includes(domain) : false;
}

// The questionnaire skips native constraint validation, so check the format here.
function isEmailAddress(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function ErrorMessage({ children }: { children?: React.ReactNode }) {
  return (
    <QuestionnaireError className="flex items-center gap-1.5">
      <CircleAlertIcon aria-hidden="true" className="size-4 shrink-0" />
      {children}
    </QuestionnaireError>
  );
}

export default function Questionnaire05() {
  const [email, setEmail] = React.useState("");
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);
  const [checked, setChecked] = React.useState(false);
  const personal = isPersonalEmail(email);
  const malformed = email.trim() !== "" && !isEmailAddress(email);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (malformed) {
      setChecked(true);
      return;
    }
    if (personal) return;
    setSubmittedEmail(email.trim());
  }

  if (submittedEmail) {
    return (
      <div
        className="flex w-full max-w-md flex-col items-start gap-3 rounded-xl border p-6"
        aria-live="polite"
      >
        <CircleCheckIcon aria-hidden="true" className="size-5 text-success" />
        <div className="flex flex-col gap-1">
          <p className="font-medium">You&apos;re on the list</p>
          <p className="text-sm text-muted-foreground">
            We&apos;ll email <span className="text-foreground">{submittedEmail}</span> when a
            beta seat opens for your team, usually within 5 business days.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSubmittedEmail(null);
            setEmail("");
            setChecked(false);
          }}
        >
          Submit another request
        </Button>
      </div>
    );
  }

  return (
    <Questionnaire
      onSubmit={handleSubmit}
      className="max-w-md rounded-xl border p-6"
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="deployment" required>
        <QuestionnaireTitle>Where would you deploy the beta?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="cloud">
            Hosted cloud
            <QuestionnaireChoiceDescription>
              Available in US and EU regions
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="vpc">
            Your own VPC
            <QuestionnaireChoiceDescription>AWS and GCP only</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
          <QuestionnaireChoice value="on-prem" disabled>
            On-premises
            <QuestionnaireChoiceDescription>Not part of this beta</QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <ErrorMessage>Pick a deployment target to continue.</ErrorMessage>
      </QuestionnaireItem>
      <QuestionnaireItem name="email" required invalid={personal || (checked && malformed)}>
        <QuestionnaireTitle>What&apos;s your work email?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Beta seats are issued per company domain.
        </QuestionnaireDescription>
        <QuestionnaireInput
          type="email"
          aria-label="Work email"
          autoComplete="email"
          placeholder="name@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => setChecked(true)}
        />
        <ErrorMessage>
          {personal
            ? "Use your company address. Personal domains can't claim a team seat."
            : checked && malformed
              ? "Enter a full email address, like name@company.com."
              : "Enter your work email to request access."}
        </ErrorMessage>
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit>Request access</QuestionnaireSubmit>
      </QuestionnaireActions>
    </Questionnaire>
  );
}
