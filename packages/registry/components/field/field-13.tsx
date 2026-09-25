"use client";

import { useId, useState } from "react";
import {
  CheckIcon,
  CopyIcon,
  KeyRoundIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
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
import { Input } from "@/registry/base/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/registry/base/ui/native-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/base/ui/select";

type Access = "none" | "read" | "write";

const resources = [
  {
    id: "deployments",
    label: "Deployments",
    hint: "Trigger, promote, and roll back",
  },
  {
    id: "projects",
    label: "Projects",
    hint: "Settings and environment variables",
  },
  { id: "domains", label: "Domains", hint: "DNS records and certificates" },
  { id: "logs", label: "Logs", hint: "Build and runtime output" },
];

const expirations = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "never", label: "No expiration" },
];

const existingNames = ["github-actions", "local-dev"];

export default function Field13() {
  const scopeIdPrefix = useId();
  const [name, setName] = useState("");
  const [expiration, setExpiration] = useState<string | null>("30");
  const [access, setAccess] = useState<Record<string, Access>>({
    deployments: "write",
    projects: "read",
    domains: "none",
    logs: "read",
  });
  const [attempted, setAttempted] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const trimmed = name.trim();
  const nameError = !attempted
    ? null
    : trimmed.length === 0
      ? "Name the key after where it's used, like ci-production."
      : existingNames.includes(trimmed)
        ? `A key named ${trimmed} already exists.`
        : null;
  const grantedCount = Object.values(access).filter(
    (value) => value !== "none",
  ).length;
  const scopeError =
    attempted && grantedCount === 0
      ? "Grant access to at least one resource."
      : null;

  async function copy() {
    if (!secret) return;
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (secret) {
    return (
      <div className="flex w-full max-w-md flex-col gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <KeyRoundIcon
            aria-hidden="true"
            className="size-4 text-muted-foreground"
          />
          <h3 className="font-semibold">{trimmed} created</h3>
        </div>
        <Field>
          <FieldLabel>Secret key</FieldLabel>
          <InputGroup>
            <InputGroupInput
              readOnly
              value={secret}
              className="font-mono text-xs"
              onFocus={(event) => event.target.select()}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                aria-label={copied ? "Copied" : "Copy secret key"}
                onClick={copy}
              >
                {copied ? (
                  <CheckIcon aria-hidden="true" />
                ) : (
                  <CopyIcon aria-hidden="true" />
                )}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <FieldDescription className="flex items-start gap-1.5">
            <TriangleAlertIcon
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0 text-warning"
            />
            Copy it now and store it in your secrets manager. You won't be able
            to see it again.
          </FieldDescription>
        </Field>
        <Button
          variant="outline"
          onClick={() => {
            setSecret(null);
            setCopied(false);
            setName("");
            setAttempted(false);
          }}
        >
          Done
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="w-full max-w-md rounded-xl border border-border bg-card p-5"
      onSubmit={(event) => {
        event.preventDefault();
        setAttempted(true);
        if (trimmed && !existingNames.includes(trimmed) && grantedCount > 0) {
          setSecret("svn_live_7Hq2xLp9Rk4mWz8TcV3bNf6Ya1Ds5Ge0");
        }
      }}
    >
      <div className="mb-5 flex flex-col gap-1">
        <h3 className="font-semibold">New API key</h3>
        <p className="text-sm text-muted-foreground">
          Keys act on behalf of the Northwind team, not your personal account.
        </p>
      </div>
      <FieldGroup className="gap-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
          <Field invalid={nameError !== null}>
            <FieldLabel>Name</FieldLabel>
            <Input
              value={name}
              placeholder="ci-production"
              autoComplete="off"
              spellCheck={false}
              className="font-mono"
              onChange={(event) => setName(event.target.value)}
            />
            <FieldError>{nameError}</FieldError>
          </Field>
          <Field>
            <FieldLabel>Expires in</FieldLabel>
            <Select
              items={expirations}
              value={expiration}
              onValueChange={setExpiration}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expirations.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <FieldSet>
          <div className="flex items-center justify-between gap-2">
            <FieldLegend variant="label" className="mb-0">
              Permissions
            </FieldLegend>
            <Badge variant="secondary" className="tabular-nums">
              {grantedCount} of {resources.length} granted
            </Badge>
          </div>
          <div className="divide-y divide-border rounded-lg border border-border">
            {resources.map((resource) => {
              const selectId = `${scopeIdPrefix}-${resource.id}`;
              return (
                <Field
                  key={resource.id}
                  orientation="horizontal"
                  className="gap-2 px-3 py-2.5 max-sm:flex-col max-sm:items-stretch sm:gap-3"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <FieldLabel htmlFor={selectId}>{resource.label}</FieldLabel>
                    <FieldDescription className="text-xs">
                      {resource.hint}
                    </FieldDescription>
                  </div>
                  <NativeSelect
                    id={selectId}
                    size="sm"
                    className="w-full shrink-0 sm:w-32"
                    value={access[resource.id]}
                    onChange={(event) =>
                      setAccess((current) => ({
                        ...current,
                        [resource.id]: event.target.value as Access,
                      }))
                    }
                  >
                    <NativeSelectOption value="none">
                      No access
                    </NativeSelectOption>
                    <NativeSelectOption value="read">Read</NativeSelectOption>
                    <NativeSelectOption value="write">
                      Read & write
                    </NativeSelectOption>
                  </NativeSelect>
                </Field>
              );
            })}
          </div>
          {scopeError ? (
            <p role="alert" className="text-sm text-destructive">
              {scopeError}
            </p>
          ) : null}
        </FieldSet>

        <Button type="submit" className="w-full">
          Create key
        </Button>
      </FieldGroup>
    </form>
  );
}
