"use client";

import {
  LayerCard,
  LayerCardDescription,
  LayerCardHeader,
  LayerCardPanel,
  LayerCardTitle,
} from "@/registry/base/ui/layer-card";
import { Switch } from "@/registry/base/ui/switch";

const settings = [
  {
    id: "email-digests",
    title: "Email digests",
    description: "A weekly summary of activity in your projects.",
    enabled: true,
  },
  {
    id: "push-alerts",
    title: "Push alerts",
    description: "Failed deployments and security notices.",
    enabled: true,
  },
  {
    id: "product-updates",
    title: "Product updates",
    description: "New features and changes, once a month.",
    enabled: false,
  },
];

export default function LayerCard06() {
  return (
    <LayerCard stacked size="sm" className="w-full max-w-md">
      <LayerCardHeader>
        <LayerCardTitle>Notifications</LayerCardTitle>
        <LayerCardDescription>Choose what reaches your inbox.</LayerCardDescription>
      </LayerCardHeader>
      {settings.map((setting) => (
        <LayerCardPanel key={setting.id} className="flex items-center gap-4">
          <div className="grid flex-1 gap-0.5">
            <label htmlFor={setting.id} className="font-medium">
              {setting.title}
            </label>
            <span className="text-xs text-muted-foreground">{setting.description}</span>
          </div>
          <Switch id={setting.id} defaultChecked={setting.enabled} />
        </LayerCardPanel>
      ))}
    </LayerCard>
  );
}
