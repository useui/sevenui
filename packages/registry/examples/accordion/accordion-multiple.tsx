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
