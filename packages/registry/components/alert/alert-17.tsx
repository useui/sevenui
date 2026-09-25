"use client";

import * as React from "react";
import { ActivityIcon, BellRingIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Badge } from "@/registry/base/ui/badge";
import { Label } from "@/registry/base/ui/label";
import { Switch } from "@/registry/base/ui/switch";

const services = [
  { name: "API", latency: "84 ms", status: "Operational" },
  { name: "Webhooks", latency: "2.4 s", status: "Degraded" },
  { name: "Dashboard", latency: "120 ms", status: "Operational" },
];

const updates = [
  {
    time: "14:52 UTC",
    stage: "Monitoring",
    body: "A fix is deployed. Queued webhooks are draining; backlog is at 12%.",
  },
  {
    time: "14:31 UTC",
    stage: "Identified",
    body: "A saturated queue worker in eu-west-1 is delaying deliveries.",
  },
  {
    time: "14:10 UTC",
    stage: "Investigating",
    body: "We are seeing delayed webhook deliveries for some accounts.",
  },
];

export default function Alert17() {
  const [subscribed, setSubscribed] = React.useState(false);

  return (
    <section
      aria-labelledby="alert-17-heading"
      className="grid w-full max-w-md gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id="alert-17-heading" className="font-medium">
          System status
        </h3>
        <span className="text-xs text-muted-foreground">Updated 1 min ago</span>
      </div>
      <Alert className="border-warning/40 bg-warning/10">
        <ActivityIcon aria-hidden="true" className="text-warning!" />
        <AlertTitle>Webhook deliveries are delayed</AlertTitle>
        <AlertDescription className="text-foreground/80">
          Events are not lost; they arrive late while the queue recovers. API
          requests are unaffected.
        </AlertDescription>
        <ol className="col-start-2 mt-3 grid gap-3 border-l pl-3">
          {updates.map((update, index) => (
            <li key={update.time} className="grid gap-0.5 text-xs">
              <span className="flex flex-wrap items-center gap-x-2">
                <span
                  className={
                    index === 0 ? "font-medium text-foreground" : "font-medium"
                  }
                >
                  {update.stage}
                </span>
                <time className="text-muted-foreground tabular-nums">
                  {update.time}
                </time>
              </span>
              <span className="text-muted-foreground">{update.body}</span>
            </li>
          ))}
        </ol>
      </Alert>
      <ul className="divide-y rounded-lg border">
        {services.map((service) => (
          <li
            key={service.name}
            className="flex items-center gap-3 px-3 py-2 text-sm"
          >
            <span className="min-w-0 flex-1 truncate font-medium">{service.name}</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {service.latency}
            </span>
            <Badge variant={service.status === "Degraded" ? "outline" : "secondary"}>
              {service.status}
            </Badge>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="alert-17-subscribe" className="flex items-center gap-2 font-normal">
          <BellRingIcon aria-hidden="true" className="size-4 text-muted-foreground" />
          Email me when this is resolved
        </Label>
        <Switch
          id="alert-17-subscribe"
          checked={subscribed}
          onCheckedChange={setSubscribed}
        />
      </div>
    </section>
  );
}
