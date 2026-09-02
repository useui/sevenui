import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

export default function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="comfortable">
      <div className="flex items-center">
        <Label>
          <RadioGroupItem value="default" />
          Default
        </Label>
      </div>
      <div className="flex items-center">
        <Label>
          <RadioGroupItem value="comfortable" />
          Comfortable
        </Label>
      </div>
      <div className="flex items-center">
        <Label>
          <RadioGroupItem value="compact" />
          Compact
        </Label>
      </div>
    </RadioGroup>
  );
}
