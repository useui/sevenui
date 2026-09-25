"use client";

import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

const LENGTH = 6;
const positions = [1, 2, 3, 4, 5, 6];

const styles = [
  {
    name: "segmented",
    label: "Segmented",
    hint: "Joined cells read as one control.",
    group: "",
    slot: "",
  },
  {
    name: "detached",
    label: "Detached",
    hint: "Separate boxes give each digit room to breathe.",
    group: "gap-2",
    slot: "rounded-lg border first:rounded-lg last:rounded-lg",
  },
  {
    name: "soft",
    label: "Soft",
    hint: "Muted fills without borders for quiet surfaces.",
    group: "gap-2",
    slot: "rounded-lg border border-transparent bg-muted first:rounded-lg last:rounded-lg dark:bg-muted",
  },
  {
    name: "underline",
    label: "Underline",
    hint: "A single stroke per digit, like a paper form.",
    group: "gap-3",
    slot: "rounded-none border-0 border-b-2 bg-transparent first:rounded-none first:border-l-0 last:rounded-none focus:ring-0 dark:bg-transparent",
  },
];

export default function InputOtp02() {
  return (
    <div className="flex w-full max-w-xs flex-col gap-6">
      {styles.map((style) => (
        <Field key={style.name} name={`code-${style.name}`}>
          <FieldLabel>{style.label}</FieldLabel>
          <InputOTP length={LENGTH} defaultValue="4829">
            <InputOTPGroup className={style.group}>
              {positions.map((position) => (
                <InputOTPSlot
                  key={position}
                  aria-label={position === 1 ? undefined : `Digit ${position} of ${LENGTH}`}
                  className={style.slot}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription>{style.hint}</FieldDescription>
        </Field>
      ))}
    </div>
  );
}
