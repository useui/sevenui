"use client";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";
import { LabSection } from "../lab-frame";

function Otp(props: Omit<React.ComponentProps<typeof InputOTP>, "length" | "children">) {
  return (
    <InputOTP length={6} {...props}>
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot />
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTPGroup>
    </InputOTP>
  );
}

export default function InputOTPMatrix() {
  return (
    <div>
      <LabSection title="empty (click or tab in to see the active slot)">
        <Otp aria-label="Empty code" />
      </LabSection>
      <LabSection title="partly filled">
        <Otp aria-label="Partial code" defaultValue="123" />
      </LabSection>
      <LabSection title="complete">
        <Otp aria-label="Complete code" defaultValue="123456" />
      </LabSection>
      <LabSection title="disabled">
        <Otp aria-label="Disabled code" defaultValue="12" disabled />
      </LabSection>
      <LabSection title="invalid (aria-invalid on the slots)">
        <InputOTP length={4} aria-label="Invalid code" defaultValue="12">
          <InputOTPGroup>
            <InputOTPSlot aria-invalid />
            <InputOTPSlot aria-invalid />
            <InputOTPSlot aria-invalid />
            <InputOTPSlot aria-invalid />
          </InputOTPGroup>
        </InputOTP>
      </LabSection>
    </div>
  );
}
