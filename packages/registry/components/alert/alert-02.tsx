"use client";

import { CloudIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";

const densities = [
  {
    label: "Compact",
    className: "gap-0 px-2 py-1.5 text-xs",
    iconClassName: "size-3.5",
    titleClassName: "text-xs",
    descriptionClassName: "text-xs",
  },
  {
    label: "Default",
    className: "",
    iconClassName: "size-4",
    titleClassName: "",
    descriptionClassName: "",
  },
  {
    label: "Comfortable",
    className: "gap-1 px-4 py-3.5 has-[>svg]:gap-x-3",
    iconClassName: "size-5",
    titleClassName: "text-base",
    descriptionClassName: "",
  },
];

export default function Alert02() {
  return (
    <div className="grid w-full max-w-md gap-5">
      {densities.map((density) => (
        <div key={density.label} className="grid gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            {density.label}
          </span>
          <Alert role="status" className={density.className}>
            <CloudIcon aria-hidden="true" className={density.iconClassName} />
            <AlertTitle className={density.titleClassName}>
              Sync paused on this device
            </AlertTitle>
            <AlertDescription className={density.descriptionClassName}>
              Changes are saved locally and upload once you are back online.
            </AlertDescription>
          </Alert>
        </div>
      ))}
    </div>
  );
}
