---
title: Accordion
description: A vertically stacked set of interactive headings that each reveal an associated panel of content, built on the Base UI Accordion primitive.
---

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

export default function AccordionDemo() {
  return (
    <Accordion className="w-full max-w-md" defaultValue={["item-1"]}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Product Information</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2 last:mb-0">
            Our flagship product combines cutting-edge technology with sleek
            design. Built from premium materials, it offers reliability and
            performance for everyday use.
          </p>
          <p className="mb-2 last:mb-0">
            Every unit is rigorously tested before shipping to ensure it
            meets our high quality standards.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Shipping Details</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2 last:mb-0">
            We offer worldwide shipping through trusted courier partners.
            Standard delivery takes 3-5 business days, while express
            shipping ensures next-day delivery.
          </p>
          <p className="mb-2 last:mb-0">
            All orders are carefully packaged and fully insured. Track your
            shipment in real time from our dashboard.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Return Policy</AccordionTrigger>
        <AccordionContent>
          <p className="mb-2 last:mb-0">
            We stand behind our products with a comprehensive 30-day return
            policy. If you&apos;re not completely satisfied, simply return
            the item in its original condition.
          </p>
          <p className="mb-2 last:mb-0">
            Our hassle-free return process includes free return shipping and
            full refunds processed within 48 hours of receiving the return.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Installation

<InstallCommand item="accordion" />

## Usage

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function AccordionDemo() {
  return (
    <Accordion className="w-full max-w-md" defaultValue={["item-1"]}>
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Examples

### Multiple open panels

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const faqs = [
  {
    value: "shipping",
    question: "How long does shipping take?",
    answer: "Orders ship within 24 hours and arrive in 3-5 business days.",
  },
  {
    value: "returns",
    question: "What is the return policy?",
    answer: "Returns are free within 30 days of delivery.",
  },
  {
    value: "warranty",
    question: "Is there a warranty?",
    answer: "Every product includes a two-year limited warranty.",
  },
];

export default function AccordionMultiple() {
  return (
    <Accordion
      multiple
      defaultValue={["shipping", "returns"]}
      className="w-full max-w-md"
    >
      {faqs.map((faq) => (
        <AccordionItem key={faq.value} value={faq.value}>
          <AccordionTrigger>{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

### In a card

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const items = [
  {
    value: "included",
    question: "What's included in the Pro plan?",
    answer: "Unlimited projects, priority support, and team analytics.",
  },
  {
    value: "billing",
    question: "Can I switch billing periods?",
    answer: "Yes — changes take effect at the start of the next cycle.",
  },
  {
    value: "cancel",
    question: "How do I cancel?",
    answer: "From settings, anytime. Your data stays for 30 days.",
  },
];

export default function AccordionCard() {
  return (
    <Accordion
      defaultValue={["included"]}
      className="w-full max-w-md rounded-xl bg-card px-4 ring-1 ring-foreground/10"
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="last:border-b-0"
        >
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

### Split items

```tsx
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const items = [
  {
    value: "design",
    question: "Do you offer design files?",
    answer: "Figma files ship with every release.",
  },
  {
    value: "themes",
    question: "Can I use my own theme?",
    answer: "All components read your CSS variables — swap the palette freely.",
  },
  {
    value: "support",
    question: "Where do I get help?",
    answer: "GitHub discussions and the community Discord.",
  },
];

export default function AccordionSplit() {
  return (
    <Accordion defaultValue={["design"]} className="w-full max-w-md space-y-2">
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="rounded-lg border bg-muted/30 px-4 last:border-b"
        >
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
```

## API reference

### Accordion

Extends the
[Base UI Accordion](https://base-ui.com/react/components/accordion)
Root — all its props apply. `value`/`defaultValue` are **arrays** of the
open item values (`defaultValue={["item-1"]}`), not a single value.

| Prop                     | Type                                       | Default |
| ------------------------ | ------------------------------------------ | ------- |
| `value` / `defaultValue` | `string[]`                                 | —       |
| `onValueChange`          | `(value: string[]) => void`                | —       |
| `multiple`               | `boolean` (renamed from `openMultiple` in 1.7) | `false` |
| `hiddenUntilFound`       | `boolean` — `hidden="until-found"` panels reveal via find-in-page | `false` |
| `disabled`               | `boolean`                                  | `false` |

### AccordionItem

Takes the item `value` (and `disabled`).

### AccordionTrigger

A native `<button>` inside an `<h3>` heading (`Accordion.Header`) —
override the heading level via `render` on the primitive's Header when
composing directly. The open state styles via `data-panel-open`
(presence) — not `data-open`, which lives on Item/Panel/Root. A disabled
trigger stays focusable with `aria-disabled="true"` — style it with
`data-disabled:`, not `disabled:`.

### AccordionContent

Open/close animates via the `animate-accordion-down` /
`animate-accordion-up` utilities. Their keyframes ship in this
primitive's registry item (the CLI merges them into your CSS); when
copying the source manually, add them yourself:

```css
@theme inline {
  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--accordion-panel-height); }
}

@keyframes accordion-up {
  from { height: var(--accordion-panel-height); }
  to { height: 0; }
}
```

`--accordion-panel-height` is set by Base UI on the panel.
