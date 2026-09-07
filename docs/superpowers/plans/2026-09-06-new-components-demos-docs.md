# New Components Demos & Docs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship demo examples, docs pages, and registry demo items for the 12 new components (input-group, button-group, native-select, empty, item, marker, direction, message, bubble, attachment, message-scroller, questionnaire), delivered in 4 review-gated batches.

**Architecture:** Each component gets: (1) one or more example files in `packages/registry/examples/<name>/`, (2) `registry:component` demo items appended to `packages/registry/registry.json`, (3) a docs page `apps/web/docs/components/<name>.mdx` with a per-sub-component API reference, (4) a sidebar entry in `apps/web/blume.config.ts`. Docs content is grounded in the official shadcn and Base UI docs fetched at execution time.

**Tech Stack:** React 19, Base UI 1.7 (`@base-ui/react`), `@shadcn/react` 0.3.1 (questionnaire, message-scroller), `cn` package, Blume docs app, shadcn CLI 4.19 registry.

**Spec:** No separate spec file — requirements were decided in-conversation on 2026-09-06 and are captured verbatim in Global Constraints below.

## Global Constraints

- **NEVER run `git add` / `git commit` / `git push`** — the user reviews unstaged diffs and commits personally. No commit steps exist in this plan. Do not stop the user's dev server.
- Example files import components via `@/registry/base/ui/<name>` and `cn` from `"cn"`. Never `@/components/ui/*` in example source.
- Docs **Usage/code blocks shown to consumers** use the consumer path `@/components/ui/<name>` (matches all 54 existing pages).
- All repo content in English. Chat with the user is Turkish; files are English.
- Docs must be grounded in primary sources at execution time: fetch `https://ui.shadcn.com/docs/components/<name>` for each component and the relevant Base UI page (`https://base-ui.com/react/...`) before writing the mdx. If a shadcn URL 404s, check the component index at `https://ui.shadcn.com/docs/components` for the actual slug. Do not invent prop descriptions — derive them from our source file plus upstream docs.
- API reference format (decided): one `### <SubComponentName>` per exported sub-component under `## API reference`. Each gets a one-line "Extends …" note (Base UI part link, `@shadcn/react` part, or native element) and a props table with columns `Prop | Type | Default` containing SevenUI-added props (variant/size/etc. from the cva blocks) **plus critical passthrough props** (value/onValueChange/render and similar behavior-defining ones). Skip sub-components with zero notable props by grouping them into a single sentence ("X, Y and Z accept standard div props."). Exported cva helpers (`buttonGroupVariants`, `markerVariants`) get one sentence, no table.
- Every cva variant axis gets shown: if a component has a `variant` axis with N values, an Examples section demonstrates them (one example file can cover a whole axis; separate example files per *concept*, not per value).
- Example file convention: `packages/registry/examples/<name>/<name>-demo.tsx` (default example) plus optional `<name>-<concept>.tsx`; each is a `export default function <PascalName>()` React component, `"use client"` at top, self-contained realistic content (no lorem ipsum).
- Registry demo item convention (append to `registry.json` items array, right after the tail where the 12 component items live):
  ```json
  {
    "name": "<file-basename>",
    "type": "registry:component",
    "title": "<Component> Demo",
    "description": "<one line>",
    "registryDependencies": ["https://sevenui.dev/r/<name>.json"],
    "files": [{ "path": "examples/<name>/<file-basename>.tsx", "type": "registry:component" }]
  }
  ```
  Add extra `registryDependencies` URLs / npm `dependencies` if the example imports other registry components or packages (derive from the example's real imports, same rule as everywhere).
- Docs page skeleton (matches the 54 existing pages, extended with the richer API reference):
  ```mdx
  ---
  title: <Title>
  description: <registry.json description for the component>
  ---

  <Component path="<name>/<name>-demo" />

  ## Installation

  ```bash
  npx shadcn@latest add @sevenui/<name>
  ```

  ## Usage

  ```tsx
  (minimal consumer snippet importing from "@/components/ui/<name>")
  ```

  ## Examples        ← only when extra example files exist

  ### <Concept>

  <Component path="<name>/<name>-<concept>" />

  (1-2 sentences explaining what this shows)

  ## API reference

  (per-sub-component sections per the format constraint above)
  ```
- Sidebar: insert `"/components/<name>"` into the alphabetical Components list in `apps/web/blume.config.ts` (lines ~80-131).
- Batch verification commands (run at every batch checkpoint, from repo root):
  1. `cd packages/registry && npx tsc --noEmit -p tsconfig.json` → only pre-existing failures allowed: 4 errors in `examples/field/field-demo.tsx` + `examples/form/form-demo.tsx`.
  2. `npx vitest run` (in packages/registry) → 12 tests green.
  3. `cd apps/web && npx shadcn build -c ../../packages/registry -o <scratchpad>/r-check` → "Building registry." success.
- STOP at the end of each batch and wait for the user's review before starting the next batch.

## Component inventory (ground truth extracted from source, 2026-09-06)

| Component | Exports | cva axes |
|---|---|---|
| input-group | InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput, InputGroupTextarea | addon: align + size(xs,sm); button: size |
| button-group | ButtonGroup, ButtonGroupSeparator, ButtonGroupText, buttonGroupVariants | buttonGroupVariants (read axes from source) |
| native-select | NativeSelect, NativeSelectOptGroup, NativeSelectOption | — |
| empty | Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia | media variant: default, icon |
| item | Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter | item variant: default, outline, muted; size: default, sm, xs; media variant: default, icon, image |
| marker | Marker, MarkerIcon, MarkerContent, markerVariants | variant: default, separator, border |
| direction | DirectionProvider, useDirection (re-export of Base UI) | — |
| message | MessageGroup, Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader | — |
| bubble | BubbleGroup, Bubble, BubbleContent, BubbleReactions | variant: default, secondary, muted, tinted, outline, ghost, destructive; side: top, bottom; align: start, end |
| attachment | Attachment, AttachmentGroup, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction, AttachmentTrigger | size: default, sm, xs; media variant: icon, image |
| message-scroller | MessageScrollerProvider, MessageScroller, MessageScrollerViewport, MessageScrollerContent, MessageScrollerItem, MessageScrollerButton, useMessageScroller, useMessageScrollerScrollable, useMessageScrollerVisibility | — |
| questionnaire | Questionnaire, QuestionnaireActions, QuestionnaireChoice, QuestionnaireChoiceDescription, QuestionnaireChoices, QuestionnaireDescription, QuestionnaireError, QuestionnaireInput, QuestionnaireItem, QuestionnaireNext, QuestionnairePrevious, QuestionnaireProgress, QuestionnaireSkip, QuestionnaireSubmit, QuestionnaireTitle | — |

---

## BATCH 1 — input & control adjacent: input-group, button-group, native-select, empty

### Task 1: input-group demo + docs

**Files:**
- Create: `packages/registry/examples/input-group/input-group-demo.tsx` (input + icon addon + text addon)
- Create: `packages/registry/examples/input-group/input-group-button.tsx` (InputGroupButton usage, e.g. copy/clear button)
- Create: `packages/registry/examples/input-group/input-group-textarea.tsx` (InputGroupTextarea with addon)
- Modify: `packages/registry/registry.json` (3 demo items)
- Create: `apps/web/docs/components/input-group.mdx`
- Modify: `apps/web/blume.config.ts` (sidebar, alphabetical: after `/components/input`, before `/components/input-otp`)

**Interfaces:** Produces the canonical mdx + example format that every later task copies.

- [ ] **Step 1: Research** — WebFetch `https://ui.shadcn.com/docs/components/input-group` and read `packages/registry/registry/base/ui/input-group.tsx` fully (all props, cva axes, `align` values). Note which upstream examples exist; mirror the useful ones, don't copy text verbatim.
- [ ] **Step 2: Write the 3 example files** per the example convention (imports from `@/registry/base/ui/input-group`, plus `@/registry/base/ui/label` etc. as needed; icons from `lucide-react`).
- [ ] **Step 3: Register 3 demo items** in registry.json per the demo item convention (`input-group-demo`, `input-group-button`, `input-group-textarea`; regDeps include every registry component the examples import).
- [ ] **Step 4: Write `input-group.mdx`** per the docs skeleton. Examples sections: "With button", "Textarea". API reference sections: InputGroup; InputGroupAddon (align, size table); InputGroupButton (size + inherited Button props note); InputGroupText; InputGroupInput; InputGroupTextarea (both "extends Input/Textarea" with links to our input/textarea pages).
- [ ] **Step 5: Sidebar entry** in blume.config.ts.
- [ ] **Step 6: Verify** — `npx tsc --noEmit -p packages/registry/tsconfig.json` (no new errors) and confirm the three example files typecheck.

### Task 2: button-group demo + docs

**Files:**
- Create: `packages/registry/examples/button-group/button-group-demo.tsx` (attached buttons, e.g. pagination-style prev/next or toolbar actions)
- Create: `packages/registry/examples/button-group/button-group-separator.tsx` (ButtonGroupSeparator + ButtonGroupText, e.g. split button with a dropdown-menu trigger)
- Modify: `packages/registry/registry.json` (2 demo items)
- Create: `apps/web/docs/components/button-group.mdx`
- Modify: `apps/web/blume.config.ts` (after `/components/button`, before `/components/calendar`)

- [ ] **Step 1: Research** — WebFetch `https://ui.shadcn.com/docs/components/button-group`; read `button-group.tsx` (derive `buttonGroupVariants` axes — the inventory table above could not extract them; get exact axis names/values from the cva call).
- [ ] **Step 2: Write both example files** (button imports from `@/registry/base/ui/button`; if the separator example uses dropdown-menu, import from `@/registry/base/ui/dropdown-menu`).
- [ ] **Step 3: Register 2 demo items** (`button-group-demo`, `button-group-separator`) with regDeps for button + any other used components.
- [ ] **Step 4: Write `button-group.mdx`**. API reference: ButtonGroup (cva axes table + "extends div, uses useRender/mergeProps" note), ButtonGroupSeparator ("extends Separator", link), ButtonGroupText; one sentence for `buttonGroupVariants`.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: Verify** — typecheck as in Task 1.

### Task 3: native-select demo + docs

**Files:**
- Create: `packages/registry/examples/native-select/native-select-demo.tsx` (labelled select with placeholder option)
- Create: `packages/registry/examples/native-select/native-select-groups.tsx` (NativeSelectOptGroup + disabled options)
- Modify: `packages/registry/registry.json` (2 demo items)
- Create: `apps/web/docs/components/native-select.mdx`
- Modify: `apps/web/blume.config.ts` (after `/components/menubar`… alphabetical: between `/components/meter` and `/components/navigation-menu`)

- [ ] **Step 1: Research** — check `https://ui.shadcn.com/docs/components` index for the native select slug (try `native-select`); read `native-select.tsx` (note the ChevronDownIcon wrapper structure and any invalid/disabled styling hooks).
- [ ] **Step 2: Write both example files** (pair with `@/registry/base/ui/label` in the demo; realistic option data, e.g. timezones or fruits).
- [ ] **Step 3: Register 2 demo items** (`native-select-demo`, `native-select-groups`).
- [ ] **Step 4: Write `native-select.mdx`**. API reference: NativeSelect ("extends the native `<select>` element" — table only if source adds props beyond className), NativeSelectOption / NativeSelectOptGroup grouped in one sentence (native `<option>` / `<optgroup>`). Mention in prose when to prefer this over the Base UI `select` component (mobile/native form UX) — ground the claim in the upstream docs.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: Verify** — typecheck.

### Task 4: empty demo + docs + BATCH 1 CHECKPOINT

**Files:**
- Create: `packages/registry/examples/empty/empty-demo.tsx` (EmptyMedia variant="icon" + title + description + EmptyContent action button)
- Create: `packages/registry/examples/empty/empty-avatar.tsx` (EmptyMedia variant="default" with an avatar/image, secondary layout)
- Modify: `packages/registry/registry.json` (2 demo items)
- Create: `apps/web/docs/components/empty.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/dropdown-menu` and `/components/field`)

