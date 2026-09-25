"use client";

import {
  Ban,
  Copy,
  ExternalLink,
  PackageCheck,
  Printer,
  ReceiptText,
} from "lucide-react";
import * as React from "react";

import { Badge } from "@/registry/base/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/base/ui/context-menu";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

// macOS browsers never turn Shift+F10 into a contextmenu event (Windows and
// Linux do), so the shortcut the hint advertises is forwarded by hand there.
function openMenuWithShiftF10(event: React.KeyboardEvent<HTMLElement>) {
  if (event.key !== "F10" || !event.shiftKey) return;
  if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) return;
  event.preventDefault();
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.left + 8,
      clientY: rect.top + 8,
    }),
  );
}

type Fulfillment = "unfulfilled" | "packed" | "shipped";
type Payment = "paid" | "refunded" | "partially refunded" | "canceled";

type Order = {
  id: string;
  customer: string;
  items: number;
  total: number;
  shipping: number;
  fulfillment: Fulfillment;
  payment: Payment;
};

const fulfillmentLabel: Record<Fulfillment, string> = {
  unfulfilled: "Unfulfilled",
  packed: "Packed",
  shipped: "Shipped",
};

const initialOrders: Order[] = [
  {
    id: "SO-10482",
    customer: "Hannah Okafor",
    items: 3,
    total: 128.5,
    shipping: 8.5,
    fulfillment: "unfulfilled",
    payment: "paid",
  },
  {
    id: "SO-10481",
    customer: "Kenji Sato",
    items: 1,
    total: 64,
    shipping: 6,
    fulfillment: "packed",
    payment: "paid",
  },
  {
    id: "SO-10479",
    customer: "Lucía Fernández",
    items: 5,
    total: 242.9,
    shipping: 0,
    fulfillment: "shipped",
    payment: "paid",
  },
];

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ContextMenu13() {
  const [orders, setOrders] = React.useState(initialOrders);
  const [status, setStatus] = React.useState("");

  function patch(id: string, next: Partial<Order>) {
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, ...next } : order)),
    );
  }

  return (
    <div className="w-full max-w-xl rounded-xl border bg-card text-card-foreground">
      <Table>
        <TableCaption className="mb-3 px-4 text-left text-xs">
          <span aria-live="polite">
            {status ||
              "Right-click an order for fulfillment and refund actions."}
          </span>
        </TableCaption>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Order</TableHead>
            <TableHead className="hidden sm:table-cell">Customer</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="pr-4 text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const closed =
              order.payment === "refunded" || order.payment === "canceled";
            const statusBadge = closed ? (
              <Badge variant="destructive" className="capitalize">
                {order.payment}
              </Badge>
            ) : (
              <Badge
                variant={
                  order.fulfillment === "shipped"
                    ? "secondary"
                    : "outline"
                }
              >
                {order.fulfillment === "shipped" ? (
                  <PackageCheck aria-hidden="true" />
                ) : null}
                {fulfillmentLabel[order.fulfillment]}
              </Badge>
            );
            return (
              <ContextMenu key={order.id}>
                <ContextMenuTrigger
                  onKeyDown={openMenuWithShiftF10}
                  render={<TableRow />}
                  tabIndex={0}
                  aria-label={`Order ${order.id} from ${order.customer}, ${fulfillmentLabel[order.fulfillment]}, ${order.payment}, ${currency.format(order.total)}`}
                  className="outline-none focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset data-popup-open:bg-muted"
                >
                  <TableCell className="pl-4">
                    <span className="font-medium tabular-nums">{order.id}</span>
                    <span className="block text-xs text-muted-foreground sm:hidden">
                      {order.customer}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.customer}
                    <span className="block text-xs text-muted-foreground">
                      {order.items} {order.items === 1 ? "item" : "items"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {statusBadge}
                  </TableCell>
                  <TableCell className="pr-4 text-right tabular-nums">
                    <span
                      className={
                        closed ? "text-muted-foreground line-through" : ""
                      }
                    >
                      {currency.format(order.total)}
                    </span>
                    <span className="mt-1 flex justify-end sm:hidden">
                      {statusBadge}
                    </span>
                    {order.payment === "partially refunded" ? (
                      <span className="block text-xs text-muted-foreground">
                        −{currency.format(order.shipping)} shipping
                      </span>
                    ) : null}
                  </TableCell>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-60">
                  <ContextMenuItem
                    onClick={() => setStatus(`Opened order ${order.id}.`)}
                  >
                    <ExternalLink aria-hidden="true" />
                    View order
                    <ContextMenuShortcut>↵</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuItem
                    onClick={() => {
                      void navigator.clipboard
                        ?.writeText(order.id)
                        .catch(() => {});
                      setStatus(`Copied ${order.id} to clipboard.`);
                    }}
                  >
                    <Copy aria-hidden="true" />
                    Copy order number
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuGroup>
                    <ContextMenuLabel>Fulfillment</ContextMenuLabel>
                    <ContextMenuRadioGroup
                      value={order.fulfillment}
                      onValueChange={(value) => {
                        patch(order.id, { fulfillment: value as Fulfillment });
                        setStatus(
                          `${order.id} marked as ${fulfillmentLabel[value as Fulfillment].toLowerCase()}.`,
                        );
                      }}
                    >
                      {(Object.keys(fulfillmentLabel) as Fulfillment[]).map(
                        (key) => (
                          <ContextMenuRadioItem
                            key={key}
                            value={key}
                            disabled={closed}
                          >
                            {fulfillmentLabel[key]}
                          </ContextMenuRadioItem>
                        ),
                      )}
                    </ContextMenuRadioGroup>
                  </ContextMenuGroup>
                  <ContextMenuItem
                    disabled={closed}
                    onClick={() =>
                      setStatus(`Packing slip for ${order.id} sent to printer.`)
                    }
                  >
                    <Printer aria-hidden="true" />
                    Print packing slip
                    <ContextMenuShortcut>⌘P</ContextMenuShortcut>
                  </ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuSub>
                    <ContextMenuSubTrigger disabled={order.payment !== "paid"}>
                      <ReceiptText aria-hidden="true" />
                      Refund
                    </ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-56">
                      <ContextMenuItem
                        onClick={() => {
                          patch(order.id, { payment: "refunded" });
                          setStatus(
                            `Refunded ${currency.format(order.total)} to ${order.customer}.`,
                          );
                        }}
                      >
                        Full refund
                        <ContextMenuShortcut className="tracking-normal">
                          {currency.format(order.total)}
                        </ContextMenuShortcut>
                      </ContextMenuItem>
                      <ContextMenuItem
                        disabled={order.shipping === 0}
                        onClick={() => {
                          patch(order.id, { payment: "partially refunded" });
                          setStatus(
                            `Refunded ${currency.format(order.shipping)} shipping on ${order.id}.`,
                          );
                        }}
                      >
                        Shipping only
                        <ContextMenuShortcut className="tracking-normal">
                          {order.shipping === 0
                            ? "Free"
                            : currency.format(order.shipping)}
                        </ContextMenuShortcut>
                      </ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuItem
                    variant="destructive"
                    disabled={order.fulfillment === "shipped" || closed}
                    onClick={() => {
                      patch(order.id, { payment: "canceled" });
                      setStatus(`${order.id} canceled and restocked.`);
                    }}
                  >
                    <Ban aria-hidden="true" />
                    Cancel order
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
