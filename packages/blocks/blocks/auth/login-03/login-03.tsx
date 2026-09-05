import { Button } from "@/registry/base/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/registry/base/ui/input-otp";

export default function Login03() {
  return (
    <div className="flex min-h-[560px] w-full items-center justify-center bg-background p-6">
      <div className="w-full max-w-xs text-center">
        <h1 className="text-xl font-semibold tracking-tight">Sign in with a code</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We will email you a six-digit one-time code.
        </p>
        <div className="mt-8 grid gap-4 text-left">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <FieldLabel>One-time code</FieldLabel>
            <InputOTP length={6}>
              <InputOTPGroup className="w-full justify-between">
                <InputOTPSlot />
                <InputOTPSlot />
                <InputOTPSlot />
                <InputOTPSlot />
                <InputOTPSlot />
                <InputOTPSlot />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>Paste or type the code from your inbox.</FieldDescription>
          </Field>
          <Button className="w-full">Continue</Button>
        </div>
      </div>
    </div>
  );
}
