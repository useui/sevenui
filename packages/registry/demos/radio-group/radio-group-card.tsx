import { Label } from "@/registry/base/ui/label";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const plans = [
  { value: "starter", label: "Starter", description: "For side projects", price: "$0" },
  { value: "pro", label: "Pro", description: "For growing teams", price: "$12" },
  { value: "team", label: "Team", description: "For organizations", price: "$32" },
];

export default function RadioGroupCard() {
  return (
    <RadioGroup defaultValue="pro" className="w-full max-w-sm gap-2">
      {plans.map((plan) => (
        <Label
          key={plan.value}
          className="cursor-pointer items-start rounded-lg border border-input px-3 py-2.5 has-data-checked:border-primary/40 has-data-checked:bg-muted hover:bg-muted/50"
        >
          <RadioGroupItem value={plan.value} className="mt-0.5" />
          <div className="flex flex-1 flex-col gap-0.5">
            <span>{plan.label}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {plan.description}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">{plan.price}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}
