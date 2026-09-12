"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const items = [
  {
    value: "email",
    title: "Email notifications",
    body: "Get a summary of activity in your workspace delivered every morning.",
  },
  {
    value: "sms",
    title: "SMS alerts",
    disabled: true,
    body: "Requires a verified phone number on a Pro plan or higher.",
  },
  {
    value: "push",
    title: "Push notifications",
    body: "Enable browser push to get notified the moment something changes.",
  },
];

export default function Accordion04() {
  return (
    <Accordion className="w-full max-w-md" defaultValue={["email"]}>
      {items.map((item) => (
        <AccordionItem
          key={item.value}
          value={item.value}
          disabled={item.disabled}
        >
          <AccordionTrigger>{item.title}</AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
