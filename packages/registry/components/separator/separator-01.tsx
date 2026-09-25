"use client";

import { Separator } from "@/registry/base/ui/separator";

const sections = [
  {
    align: "start",
    label: "Profile",
    body: "Name, avatar, and the email address teammates see on shared projects.",
  },
  {
    align: "center",
    label: "Notifications",
    body: "Choose which activity sends a push alert and which waits for the daily digest.",
  },
  {
    align: "end",
    label: "Danger zone",
    body: "Transfer ownership of the workspace or delete it with all of its data.",
  },
] as const;

const textAlign = {
  start: "text-left",
  center: "text-center",
  end: "text-right",
};

export default function Separator01() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      {sections.map((section) => (
        <section
          key={section.label}
          aria-labelledby={`separator-01-${section.align}`}
          className="flex flex-col gap-2"
        >
          <div className="flex items-center gap-3">
            {section.align !== "start" && <Separator className="flex-1" />}
            <h3
              id={`separator-01-${section.align}`}
              className="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase"
            >
              {section.label}
            </h3>
            {section.align !== "end" && <Separator className="flex-1" />}
          </div>
          <p className={`text-sm text-balance ${textAlign[section.align]}`}>
            {section.body}
          </p>
        </section>
      ))}
    </div>
  );
}
