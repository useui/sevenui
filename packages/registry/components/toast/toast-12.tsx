"use client";

import * as React from "react";
import { Loader2Icon, SendIcon, WebhookIcon } from "lucide-react";

import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  createToastManager,
  useToastManager,
} from "@/registry/base/ui/toast";

type DeliveryData = {
  status: number;
  latency: number;
  event: string;
};

const toastManager = createToastManager<DeliveryData>();

const endpoints = [
  {
    id: "orders",
    url: "https://api.northwind.dev/hooks/orders",
    event: "order.paid",
    status: 200,
    latency: 184,
  },
  {
    id: "fulfillment",
    url: "https://ship.northwind.dev/v2/events",
    event: "shipment.created",
    status: 202,
    latency: 412,
  },
  {
    id: "legacy-crm",
    url: "https://crm-legacy.northwind.dev/webhook",
    event: "customer.updated",
    status: 410,
    latency: 96,
  },
];

function DeliveryToasts() {
  const { toasts } = useToastManager<DeliveryData>();

  return toasts.map((toastItem) => {
    const data = toastItem.data;
    const failed = toastItem.type === "error";

    return (
      <Toast key={toastItem.id} toast={toastItem}>
        <ToastContent className="items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex items-center gap-2">
              {toastItem.type === "loading" ? (
                <Loader2Icon
                  className="size-4 shrink-0 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              ) : null}
              {data ? (
                <Badge
                  variant={failed ? "destructive" : "secondary"}
                  className="font-mono tabular-nums"
                >
                  {data.status}
                </Badge>
              ) : null}
              <ToastTitle className="truncate" />
            </div>
            <ToastDescription className="text-xs" />
            {data ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-xs">
                <dt className="text-muted-foreground">Event</dt>
                <dd className="truncate font-mono">{data.event}</dd>
                <dt className="text-muted-foreground">Latency</dt>
                <dd className="font-mono tabular-nums">{data.latency} ms</dd>
              </dl>
            ) : null}
            {toastItem.actionProps ? (
              <ToastAction
                className="w-fit"
                onClick={() => toastManager.close(toastItem.id)}
              />
            ) : null}
          </div>
          <ToastClose className="-mt-1 -mr-1" />
        </ToastContent>
      </Toast>
    );
  });
}

export default function Toast12() {
  const [pending, setPending] = React.useState<string | null>(null);
  const [disabled, setDisabled] = React.useState<string[]>([]);

  async function sendTest(endpoint: (typeof endpoints)[number]) {
    setPending(endpoint.id);
    const host = new URL(endpoint.url).host;

    try {
      await toastManager.promise(
        new Promise<(typeof endpoints)[number]>((resolve, reject) => {
          setTimeout(() => {
            if (endpoint.status >= 400) {
              reject(endpoint);
            } else {
              resolve(endpoint);
            }
          }, endpoint.latency + 600);
        }),
        {
          loading: {
            title: `Sending ${endpoint.event}`,
            description: `POST to ${host}`,
          },
          success: (result) => ({
            title: "Test event delivered",
            description: `${host} acknowledged the payload.`,
            data: {
              status: result.status,
              latency: result.latency,
              event: result.event,
            },
          }),
          error: (result: (typeof endpoints)[number]) => ({
            title: "Endpoint rejected the event",
            description: `${host} returned ${result.status}. Deliveries will keep failing until it's fixed.`,
            priority: "high",
            timeout: 0,
            data: {
              status: result.status,
              latency: result.latency,
              event: result.event,
            },
            actionProps: {
              children: "Disable endpoint",
              onClick: () =>
                setDisabled((current) => [...current, result.id]),
            },
          }),
        },
      );
    } catch {
      // The toast already reports the failure.
    } finally {
      setPending(null);
    }
  }

  return (
    <ToastProvider toastManager={toastManager}>
      <ToastPortal>
        <ToastViewport>
          <DeliveryToasts />
        </ToastViewport>
      </ToastPortal>
      <section
        aria-labelledby="toast-12-heading"
        className="w-full max-w-lg overflow-hidden rounded-xl border bg-card text-card-foreground"
      >
        <header className="flex items-start gap-3 border-b px-4 py-3">
          <WebhookIcon
            className="mt-0.5 size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5">
            <h3 id="toast-12-heading" className="text-sm font-medium">
              Webhook endpoints
            </h3>
            <p className="text-xs text-muted-foreground">
              Send a signed test event to confirm an endpoint is reachable.
            </p>
          </div>
        </header>
        <ul className="divide-y divide-border">
          {endpoints.map((endpoint) => {
            const isDisabled = disabled.includes(endpoint.id);
            return (
              <li
                key={endpoint.id}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={
                      isDisabled
                        ? "truncate font-mono text-xs text-muted-foreground line-through"
                        : "truncate font-mono text-xs"
                    }
                  >
                    {endpoint.url}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isDisabled ? "Disabled · no events sent" : endpoint.event}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending !== null || isDisabled}
                  aria-label={`Send test event to ${endpoint.url}`}
                  onClick={() => sendTest(endpoint)}
                >
                  {pending === endpoint.id ? (
                    <Loader2Icon className="animate-spin" aria-hidden="true" />
                  ) : (
                    <SendIcon aria-hidden="true" />
                  )}
                  Test
                </Button>
              </li>
            );
          })}
        </ul>
      </section>
    </ToastProvider>
  );
}
