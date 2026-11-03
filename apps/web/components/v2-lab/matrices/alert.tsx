"use client";

import { CircleAlertIcon, InfoIcon } from "lucide-react";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { LabSection } from "../lab-frame";

const VARIANTS = ["default", "destructive"] as const;

export default function AlertMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => {
        const Icon = variant === "destructive" ? CircleAlertIcon : InfoIcon;
        return (
          <LabSection key={variant} title={`variant=${variant}`}>
            <Alert variant={variant} className="max-w-sm">
              <Icon />
              <AlertTitle>Payment failed</AlertTitle>
              <AlertDescription>
                Your card was declined. <a href="#billing">Update billing</a>.
              </AlertDescription>
            </Alert>
            <Alert variant={variant} className="max-w-sm">
              <AlertTitle>Title only, no icon</AlertTitle>
            </Alert>
            <Alert variant={variant} className="max-w-sm">
              <Icon />
              <AlertTitle>Update available</AlertTitle>
              <AlertDescription>Version 2.0 is ready to install.</AlertDescription>
              <AlertAction>
                <Button size="xs" variant="outline">
                  Install
                </Button>
              </AlertAction>
            </Alert>
          </LabSection>
        );
      })}
    </div>
  );
}