- [ ] **Step 1: Research** — WebFetch `https://ui.shadcn.com/docs/components/empty`; read `empty.tsx`.
- [ ] **Step 2: Write both example files** (icon from lucide-react; action via `@/registry/base/ui/button`).
- [ ] **Step 3: Register 2 demo items** (`empty-demo`, `empty-avatar`; avatar example regDeps include avatar.json if used).
- [ ] **Step 4: Write `empty.mdx`**. API reference: Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent grouped where prop-less; EmptyMedia gets the variant table (default, icon).
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: BATCH 1 verification** — run all three batch verification commands from Global Constraints. Fix anything new before reporting.
- [ ] **Step 7: STOP.** Report the batch to the user (files created, examples per component, any deviations) and wait for review before Batch 2.

---

## BATCH 2 — layout & annotation: item, marker, direction

### Task 5: item demo + docs

**Files:**
- Create: `packages/registry/examples/item/item-demo.tsx` (Item with ItemMedia icon, title+description, ItemActions)
- Create: `packages/registry/examples/item/item-variants.tsx` (variant axis: default, outline, muted)
- Create: `packages/registry/examples/item/item-group.tsx` (ItemGroup + ItemSeparator list, mixed sizes sm/xs, ItemHeader/ItemFooter)
- Modify: `packages/registry/registry.json` (3 demo items)
- Create: `apps/web/docs/components/item.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/input-otp` and `/components/kbd`)

