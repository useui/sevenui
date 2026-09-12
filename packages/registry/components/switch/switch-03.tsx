"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const consents = [
  {
    id: "switch-03-analytics",
    label: "Usage analytics",
    description: "Help us improve the product with anonymous usage data.",
    defaultChecked: true,
  },
  {
    id: "switch-03-cookies",
    label: "Marketing cookies",
    description: "Allow cookies that personalize ads across sites.",
    defaultChecked: false,
  },
];

export default function Switch03() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Privacy consent</CardTitle>
        <CardDescription>Control how your data is used.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {consents.map((consent) => (
          <div key={consent.id} className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor={consent.id}>{consent.label}</Label>
              <span className="text-xs text-muted-foreground">{consent.description}</span>
            </div>
            <Switch id={consent.id} defaultChecked={consent.defaultChecked} />
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-end">
        <Button size="sm">Save preferences</Button>
      </CardFooter>
    </Card>
  );
}
