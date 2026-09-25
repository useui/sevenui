"use client";

import { Badge } from "@/registry/base/ui/badge";
import { Spinner } from "@/registry/base/ui/spinner";

const services = [
  {
    name: "api-gateway",
    region: "eu-central-1",
    status: "Deploying",
    variant: "default" as const,
  },
  {
    name: "billing-worker",
    region: "us-east-1",
    status: "Syncing",
    variant: "secondary" as const,
  },
  {
    name: "search-indexer",
    region: "ap-south-1",
    status: "Provisioning",
    variant: "outline" as const,
  },
  {
    name: "email-relay",
    region: "us-west-2",
    status: "Rolling back",
    variant: "destructive" as const,
  },
];

export default function Spinner04() {
  return (
    <ul className="w-full max-w-sm divide-y divide-border rounded-xl border border-border bg-card">
      {services.map((service) => (
        <li
          key={service.name}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-sm">{service.name}</span>
            <span className="text-xs text-muted-foreground">
              {service.region}
            </span>
          </div>
          <Badge variant={service.variant}>
            <Spinner
              aria-label={`${service.name}: ${service.status}`}
              data-icon="inline-start"
            />
            {service.status}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
