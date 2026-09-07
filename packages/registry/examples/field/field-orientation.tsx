import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Switch } from "@/registry/base/ui/switch";

export default function FieldOrientation() {
  return (
    <FieldGroup className="max-w-md">
      <Field orientation="horizontal" name="marketing">
        <FieldContent>
          <FieldLabel>Marketing emails</FieldLabel>
          <FieldDescription>Occasional product news. No spam.</FieldDescription>
        </FieldContent>
        <Switch />
      </Field>
      <Field orientation="responsive" name="displayName">
        <FieldContent>
          <FieldLabel>Display name</FieldLabel>
          <FieldDescription>
            Stacks on narrow containers, inline on wide ones.
          </FieldDescription>
        </FieldContent>
        <Input placeholder="Margaret Hamilton" />
      </Field>
    </FieldGroup>
  );
}
