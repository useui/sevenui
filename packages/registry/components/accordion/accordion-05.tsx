"use client";

import { PlusIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/registry/base/ui/accordion";

const topics = [
  {
    value: "invite",
    title: "Inviting teammates",
    body: "Open Settings, then Members, and paste up to 50 email addresses at once. Invites expire after seven days and can be resent from the same screen.",
  },
  {
    value: "roles",
    title: "Changing someone's role",
    body: "Owners and admins can switch a member between Viewer, Editor, and Admin. The change applies on their next page load, no sign-out needed.",
  },
  {
    value: "transfer",
    title: "Transferring ownership",
    body: "Only the current owner can hand over a workspace. The new owner must accept within 48 hours, and billing moves with the ownership.",
  },
  {
    value: "remove",
    title: "Removing a member",
    body: "Removed members lose access immediately. Their documents stay in the workspace and are reassigned to you.",
  },
];

export default function Accordion05() {
  return (
    <Accordion className="w-full max-w-md gap-0.5">
      {topics.map((topic) => (
        <AccordionItem
          key={topic.value}
          value={topic.value}
          className="rounded-lg not-last:border-b-0 transition-colors hover:bg-muted/60 data-open:bg-muted/60"
        >
          <AccordionTrigger className="items-center gap-3 px-3 hover:no-underline **:data-[slot=accordion-trigger-icon]:hidden!">
            <PlusIcon
              aria-hidden="true"
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-out group-aria-expanded/accordion-trigger:rotate-45 group-aria-expanded/accordion-trigger:text-foreground"
            />
            <span className="flex-1">{topic.title}</span>
          </AccordionTrigger>
          <AccordionContent className="pr-3 pl-10 text-muted-foreground">
            {topic.body}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
