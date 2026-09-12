import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

export default function RadioGroupInvalid() {
  return (
    <div className="flex flex-col gap-2">
      <RadioGroup aria-invalid="true" aria-describedby="radio-group-error">
        <Label>
          <RadioGroupItem value="monthly" aria-invalid="true" />
          Monthly billing
        </Label>
        <Label>
          <RadioGroupItem value="yearly" aria-invalid="true" />
          Yearly billing
        </Label>
      </RadioGroup>
      <p id="radio-group-error" className="text-sm text-destructive">
        Select a billing period to continue.
      </p>
    </div>
  );
}
