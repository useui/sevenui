import {
  Field,
  FieldDescription,
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
      </Field>
    </div>
  );
}
