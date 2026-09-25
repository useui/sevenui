"use client";

import { useRef, useState } from "react";
import { PlusIcon, RocketIcon, Trash2Icon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/registry/base/ui/toggle-group";

type Row = { id: number; key: string; value: string };

const environments = [
  { value: "production", label: "Production" },
  { value: "preview", label: "Preview" },
  { value: "development", label: "Development" },
];

// Names the platform sets itself; the "server" rejects them on save.
const reservedKeys = ["NODE_ENV", "PORT", "VERCEL_URL"];
const keyPattern = /^[A-Z_][A-Z0-9_]*$/;

const initialRows: Row[] = [
  {
    id: 1,
    key: "DATABASE_URL",
    value: "postgres://app:••••@db.internal:5432/app",
  },
  { id: 2, key: "STRIPE_SECRET_KEY", value: "sk_live_51Hx••••" },
];

export default function Form13() {
  const nextId = useRef(initialRows.length + 1);
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [targets, setTargets] = useState<string[]>(["production", "preview"]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const createRow = (key = "", value = ""): Row => {
    const row = { id: nextId.current, key, value };
    nextId.current += 1;
    return row;
  };

  const updateRow = (id: number, patch: Partial<Row>) => {
    setSaved(null);
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  // Pasting a whole .env file into a name field expands it into rows.
  const handlePaste = (id: number, text: string) => {
    const pairs = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return {
          key: line.slice(0, index).trim(),
          value: line
            .slice(index + 1)
            .trim()
            .replace(/^["']|["']$/g, ""),
        };
      });
    if (pairs.length < 2) return false;
    setSaved(null);
    setRows((current) => {
      const index = current.findIndex((row) => row.id === id);
      const pasted = pairs.map((pair) => createRow(pair.key, pair.value));
      const next = [...current];
      // Replace the row being pasted into when it's still empty.
      const replace = next[index] && !next[index].key && !next[index].value;
      next.splice(index + (replace ? 0 : 1), replace ? 1 : 0, ...pasted);
      return next;
    });
    return true;
  };

  return (
    <Form
      className="w-full max-w-2xl gap-0 overflow-hidden rounded-xl border border-border bg-card"
      errors={errors}
      onFormSubmit={() => {
        const rejected = rows.find((row) => reservedKeys.includes(row.key));
        if (rejected) {
          setErrors({
            [`key-${rejected.id}`]: `${rejected.key} is set by the platform and can't be overridden.`,
          });
          return;
        }
        setErrors({});
        const names = environments
          .filter((env) => targets.includes(env.value))
          .map((env) => env.label);
        setSaved(
          `${rows.length} ${rows.length === 1 ? "variable" : "variables"} saved to ${names.join(" and ")}. Redeploy to apply them.`,
        );
      }}
    >
      <div className="flex flex-col gap-4 border-b border-border p-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">Environment variables</h3>
          <p className="text-sm text-muted-foreground">
            Encrypted at rest and exposed to builds and serverless functions.
          </p>
        </div>
        <FieldSet>
          <FieldLegend variant="label">Apply to</FieldLegend>
          <ToggleGroup
            multiple
            variant="outline"
            size="sm"
            value={targets}
            onValueChange={(value) => {
              const next = value as string[];
              // Keep at least one environment selected.
              if (next.length > 0) setTargets(next);
              setSaved(null);
            }}
            className="flex-wrap"
          >
            {environments.map((env) => (
              <ToggleGroupItem key={env.value} value={env.value}>
                {env.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FieldSet>
      </div>

      <div className="flex flex-col gap-3 p-5">
        <div
          aria-hidden="true"
          className="hidden grid-cols-[minmax(0,2fr)_minmax(0,3fr)_2rem] gap-2 text-xs font-medium text-muted-foreground sm:grid"
        >
          <span>Name</span>
          <span>Value</span>
        </div>
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-[minmax(0,1fr)_2rem] items-start gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_2rem]"
          >
            <Field
              name={`key-${row.id}`}
              validate={(value, formValues) => {
                const key = String(value ?? "");
                if (!key) return "Enter a name.";
                if (!keyPattern.test(key)) {
                  return "Use A–Z, 0–9, and underscores; don't start with a digit.";
                }
                const duplicate = Object.entries(formValues).some(
                  ([name, other]) =>
                    name.startsWith("key-") &&
                    name !== `key-${row.id}` &&
                    other === key,
                );
                return duplicate ? `${key} is already defined.` : null;
              }}
            >
              <FieldLabel className="sr-only">
                Name of variable {index + 1}
              </FieldLabel>
              <Input
                placeholder="API_BASE_URL"
                spellCheck={false}
                autoComplete="off"
                className="font-mono"
                value={row.key}
                onChange={(event) =>
                  updateRow(row.id, {
                    key: event.target.value
                      .toUpperCase()
                      .replace(/[\s-]/g, "_"),
                  })
                }
                onPaste={(event) => {
                  const text = event.clipboardData.getData("text");
                  if (handlePaste(row.id, text)) event.preventDefault();
                }}
              />
              <FieldError />
            </Field>
            <Field
              name={`value-${row.id}`}
              className="col-start-1 sm:col-start-auto"
            >
              <FieldLabel className="sr-only">
                Value of variable {index + 1}
              </FieldLabel>
              <Input
                placeholder="Value"
                spellCheck={false}
                autoComplete="off"
                className="font-mono"
                value={row.value}
                onChange={(event) =>
                  updateRow(row.id, { value: event.target.value })
                }
              />
            </Field>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="col-start-2 row-start-1 sm:col-start-3"
              aria-label={`Remove ${row.key || `variable ${index + 1}`}`}
              disabled={rows.length === 1}
              onClick={() => {
                setSaved(null);
                setRows((current) => current.filter((r) => r.id !== row.id));
              }}
            >
              <Trash2Icon aria-hidden="true" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setSaved(null);
            setRows((current) => [...current, createRow()]);
          }}
        >
          <PlusIcon aria-hidden="true" data-icon="inline-start" />
          Add variable
        </Button>
        <p className="text-xs text-muted-foreground">
          Paste a whole <span className="font-mono">.env</span> file into any
          name field to import every line at once.
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border bg-muted/40 px-5 py-3 sm:flex-row sm:items-center">
        <p
          role="status"
          className="flex items-start gap-2 text-sm text-muted-foreground sm:mr-auto"
        >
          {saved ? (
            <>
              <RocketIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              {saved}
            </>
          ) : null}
        </p>
        <Button type="submit" className="shrink-0">
          Save variables
        </Button>
      </div>
    </Form>
  );
}
