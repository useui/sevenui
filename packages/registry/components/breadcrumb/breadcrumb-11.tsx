"use client";

import { ChevronDown } from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

type Endpoint = {
  name: string;
  method: "GET" | "POST" | "DELETE";
  path: string;
  summary: string;
};
type Resource = { name: string; slug: string; endpoints: Endpoint[] };
type Section = { name: string; slug: string; resources: Resource[] };

const sections: Section[] = [
  {
    name: "Payments",
    slug: "payments",
    resources: [
      {
        name: "Refunds",
        slug: "refunds",
        endpoints: [
          {
            name: "Create a refund",
            method: "POST",
            path: "/v1/refunds",
            summary:
              "Refunds all or part of a captured charge to the original card.",
          },
          {
            name: "List refunds",
            method: "GET",
            path: "/v1/refunds",
            summary: "Returns refunds newest first, 25 per page.",
          },
          {
            name: "Cancel a refund",
            method: "POST",
            path: "/v1/refunds/:id/cancel",
            summary:
              "Cancels a refund that is still pending with the card network.",
          },
        ],
      },
      {
        name: "Disputes",
        slug: "disputes",
        endpoints: [
          {
            name: "Submit evidence",
            method: "POST",
            path: "/v1/disputes/:id/evidence",
            summary:
              "Attaches receipts and shipping proof before the deadline.",
          },
          {
            name: "Close a dispute",
            method: "POST",
            path: "/v1/disputes/:id/close",
            summary: "Accepts the chargeback and stops the dispute process.",
          },
        ],
      },
    ],
  },
  {
    name: "Customers",
    slug: "customers",
    resources: [
      {
        name: "Customers",
        slug: "customers",
        endpoints: [
          {
            name: "Retrieve a customer",
            method: "GET",
            path: "/v1/customers/:id",
            summary: "Returns a customer with their default payment method.",
          },
          {
            name: "Delete a customer",
            method: "DELETE",
            path: "/v1/customers/:id",
            summary:
              "Permanently removes a customer and cancels their subscriptions.",
          },
        ],
      },
    ],
  },
  {
    name: "Webhooks",
    slug: "webhooks",
    resources: [
      {
        name: "Endpoints",
        slug: "endpoints",
        endpoints: [
          {
            name: "Create an endpoint",
            method: "POST",
            path: "/v1/webhook_endpoints",
            summary: "Registers a URL that receives signed event payloads.",
          },
        ],
      },
    ],
  },
];

const linkClassName =
  "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

function LevelMenu({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Pages in ${label}`}
        className="flex size-6 items-center justify-center rounded-md outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-popup-open:bg-muted data-popup-open:text-foreground"
      >
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={(next) => onChange(next as string)}
          >
            {options.map((option) => (
              <DropdownMenuRadioItem
                key={option}
                value={option}
                closeOnClick
              >
                {option}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Breadcrumb11() {
  const [sectionName, setSectionName] = React.useState("Payments");
  const [resourceName, setResourceName] = React.useState("Refunds");
  const [endpointName, setEndpointName] = React.useState("Create a refund");

  const section =
    sections.find((item) => item.name === sectionName) ?? sections[0];
  const resource =
    section.resources.find((item) => item.name === resourceName) ??
    section.resources[0];
  const endpoint =
    resource.endpoints.find((item) => item.name === endpointName) ??
    resource.endpoints[0];

  const openSection = (name: string) => {
    const next = sections.find((item) => item.name === name) ?? sections[0];
    setSectionName(next.name);
    setResourceName(next.resources[0].name);
    setEndpointName(next.resources[0].endpoints[0].name);
  };

  const openResource = (name: string) => {
    const next =
      section.resources.find((item) => item.name === name) ??
      section.resources[0];
    setResourceName(next.name);
    setEndpointName(next.endpoints[0].name);
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Breadcrumb aria-label="API reference path">
        <BreadcrumbList className="gap-1">
          <BreadcrumbItem className="gap-0.5">
            <BreadcrumbLink href="#api-reference" className={linkClassName}>
              API reference
            </BreadcrumbLink>
            <LevelMenu
              label="API reference"
              value={section.name}
              options={sections.map((item) => item.name)}
              onChange={openSection}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem className="gap-0.5">
            <BreadcrumbLink
              href={`#${section.slug}`}
              className={linkClassName}
            >
              {section.name}
            </BreadcrumbLink>
            <LevelMenu
              label={section.name}
              value={resource.name}
              options={section.resources.map((item) => item.name)}
              onChange={openResource}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem className="gap-0.5">
            <BreadcrumbLink
              href={`#${section.slug}-${resource.slug}`}
              className={linkClassName}
            >
              {resource.name}
            </BreadcrumbLink>
            <LevelMenu
              label={resource.name}
              value={endpoint.name}
              options={resource.endpoints.map((item) => item.name)}
              onChange={setEndpointName}
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator>/</BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-medium">
              {endpoint.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <h2 className="text-lg font-semibold tracking-tight text-balance">
          {endpoint.name}
        </h2>
        <div className="flex min-w-0 items-center gap-2">
          <Badge
            variant={endpoint.method === "DELETE" ? "destructive" : "secondary"}
            className="font-mono"
          >
            {endpoint.method}
          </Badge>
          <code className="truncate font-mono text-sm">{endpoint.path}</code>
        </div>
        <p className="text-sm text-muted-foreground">{endpoint.summary}</p>
      </div>
    </div>
  );
}
