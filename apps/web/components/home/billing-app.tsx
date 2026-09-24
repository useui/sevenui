"use client";

import {
  ChevronDownIcon,
  CreditCardIcon,
  DownloadIcon,
  FolderIcon,
  HomeIcon,
  InfoIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/base/ui/breadcrumb";
import { Button } from "@/registry/base/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/base/ui/card";
import { Checkbox } from "@/registry/base/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Input } from "@/registry/base/ui/input";
import { Kbd } from "@/registry/base/ui/kbd";
import { Meter, MeterLabel, MeterValue } from "@/registry/base/ui/meter";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/base/ui/select";
import { Separator } from "@/registry/base/ui/separator";
import { Slider } from "@/registry/base/ui/slider";
import { Switch } from "@/registry/base/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/base/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";
import { Toaster, toast } from "@/registry/base/ui/toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/base/ui/tooltip";
import { InspectFrame, Part } from "./inspect";
import type { PartInfo } from "./registry-data";

const NAV = [
  { label: "Overview", icon: HomeIcon },
  { label: "Projects", icon: FolderIcon },
  { label: "Members", icon: UsersIcon },
  { label: "Billing", icon: CreditCardIcon, current: true },
  { label: "Settings", icon: SettingsIcon },
];

type Invoice = { id: string; date: string; amount: string; status: "Paid" | "Open" | "Refunded" };

const INVOICES: Invoice[] = [
  { id: "INV-0931", date: "Sep 1, 2026", amount: "$134.20", status: "Open" },
  { id: "INV-0874", date: "Aug 1, 2026", amount: "$120.00", status: "Paid" },
  { id: "INV-0812", date: "Jul 1, 2026", amount: "$128.60", status: "Paid" },
  { id: "INV-0755", date: "Jun 1, 2026", amount: "$120.00", status: "Paid" },
  { id: "INV-0703", date: "May 1, 2026", amount: "$96.00", status: "Refunded" },
];

const CURRENCIES = [
  { value: "usd", label: "USD — US dollar" },
  { value: "eur", label: "EUR — Euro" },
  { value: "gbp", label: "GBP — Pound sterling" },
];

export function BillingApp({ parts }: { parts: PartInfo[] }) {
  const [cap, setCap] = React.useState(400);
  const emailId = React.useId();
  const vatId = React.useId();
  const mailId = React.useId();

  return (
    <TooltipProvider>
      <InspectFrame address="app.acme.com/settings/billing" initialSelected="meter" parts={parts}>
        <div className="grid grid-cols-1 text-sm lg:grid-cols-[13.5rem_minmax(0,1fr)]">
          <aside className="hidden flex-col gap-5 border-e border-border bg-muted/30 p-3 pt-4 lg:flex">
            <div className="flex items-center gap-2.5 px-2">
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-md bg-foreground text-xs font-semibold text-background"
              >
                N
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium">Acme</span>
                <span className="block text-xs text-muted-foreground">Team workspace</span>
              </span>
            </div>
            <Part name="kbd" side="end">
              <button
                className="flex h-8 w-full items-center gap-2 rounded-lg border border-border bg-background px-2.5 text-muted-foreground transition-colors hover:text-foreground"
                type="button"
              >
                <SearchIcon aria-hidden="true" className="size-3.5" />
                Search
                <Kbd className="ms-auto">⌘K</Kbd>
              </button>
            </Part>
            <nav aria-label="Acme" className="grid grid-cols-1 gap-0.5">
              {NAV.map((item) => (
                <Button
                  aria-current={item.current ? "page" : undefined}
                  className="justify-start font-normal text-muted-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
                  key={item.label}
                  variant="ghost"
                >
                  <item.icon aria-hidden="true" />
                  {item.label}
                </Button>
              ))}
            </nav>
            <div className="mt-auto flex items-center gap-2.5 rounded-lg px-2 py-1.5">
              <Part className="rounded-full" name="avatar">
                <Avatar>
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
              </Part>
              <span className="min-w-0">
                <span className="block truncate font-medium">Maya Russo</span>
                <span className="block truncate text-xs text-muted-foreground">maya@acme.com</span>
              </span>
            </div>
          </aside>

          <div className="min-w-0 px-4 pt-7 pb-6 sm:px-6 lg:px-8 lg:pt-8">
            <Part className="w-fit" name="breadcrumb">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="#billing-demo">Settings</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Billing</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </Part>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-x-6 gap-y-8">
              <div className="min-w-0">
                <p className="text-xl font-semibold tracking-tight">Billing</p>
                <p className="mt-1 text-muted-foreground">Plan, payment details and invoices for Acme.</p>
              </div>
              <div className="flex items-center gap-2">
                <Part name="dropdown-menu">
                  <DropdownMenu>
                    <DropdownMenuTrigger render={<Button variant="outline" />}>
                      Export
                      <ChevronDownIcon aria-hidden="true" data-icon="inline-end" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Invoices as CSV</DropdownMenuItem>
                      <DropdownMenuItem>Invoices as PDF</DropdownMenuItem>
                      <DropdownMenuItem>Usage report</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Part>
                <Part name="button" side="end">
                  <Button onClick={() => toast.add({ title: "Billing settings saved", type: "success" })}>
                    Save changes
                  </Button>
                </Part>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
              <Part className="rounded-xl" name="card">
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>Team plan</CardTitle>
                      <Part name="badge" side="end">
                        <Badge variant="secondary">Monthly</Badge>
                      </Part>
                    </div>
                    <CardDescription>
                      <span className="text-foreground tabular-nums">$12</span> per seat a month. Next invoice on Oct 1.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 gap-6 pt-3">
                    <Part name="meter" side="end">
                      <Meter max={10} value={8}>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <MeterLabel>Seats</MeterLabel>
                            <Part className="rounded-md" name="tooltip">
                              <Tooltip>
                                <TooltipTrigger
                                  aria-label="How seats are billed"
                                  className="flex size-5 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                                >
                                  <InfoIcon aria-hidden="true" className="size-3.5" />
                                </TooltipTrigger>
                                <TooltipContent>Every invited member takes a seat, active or not.</TooltipContent>
                              </Tooltip>
                            </Part>
                          </span>
                          <MeterValue className="tabular-nums">{() => "8 of 10 used"}</MeterValue>
                        </div>
                      </Meter>
                    </Part>
                    <Part name="separator" side="end">
                      <Separator />
                    </Part>
                    <Part name="slider">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium" id="billing-cap-label">
                            Usage cap
                          </span>
                          <span className="text-muted-foreground tabular-nums">${cap} a month</span>
                        </div>
                        <Slider
                          aria-labelledby="billing-cap-label"
                          max={1000}
                          min={100}
                          onValueChange={(value) => setCap(Array.isArray(value) ? value[0] : value)}
                          step={50}
                          value={[cap]}
                        />
                        <p className="text-xs text-muted-foreground">
                          Builds pause when usage charges reach the cap. You get an email at 80%.
                        </p>
                      </div>
                    </Part>
                  </CardContent>
                  <CardFooter className="mt-auto justify-between gap-3 border-t">
                    <span className="text-xs text-muted-foreground">Visa ending 4242 · expires 08/28</span>
                    <Button size="sm" variant="outline">
                      Change plan
                    </Button>
                  </CardFooter>
                </Card>
              </Part>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Billing details</CardTitle>
                  <CardDescription>Shown on every invoice we send you.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 gap-2">
                    <label className="font-medium" htmlFor={emailId}>
                      Billing email
                    </label>
                    <Part name="input" side="end">
                      <Input defaultValue="finance@acme.com" id={emailId} type="email" />
                    </Part>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <span className="font-medium" id="billing-currency-label">
                      Currency
                    </span>
                    <Part name="select" side="end">
                      <Select defaultValue="usd" items={CURRENCIES}>
                        <SelectTrigger aria-labelledby="billing-currency-label" className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Part>
                  </div>
                  <div className="flex items-start gap-3">
                    <Part className="mt-0.5 rounded-[4px]" name="checkbox">
                      <Checkbox defaultChecked id={vatId} />
                    </Part>
                    <label className="leading-snug" htmlFor={vatId}>
                      Print VAT number <span className="text-muted-foreground tabular-nums">DE 318 442 907</span>
                    </label>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <label className="leading-snug" htmlFor={mailId}>
                      Email each invoice to the billing contact
                    </label>
                    <Part className="mt-0.5 rounded-full" name="switch" side="end">
                      <Switch defaultChecked id={mailId} />
                    </Part>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-9">
              <Part className="rounded-lg" name="tabs">
                <Tabs defaultValue="invoices">
                  <TabsList>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>
                  <TabsContent className="pt-5" value="invoices">
                    <Part name="table">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead className="max-sm:hidden">Date</TableHead>
                            <TableHead className="text-end">Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-10">
                              <span className="sr-only">Download</span>
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {INVOICES.map((invoice) => (
                            <TableRow key={invoice.id}>
                              <TableCell className="font-medium tabular-nums">{invoice.id}</TableCell>
                              <TableCell className="text-muted-foreground tabular-nums max-sm:hidden">
                                {invoice.date}
                              </TableCell>
                              <TableCell className="text-end tabular-nums">{invoice.amount}</TableCell>
                              <TableCell>
                                <Badge
                                  className={invoice.status === "Refunded" ? "text-muted-foreground" : undefined}
                                  variant={invoice.status === "Paid" ? "secondary" : "outline"}
                                >
                                  {invoice.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button aria-label={`Download ${invoice.id}`} size="icon-sm" variant="ghost">
                                  <DownloadIcon aria-hidden="true" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Part>
                  </TabsContent>
                  <TabsContent className="grid grid-cols-1 gap-6 pt-5 sm:grid-cols-2" value="usage">
                    <Meter max={10000} value={6240}>
                      <div className="flex items-center justify-between">
                        <MeterLabel>Build minutes</MeterLabel>
                        <MeterValue className="tabular-nums">{() => "6,240 of 10,000"}</MeterValue>
                      </div>
                    </Meter>
                    <Meter max={50} value={38}>
                      <div className="flex items-center justify-between">
                        <MeterLabel>Storage</MeterLabel>
                        <MeterValue className="tabular-nums">{() => "38 of 50 GB"}</MeterValue>
                      </div>
                    </Meter>
                  </TabsContent>
                </Tabs>
              </Part>
            </div>
          </div>
        </div>
      </InspectFrame>
      <Toaster />
    </TooltipProvider>
  );
}
