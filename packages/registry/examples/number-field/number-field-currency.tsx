import { Label } from "@/registry/base/ui/label";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "@/registry/base/ui/number-field";

export default function NumberFieldCurrency() {
  return (
    <NumberField
      defaultValue={1500}
      min={0}
      step={100}
      largeStep={1000}
      format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
    >
      <NumberFieldScrubArea>
        <Label>Monthly budget</Label>
      </NumberFieldScrubArea>
      <NumberFieldGroup>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  );
}
