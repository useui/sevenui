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
    id: "card-notify-comments",
    label: "Comments",
    description: "When someone replies to your thread",
    defaultChecked: true,
  },
  {
    id: "card-notify-mentions",
    label: "Mentions",
    description: "When someone mentions you",
    defaultChecked: true,
  },
  {
    id: "card-notify-digest",
    label: "Weekly digest",
    description: "Summary of activity every Monday",
    defaultChecked: false,
  },
];

export default function CardNotifications() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>Choose what you want to hear about.</CardDescription>
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
