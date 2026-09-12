import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from "@/registry/base/ui/number-field";

export default function NumberFieldQuantity() {
  return (
    <div className="flex items-center gap-3">
      <Label htmlFor="number-field-quantity">Quantity</Label>
      <NumberField id="number-field-quantity" defaultValue={2} min={1} max={99}>
        <NumberFieldGroup className="w-28">
          <NumberFieldDecrement />
          <NumberFieldInput className="text-center" />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </div>
  );
}
