"use client";

import {
  LayerCard,
  LayerCardDescription,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";
import { RadioGroup, RadioGroupItem } from "@/registry/base/ui/radio-group";

const plans = [
  { value: "hobby", name: "Hobby", price: "$0", note: "For personal projects." },
  { value: "pro", name: "Pro", price: "$20", note: "For growing teams." },
  { value: "team", name: "Team", price: "$60", note: "For organizations." },
];

export default function LayerCard04() {
  return (
    <LayerCard className="w-full max-w-sm">
      <LayerCardHeader>
        <LayerCardTitle>Choose a plan</LayerCardTitle>
        <LayerCardDescription>You can change it at any time.</LayerCardDescription>
      </LayerCardHeader>
      <RadioGroup defaultValue="pro" aria-label="Plan" className="gap-1">
        {plans.map((plan) => (
          <LayerCardPanel
            key={plan.value}
            render={<label />}
            className="flex cursor-pointer items-center gap-3 has-data-checked:border-primary has-data-checked:ring-2 has-data-checked:ring-primary/20"
          >
            <RadioGroupItem value={plan.value} />
            <div className="grid flex-1 gap-0.5">
              <span className="font-medium">{plan.name}</span>
              <span className="text-xs text-muted-foreground">{plan.note}</span>
            </div>
            <span className="tabular-nums">
              {plan.price}
              <span className="text-xs text-muted-foreground">/mo</span>
            </span>
          </LayerCardPanel>
        ))}
      </RadioGroup>
    </LayerCard>
  );
}
