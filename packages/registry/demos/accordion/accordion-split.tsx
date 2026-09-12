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
