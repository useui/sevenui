"use client";

import {
  ArrowUpRightIcon,
  BellIcon,
  ChevronRightIcon,
  CreditCardIcon,
  UserRoundIcon,
} from "lucide-react";

import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/base/ui/item";

const links = [
  {
    icon: UserRoundIcon,
    title: "Profile",
    description: "Name, photo, and public handle",
    href: "#profile",
  },
  {
    icon: BellIcon,
    title: "Notifications",
    description: "Email digests and mobile push",
    href: "#notifications",
  },
  {
    icon: CreditCardIcon,
    title: "Billing",
    description: "Plan, invoices, and payment method",
    href: "#billing",
  },
];

export default function Item06() {
  return (
    <nav aria-label="Account settings" className="w-full max-w-sm">
      <ul className="flex w-full flex-col overflow-hidden rounded-xl border bg-card">
        {links.map(({ icon: Icon, title, description, href }) => (
          <li key={title}>
            <Item
              className="rounded-none focus-visible:ring-inset"
              render={<a href={href} />}
            >
              <ItemMedia variant="icon" className="text-muted-foreground">
                <Icon aria-hidden="true" />
              </ItemMedia>
              <ItemContent className="gap-0.5">
                <ItemTitle>{title}</ItemTitle>
                <ItemDescription>{description}</ItemDescription>
              </ItemContent>
              <ChevronRightIcon
                aria-hidden="true"
                className="size-4 text-muted-foreground transition-transform group-hover/item:translate-x-0.5 motion-reduce:transition-none"
              />
            </Item>
          </li>
        ))}
        <li>
          <ItemSeparator className="my-0" />
          <Item
            size="sm"
            className="rounded-none text-muted-foreground focus-visible:ring-inset"
            render={<a href="#changelog" />}
          >
            <ItemContent>
              <ItemTitle className="font-normal">What&apos;s new</ItemTitle>
            </ItemContent>
            <ArrowUpRightIcon
              aria-hidden="true"
              className="size-4 transition-transform group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5 motion-reduce:transition-none"
            />
          </Item>
        </li>
      </ul>
    </nav>
  );
}
