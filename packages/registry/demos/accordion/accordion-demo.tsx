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