- [ ] **Step 1: Research** — WebFetch `https://ui.shadcn.com/docs/components/item`; read `item.tsx` fully (10 exports; note useRender/mergeProps `render` support if present).
- [ ] **Step 2: Write the 3 example files.**
- [ ] **Step 3: Register 3 demo items** (`item-demo`, `item-variants`, `item-group`).
- [ ] **Step 4: Write `item.mdx`**. Examples: "Variants", "Group". API reference: Item (variant + size tables), ItemMedia (variant table: default, icon, image), remaining structural parts grouped in prose sentences.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: Verify** — typecheck.

### Task 6: marker demo + docs

**Files:**
- Create: `packages/registry/examples/marker/marker-demo.tsx` (default markers inline in text/list context)
- Create: `packages/registry/examples/marker/marker-variants.tsx` (variant axis: default, separator, border)
- Modify: `packages/registry/registry.json` (2 demo items)
- Create: `apps/web/docs/components/marker.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/label` and `/components/menubar`)

- [ ] **Step 1: Research** — check the shadcn components index for marker's slug (newer component; if no page exists, ground the docs purely in our source and say so in the task report); read `marker.tsx`.
- [ ] **Step 2: Write both example files** (MarkerIcon with lucide icons + MarkerContent).
- [ ] **Step 3: Register 2 demo items** (`marker-demo`, `marker-variants`).
- [ ] **Step 4: Write `marker.mdx`**. API reference: Marker (variant table), MarkerIcon, MarkerContent (grouped if prop-less); one sentence for `markerVariants`.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: Verify** — typecheck.

