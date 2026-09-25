"use client";

import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { useId, useState } from "react";

import { Button } from "@/registry/base/ui/button";
import { Label } from "@/registry/base/ui/label";
import { Textarea } from "@/registry/base/ui/textarea";

const MIN_LENGTH = 30;

export default function Textarea04() {
  const id = useId();
  const [value, setValue] = useState("Upgraded by mistake");
  const [touched, setTouched] = useState(true);

  const length = value.trim().length;
  const isValid = length >= MIN_LENGTH;
  const showError = touched && !isValid;
  const showSuccess = touched && isValid;

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-2"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
      }}
    >
      <Label htmlFor={`${id}-reason`}>Reason for refund</Label>
      <Textarea
        id={`${id}-reason`}
        value={value}
        required
        minLength={MIN_LENGTH}
        aria-invalid={showError || undefined}
        aria-describedby={`${id}-status`}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => setTouched(true)}
        className={
          showSuccess
            ? "border-success focus-visible:border-success focus-visible:ring-success/25"
            : undefined
        }
      />
      <p
        id={`${id}-status`}
        aria-live="polite"
        className={
          showError
            ? "flex items-start gap-1.5 text-sm text-destructive"
            : showSuccess
              ? "flex items-start gap-1.5 text-sm text-success"
              : "text-sm text-muted-foreground"
        }
      >
        {showError ? (
          <>
            <CircleAlertIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Add {MIN_LENGTH - length} more characters so billing can locate the
            charge. Include the date and last four card digits.
          </>
        ) : showSuccess ? (
          <>
            <CircleCheckIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            Looks good. Billing replies within one business day.
          </>
        ) : (
          `At least ${MIN_LENGTH} characters.`
        )}
      </p>
      <Button type="submit" className="mt-2 self-end">
        Request refund
      </Button>
    </form>
  );
}
