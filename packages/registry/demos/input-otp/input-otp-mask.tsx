"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { Label } from "@/registry/base/ui/label";

export default function InputOTPMask() {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="input-otp-mask">Verification PIN</Label>
      <InputOTP id="input-otp-mask" length={4} mask defaultValue="1234">
        <InputOTPGroup>
          {Array.from({ length: 4 }).map((_, index) => (
            <InputOTPSlot
              key={index}
              aria-label={`PIN digit ${index + 1} of 4`}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}