### Task 7: direction docs + BATCH 2 CHECKPOINT

**Files:**
- Create: `packages/registry/examples/direction/direction-demo.tsx` (DirectionProvider dir="rtl" wrapping a small composed UI — e.g. a breadcrumb or input-group — next to the same UI in LTR, so the flip is visible)
- Modify: `packages/registry/registry.json` (1 demo item)
- Create: `apps/web/docs/components/direction.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/dialog` and `/components/drawer`)

- [ ] **Step 1: Research** — WebFetch `https://base-ui.com/react/utils/direction-provider` (this is a pure re-export of Base UI; the docs page must say so and link it).
- [ ] **Step 2: Write the example** (side-by-side LTR/RTL panels).
- [ ] **Step 3: Register 1 demo item** (`direction-demo`; regDeps: direction.json + whichever component is wrapped).
- [ ] **Step 4: Write `direction.mdx`**. No Examples section needed beyond the demo. API reference: DirectionProvider (dir prop table), useDirection (one sentence, return value). State clearly it re-exports `@base-ui/react/direction-provider`.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: BATCH 2 verification** — all three batch commands.
- [ ] **Step 7: STOP.** Report batch 2 and wait for review.

---

## BATCH 3 — chat display: message, bubble, attachment

### Task 8: message demo + docs

