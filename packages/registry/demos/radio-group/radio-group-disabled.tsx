import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

export default function RadioGroupDisabled() {
  return (
    <RadioGroup defaultValue="standard">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="standard" id="radio-standard" />
        <Label htmlFor="radio-standard">Standard shipping</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="express" id="radio-express" />
        <Label htmlFor="radio-express">Express shipping</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="overnight" id="radio-overnight" disabled />
        <Label htmlFor="radio-overnight">Overnight (unavailable)</Label>
      </div>
    </RadioGroup>
  );
}
