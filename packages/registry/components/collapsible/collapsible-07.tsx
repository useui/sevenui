"use client";

import * as React from "react";

import {
  CircleCheckIcon,
  ChevronRightIcon,
  SlidersHorizontalIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/registry/base/ui/collapsible";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import { Switch } from "@/registry/base/ui/switch";

const retryPolicies = [
  { value: "exponential", label: "Exponential backoff (5 attempts)" },
  { value: "linear", label: "Linear, every 60 seconds (3 attempts)" },
  { value: "none", label: "Do not retry" },
];

export default function Collapsible07() {
  const [advancedOpen, setAdvancedOpen] = React.useState(false);
  const [addedUrl, setAddedUrl] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const url = new FormData(form).get("url");
    // reset() fires onReset synchronously, so set the status afterwards.
    form.reset();
    setAddedUrl(typeof url === "string" ? url : null);
  }

  function handleReset() {
    setAddedUrl(null);
    setAdvancedOpen(false);
  }

  return (
    <form
      className="flex w-full max-w-md flex-col gap-5 rounded-xl border bg-card p-5 text-card-foreground"
      onSubmit={handleSubmit}
      onReset={handleReset}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold">Add webhook endpoint</h3>
        <p className="text-sm text-muted-foreground">
          We send a POST request to this URL whenever an order changes state.
        </p>
      </div>

      <Field>
        <FieldLabel htmlFor="collapsible-07-url">Endpoint URL</FieldLabel>
        <Input
          id="collapsible-07-url"
          name="url"
          type="url"
          placeholder="https://api.example.com/hooks/orders"
          required
        />
      </Field>

      <Collapsible
        open={advancedOpen}
        onOpenChange={setAdvancedOpen}
        className="rounded-lg border"
      >
        <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50">
          <SlidersHorizontalIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <span className="flex-1">Advanced options</span>
          {!advancedOpen && (
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
              Signing, retries, timeout
            </span>
          )}
          <ChevronRightIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground transition-transform group-data-panel-open:rotate-90"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 border-t px-3 pt-4 pb-3">
            <Field>
              <FieldLabel htmlFor="collapsible-07-secret">
                Signing secret
              </FieldLabel>
              <Input
                id="collapsible-07-secret"
                defaultValue="whsec_7Kq2mZr81xPa"
                className="font-mono"
              />
              <FieldDescription>
                Verify the X-Signature header against this value.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="collapsible-07-retry">
                Retry policy
              </FieldLabel>
              <NativeSelect
                id="collapsible-07-retry"
                defaultValue="exponential"
                className="w-full"
              >
                {retryPolicies.map((policy) => (
                  <NativeSelectOption key={policy.value} value={policy.value}>
                    {policy.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel htmlFor="collapsible-07-timeout">
                Timeout (seconds)
              </FieldLabel>
              <Input
                id="collapsible-07-timeout"
                type="number"
                min={1}
                max={30}
                defaultValue={10}
                className="w-24"
              />
            </Field>
            <Field orientation="horizontal" className="justify-between">
              <FieldLabel htmlFor="collapsible-07-batch">
                Batch events every 5 seconds
              </FieldLabel>
              <Switch id="collapsible-07-batch" />
            </Field>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {addedUrl && (
          <p
            role="status"
            className="mr-auto flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground"
          >
            <CircleCheckIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-success"
            />
            <span className="truncate">Added {addedUrl}</span>
          </p>
        )}
        <Button type="reset" variant="ghost">
          Cancel
        </Button>
        <Button type="submit">Add endpoint</Button>
      </div>
    </form>
  );
}
