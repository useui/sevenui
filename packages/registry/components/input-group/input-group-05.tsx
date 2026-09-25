"use client";

import { useEffect, useId, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  GlobeIcon,
  LockIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/registry/base/ui/input-group";
import { Label } from "@/registry/base/ui/label";

const PROJECT_ID = "prj_8kd2Lq41ZxVt";

const plans = [
  {
    key: "team-yearly",
    label: "Team, billed yearly",
    note: "Renews on March 4, 2027 for $1,152.",
  },
  {
    key: "team-monthly",
    label: "Team, billed monthly",
    note: "Renews on October 4, 2026 for $120.",
  },
  {
    key: "business-yearly",
    label: "Business, billed yearly",
    note: "Renews on March 4, 2027 for $2,880. The difference is prorated.",
  },
] as const;

type PlanKey = (typeof plans)[number]["key"];

// Read-only fields stay focusable and selectable, so they get a quiet fill
// instead of the dimmed disabled treatment.
const readOnlyGroup = "bg-muted/50 dark:bg-muted/40";

export default function InputGroup05() {
  const id = useId();
  const [copied, setCopied] = useState(false);
  const [planKey, setPlanKey] = useState<PlanKey>("team-yearly");
  const plan = plans.find((option) => option.key === planKey) ?? plans[0];

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copyProjectId = () => {
    navigator.clipboard?.writeText(PROJECT_ID).catch(() => {});
    setCopied(true);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-project`}>Project ID</Label>
        <InputGroup className={readOnlyGroup}>
          <InputGroupInput
            id={`${id}-project`}
            readOnly
            value={PROJECT_ID}
            className="font-mono text-xs md:text-xs"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              size="icon-xs"
              aria-label={copied ? "Copied" : "Copy project ID"}
              onClick={copyProjectId}
            >
              {copied ? (
                <CheckIcon aria-hidden="true" className="text-success" />
              ) : (
                <CopyIcon aria-hidden="true" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-plan`}>Current plan</Label>
        <InputGroup className={readOnlyGroup}>
          <InputGroupAddon>
            <CreditCardIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={`${id}-plan`}
            readOnly
            value={plan.label}
            aria-describedby={`${id}-plan-note`}
          />
          <InputGroupAddon align="inline-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <InputGroupButton
                    variant="outline"
                    aria-label={`Change plan, currently ${plan.label}`}
                  />
                }
              >
                Change
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Switch plan</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={planKey}
                    onValueChange={(value) => setPlanKey(value as PlanKey)}
                  >
                    {plans.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.key}
                        value={option.key}
                        closeOnClick
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </InputGroupAddon>
        </InputGroup>
        <p id={`${id}-plan-note`} className="text-sm text-muted-foreground">
          {plan.note}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-region`}>Data region</Label>
        <InputGroup data-disabled="true">
          <InputGroupAddon>
            <GlobeIcon aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            id={`${id}-region`}
            disabled
            defaultValue="eu-central-1 (Frankfurt)"
            aria-describedby={`${id}-region-note`}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>
              <LockIcon aria-hidden="true" />
              Locked
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <p id={`${id}-region-note`} className="text-sm text-muted-foreground">
          The region is fixed once a project is created.
        </p>
      </div>
    </div>
  );
}
