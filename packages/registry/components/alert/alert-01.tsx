"use client";

import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/registry/base/ui/alert";

export default function Alert01() {
  return (
    <div className="grid w-full max-w-md gap-3">
      <Alert role="status" className="border-chart-2/30 bg-chart-2/5">
        <InfoIcon aria-hidden="true" className="text-chart-2!" />
        <AlertTitle>Scheduled maintenance on Sunday</AlertTitle>
        <AlertDescription>
          The dashboard will be read-only from 02:00 to 03:30 UTC.
        </AlertDescription>
      </Alert>
      <Alert role="status" className="border-success/30 bg-success/5">
        <CircleCheckIcon aria-hidden="true" className="text-success!" />
        <AlertTitle>Domain verified</AlertTitle>
        <AlertDescription>
          acme.com is now sending mail with DKIM and SPF records.
        </AlertDescription>
      </Alert>
      <Alert className="border-warning/40 bg-warning/5">
        <TriangleAlertIcon aria-hidden="true" className="text-warning!" />
        <AlertTitle>You have used 92% of your storage</AlertTitle>
        <AlertDescription>
          Uploads will pause at 100 GB. Archive old projects or upgrade.
        </AlertDescription>
      </Alert>
      <Alert
        variant="destructive"
        className="border-destructive/30 bg-destructive/5"
      >
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>
          Your card ending in 4242 was declined. Update it to keep your plan.
        </AlertDescription>
      </Alert>
    </div>
  );
}
