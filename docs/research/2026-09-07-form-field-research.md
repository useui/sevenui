# Form / Field component models — shadcn/ui, Base UI, ReUI

Date: 2026-09-07. Primary sources only: base-ui.com docs + installed `@base-ui/react@1.7.0` type
declarations in this repo, `shadcn-ui/ui@main` registry source + docs mdx, `keenthemes/reui@main`
source. Every claim carries a URL or file path. Purpose: decide the API surface for SevenUI's
`field`, `form`, and `form-rhf` registry items.

---

## 1. Base UI (`@base-ui/react` — the primitive SevenUI wraps)

Sources: https://base-ui.com/react/components/field, https://base-ui.com/react/components/form,
https://base-ui.com/react/handbook/forms, and installed types at
`node_modules/@base-ui/react/field/root/FieldRoot.d.ts`, `node_modules/@base-ui/react/form/Form.d.ts`,
`node_modules/@base-ui/react/field/error/FieldError.d.ts`.

### 1.1 Field parts

```
<Field.Root>          renders <div>; groups all parts, owns validity state
  <Field.Label />     renders <label>; auto-associated with the control
  <Field.Control />   renders <input>; or any Base UI control (Input, Checkbox, Select, …)
  <Field.Description /> renders <p>; auto-linked via aria-describedby
  <Field.Item />      groups items inside checkbox/radio groups (new in 1.7)
  <Field.Error />     renders <div>; conditional error message
  <Field.Validity />  render-prop access to ValidityState
</Field.Root>
```

### 1.2 `Field.Root` props (from `FieldRoot.d.ts`, matches docs)

| Prop | Type | Default | Notes |
|---|---|---|---|
| `name` | `string` | — | "Identifies the field when a form is submitted. Takes precedence over the `name` prop on `<Field.Control>`." Keys the field into `<Form errors>`. |
| `disabled` | `boolean` | `false` | Supersedes control-level `disabled`. |
| `invalid` | `boolean` | — | "Useful when the field state is controlled by an external library." (the RHF hook-in) |
| `dirty`, `touched` | `boolean` | — | Same purpose: external-library control. |
| `validate` | `(value, formValues) => string \| string[] \| null \| Promise<…>` | — | Custom validation; async supported. |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | `'onSubmit'` | Takes precedence over `<Form validationMode>`. |
| `validationDebounceTime` | `number` | `0` | For `onChange` mode. |
| `actionsRef` | `RefObject<{ validate() }>` | — | Imperative validation. |

