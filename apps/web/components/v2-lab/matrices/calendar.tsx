"use client";

import { Calendar } from "@/registry/base/ui/calendar";
import { LabSection } from "../lab-frame";

const MONTH = new Date(2026, 5, 1);
const TODAY = new Date(2026, 5, 3);

export default function CalendarMatrix() {
  return (
    <div>
      <LabSection title="single (today = 3rd, selected = 12th, 15th disabled)">
        <Calendar
          mode="single"
          defaultMonth={MONTH}
          today={TODAY}
          selected={new Date(2026, 5, 12)}
          disabled={[new Date(2026, 5, 15)]}
        />
      </LabSection>
      <LabSection title="range (8th to 17th)">
        <Calendar
          mode="range"
          defaultMonth={MONTH}
          today={TODAY}
          selected={{ from: new Date(2026, 5, 8), to: new Date(2026, 5, 17) }}
        />
      </LabSection>
      <LabSection title="captionLayout=dropdown + week numbers">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          showWeekNumber
          defaultMonth={MONTH}
          today={TODAY}
        />
      </LabSection>
      <LabSection title="buttonVariant=outline">
        <Calendar mode="single" buttonVariant="outline" defaultMonth={MONTH} today={TODAY} />
      </LabSection>
    </div>
  );
}
