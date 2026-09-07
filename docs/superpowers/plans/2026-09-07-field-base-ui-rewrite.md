# Field on Base UI (Option B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild SevenUI's `field` core parts (`Field`, `FieldLabel`, `FieldDescription`, `FieldError`) on Base UI Field primitives while keeping shadcn's naming and layout parts; keep `form` as-is; delete `form-rhf`; update demos and docs.

**Architecture:** The four accessibility-bearing parts become wrappers over `@base-ui/react/field` (`Field.Root/Label/Description/Error`), gaining automatic `htmlFor`/`aria-describedby`/`aria-invalid` wiring, `validate`/`validationMode`, and `<Form errors>` flow (every SevenUI control already registers with Base UI's Field context). The six layout parts (`FieldSet/FieldLegend/FieldGroup/FieldContent/FieldTitle/FieldSeparator`) stay plain styled elements. Form-library integrations (react-hook-form, TanStack Form) live only in demos/docs via generic props (`invalid`, `touched`, `dirty`, `errors`) — no library types ever enter `field.tsx`.

**Tech Stack:** React 19, `@base-ui/react` 1.7 (Field, Form primitives), class-variance-authority, Tailwind v4, vitest + @testing-library/react (jsdom, NO jest-dom — plain DOM assertions only), react-hook-form (demo only).

**Spec:** `docs/research/2026-09-07-form-field-research.md` (section 6, Option B chosen by the user 2026-09-07; form-rhf deletion also approved).

## Global Constraints

- **NO COMMITS.** The user explicitly said no commits for now. Skip every commit step; leave all changes unstaged. Do not stop the running dev server, do not run the release gate, do not push (see memory: gate-steps-wait-for-user).
- All repo content in English (code, docs, demo copy). Demo content: English names only, `/placeholder.svg` for images.
- Imports: `@/registry/base/ui/*` for registry components, `cn` from the `cn` npm package.
- Base UI only — no Radix, no new third-party deps.
- Registry items in `packages/registry/registry.json` must keep ALL existing keys when edited (a past bug dropped `cssVars` — never rebuild items from a key list).
- Test commands run from repo root: `pnpm --filter @sevenui/registry test`, `pnpm --filter @sevenui/registry typecheck` (if the filter name differs, check `packages/registry/package.json` `name` field and use that; plain `pnpm typecheck` at root runs it recursively).
- Docs pages follow the per-item API standard: `### SubComponent` headings, "Extends X" note with Base UI link, `Prop | Type | Default` tables, every cva axis demonstrated by an example.

---

### Task 1: Rewrite `field.tsx` on Base UI Field primitives (TDD)

**Files:**
- Test: `packages/registry/tests/field.test.tsx` (create)
- Modify: `packages/registry/registry/base/ui/field.tsx`
- Modify: `packages/registry/registry.json` (the `field` item's `dependencies`)

**Interfaces:**
- Consumes: `@base-ui/react/field` (`Field.Root/Label/Description/Error`), `Label` from `@/registry/base/ui/label`, `Separator` from `@/registry/base/ui/separator`.
- Produces (later tasks rely on these exact signatures):
  - `Field`: `React.ComponentProps<typeof FieldPrimitive.Root> & { orientation?: "vertical" | "horizontal" | "responsive" }` — so `name`, `invalid`, `touched`, `dirty`, `disabled`, `validate`, `validationMode` all pass through.
  - `FieldLabel`: `React.ComponentProps<typeof FieldPrimitive.Label>` — NO `htmlFor` needed anymore.
  - `FieldDescription`: `React.ComponentProps<typeof FieldPrimitive.Description>`.
  - `FieldError`: `React.ComponentProps<typeof FieldPrimitive.Error> & { errors?: Array<{ message?: string } | undefined> }` — bare `<FieldError />` auto-renders context errors (native validity, `validate`, `<Form errors>`); `errors` array renders external (RHF/Zod) messages.
  - Layout parts unchanged: `FieldSet`, `FieldLegend`, `FieldGroup`, `FieldContent`, `FieldTitle`, `FieldSeparator`.

- [x] **Step 1: Write the failing tests**

Create `packages/registry/tests/field.test.tsx` (plain DOM assertions — the repo does NOT use jest-dom):

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

describe("Field", () => {
  it("associates label and control automatically", () => {
    render(
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Email")).not.toBeNull();
  });

  it("links the description to the control via aria-describedby", () => {
    render(
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input type="email" />
        <FieldDescription>Order updates.</FieldDescription>
      </Field>,
    );
    const input = screen.getByLabelText("Email");
    const description = screen.getByText("Order updates.");
    expect(description.id).not.toBe("");
    expect(input.getAttribute("aria-describedby") ?? "").toContain(
      description.id,
    );
  });

  it("sets data-orientation from the orientation variant", () => {
    render(<Field orientation="horizontal" data-testid="field-root" />);
    expect(
      screen.getByTestId("field-root").getAttribute("data-orientation"),
    ).toBe("horizontal");
  });
});

describe("FieldError", () => {
  it("renders external errors deduped by message", () => {
    render(
      <Field invalid>
        <FieldError errors={[{ message: "Too short." }, { message: "Too short." }]} />
      </Field>,
    );
    expect(screen.getAllByText("Too short.")).toHaveLength(1);
  });

  it("renders multiple distinct errors as a list", () => {
    render(
      <Field invalid>
        <FieldError
          errors={[{ message: "Too short." }, { message: "Needs a number." }]}
        />
      </Field>,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders nothing for an empty errors array", () => {
    const { container } = render(
      <Field invalid>
        <FieldError errors={[]} />
      </Field>,
    );
    expect(container.querySelector('[data-slot="field-error"]')).toBeNull();
  });

  it("renders children when given", () => {
    render(
      <Field invalid>
        <FieldError>Custom message</FieldError>
      </Field>,
    );
    expect(screen.getByText("Custom message")).not.toBeNull();
  });
});
```

- [x] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter ./packages/registry test -- field`
Expected: FAIL — current `Field` doesn't accept `name`/`invalid`, label association is manual, so `getByLabelText` and the aria assertions fail. (The FieldError dedupe tests may pass against the current implementation — that's fine; the Field ones must fail.)

- [x] **Step 3: Rewrite `field.tsx`**

Replace the entire contents of `packages/registry/registry/base/ui/field.tsx` with:

```tsx
"use client";

import { useMemo } from "react";
import { Field as FieldPrimitive } from "@base-ui/react/field";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className,
      )}
      {...props}
    />
  );
}

const fieldVariants = cva(
  "group/field flex w-full gap-2 data-[invalid]:text-destructive",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

function Field({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Root> &
  VariantProps<typeof fieldVariants>) {
  return (
    <FieldPrimitive.Root
      data-slot="field"
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-0.5 leading-snug",
        className,
      )}
      {...props}
    />
  );
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Label>) {
  return (
    <FieldPrimitive.Label
      data-slot="field-label"
      render={<Label />}
      className={cn(
        "group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled]/field:opacity-50 has-data-checked:border-primary/30 has-data-checked:bg-primary/5 has-[>[data-slot=field]]:rounded-lg has-[>[data-slot=field]]:border has-[>[data-slot=field]]:not-has-[:disabled,[data-disabled]]:hover:bg-muted/50 has-[>[data-slot=field]]:has-[:focus-visible]:border-ring has-[>[data-slot=field]]:has-[:focus-visible]:ring-3 has-[>[data-slot=field]]:has-[:focus-visible]:ring-ring/50 *:data-[slot=field]:p-2.5 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm font-medium group-data-[disabled]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({
  className,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Description>) {
  return (
    <FieldPrimitive.Description
      data-slot="field-description"
      className={cn(
        "text-left text-sm leading-normal font-normal text-muted-foreground group-data-[orientation=horizontal]/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary",
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode;
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="relative mx-auto block w-fit bg-background px-2 text-muted-foreground"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  match,
  ...props
}: React.ComponentProps<typeof FieldPrimitive.Error> & {
  errors?: Array<{ message?: string } | undefined>;
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ];

    if (uniqueErrors.length === 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>,
        )}
      </ul>
    );
  }, [children, errors]);

  // External errors / literal children requested but empty: render nothing.
  if ((children || errors) && !content) {
    return null;
  }

  return (
    <FieldPrimitive.Error
      role="alert"
      data-slot="field-error"
      match={match ?? (content ? true : undefined)}
      className={cn("text-sm font-normal text-destructive", className)}
      {...props}
    >
      {content ?? undefined}
    </FieldPrimitive.Error>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
```

Behavior notes baked into the code above (do not change):
- `FieldError` with NO `errors`/`children`/`match` renders a bare `FieldPrimitive.Error`, which auto-renders context errors (native validity messages, `validate` results, `<Form errors>` entries) only while the field is invalid.
- `match ?? (content ? true : undefined)`: explicit `match` (e.g. `"valueMissing"`) always wins; external/literal content defaults to always-visible (`match={true}`, the documented hook for external libraries); bare usage leaves `match` undefined for Base UI's default visibility.
- Selector migrations from the old file: `data-[invalid=true]:` → `data-[invalid]:` (Base UI emits presence-only `data-invalid`), `group-data-[disabled=true]/field:` → `group-data-[disabled]/field:` (twice: FieldLabel, FieldTitle), and the dead `group-has-data-horizontal/field:text-balance` → `group-data-[orientation=horizontal]/field:text-balance` (this fixes the known line-136 bug).
- `render={<Label />}` on `FieldLabel`: Base UI merges its computed props (auto `htmlFor`, className, data attrs) onto SevenUI's `Label`, so label styling stays single-sourced.

- [x] **Step 4: Run the field tests, verify they pass**

Run: `pnpm --filter ./packages/registry test -- field`
Expected: PASS (all 7).

- [x] **Step 5: Update the `field` registry item dependencies**

In `packages/registry/registry.json`, find the item with `"name": "field"` and change ONLY its `dependencies` array (keep every other key untouched):

```json
"dependencies": [
  "@base-ui/react",
  "class-variance-authority",
  "cn"
],
```

(`registryDependencies` stays `label` + `separator` — both still imported.)

- [x] **Step 6: Typecheck the package**

Run: `pnpm --filter ./packages/registry typecheck`
Expected: PASS for `field.tsx` itself. KNOWN downstream failures at this point: `examples/field/field-demo.tsx` / `examples/form/form-demo.tsx` may still typecheck fine (they use a subset), but if errors appear there, they are fixed in Tasks 2–3 — only `field.tsx`-internal errors block this task.

---

### Task 2: Field demos — update default, add orientation / validation / react-hook-form examples

**Files:**
- Modify: `packages/registry/examples/field/field-demo.tsx`
- Create: `packages/registry/examples/field/field-orientation.tsx`
- Create: `packages/registry/examples/field/field-validation.tsx`
- Create: `packages/registry/examples/field/field-rhf.tsx`
- Modify: `packages/registry/registry.json` (3 new demo items)

**Interfaces:**
- Consumes: Task 1's `Field` (props `name`, `invalid`, `touched`, `dirty`, `validate`, `validationMode`, `orientation`), `FieldError` (`errors` array, bare auto mode), plus existing `Input`, `Switch`, `Button` registry components.
- Produces: demo files embedded by Task 5's `field.mdx` via `<Component path="field/..." />`.

- [x] **Step 1: Rewrite the default demo (no manual ids anymore)**

Replace `packages/registry/examples/field/field-demo.tsx` with:

```tsx
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

export default function FieldDemo() {
  return (
    <div className="w-full max-w-sm">
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input required type="email" placeholder="name@example.com" />
        <FieldDescription>Used to send you order updates.</FieldDescription>
      </Field>
    </div>
  );
}
```

- [x] **Step 2: Create the orientation demo (covers the cva axis)**

Create `packages/registry/examples/field/field-orientation.tsx`:

```tsx
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Switch } from "@/registry/base/ui/switch";

export default function FieldOrientation() {
  return (
    <FieldGroup className="max-w-md">
      <Field orientation="horizontal" name="marketing">
        <FieldContent>
          <FieldLabel>Marketing emails</FieldLabel>
          <FieldDescription>
            Occasional product news. No spam.
          </FieldDescription>
        </FieldContent>
        <Switch />
      </Field>
      <Field orientation="responsive" name="displayName">
        <FieldContent>
          <FieldLabel>Display name</FieldLabel>
          <FieldDescription>
            Stacks on narrow containers, inline on wide ones.
          </FieldDescription>
        </FieldContent>
        <Input placeholder="Margaret Hamilton" />
      </Field>
    </FieldGroup>
  );
}
```

(If `switch.tsx` exports a different component name, check `packages/registry/registry/base/ui/switch.tsx` and use its export; the file exists in the registry.)

- [x] **Step 3: Create the validation demo (bare FieldError + validate + match)**

Create `packages/registry/examples/field/field-validation.tsx`:

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

export default function FieldValidation() {
  return (
    <div className="w-full max-w-sm">
      <Field
        name="username"
        validationMode="onBlur"
        validate={(value) =>
          String(value ?? "").length >= 3
            ? null
            : "Username must be at least 3 characters."
        }
      >
        <FieldLabel>Username</FieldLabel>
        <Input required placeholder="sevenui" />
        <FieldDescription>Validates when the input loses focus.</FieldDescription>
        <FieldError />
      </Field>
    </div>
  );
}
```

- [x] **Step 4: Create the react-hook-form demo (Controller pattern, replaces form-rhf)**

Create `packages/registry/examples/field/field-rhf.tsx`:

```tsx
"use client";

import { Controller, useForm } from "react-hook-form";

import { Button } from "@/registry/base/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

type FormValues = { username: string };

export default function FieldRhf() {
  const form = useForm<FormValues>({
    defaultValues: { username: "" },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="grid w-full max-w-sm gap-4"
      noValidate
    >
      <Controller
        control={form.control}
        name="username"
        rules={{
          required: "Username is required.",
          minLength: {
            value: 3,
            message: "Username must be at least 3 characters.",
          },
        }}
        render={({ field, fieldState }) => (
          <Field
            name={field.name}
            invalid={fieldState.invalid}
            touched={fieldState.isTouched}
            dirty={fieldState.isDirty}
          >
            <FieldLabel>Username</FieldLabel>
            <Input placeholder="sevenui" {...field} />
            <FieldDescription>
              This is your public display name.
            </FieldDescription>
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

- [x] **Step 5: Register the three new demos**

In `packages/registry/registry.json`, insert directly after the existing `field-demo` item (match its JSON shape exactly):

```json
{
  "name": "field-orientation",
  "type": "registry:component",
  "title": "Field Orientation",
  "description": "Horizontal and responsive field orientations.",
  "registryDependencies": [
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json",
    "https://sevenui.dev/r/switch.json"
  ],
  "files": [
    {
      "path": "examples/field/field-orientation.tsx",
      "type": "registry:component"
    }
  ]
},
{
  "name": "field-validation",
  "type": "registry:component",
  "title": "Field Validation",
  "description": "Custom validation with an auto-rendered error message.",
  "registryDependencies": [
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json"
  ],
  "files": [
    {
      "path": "examples/field/field-validation.tsx",
      "type": "registry:component"
    }
  ]
},
{
  "name": "field-rhf",
  "type": "registry:component",
  "title": "Field with React Hook Form",
  "description": "Controller-driven field state via the invalid, touched, and dirty props.",
  "dependencies": [
    "react-hook-form"
  ],
  "registryDependencies": [
    "https://sevenui.dev/r/button.json",
    "https://sevenui.dev/r/field.json",
    "https://sevenui.dev/r/input.json"
  ],
  "files": [
    {
      "path": "examples/field/field-rhf.tsx",
      "type": "registry:component"
    }
  ]
},
```

- [x] **Step 6: Verify**

Run: `pnpm --filter ./packages/registry typecheck && pnpm check:registry`
Expected: typecheck PASS; check:registry PASS (if `check:registry` is not a root script, find it via `grep -r "check-registry" package.json apps/web/package.json packages/*/package.json` and run the package-level script it lives in).

---

### Task 3: Make `form-demo` actually use the Form→Field errors flow

**Files:**
- Modify: `packages/registry/examples/form/form-demo.tsx`

**Interfaces:**
- Consumes: Task 1's `Field name=` + bare `FieldError` (context auto-render); existing `Form` (unchanged Base UI wrapper — `errors`, `onFormSubmit`).
- Produces: the demo embedded by `form.mdx`. Server errors now flow via context and auto-clear when the field value changes (the old demo fed `FieldError` manually because layout-Field couldn't consume `<Form errors>`).

- [x] **Step 1: Rewrite the demo**

Replace `packages/registry/examples/form/form-demo.tsx` with:

```tsx
"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import { Field, FieldError, FieldLabel } from "@/registry/base/ui/field";
import { Form } from "@/registry/base/ui/form";
import { Input } from "@/registry/base/ui/input";

export default function FormDemo() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  return (
    <div className="w-full max-w-sm">
      <Form
        errors={errors}
        onFormSubmit={() => {
          // Simulate a server-side validation error. It clears automatically
          // once the field's value changes.
          setErrors({ url: "This URL is already taken." });
        }}
      >
        <Field name="url">
          <FieldLabel>Website</FieldLabel>
          <Input required type="url" placeholder="https://example.com" />
          <FieldError />
        </Field>
        <Button type="submit">Submit</Button>
      </Form>
    </div>
  );
}
```

- [x] **Step 2: Verify**

Run: `pnpm --filter ./packages/registry typecheck`
Expected: PASS.

---

### Task 4: Delete `form-rhf` everywhere

**Files:**
- Delete: `packages/registry/registry/base/ui/form-rhf.tsx`
- Delete: `packages/registry/examples/form-rhf/` (whole directory, contains only `form-rhf-demo.tsx`)
- Delete: `apps/web/docs/components/form-rhf.mdx`
- Modify: `packages/registry/registry.json` (remove `form-rhf` and `form-rhf-demo` items)
- Modify: `apps/web/blume.config.ts:108` (remove the `"/components/form-rhf",` line)
- Modify: `apps/web/docs/index.mdx` (lines 23, 28, 47–48)

**Interfaces:**
- Consumes: nothing from other tasks (independent), but run AFTER Task 2 so the react-hook-form usage story (field-rhf demo) already exists.
- Produces: react-hook-form remains only as the `field-rhf` demo item's dependency.

- [x] **Step 1: Delete the files**

```bash
rm packages/registry/registry/base/ui/form-rhf.tsx
rm -r packages/registry/examples/form-rhf
rm apps/web/docs/components/form-rhf.mdx
```

(Do NOT touch `apps/web/dist/**` — build output, regenerated.)

- [x] **Step 2: Remove the two registry items**

In `packages/registry/registry.json`, delete the entire objects with `"name": "form-rhf"` and `"name": "form-rhf-demo"` (mind the JSON commas on the neighbors).

- [x] **Step 3: Remove the nav entry**

In `apps/web/blume.config.ts`, delete line 108: `            "/components/form-rhf",` (inside the components sidebar list, between `/components/form` and the next entry).

- [x] **Step 4: Update the docs index**

In `apps/web/docs/index.mdx`:
- Line 23: `SevenUI ships with 54 components across five waves:` → `SevenUI ships with 53 components across five waves:`
- Line 28: `- **Form wave** (15): input, label, field, form, form-rhf, checkbox,` → `- **Form wave** (14): input, label, field, form, checkbox,`
- Lines 47–48, replace:

```
Form components use Base UI-native form handling, with an optional
`form-rhf` integration for [react-hook-form](https://react-hook-form.com).
```

with:

```
Form components use Base UI-native form handling. Libraries like
[react-hook-form](https://react-hook-form.com) plug into the `Field`
component's external-state props — see [Field](/components/field).
```

- [x] **Step 5: Verify nothing references form-rhf anymore**

Run: `grep -rn "form-rhf" --include="*.ts" --include="*.tsx" --include="*.mdx" --include="*.json" apps/web packages/registry | grep -v dist | grep -v node_modules`
Expected: no output.

Run: `pnpm --filter ./packages/registry typecheck && pnpm check:registry`
Expected: PASS.

---

### Task 5: Rewrite `field.mdx` and align `form.mdx` to the per-item docs standard

**Files:**
- Modify: `apps/web/docs/components/field.mdx` (full rewrite — it still documents the pre-rewrite API)
- Modify: `apps/web/docs/components/form.mdx` (small alignment)

**Interfaces:**
- Consumes: Task 2's demo items (`field/field-orientation`, `field/field-validation`, `field/field-rhf`), Task 3's `form/form-demo`, Task 1's component API.
- Produces: final docs pages; the three-way mdx ↔ example file ↔ registry item consistency that `check:registry`/docs conventions expect.

- [x] **Step 1: Replace `apps/web/docs/components/field.mdx` entirely with:**

````mdx
---
title: Field
description: Associates a label, control, description, and validation error for a form field.
---

<Component path="field/field-demo" />

## Installation

<InstallCommand item="field" />

## Usage

```tsx
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

<Field name="email">
  <FieldLabel>Email</FieldLabel>
  <Input required type="email" placeholder="name@example.com" />
  <FieldDescription>Used to send you order updates.</FieldDescription>
  <FieldError />
</Field>;
```

`Field` wires the label, control, description, and error together
automatically — `htmlFor`/`id`, `aria-describedby`, and `aria-invalid` are
managed by the underlying Base UI Field context, and every SevenUI form
control (Input, Checkbox, Select, Switch, …) participates without extra
props.

## Examples

### Orientation

`horizontal` lays the label and control on one row; `responsive` stacks in
narrow containers and goes inline from the `@md` container breakpoint
(requires a `FieldGroup` ancestor for the container query).

<Component path="field/field-orientation" />

### Validation

A bare `<FieldError />` renders the field's active error automatically —
native constraint messages, `validate` results, or server errors passed via
[Form](/components/form). Use `match` to scope a literal message to one
validity state.

<Component path="field/field-validation" />

### React Hook Form

Drive the field from any form library through the `invalid`, `touched`, and
`dirty` props, and pass the library's error into `FieldError errors`. The
same pattern works for TanStack Form (`field.state.meta.isTouched`,
`field.state.meta.errors`) — no library types live in the component.

<Component path="field/field-rhf" />

## API reference

### Field

Extends the
[Base UI Field](https://base-ui.com/react/components/field) Root — all its
props apply.

| Prop                            | Type                                                                     | Default      |
| ------------------------------- | ------------------------------------------------------------------------ | ------------ |
| `orientation`                   | `"vertical" \| "horizontal" \| "responsive"`                             | `"vertical"` |
| `name`                          | `string` — keys the field for form submission and `Form errors`          | —            |
| `validate`                      | `(value, formValues) => string \| string[] \| null \| Promise<...>`      | —            |
| `validationMode`                | `"onSubmit" \| "onBlur" \| "onChange"`                                   | `"onSubmit"` |
| `invalid` / `touched` / `dirty` | `boolean` — for external form libraries                                  | —            |
| `disabled`                      | `boolean`                                                                | `false`      |

State data attributes for styling on every part: `data-invalid`,
`data-valid`, `data-dirty`, `data-touched`, `data-filled`, `data-focused`,
`data-disabled`.

### FieldLabel

Extends the Base UI Field Label — associated with the field's control
automatically, no `htmlFor` needed. Renders through
[Label](/docs/components/label), so its styling applies.

### FieldDescription

Extends the Base UI Field Description — linked to the control via
`aria-describedby` automatically.

### FieldError

Extends the Base UI Field Error.

| Prop     | Type                                          | Default |
| -------- | --------------------------------------------- | ------- |
| `errors` | `Array<{ message?: string } \| undefined>`    | —       |
| `match`  | `boolean \| keyof ValidityState`              | —       |

With no props it auto-renders the active error from context. `errors`
accepts issues from any Standard Schema validator or form library (deduped;
multiple messages render as a list). Literal children or `errors` display
whenever present; `match="valueMissing"` (etc.) scopes children to one
native validity state.

### Layout parts

Plain styled elements, no form wiring — compose freely:

| Component        | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| `FieldSet`       | `<fieldset>` grouping related fields.                              |
| `FieldLegend`    | `<legend>`; `variant`: `"legend"` (default) or `"label"`.          |
| `FieldGroup`     | Vertical stack of fields; container-query scope for `responsive`.  |
| `FieldContent`   | Column wrapper pairing a label/description beside a control.       |
| `FieldTitle`     | Label-styled heading for non-label contexts.                       |
| `FieldSeparator` | Divider between fields, with optional inline content.              |
````

- [x] **Step 2: Align `apps/web/docs/components/form.mdx`**

Two edits, keeping the rest of the file:

1. In the Usage code block, the `<Field name="url">` example is already correct for the new API — verify it matches Task 3's demo pattern (it does: `Field name` + bare `FieldError`); update only if drift is found.
2. Replace the `## API reference` heading's intro table section header so the props table sits under a `### Form` subheading (per-item standard):

```mdx
## API reference

### Form

Extends the [Base UI Form](https://base-ui.com/react/components/form)
primitive — all its props apply. Renders a native `<form>` and consolidates
validation errors for the `Field`s inside it.
```

(then the existing props table and the `onClearErrors` note follow unchanged).

- [x] **Step 3: Verify docs build inputs**

Run: `grep -c "Component path=\"field/" apps/web/docs/components/field.mdx`
Expected: `4` (demo, orientation, validation, rhf — all four embeds present and matching example paths).

---

### Task 6: Full verification sweep

**Files:** none (verification only).

- [x] **Step 1: Unit tests**

Run: `pnpm --filter ./packages/registry test`
Expected: PASS (field, chart, command suites).

- [x] **Step 2: Repo-wide typecheck**

Run: `pnpm typecheck`
Expected: PASS in every workspace package (this is the command CI runs recursively; the old deferred field/form demo errors must be gone).

- [x] **Step 3: Registry consistency**

Run: `pnpm check:registry`
Expected: PASS — item files exist, dependencies declared (`@base-ui/react` on `field`, `react-hook-form` on `field-rhf`), no orphaned form-rhf entries.

- [x] **Step 4: Report — do NOT commit, do NOT build/deploy**

Summarize: files changed, tests run and their results, and that visual browser QA on the dev server (field docs page rendering, orientation demo at container widths, validation onBlur, RHF submit errors, form-demo server-error auto-clear) is left for the user's go per the gate-steps-wait-for-user rule.
