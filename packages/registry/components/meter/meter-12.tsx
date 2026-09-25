"use client";

import { RotateCw } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const WINDOW_SECONDS = 60;

const environments = [
  {
    value: "production",
    label: "Production",
    key: "sk_live_…8f2c",
    limits: [
      { endpoint: "POST /v1/charges", used: 472, limit: 500 },
      { endpoint: "GET /v1/customers", used: 1180, limit: 2000 },
      { endpoint: "POST /v1/webhooks/test", used: 20, limit: 20 },
    ],
  },
  {
    value: "staging",
    label: "Staging",
    key: "sk_test_…41ad",
    limits: [
      { endpoint: "POST /v1/charges", used: 38, limit: 100 },
      { endpoint: "GET /v1/customers", used: 212, limit: 500 },
      { endpoint: "POST /v1/webhooks/test", used: 4, limit: 20 },
    ],
  },
];

const numberFormat = new Intl.NumberFormat("en-US");

function statusFor(ratio: number) {
  if (ratio >= 1) {
    return {
      badge: <Badge variant="destructive">Throttled</Badge>,
      className:
        "[&>div:last-of-type]:bg-destructive/15 [&>div:last-of-type>div]:bg-destructive",
    };
  }
  if (ratio >= 0.8) {
    return {
      badge: <Badge variant="outline">Near limit</Badge>,
      className:
        "[&>div:last-of-type]:bg-warning/20 [&>div:last-of-type>div]:bg-warning",
    };
  }
  return { badge: null, className: "" };
}

export default function Meter12() {
  const [secondsLeft, setSecondsLeft] = React.useState(42);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((current) => (current <= 1 ? WINDOW_SECONDS : current - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section
      aria-labelledby="meter-12-title"
      className="w-full max-w-md rounded-xl border bg-card p-4 text-card-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="meter-12-title" className="font-medium">
          Rate limits
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          <RotateCw aria-hidden="true" className="size-3.5" />
          Window resets in {secondsLeft}s
        </p>
      </div>

      <Tabs defaultValue="production" className="mt-3">
        <TabsList className="w-full">
          {environments.map((environment) => (
            <TabsTrigger
              key={environment.value}
              value={environment.value}
              className="flex-1"
            >
              {environment.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {environments.map((environment) => (
          <TabsContent
            key={environment.value}
            value={environment.value}
            className="grid gap-4 pt-2"
          >
            <p className="text-xs text-muted-foreground">
              Requests per minute for key{" "}
              <code className="whitespace-nowrap rounded bg-muted px-1 py-0.5 font-mono text-foreground">
                {environment.key}
              </code>
            </p>
            {environment.limits.map((item) => {
              const status = statusFor(item.used / item.limit);
              return (
                <Meter
                  key={item.endpoint}
                  value={item.used}
                  max={item.limit}
                  getAriaValueText={() =>
                    `${numberFormat.format(item.used)} of ${numberFormat.format(item.limit)} requests this minute`
                  }
                  className={`grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 ${status.className}`}
                >
                  <MeterLabel className="flex min-w-0 items-center gap-2 font-mono text-xs font-normal">
                    <span className="truncate">{item.endpoint}</span>
                    {status.badge}
                  </MeterLabel>
                  <MeterValue className="text-xs tabular-nums">
                    {() =>
                      `${numberFormat.format(item.used)} / ${numberFormat.format(item.limit)}`
                    }
                  </MeterValue>
                </Meter>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Throttled requests return{" "}
              <code className="font-mono text-foreground">429</code> with a{" "}
              <code className="font-mono text-foreground">Retry-After</code>{" "}
              header.
            </p>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
