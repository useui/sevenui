"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const faqs = [
  {
    value: "trial",
    question: "Is there a free trial?",
    answer: "Every plan includes a 14-day trial, no credit card required. You can invite your whole team during the trial.",
  },
  {
    value: "billing",
    question: "Can I change plans later?",
    answer: "Yes. Upgrades apply immediately; downgrades take effect at the start of your next billing cycle.",
  },
  {
    value: "data",
    question: "What happens to my data if I cancel?",
    answer: "Your data stays available for 30 days after cancellation, so you can export everything or reactivate anytime.",
  },
  {
    value: "security",
    question: "How is my data secured?",
    answer: "All traffic is encrypted in transit and at rest. We run regular third-party audits and publish the results on our security page.",
  },
];

export default function Accordion03() {
  return (
    <div className="flex w-full max-w-lg flex-col gap-6">
      <h3 className="text-lg font-semibold">Frequently asked questions</h3>
      <Accordion defaultValue={["trial"]}>
        {faqs.map((faq) => (
          <AccordionItem key={faq.value} value={faq.value}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-sm text-muted-foreground">
        Still stuck?{" "}
        <a href="#" className="font-medium text-foreground underline underline-offset-4">
          Contact support
        </a>
        .
      </p>
    </div>
  );
}
