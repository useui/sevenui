"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { LabSection } from "../lab-frame";

export default function AccordionMatrix() {
  return (
    <div>
      <LabSection title="single / first open / disabled last">
        <Accordion defaultValue={["shipping"]} className="max-w-md">
          <AccordionItem value="shipping">
            <AccordionTrigger>Shipping</AccordionTrigger>
            <AccordionContent>
              <p>Orders ship within two business days.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="returns">
            <AccordionTrigger>Returns</AccordionTrigger>
            <AccordionContent>
              <p>
                Free returns for 30 days. <a href="#returns">Read the policy</a>.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="locked" disabled>
            <AccordionTrigger>Disabled item</AccordionTrigger>
            <AccordionContent>Hidden.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </LabSection>
      <LabSection title="multiple / long trigger wraps">
        <Accordion multiple defaultValue={["a", "b"]} className="max-w-md">
          <AccordionItem value="a">
            <AccordionTrigger>
              A considerably longer question that wraps onto a second line in a narrow column
            </AccordionTrigger>
            <AccordionContent>First answer.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="b">
            <AccordionTrigger>Second</AccordionTrigger>
            <AccordionContent>Second answer.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </LabSection>
    </div>
  );
}
