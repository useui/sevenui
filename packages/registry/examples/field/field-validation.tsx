import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";

export default function FieldValidation() {
  return (
    <div className="w-full max-w-sm">
      <Field
        name="username"
        validationMode="onBlur"
        validate={(value) =>
          String(value ?? "").length >= 3
            ? null
            : "Username must be at least 3 characters."
        }
      >
        <FieldLabel>Username</FieldLabel>
        <Input required placeholder="sevenui" />
        <FieldDescription>
          Validates when the input loses focus.
        </FieldDescription>
        <FieldError />
      </Field>
    </div>
  );
}