**Files:**
- Create: `packages/registry/examples/message/message-demo.tsx` (MessageGroup with 2-3 Messages: avatar, header with name/time, content, footer)
- Modify: `packages/registry/registry.json` (1 demo item)
- Create: `apps/web/docs/components/message.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/menubar` and `/components/meter`)

- [ ] **Step 1: Research** — check the shadcn components index for message (AI/chat component family); read `message.tsx`.
- [ ] **Step 2: Write the example** (realistic short chat transcript; avatar via `@/registry/base/ui/avatar` if message.tsx expects it, otherwise MessageAvatar's own API).
- [ ] **Step 3: Register 1 demo item** (`message-demo`).
- [ ] **Step 4: Write `message.mdx`**. API reference: one section per export; structural prop-less parts grouped.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: Verify** — typecheck.

### Task 9: bubble demo + docs

**Files:**
- Create: `packages/registry/examples/bubble/bubble-demo.tsx` (BubbleGroup two-party conversation using align start/end)
- Create: `packages/registry/examples/bubble/bubble-variants.tsx` (all 7 variants labelled)
- Create: `packages/registry/examples/bubble/bubble-reactions.tsx` (BubbleReactions with side/align combinations)
- Modify: `packages/registry/registry.json` (3 demo items)
- Create: `apps/web/docs/components/bubble.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/breadcrumb` and `/components/button`)

- [ ] **Step 1: Research** — shadcn components index for bubble; read `bubble.tsx` (7 variants, side top/bottom, align start/end — confirm which sub-component owns which axis).
- [ ] **Step 2: Write the 3 example files.**
- [ ] **Step 3: Register 3 demo items** (`bubble-demo`, `bubble-variants`, `bubble-reactions`).
- [ ] **Step 4: Write `bubble.mdx`**. Examples: "Variants", "Reactions". API reference: Bubble (variant/align tables as owned), BubbleContent, BubbleGroup, BubbleReactions (side/align table).
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: Verify** — typecheck.

### Task 10: attachment demo + docs + BATCH 3 CHECKPOINT

**Files:**
- Create: `packages/registry/examples/attachment/attachment-demo.tsx` (AttachmentGroup: one image attachment + one file/icon attachment with title/description)
- Create: `packages/registry/examples/attachment/attachment-actions.tsx` (AttachmentActions/AttachmentAction — download/remove — and AttachmentTrigger; sizes sm/xs shown)
- Modify: `packages/registry/registry.json` (2 demo items)
- Create: `apps/web/docs/components/attachment.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/aspect-ratio` and `/components/avatar` — alphabetical: attachment < avatar)
- [ ] **Step 1: Research** — shadcn components index; read `attachment.tsx` (9 exports; note Button reuse in actions).
- [ ] **Step 2: Write both example files** (use a data-URI or local-free placeholder pattern for the image — no external image hosts; check how existing examples like avatar handle images and copy that approach).
- [ ] **Step 3: Register 2 demo items** (`attachment-demo`, `attachment-actions`).
- [ ] **Step 4: Write `attachment.mdx`**. API reference: Attachment (size table), AttachmentMedia (variant table icon/image), AttachmentAction ("extends Button", link), others grouped.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: BATCH 3 verification** — all three batch commands.
- [ ] **Step 7: STOP.** Report batch 3 and wait for review.

---