State/data attributes on every part: `data-disabled`, `data-valid`, `data-invalid`, `data-dirty`,
`data-touched`, `data-filled`, `data-focused` (https://base-ui.com/react/components/field).

### 1.3 `Field.Error`

`match?: boolean | keyof ValidityState` — show when the given ValidityState key is true
(`'valueMissing'`, `'typeMismatch'`, …); "Specifying `true` will always show the error message, and
lets external libraries control the visibility" (`FieldError.d.ts`). Critically, **when rendered
with no children it auto-renders the current error(s) from context** — external `<Form errors>`
entries for the field's `name`, or messages returned by `validate`; multiple messages render as an
`<li>` list (`node_modules/@base-ui/react/field/error/FieldError.js` lines 51–93).

### 1.4 `Form` (from `Form.d.ts`)

| Prop | Type | Notes |
|---|---|---|
| `errors` | `Record<name, string \| string[]>` | "Validation errors returned externally, typically after submission by a server or a form action. … keys correspond to the `name` attribute on `<Field.Root>`." Errors auto-clear from a field once its value changes (https://base-ui.com/react/handbook/forms). |
| `onFormSubmit` | `(formValues: FormValues, eventDetails) => void` | Typed values object; "`preventDefault()` is called on the native submit event when used." |
| `validationMode` | `'onSubmit' \| 'onBlur' \| 'onChange'` | Default `'onSubmit'`; `Field.Root`'s prop wins. |
| `actionsRef` | `RefObject<{ validate(fieldName?) }>` | Validate all fields or one by name. |

### 1.5 Accessibility wiring — automatic

Base UI Field manages, via context: label↔control `id`/`htmlFor` association, `aria-describedby`
pointing at Description and Error, and `aria-invalid` from validity
(https://base-ui.com/react/components/field, "Accessibility" — no manual `htmlFor`/`id` needed).
This works not just with `Field.Control`: **every Base UI form control registers with the Field
context**. E.g. `Input` is "A native input element that automatically works with Field" and its
state extends `FieldControlState` (`node_modules/@base-ui/react/input/Input.d.ts`). SevenUI's
`Input` wraps exactly this primitive (`packages/registry/registry/base/ui/input.tsx`), as do
Checkbox, Radio, Select, Slider, Switch, NumberField, etc.

### 1.6 Base UI's official react-hook-form recipe (https://base-ui.com/react/handbook/forms)

```tsx
<Controller
  name="username"
  control={control}
  rules={{ required: 'Required' }}
  render={({ field: { ref, name, value, onBlur, onChange },
             fieldState: { invalid, isTouched, isDirty, error } }) => (
    <Field.Root name={name} invalid={invalid} touched={isTouched} dirty={isDirty}>
      <Field.Label>Username</Field.Label>
      <Field.Control ref={ref} value={value} onBlur={onBlur} onValueChange={onChange} />
      <Field.Error match={!!error}>{error?.message}</Field.Error>
    </Field.Root>
  )}
/>
```

Pattern: `fieldState` → `Field.Root` (`invalid`/`touched`/`dirty`), `Field.Error match={!!error}`
with the message as children. The handbook positions Base UI's own `<Form>` for straightforward
forms and RHF/TanStack for complex state (field arrays, async orchestration).

---

## 2. shadcn/ui

### 2.1 Classic `form.tsx` (react-hook-form wrapper) — legacy direction

Source: https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/form.tsx
(fetched 2026-09-07).

| Export | What it is |
|---|---|
| `Form` | `= FormProvider` (react-hook-form). |
| `FormField` | Wraps RHF `Controller`, publishes `name` via `FormFieldContext`. |
| `FormItem` | `<div>` that mints an `id` via `useId` into `FormItemContext`. |
| `FormLabel` | Label with `htmlFor={formItemId}`, `data-error`. |
| `FormControl` | Radix `Slot` that injects `id`, `aria-describedby` (`description` + `message` ids), `aria-invalid={!!error}` onto the child control. |
| `FormDescription` / `FormMessage` | `<p>`s carrying the ids; `FormMessage` reads `error.message` from `useFormField()`. |
| `useFormField` | Combines both contexts + `getFieldState`. |

All aria wiring is done manually by `FormControl`/`FormItem` through generated ids. Hard-coupled to
react-hook-form and (upstream) to Radix `Slot`.

Docs status: `https://ui.shadcn.com/docs/components/form` now serves the **Forms landing page**
(framework picker: React Hook Form / TanStack Form / Formisch / "useActionState (Coming Soon)") —
verified by fetching the URL 2026-09-07; the standalone classic-Form doc page is gone, though
`form.tsx` still ships in the `new-york-v4` registry. Notably, **shadcn's new per-primitive
"bases" trees (`apps/v4/registry/bases/{base,radix,aria}/ui/`) contain `field.tsx` but no
`form.tsx` at all** (GitHub tree listing of `shadcn-ui/ui@main`, 2026-09-07) — the RHF wrapper was
not carried into the Base UI / React Aria generation of shadcn.

### 2.2 New `field.tsx` family (2025) — current direction

Sources: https://ui.shadcn.com/docs/components/field and
https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/field.tsx.

Exports: `Field`, `FieldSet`, `FieldLegend` (`variant: "legend" | "label"`), `FieldGroup`,
`FieldLabel`, `FieldContent`, `FieldTitle`, `FieldDescription`, `FieldError`, `FieldSeparator`.
**Every part is a plain styled element — no context, no ids, no form-library coupling.**

| Part | Element | API notes |
|---|---|---|
| `Field` | `div role="group"` | cva `orientation: "vertical" \| "horizontal" \| "responsive"` (container-query responsive via `@container/field-group`); sets `data-orientation`; styling hook `data-invalid`. |
| `FieldLabel` | `Label` | Doubles as a selectable card when it wraps a nested `Field` (checkbox/radio card patterns). |
| `FieldError` | `div role="alert"` | `errors?: Array<{ message?: string } \| undefined>` — dedupes by message, single message renders bare, multiple as a `<ul>`. Docs: "FieldError also accepts issues produced by any validator that implements Standard Schema, including Zod, Valibot, and ArkType." |

Accessibility is **manual and by convention**: "Field outputs `role="group"` so nested controls
inherit labeling"; the consumer sets `htmlFor`/`id`, puts `aria-invalid` on the input, and
`data-invalid` on `Field` (https://ui.shadcn.com/docs/components/field).

### 2.3 shadcn's recommended react-hook-form pattern (with new Field)

Source: https://ui.shadcn.com/docs/forms/react-hook-form. Uses `Controller` (not `register`) "for
complete markup flexibility":

```tsx
<Controller
  name="title"
  control={form.control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>Label</FieldLabel>
      <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
    </Field>
  )}
/>
```

For native/server forms, https://github.com/shadcn-ui/ui/blob/main/apps/v4/content/docs/forms/next.mdx
shows the same Field markup fed from `useActionState` (`data-invalid`/`aria-invalid` from
`formState.errors`, `<FieldError>{formState.errors.title[0]}</FieldError>`). There is **no wrapper
component**: `<form onSubmit={form.handleSubmit(...)}>` or Next's `<Form action>` directly.

---

## 3. ReUI (keenthemes/reui, v2.5.2)

Sources: GitHub tree `https://api.github.com/repos/keenthemes/reui/git/trees/main?recursive=1`
(fetched 2026-09-07) and raw files cited below. Companion notes:
`docs/research/2026-09-06-reui-registry-structure.md`.

- ReUI vendors **shadcn's new `field.tsx` unchanged in structure** for each primitive base:
  `registry/bases/base/ui/field.tsx` (Base UI flavor) and `registry/bases/radix/ui/field.tsx` —
  same ten exports, same `FieldError` `errors` array + `useMemo` dedupe, same cva orientations;
  classes are tokenized to shadcn v4's `cn-*` utility names. The Base UI flavor contains **zero
  `@base-ui/react` imports** — it is layout-only, exactly like upstream
  (`registry/bases/base/ui/field.tsx` on `keenthemes/reui@main`).
- **There is no `form.tsx` anywhere in either base tree** — the only form/field-named sources are
  the two `field.tsx` files and their `number-field.tsx` primitives (tree grep, 2026-09-07). ReUI
  ships no RHF wrapper component.
- react-hook-form is a repo dependency (`package.json`: `react-hook-form ^7.72.1`,
  `@hookform/resolvers ^5.2.2`, `zod ^4.3.6`) but is used only in a handful of example patterns
  (GitHub code search `repo:keenthemes/reui react-hook-form`: `c-autocomplete-12.tsx`,
  `c-number-field-6.tsx` per base, plus cascader docs). Those examples follow shadcn's pattern
  verbatim: raw `<form onSubmit={form.handleSubmit(onSubmit)}>` + `Controller` +
  `<Field data-invalid={fieldState.invalid}>` + `<FieldError>` — see
  `registry-reui/bases/base/components/number-field/c-number-field-6.tsx`.
- Their 11 `field` example patterns (`registry-reui/bases/base/components/field/c-field-*.tsx`)
  are static compositions; error states are shown with hardcoded `data-invalid` on `Field` and
  literal `<FieldError>` children (`c-field-11.tsx`).

Conclusion: ReUI fully adopted shadcn's layout-only Field direction and dropped the RHF `Form`
wrapper entirely, even for its Radix base.

---

## 4. Current SevenUI state (for reference)

- `packages/registry/registry/base/ui/field.tsx` — near-verbatim port of shadcn's
  `new-york-v4/ui/field.tsx` (diffed 2026-09-07; differences are formatting, `@/registry/base`
  imports, slightly tighter gaps, and modernized selectors). Layout-only, no Base UI imports.
  - Known bug (line 136): `group-has-data-horizontal/field:text-balance` is dead — `Field` emits
    `data-orientation="horizontal"`, not `data-horizontal`. Upstream uses
    `group-has-[[data-orientation=horizontal]]/field:text-balance` (shadcn `field.tsx` line 146).
- `packages/registry/registry/base/ui/form.tsx` — thin styled wrapper around Base UI `<Form>`
  (grid + gap). Fine as-is.
- `packages/registry/registry/base/ui/form-rhf.tsx` — shadcn's classic Form API re-implemented on
  Base UI `Field.Root/Label/Description/Error` (clever: Base UI does the aria wiring that shadcn's
  `FormControl`/Slot did manually, so `FormControl` is a pass-through).
- Demos: `examples/field/field-demo.tsx` and `examples/form/form-demo.tsx` are minimal
  placeholders. Caveat in `form-demo.tsx`: the `errors` prop passed to Base UI `<Form>` is
  currently **inert** — Form `errors` are consumed by `Field.Root` children keyed by their `name`
  (`Form.d.ts`), and the demo uses the layout-only `Field`, not `Field.Root`; the error only shows
  because it is also fed manually into `FieldError errors={...}`. (Auto-clear-on-change therefore
  doesn't happen either.)
- Registry items (`packages/registry/registry.json`): `field` (deps: cva + cn; label, separator),
  `form` (@base-ui/react + cn), `form-rhf` (@base-ui/react + cn + react-hook-form), each with a
  demo item. `apps/web/docs/components/form-rhf.mdx` documents form-rhf as a "1:1 shadcn form API"
  drop-in.

---

## 5. Comparison: who wires accessibility

| | Label↔control id | aria-describedby | aria-invalid | Error visibility | Coupled to |
|---|---|---|---|---|---|
| Base UI Field | automatic (context) | automatic | automatic | `match` / auto from `validate` + `<Form errors>` | Base UI controls |
| shadcn classic `form.tsx` | generated ids via `FormItem`/`FormControl` | manual-but-hidden (Slot injection) | from RHF `error` | `FormMessage` reads RHF error | react-hook-form |
| shadcn new `field.tsx` | consumer writes `htmlFor`/`id` | consumer (usually omitted in their demos) | consumer sets on input | consumer renders `FieldError errors=[…]` | nothing |
| ReUI | same as shadcn new field | same | same | same | nothing |

The ecosystem direction (shadcn 2025 + ReUI) is: **layout-only Field, no form wrapper, form
library drives state via `Controller`, consumer wires aria manually.** Base UI is the outlier that
does the wiring for you — and SevenUI is uniquely positioned to use it because every SevenUI
control already registers with Base UI's Field context (section 1.5).

---

## 6. Recommendation (options — decision is yours)

### Option A — Stay shadcn-aligned: layout-only `field` + Base UI `form` + keep `form-rhf` as compat shim

Keep `field.tsx` exactly as the shadcn port it is (fix the dead class). Document two usage paths:
(1) RHF/TanStack via `Controller` + `Field data-invalid` + `FieldError errors` (shadcn's
recommended pattern, §2.3); (2) native/server forms via Base UI `<Form>` — but demos must then use
Base UI `Field.Root` (via `form-rhf`'s internals or raw primitive) for `errors` to flow, or feed
`FieldError` manually as today. Keep `form-rhf` for shadcn migrators.

- Pros: maximum copy-paste compatibility with shadcn v4 blocks/examples (SevenUI's demo pipeline
  ports shadcn demos wholesale); matches ReUI and the visible ecosystem direction; zero context
  overhead; works with non-Base-UI content too.
- Cons: throws away Base UI's automatic aria wiring even though every SevenUI control supports it;
  every demo must hand-write `htmlFor`/`id`/`aria-invalid`; `form` + layout `field` don't compose
  (the `errors` prop dead-end above) unless documented carefully.

### Option B — Base UI-native hybrid: keep shadcn names, implement the a11y-bearing parts on Base UI Field

Keep `FieldSet/Legend/Group/Content/Title/Separator` as-is (pure layout). Reimplement the core
four on Base UI primitives while preserving the shadcn-style outer API:
`Field` → `Field.Root` (+ the cva `orientation` variants; expose `name`, `invalid`, `validate`,
`validationMode` pass-through), `FieldLabel` → `Field.Label`, `FieldDescription` →
`Field.Description`, `FieldError` → `Field.Error` (keep the `errors?: {message}[]` prop for
RHF/Standard Schema, defaulting to `match={true}` behavior when `errors`/children given, and
auto-render context errors otherwise).

- Pros: automatic `htmlFor`/`aria-describedby`/`aria-invalid` for every SevenUI control (they all
  register with Field context, §1.5); native validation + `validate` + `<Form errors>` (server
  errors, auto-clearing) work out of the box; strongest expression of "SevenUI = Base UI-only";
  data attributes (`data-invalid`, `data-touched`, …) come free for styling.
- Cons: shadcn demos are no longer verbatim copy-paste (their `htmlFor`/`id`/`aria-invalid`
  boilerplate becomes redundant, `data-invalid` becomes `invalid`); shadcn's fancy
  label-as-card patterns (FieldLabel wrapping a nested Field + checkbox) need auditing — Base UI's
  `Field.Label` assumes one control per Field.Root (`nativeLabel` escape hatch exists); slightly
  more runtime (context) and more divergence to maintain against upstream field updates.

### Option C — Two-tier: keep Option A's `field` untouched, add the Base UI wiring at the `form` layer

`field` stays the shadcn port. `form.tsx` grows a `FormField`-like part that IS Base UI
`Field.Root` styled with the same cva orientations (or simply re-export a styled `Field.Root` as
e.g. `FormItem`), so "inside a `<Form>`" users get auto-wiring + `errors` flow, while standalone
`field` remains a pure layout kit; `form-rhf` stays as the shadcn-API shim.

- Pros: no breakage of ported shadcn demos; native-form story becomes genuinely functional
  (`Form errors` + `validate` + auto-aria); each registry item has one clear job.
- Cons: two overlapping field vocabularies to document (Field vs FormItem); consumers must learn
  which wrapper to use when; more surface area than either A or B.

### On `form-rhf` in every option

shadcn no longer documents the classic `FormField` API (the docs route now lands on the Forms
guides, §2.1) and ReUI dropped it entirely. Options: keep it as a migration shim (it already runs
on Base UI Field internally and is honestly the *best* implementation of that API — Base UI does
the wiring Slot used to fake), or deprecate it in favor of a documented `Controller` + `field`
pattern (a `form-rhf-demo` example page can carry that pattern instead). Low cost to keep; the
main cost is documentation surface.

**If forced to rank:** A is the safest given SevenUI's shadcn-demo-porting pipeline and ecosystem
compatibility; B is the most differentiated and most accessible-by-default, and is uniquely
*possible* for SevenUI because it is Base UI-only — no other shadcn-compatible registry can offer
auto-wired fields with this API. C buys B's functionality without A's breakage, at the price of a
fatter API. Whichever is chosen, fix `field.tsx` line 136 and make `form-demo` either use real
`Field.Root`-backed parts or stop passing the inert `errors` prop to `<Form>`.
