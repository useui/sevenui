"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const sections = [
  {
    value: "details",
    title: "Product details",
    body: "A lightweight three-layer shell with fully taped seams, a helmet-compatible hood, and pit zips for venting on steep climbs.",
  },
  {
    value: "materials",
    title: "Materials and care",
    body: "Face fabric is 100% recycled nylon with a PFC-free water repellent finish. Machine wash cold, then tumble dry low to reactivate the coating.",
  },
  {
    value: "fit",
    title: "Size and fit",
    body: "Regular fit with room for a midlayer. The model is 6'1\" and wears a size M. Sleeves are cut long to stay put when you reach overhead.",
  },
  {
    value: "shipping",
    title: "Shipping and returns",
    body: "Free standard shipping on orders over $75, delivered in 3-5 business days. Unworn items can be returned within 30 days.",
  },
];

export default function Accordion01() {
  return (
    <Accordion
      className="flex w-full max-w-md flex-col gap-2"
      defaultValue={["details"]}
    >
      {sections.map((section) => (
        <AccordionItem
          key={section.value}
          value={section.value}
          className="rounded-lg border px-4 last:border-b"
        >
          <AccordionTrigger>{section.title}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {section.body}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
