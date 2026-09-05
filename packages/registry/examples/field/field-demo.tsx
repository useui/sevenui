import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

export default function FieldDemo() {
  return (
    <div className="w-full max-w-sm">
      <Field name="email">
        <FieldLabel>Email</FieldLabel>
        <Input required type="email" placeholder="name@example.com" />
        <FieldDescription>Used to send you order updates.</FieldDescription>
        <FieldError match="valueMissing">Please enter your email</FieldError>
        <FieldError match="typeMismatch">Not a valid email</FieldError>
      </Field>
    </div>
  );
}
