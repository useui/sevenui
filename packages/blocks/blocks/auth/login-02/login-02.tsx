import { Button } from "@/registry/base/ui/button";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Login02() {
  return (
    <div className="grid min-h-[640px] w-full bg-background lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to continue to your dashboard.
          </p>
          <div className="mt-8 grid gap-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input type="email" placeholder="you@example.com" />
            </Field>
            <Field>
              <FieldLabel>Password</FieldLabel>
              <Input type="password" placeholder="••••••••" />
            </Field>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="login-02-remember" />
                <Label htmlFor="login-02-remember">Remember me</Label>
              </div>
              <a
                href="#"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Button className="w-full">Sign in</Button>
            <Button variant="outline" className="w-full">
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden flex-col justify-between border-l border-border bg-muted p-10 lg:flex">
        <div className="text-lg font-semibold tracking-tight">SevenUI</div>
        <blockquote className="space-y-2">
          <p className="text-lg leading-relaxed">
            &ldquo;The fastest way we have found to ship polished, accessible
            interfaces without owning a component library.&rdquo;
          </p>
          <footer className="text-sm text-muted-foreground">
            Sofia Davis, Engineering Lead
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
