"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/registry/base/ui/input-otp";

export default function InputOTPDemo() {
  const [value, setValue] = useState("");

  return (
    <div className="w-full max-w-sm">
      <InputOTP
        length={6}
        value={value}
        onValueChange={(newValue: string) => setValue(newValue)}
      >
        <InputOTPGroup>
          {Array.from({ length: 3 }).map((_, index) => (
            <InputOTPSlot
              key={index}
              aria-label={
                index === 0
                  ? undefined
                  : `Digit ${index + 1} of 6`
              }
            />
          ))}
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          {Array.from({ length: 3 }).map((_, index) => {
            const globalIndex = 3 + index;
            return (
              <InputOTPSlot
                key={index}
                aria-label={
                  globalIndex === 0
                    ? undefined
                    : `Digit ${globalIndex + 1} of 6`
                }
              />
            );
          })}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
