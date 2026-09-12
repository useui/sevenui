"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const items = [
  {
    value: "shipping",
    title: "How long does shipping take?",
    body: "Standard delivery takes 3-5 business days. Express shipping ensures next-day delivery for orders placed before 2pm.",
  },
  {
    value: "returns",
    title: "What is the return policy?",
    body: "Every purchase includes a 30-day return window. Items go back in their original condition; refunds land within 48 hours.",
  },
  {
    value: "warranty",
    title: "Is there a warranty?",
    body: "All products carry a two-year limited warranty covering manufacturing defects and hardware failures.",
  },
];

export default function Accordion01() {
  return (
    <Accordion
      className="flex w-full max-w-md flex-col gap-2"
      defaultValue={["shipping"]}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          className="rounded-lg border px-4 last:border-b"
        >
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