## BATCH 4 — chat interactive: message-scroller, questionnaire

### Task 11: message-scroller demo + docs

**Files:**
- Create: `packages/registry/examples/message-scroller/message-scroller-demo.tsx` (fixed-height chat viewport with enough messages to scroll, MessageScrollerButton appearing when scrolled up; a "simulate new message" Button appending items to show stick-to-bottom)
- Modify: `packages/registry/registry.json` (1 demo item)
- Create: `apps/web/docs/components/message-scroller.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/message` and `/components/meter`)

- [ ] **Step 1: Research** — WebFetch the `@shadcn/react` message-scroller docs (check ui.shadcn.com components index; the primitive is `@shadcn/react/message-scroller`); read `message-scroller.tsx` fully including the three hooks.
- [ ] **Step 2: Write the example** (combine with the message component from Task 8 for realistic content; regDeps accordingly).
- [ ] **Step 3: Register 1 demo item** (`message-scroller-demo`).
- [ ] **Step 4: Write `message-scroller.mdx`**. API reference: Provider/Viewport/Content/Item/Button sections with their critical props (behavior props from the primitive: stick-to-bottom/scroll thresholds — take exact names from source + upstream docs, do not guess); the three hooks each get a one-line signature + when-to-use sentence. Note the `@shadcn/react` dependency explicitly in prose.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: Verify** — typecheck.

### Task 12: questionnaire demo + docs + BATCH 4 CHECKPOINT

**Files:**
- Create: `packages/registry/examples/questionnaire/questionnaire-demo.tsx` (3-step flow: one choices step with QuestionnaireChoice+Description, one input step with QuestionnaireError, progress bar, Previous/Next/Skip/Submit wired; onSubmit shows result via toast or inline state)
- Modify: `packages/registry/registry.json` (1 demo item)
- Create: `apps/web/docs/components/questionnaire.mdx`
- Modify: `apps/web/blume.config.ts` (between `/components/progress` and `/components/radio-group`)

- [ ] **Step 1: Research** — WebFetch the `@shadcn/react` questionnaire docs (ui.shadcn.com index); read `questionnaire.tsx` fully (15 exports — map which are structural vs stateful; find the primitive's data/answer model: how steps, values, and validation flow).
- [ ] **Step 2: Write the example** (single rich demo covering choices + input + navigation; keep it under ~120 lines by choosing 3 concise steps).
- [ ] **Step 3: Register 1 demo item** (`questionnaire-demo`).
- [ ] **Step 4: Write `questionnaire.mdx`**. API reference: stateful parts (Questionnaire root: data/value/onSubmit-style props with exact names from source; QuestionnaireItem; QuestionnaireInput; QuestionnaireChoice) get tables; pure-layout parts (Title, Description, Actions, Progress, Error, Next, Previous, Skip, Submit, Choices, ChoiceDescription) grouped into short prose with any notable prop called out. Note the `@shadcn/react` dependency in prose.
- [ ] **Step 5: Sidebar entry.**
- [ ] **Step 6: BATCH 4 verification** — all three batch commands, PLUS a final full-sweep: confirm registry.json item count = 126 components + 23 new demo items = 149, `python3 -c "import json; d=json.load(open('packages/registry/registry.json')); print(len(d['items']))"`.
- [ ] **Step 7: STOP.** Report batch 4 + overall summary (all files, demo item count, any upstream-docs gaps flagged along the way). The changed-components docs update (part 2) is a separate follow-up plan.

## Self-review notes

- Demo item count check in Task 12 Step 6: 3+2+2+2 (B1) + 3+2+1 (B2) + 1+3+2 (B3) + 1+1 (B4) = 23 new `registry:component` items; 126 existing items → 149 total.
- Every task's example files import via `@/registry/base/ui/*` (Global Constraints) — matches the Y-convention decided 2026-09-06.
- No commit steps anywhere by design (user gate).
- direction/marker/message/bubble/attachment may lack upstream shadcn pages; tasks say to flag this in the report instead of fabricating sources.
