"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const settings = [
  {
    id: "card-02-comments",
    label: "Comments",
    description: "Get notified when someone replies to your thread.",
    defaultChecked: true,
  },
  {
    id: "card-02-mentions",
    label: "Mentions",
    description: "Get notified when someone mentions you.",
    defaultChecked: true,
  },
  {
    id: "card-02-newsletter",
    label: "Product newsletter",
    description: "Occasional emails about new features and updates.",
    defaultChecked: false,
  },
];

export default function Card02() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Notification settings</CardTitle>
        <CardDescription>Choose what you want to be notified about.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={setting.id}>{setting.label}</Label>
              <span className="text-xs text-muted-foreground">
                {setting.description}
              </span>
            </div>
            <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
