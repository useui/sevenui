---
title: Table
description: Displays data in rows and columns with semantic HTML and support for headers, bodies, and footers.
---

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/base/ui/table";

const invoices = [
  {
    invoice: "INV-001",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
    paymentMethod: "Credit Card",
  },
  {
    invoice: "INV-002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "Bank Transfer",
  },
  {
    invoice: "INV-003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "PayPal",
  },
];

export default function TableDemo() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$750.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
```

## Installation

<InstallCommand item="table" />

## Usage

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV-001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">$750.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>;
```

## API reference

### Table

Extends the native `<table>` element, wrapped in an overflow container
(`data-slot="table-container"`) so wide tables scroll horizontally
instead of breaking the page.

### TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption

Extend their semantic HTML counterparts (`thead`, `tbody`, `tfoot`,
`tr`, `th`, `td`, `caption`) — no props beyond them. Rows highlight on
hover and style themselves via `data-state="selected"` or an expanded
child; cells with a leading checkbox drop their right padding
automatically.
