---
title: Questionnaire
description: Multi-step questionnaire flow built on the shadcn Questionnaire primitive.
---

```tsx
"use client";

import * as React from "react";

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
  QuestionnaireSkip,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/registry/base/ui/questionnaire";

export default function QuestionnaireDemo() {
  const [submitted, setSubmitted] = React.useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSubmitted(
      `role: ${data.get("role")} · interests: ${
        data.getAll("interests").join(", ") || "—"
      } · email: ${data.get("email")}`,
    );
  }

  if (submitted) {
    return (
      <div className="w-full max-w-md rounded-xl border p-6 text-sm">
        <p className="font-medium">Thanks for your answers!</p>
        <p className="mt-2 text-muted-foreground">{submitted}</p>
      </div>
    );
  }

  return (
    <Questionnaire
      shortcuts="letters"
      onSubmit={handleSubmit}
      className="max-w-md rounded-xl border p-6"
    >
      <QuestionnaireProgress />
      <QuestionnaireItem name="role" required>
        <QuestionnaireTitle>What best describes your role?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          <QuestionnaireChoice value="developer">Developer</QuestionnaireChoice>
          <QuestionnaireChoice value="product">
            Product
            <QuestionnaireChoiceDescription>
              PM, founder, or anything in between
            </QuestionnaireChoiceDescription>
          </QuestionnaireChoice>
        </QuestionnaireChoices>
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireItem name="interests" multiple>
        <QuestionnaireTitle>What are you building?</QuestionnaireTitle>
        <QuestionnaireDescription>
          Pick as many as you like — or skip this step.
        </QuestionnaireDescription>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="dashboards">Dashboards</QuestionnaireChoice>
          <QuestionnaireChoice value="marketing">
            Marketing sites
          </QuestionnaireChoice>
          <QuestionnaireChoice value="ai">AI interfaces</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      <QuestionnaireItem name="email" required>
        <QuestionnaireTitle>Where should we send updates?</QuestionnaireTitle>
        <QuestionnaireInput type="email" placeholder="you@example.com" />
        <QuestionnaireError />
      </QuestionnaireItem>
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireSkip />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
```

## Installation

<InstallCommand item="questionnaire" />

Depends on the `@shadcn/react` package, installed automatically.

## Usage

```tsx
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoices,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";

export function Survey() {
  return (
    <Questionnaire
      onSubmit={(event) => {
        event.preventDefault();
        const answers = new FormData(event.currentTarget);
      }}
    >
      <QuestionnaireItem name="role" required>
        <QuestionnaireTitle>What is your role?</QuestionnaireTitle>
        <QuestionnaireChoices>
          <QuestionnaireChoice value="designer">Designer</QuestionnaireChoice>
          <QuestionnaireChoice value="developer">Developer</QuestionnaireChoice>
        </QuestionnaireChoices>
      </QuestionnaireItem>
      {/* more items… */}
      <QuestionnaireActions>
        <QuestionnairePrevious />
        <QuestionnaireNext />
        <QuestionnaireSubmit />
      </QuestionnaireActions>
    </Questionnaire>
  );
}
```

The root renders a real `<form>`: each `QuestionnaireItem` is a
`fieldset` named question, progression and validation are managed
internally, and answers arrive as `FormData` in `onSubmit` (use
`getAll` for `multiple` items). Navigation buttons show and hide
themselves — Next hides on the last step, Submit appears there, Skip
only renders on non-required items.

## API reference

### Questionnaire

Extends `form`.

| Prop           | Type                                             | Default |
| -------------- | ------------------------------------------------ | ------- |
| `defaultItem`  | `string`                                         | —       |
| `item`         | `string`                                         | —       |
| `onItemChange` | `(item: string) => void`                         | —       |
| `items`        | `readonly QuestionnaireItemDefinition[]`         | —       |
| `shortcuts`    | `"letters" \| "numbers"`                         | —       |
| `onSubmit`     | `React.FormEventHandler<HTMLFormElement>`        | —       |

`item`/`onItemChange` control the active step externally (by item
name); `shortcuts` enables keyboard selection and shows the shortcut
chips on choices.

### QuestionnaireItem

Extends `fieldset`. One question per item; only the active one is
shown.

| Prop             | Type                                                        | Default |
| ---------------- | ----------------------------------------------------------- | ------- |
| `name`           | `string` (required)                                         | —       |
| `multiple`       | `boolean` — checkbox behavior instead of radio              | `false` |
| `required`       | `boolean`                                                   | `false` |
| `invalid`        | `boolean` — force invalid styling (external validation)     | —       |
| `onStatusChange` | `(status: "unanswered" \| "answered" \| "skipped") => void` | —       |

### QuestionnaireChoice

Extends `label`; the hidden input, indicator (radio dot / check), label,
and shortcut chip are built in.

| Prop                         | Type                                        | Default |
| ---------------------------- | ------------------------------------------- | ------- |
| `value`                      | `string` (required)                         | —       |
| `checked` / `defaultChecked` | `boolean`                                   | —       |
| `disabled`                   | `boolean`                                   | `false` |
| `onChange`                   | `React.ChangeEventHandler<HTMLInputElement>` | —       |

### QuestionnaireInput

Freeform answer field for the active item.

| Prop   | Type                                                       | Default  |
| ------ | ---------------------------------------------------------- | -------- |
| `type` | `"text" \| "email" \| "number" \| "date" \| "tel" \| …`    | `"text"` |

### QuestionnairePrevious, QuestionnaireSkip, QuestionnaireNext, QuestionnaireSubmit

Navigation buttons styled through
[Button](/docs/components/button)'s variants (`variant` and `size`
props apply; Previous/Skip default to `outline`). They disable and hide
themselves based on position and item state. Default labels can be
replaced via `children`.

### QuestionnaireProgress, QuestionnaireTitle, QuestionnaireDescription, QuestionnaireChoiceDescription, QuestionnaireError, QuestionnaireActions

Presentation parts: progress ("x of y", with `{ current, total, first,
last }` available via the render prop), the question heading
(`legend`) and description, per-choice helper text, the validation
message slot, and the action-row grid.
