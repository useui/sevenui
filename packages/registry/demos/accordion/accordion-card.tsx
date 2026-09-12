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
