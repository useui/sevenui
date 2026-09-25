"use client";

import { useState } from "react";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";
import { Progress } from "@/registry/base/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

const steps = [
  {
    title: "Create your workspace",
    description: "This is where your team's projects and docs will live.",
  },
  {
    title: "Tell us about your team",
    description: "We'll set up templates that match how you work.",
  },
  {
    title: "Invite your teammates",
    description: "They'll get an email with a link to join. You can skip this.",
  },
];

const useCases = [
  {
    value: "product",
    label: "Product & engineering",
    hint: "Roadmaps, specs, sprint boards",
  },
  {
    value: "marketing",
    label: "Marketing",
    hint: "Campaign calendars, briefs",
  },
  {
    value: "operations",
    label: "Operations",
    hint: "Runbooks, vendor tracking",
  },
];

const teamSizes = ["Just me", "2–10", "11–50", "51+"];
const inviteSlots = [0, 1, 2];
const takenSlugs = ["acme", "northwind", "studio", "team"];
const slugPattern = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

type Draft = {
  workspace: string;
  slug: string;
  useCase: string;
  teamSize: string;
  invites: string[];
};

export default function Form14() {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({
    workspace: "",
    slug: "",
    useCase: "",
    teamSize: "2–10",
    invites: [],
  });
  const [slugEdited, setSlugEdited] = useState(false);
  // Kept outside the step form so typed emails survive Back and Continue.
  const [inviteInputs, setInviteInputs] = useState(inviteSlots.map(() => ""));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const goTo = (next: number) => {
    setErrors({});
    setStep(next);
  };

  if (done) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <span className="flex size-10 items-center justify-center rounded-full bg-success/15">
          <CheckIcon aria-hidden="true" className="size-5 text-success" />
        </span>
        <div role="status" className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">
            {draft.workspace} is ready
          </h3>
          <p className="text-sm text-muted-foreground">
            Your workspace lives at{" "}
            <span className="font-medium text-foreground">
              sevenui.app/{draft.slug}
            </span>
            .{" "}
            {draft.invites.length > 0
              ? `We sent ${draft.invites.length} ${draft.invites.length === 1 ? "invite" : "invites"}.`
              : "Invite teammates any time from Settings."}
          </p>
        </div>
        <Button
          variant="outline"
          className="self-start"
          onClick={() => {
            setDone(false);
            setStep(0);
          }}
        >
          Review setup
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <Progress
        value={((step + 1) / steps.length) * 100}
        aria-label={`Step ${step + 1} of ${steps.length}`}
        className="gap-2"
      >
        <span className="text-xs font-medium text-muted-foreground">
          Step {step + 1} of {steps.length}
        </span>
      </Progress>

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">{steps[step].title}</h3>
        <p className="text-sm text-muted-foreground">
          {steps[step].description}
        </p>
      </div>

      {/* Each step is its own form, so only the visible fields validate. */}
      <Form
        key={step}
        className="gap-6"
        errors={errors}
        onFormSubmit={(values) => {
          if (step === 0) {
            const slug = String(values.slug ?? "");
            if (takenSlugs.includes(slug)) {
              setErrors({
                slug: `sevenui.app/${slug} is taken. Try ${slug}-hq or ${slug}-team.`,
              });
              return;
            }
            setDraft((current) => ({
              ...current,
              workspace: String(values.workspace ?? "").trim(),
              slug,
            }));
            goTo(1);
          } else if (step === 1) {
            if (!draft.useCase) {
              setErrors({
                useCase: "Pick what your team will mainly use it for.",
              });
              return;
            }
            goTo(2);
          } else {
            const invites = inviteInputs
              .map((email) => email.trim())
              .filter(Boolean);
            setDraft((current) => ({ ...current, invites }));
            setDone(true);
          }
        }}
      >
        {step === 0 ? (
          <FieldGroup className="gap-4">
            <Field name="workspace">
              <FieldLabel>Workspace name</FieldLabel>
              <Input
                required
                autoComplete="organization"
                placeholder="Acme Robotics"
                value={draft.workspace}
                onChange={(event) => {
                  const workspace = event.target.value;
                  setDraft((current) => ({
                    ...current,
                    workspace,
                    slug: slugEdited ? current.slug : toSlug(workspace),
                  }));
                }}
              />
              <FieldError />
            </Field>
            <Field
              name="slug"
              validate={(value) =>
                slugPattern.test(String(value ?? ""))
                  ? null
                  : "Use 3 to 32 lowercase letters, numbers, or hyphens."
              }
            >
              <FieldLabel>Workspace URL</FieldLabel>
              <InputGroup>
                <InputGroupAddon>
                  <InputGroupText>sevenui.app/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  spellCheck={false}
                  autoComplete="off"
                  placeholder="acme-robotics"
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setDraft((current) => ({
                      ...current,
                      slug: event.target.value.toLowerCase(),
                    }));
                  }}
                />
              </InputGroup>
              <FieldDescription>
                Filled in from the name. You can change it later.
              </FieldDescription>
              <FieldError />
            </Field>
          </FieldGroup>
        ) : null}

        {step === 1 ? (
          <FieldGroup className="gap-5">
            <FieldSet>
              <FieldLegend variant="label">Main use</FieldLegend>
              <RadioGroup
                value={draft.useCase}
                aria-invalid={Boolean(errors.useCase) || undefined}
                onValueChange={(value) => {
                  setErrors({});
                  setDraft((current) => ({
                    ...current,
                    useCase: value as string,
                  }));
                }}
              >
                {useCases.map((option) => (
                  <Label
                    key={option.value}
                    className="items-start rounded-lg border border-border p-3 font-normal has-data-checked:border-primary/40 has-data-checked:bg-primary/5"
                  >
                    <RadioGroupItem value={option.value} className="mt-0.5" />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    </span>
                  </Label>
                ))}
              </RadioGroup>
              {errors.useCase ? (
                <p role="alert" className="text-sm text-destructive">
                  {errors.useCase}
                </p>
              ) : null}
            </FieldSet>
            <FieldSet>
              <FieldLegend variant="label">Team size</FieldLegend>
              <ToggleGroup
                variant="outline"
                spacing={0}
                value={[draft.teamSize]}
                onValueChange={(value) => {
                  const next = (value as string[])[0];
                  if (next) {
                    setDraft((current) => ({ ...current, teamSize: next }));
                  }
                }}
                className="w-full"
              >
                {teamSizes.map((size) => (
                  <ToggleGroupItem key={size} value={size} className="flex-1">
                    {size}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </FieldSet>
          </FieldGroup>
        ) : null}

        {step === 2 ? (
          <FieldSet>
            <FieldLegend variant="label">Teammate emails</FieldLegend>
            <FieldGroup className="gap-3">
            {inviteSlots.map((slot) => (
              <Field
                key={slot}
                name={`invite-${slot}`}
                validate={(value) => {
                  const email = String(value ?? "").trim();
                  return !email || emailPattern.test(email)
                    ? null
                    : "Enter a full email address, like jo@acme.io.";
                }}
              >
                <FieldLabel className="sr-only">
                  Teammate email {slot + 1}
                </FieldLabel>
                <Input
                  type="text"
                  inputMode="email"
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={
                    ["jo@acme.io", "sam@acme.io", "priya@acme.io"][slot]
                  }
                  value={inviteInputs[slot]}
                  onChange={(event) => {
                    const email = event.target.value;
                    setInviteInputs((current) =>
                      current.map((entry, index) =>
                        index === slot ? email : entry,
                      ),
                    );
                  }}
                />
                <FieldError />
              </Field>
            ))}
            </FieldGroup>
          </FieldSet>
        ) : null}

        <div className="flex items-center gap-2">
          {step > 0 ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => goTo(step - 1)}
            >
              <ArrowLeftIcon aria-hidden="true" data-icon="inline-start" />
              Back
            </Button>
          ) : null}
          <div className="ml-auto flex items-center gap-2">
            {step === 2 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDraft((current) => ({ ...current, invites: [] }));
                  setDone(true);
                }}
              >
                Skip
              </Button>
            ) : null}
            <Button type="submit">
              {step === 2 ? "Send invites" : "Continue"}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
