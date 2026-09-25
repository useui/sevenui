"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/registry/base/ui/tooltip";

const terms = {
  uptime: {
    label: "monthly uptime",
    title: "Monthly uptime",
    definition:
      "The share of minutes in a calendar month when the API passed health checks. Maintenance announced 48 hours ahead does not count against it.",
  },
  credits: {
    label: "service credits",
    title: "Service credits",
    definition:
      "10% of your monthly fee below 99.95%, rising to 30% below 99%. Request them from Billing within 30 days.",
  },
  rpo: {
    label: "RPO",
    title: "Recovery point objective",
    definition:
      "The most data, measured in time, you could lose if a region fails.",
  },
  rto: {
    label: "RTO",
    title: "Recovery time objective",
    definition:
      "How long it takes us to restore service in another region after a failure.",
  },
};

type Term = keyof typeof terms;

function GlossaryTerm({ term }: { term: Term }) {
  const entry = terms[term];

  return (
    <Tooltip>
      <TooltipTrigger className="cursor-help rounded-xs font-medium text-foreground underline decoration-muted-foreground/60 decoration-dotted underline-offset-4 outline-none transition-colors hover:decoration-foreground focus-visible:ring-2 focus-visible:ring-ring">
        {entry.label}
      </TooltipTrigger>
      <TooltipContent className="grid max-w-64 gap-1 px-3 py-2 text-left">
        <span className="font-medium">{entry.title}</span>
        <span className="text-primary-foreground/80">{entry.definition}</span>
      </TooltipContent>
    </Tooltip>
  );
}

export default function Tooltip10() {
  return (
    <TooltipProvider delay={300}>
      <article className="grid w-full max-w-md gap-3">
        <h3 className="text-base font-semibold">Service level agreement</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The Business plan guarantees 99.95% <GlossaryTerm term="uptime" />. If
          we miss that target, you receive <GlossaryTerm term="credits" /> on
          your next invoice automatically.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Databases are replicated across two regions with an{" "}
          <GlossaryTerm term="rpo" /> of 15 minutes and an{" "}
          <GlossaryTerm term="rto" /> of 4 hours.
        </p>
      </article>
    </TooltipProvider>
  );
}
