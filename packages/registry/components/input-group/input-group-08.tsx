"use client";

import { type ComponentProps, useId, useState } from "react";
import { ArrowUpDownIcon, SearchIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

// Labels sit inside the border in a block-start addon, so each group reads
// as one tall tap target. Useful on dense search and mobile forms.
function InsetField({
  id,
  label,
  className,
  ...props
}: ComponentProps<typeof InputGroupInput> & {
  id: string;
  label: string;
}) {
  return (
    <InputGroup className={className}>
      <InputGroupAddon align="block-start" className="pb-0">
        <label
          htmlFor={id}
          className="text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
      </InputGroupAddon>
      <InputGroupInput id={id} className="h-8 pt-0" {...props} />
    </InputGroup>
  );
}

export default function InputGroup08() {
  const id = useId();
  const [from, setFrom] = useState("San Francisco (SFO)");
  const [to, setTo] = useState("Lisbon (LIS)");
  const [depart, setDepart] = useState("Thu, Oct 15");
  const [returning, setReturning] = useState("");
  const [status, setStatus] = useState<{ error: boolean; text: string } | null>(
    null,
  );

  function search() {
    if (!from.trim() || !to.trim()) {
      setStatus({ error: true, text: "Add both an origin and a destination." });
      return;
    }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      setStatus({ error: true, text: "Origin and destination can't match." });
      return;
    }
    const dates = [depart.trim() || "any date", returning.trim() || "one way"];
    setStatus({
      error: false,
      text: `Searching ${from.trim()} to ${to.trim()} · ${dates.join(" · ")}`,
    });
  }

  return (
    <form
      aria-label="Search flights"
      className="flex w-full max-w-sm flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        search();
      }}
    >
      <div className="relative flex flex-col gap-3">
        <InsetField
          id={`${id}-from`}
          label="From"
          value={from}
          placeholder="City or airport"
          className="pr-10"
          onChange={(event) => {
            setFrom(event.target.value);
            setStatus(null);
          }}
        />
        <InsetField
          id={`${id}-to`}
          label="To"
          value={to}
          placeholder="City or airport"
          className="pr-10"
          onChange={(event) => {
            setTo(event.target.value);
            setStatus(null);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          aria-label="Swap origin and destination"
          className="absolute inset-y-0 right-3 my-auto rounded-full bg-background dark:bg-background"
          onClick={() => {
            setFrom(to);
            setTo(from);
            setStatus(null);
          }}
        >
          <ArrowUpDownIcon aria-hidden="true" />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <InsetField
          id={`${id}-depart`}
          label="Depart"
          value={depart}
          onChange={(event) => {
            setDepart(event.target.value);
            setStatus(null);
          }}
        />
        <InsetField
          id={`${id}-return`}
          label="Return"
          value={returning}
          placeholder="One way"
          onChange={(event) => {
            setReturning(event.target.value);
            setStatus(null);
          }}
        />
      </div>
      <Button type="submit" size="lg" className="mt-1 w-full">
        <SearchIcon aria-hidden="true" />
        Search flights
      </Button>
      <p
        role="status"
        className={
          status?.error
            ? "min-h-5 text-center text-sm text-destructive"
            : "min-h-5 text-center text-sm text-muted-foreground"
        }
      >
        {status?.text}
      </p>
    </form>
  );
}
