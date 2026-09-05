import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Signup02() {
  return (
    <div className="grid min-h-[640px] w-full bg-background lg:grid-cols-2">
      <div className="hidden flex-col justify-between border-r border-border bg-muted p-10 lg:flex">
        <div className="text-lg font-semibold tracking-tight">SevenUI</div>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>54 accessible components, one dependency.</li>
          <li>Copy-paste source you own outright.</li>
          <li>Drop-in compatible with shadcn themes.</li>
        </ul>
      </div>
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free while in beta. Upgrade whenever you are ready.
          </p>
          <div className="mt-8 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>First name</FieldLabel>
                <Input placeholder="Ada" />
              </Field>
              <Field>
                <FieldLabel>Last name</FieldLabel>
                <Input placeholder="Lovelace" />
              </Field>
            </div>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="you@example.com" />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="••••••••" />
            </Field>
            <div className="flex items-start gap-2">
              <Checkbox id="signup-02-updates" className="mt-0.5" />
              <Label htmlFor="signup-02-updates" className="font-normal text-muted-foreground">
                Email me product updates. You can unsubscribe anytime.
              </Label>
            </div>
            <Button className="w-full">Create account</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
