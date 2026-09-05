import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Checkbox } from "@/registry/base/ui/checkbox";
import { Field, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Login01() {
  return (
    <div className="flex min-h-[560px] w-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your email and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel>Password</FieldLabel>
              <a
                href="#"
                className="text-sm text-muted-foreground underline-offset-4 hover:underline"
              >
                Forgot password?
              </a>
            </div>
            <Input type="password" placeholder="••••••••" />
          </Field>
          <div className="flex items-center gap-2">
            <Checkbox id="login-01-remember" />
            <Label htmlFor="login-01-remember">Remember me</Label>
          </div>
        </CardContent>
        <CardFooter className="grid gap-3">
          <Button className="w-full">Sign in</Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <a href="#" className="text-foreground underline-offset-4 hover:underline">
              Sign up
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
