"use client";

import { Package, RotateCcw, ShieldCheck } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const items = [
  {
    value: "shipping",
    icon: Package,
    title: "How long does shipping take?",
    body: "Standard delivery takes 3-5 business days. Express shipping ensures next-day delivery for orders placed before 2pm.",
  },
  {
    value: "returns",
    icon: RotateCcw,
    title: "What is the return policy?",
    body: "Every purchase includes a 30-day return window. Items go back in their original condition; refunds land within 48 hours.",
  },
  {
    value: "warranty",
    icon: ShieldCheck,
    title: "Is there a warranty?",
    body: "All products carry a two-year limited warranty covering manufacturing defects and hardware failures.",
  },
];

export default function Accordion02() {
  return (
    <Accordion className="w-full max-w-md" defaultValue={["shipping"]}>
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionTrigger>
            <span className="flex items-center gap-2">
              <item.icon className="size-4 text-muted-foreground" />
              {item.title}
            </span>
          </AccordionTrigger>
          <AccordionContent>{item.body}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
