"use client";

import { Button } from "@/registry/base/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/registry/base/ui/drawer";

const steps = [
  "Pick a base color for your theme.",
  "Adjust the radius and contrast to taste.",
  "Export the generated CSS variables.",
];

export default function DrawerSnapPoints() {
  return (
    <Drawer snapPoints={[0.5, 1]} showSwipeHandle>
      <DrawerTrigger
        render={<Button variant="outline">Open with snap points</Button>}
      />
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Theme setup</DrawerTitle>
            <DrawerDescription>
              Drag the handle — the drawer rests at half height, then full.
            </DrawerDescription>
          </DrawerHeader>
          <ol className="flex flex-col gap-3 p-4 text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-2">
                <span className="font-medium text-foreground">
                  {index + 1}.
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
