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
import { Field, FieldDescription, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Signup01() {
  return (
    <div className="flex min-h-[640px] w-full items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Start your 14-day free trial. No card required.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Field>
            <FieldLabel>Full name</FieldLabel>
            <Input placeholder="Ada Lovelace" />
          </Field>
          <Field>
            <FieldLabel>Email</FieldLabel>
            <Input type="email" placeholder="you@example.com" />
          </Field>
          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input type="password" placeholder="At least 8 characters" />
            <FieldDescription>Use 8+ characters with a mix of letters and numbers.</FieldDescription>
          </Field>
          <div className="flex items-start gap-2">
            <Checkbox id="signup-01-terms" className="mt-0.5" />
            <Label htmlFor="signup-01-terms" className="font-normal text-muted-foreground">
              I agree to the Terms of Service and Privacy Policy.
            </Label>
          </div>
        </CardContent>
        <CardFooter className="grid gap-3">
          <Button className="w-full">Create account</Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="#" className="text-foreground underline-offset-4 hover:underline">
              Sign in
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
