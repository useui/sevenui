"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";
import { Badge } from "@/registry/base/ui/badge";

const sections = [
  {
    value: "rate-limits",
    title: "Rate limits",
    body: "Your API keys can make 600 requests per minute. Requests over the limit return 429 with a Retry-After header.",
  },
  {
    value: "ip-allowlist",
    title: "IP allowlist",
    plan: "Enterprise",
    body: "Restrict API access to a list of trusted CIDR ranges.",
  },
  {
    value: "signing",
    title: "Request signing",
    body: "Every webhook carries an HMAC-SHA256 signature in the X-Signature header. Rotate the signing secret at any time without downtime.",
  },
];

export default function Accordion04() {
  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <Accordion defaultValue={["rate-limits"]}>
        {sections.map((section) => (
          <AccordionItem
            key={section.value}
            value={section.value}
            disabled={Boolean(section.plan)}
          >
            <AccordionTrigger>
              <span className="flex flex-wrap items-center gap-2">
                {section.title}
                {section.plan ? (
                  <Badge variant="outline">{section.plan} plan</Badge>
                ) : null}
              </span>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {section.body}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <p className="text-xs text-muted-foreground">
        Sections marked with a plan name unlock when you upgrade.
      </p>
    </div>
  );
}
