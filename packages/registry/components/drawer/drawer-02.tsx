"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";
import { Label } from "@/registry/base/ui/label";
import { Separator } from "@/registry/base/ui/separator";
import { Switch } from "@/registry/base/ui/switch";

type Preference = {
  id: string;
  label: string;
  description: string;
};

const groups: { title: string; items: Preference[] }[] = [
  {
    title: "Activity",
    items: [
      {
        id: "mentions",
        label: "Mentions",
        description: "When someone @mentions you in a comment.",
      },
      {
        id: "assignments",
        label: "Assignments",
        description: "When an issue is assigned to you.",
      },
    ],
  },
  {
    title: "Digest",
    items: [
      {
        id: "weekly",
        label: "Weekly summary",
        description: "Every Monday at 9:00, in your time zone.",
      },
      {
        id: "product",
        label: "Product updates",
        description: "New features and changes, about twice a month.",
      },
    ],
  },
];

export default function Drawer02() {
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({
    mentions: true,
    assignments: true,
    weekly: false,
    product: false,
  });

  return (
    <Drawer swipeDirection="right">
      <DrawerTrigger
        render={<Button variant="outline">Notification settings</Button>}
      />
      <DrawerContent>
        <DrawerHeader className="flex-row items-start justify-between gap-4 border-b pb-4">
          <div className="flex flex-col gap-1">
            <DrawerTitle>Notifications</DrawerTitle>
            <DrawerDescription>
              Choose what reaches your inbox.
            </DrawerDescription>
          </div>
          <DrawerClose
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Close" />
            }
          >
            <X aria-hidden="true" />
          </DrawerClose>
        </DrawerHeader>
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
          {groups.map((group, index) => (
            <section
              key={group.title}
              aria-labelledby={`drawer-02-${group.title}`}
              className="flex flex-col gap-4"
            >
              {index > 0 && <Separator className="-mt-2" />}
              <h3
                id={`drawer-02-${group.title}`}
                className="text-xs font-medium text-muted-foreground"
              >
                {group.title}
              </h3>
              {group.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="flex flex-1 flex-col gap-1">
                    <Label htmlFor={`drawer-02-${item.id}`}>{item.label}</Label>
                    <p
                      id={`drawer-02-${item.id}-hint`}
                      className="text-xs text-muted-foreground"
                    >
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    id={`drawer-02-${item.id}`}
                    aria-describedby={`drawer-02-${item.id}-hint`}
                    checked={enabled[item.id]}
                    onCheckedChange={(checked) =>
                      setEnabled((prev) => ({ ...prev, [item.id]: checked }))
                    }
                  />
                </div>
              ))}
            </section>
          ))}
        </div>
        <DrawerFooter className="border-t pt-4">
          <DrawerClose render={<Button>Save preferences</Button>} />
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
