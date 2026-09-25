import Link from "next/link";
import type { ReactNode } from "react";
import { PRO_LAUNCH, PRO_REGULAR } from "../../lib/pro-pricing";

/** The /pro FAQ. Its own module so the ⌘K search index can list the questions without duplicating them. */
export const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "What exactly am I buying today?",
    a: "A lifetime license to the Pro catalog: everything listed on this page is live now, and new Blocks reach your key as they ship. We don't promise a date or a particular Block — if you need one that isn't here yet, wait for it, or use the refund window.",
  },
  {
    q: `Why ${PRO_LAUNCH} instead of ${PRO_REGULAR}?`,
    a: `${PRO_LAUNCH} is the launch price; the regular price is ${PRO_REGULAR}. What you pay at checkout is all you ever pay — when the launch price ends, the regular price applies only to new purchases.`
  },
  {
    q: "Is this a subscription?",
    a: "No. One payment, a license that doesn't expire, and no renewal to cancel.",
  },
  {
    q: "How many people can use one license?",
    a: "One developer. If three people on your team work with the Pro source, that's three licenses. People who only use the finished app need nothing.",
  },
  {
    q: "Can I use Pro Blocks in client work?",
    a: "Yes — including projects you build for a client and hand over to them. What you can't do is sell or publish the Pro source itself as a product.",
  },
  {
    q: "Where is my license key?",
    a: (
      <>
        It's issued right after checkout. Sign in to{" "}
        <Link className="text-foreground underline underline-offset-4" href="/account">
          your account
        </Link>{" "}
        with the email you paid with and copy it from there. It's also in the receipt email from Polar.
      </>
    ),
  },
  {
    q: "How do refunds work?",
    a: (
      <>
        Within 14 days of purchase, for any reason: email{" "}
        <a className="text-foreground underline underline-offset-4" href="mailto:mail@sevenui.dev">
          mail@sevenui.dev
        </a>{" "}
        from your account's address, or ask Polar directly. The money goes back to your original payment method and the
        key is revoked.
      </>
    ),
  },
  {
    q: "Can I request a Block that isn't in the catalog?",
    a: (
      <>
        Yes — license holders can email a request from the address they paid with. See{" "}
        <Link className="text-foreground underline underline-offset-4" href="/block-request">
          Block Request
        </Link>{" "}
        for what to include.
      </>
    ),
  },
  {
    q: "Who handles payment and tax?",
    a: "Polar is the merchant of record. They process the payment, apply sales tax or VAT where it's due, and issue your invoice. We never see your card details.",
  },
  {
    q: "Do the free tiers change if I don't buy?",
    a: "No. The Primitives and Components stay free and MIT licensed. Pro Blocks are license-gated items in the same @sevenui registry.",
  },
];
