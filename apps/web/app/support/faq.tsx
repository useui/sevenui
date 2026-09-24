import Link from "next/link";
import type { ReactNode } from "react";

/** The /support FAQ. Its own module so the ⌘K search index can list the questions without duplicating them. */
export const ISSUES_URL = "https://github.com/useui/sevenui/issues";

export const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "How do I install SevenUI?",
    a: (
      <>
        With the shadcn CLI, in a project that already runs it with Tailwind CSS v4:{" "}
        <code>npx shadcn@latest add @sevenui/button</code>. The <code>@sevenui</code> namespace is in the shadcn
        registry index, so no extra configuration is needed. See <Link href="/docs/installation">Installation</Link>.
      </>
    ),
  },
  {
    q: "How do I set up my Pro license key?",
    a: (
      <>
        Put it in your environment as <code>SEVENUI_PRO_KEY</code>, add an <code>Authorization</code> header for the{" "}
        <code>@sevenui</code> registry in <code>components.json</code>, then install any Block by name, e.g.{" "}
        <code>npx shadcn@latest add @sevenui/pro/dashboard-01</code>. The <Link href="/pro#setup">setup steps</Link>{" "}
        have the exact snippet to copy.
      </>
    ),
  },
  {
    q: "Where do I find my license key?",
    a: (
      <>
        Sign in to <Link href="/account">your account</Link> with the email you paid with and copy it from there.
        It's also in the receipt email from Polar.
      </>
    ),
  },
  {
    q: "Installing a Pro Block fails with 401 or 403. What now?",
    a: (
      <>
        A <strong>401</strong> means no key reached the registry: check that <code>SEVENUI_PRO_KEY</code> is set in
        the shell or environment where you run the CLI, and that <code>components.json</code> sends the header. A{" "}
        <strong>403</strong> means the key was rejected — it was mistyped, or it's been revoked (for example after a
        refund). Copy it again from <Link href="/account">your account</Link>; if it still fails, email us.
      </>
    ),
  },
  {
    q: "I got a 429 “Rate limit exceeded” error.",
    a: "Each license key can install up to 100 Blocks per minute. The error tells you how many seconds to wait; after that, installs work again. Normal use rarely gets close — if you hit it without scripting installs, let us know.",
  },
  {
    q: "Can I get a refund?",
    a: (
      <>
        Yes, within 14 days of purchase, for any reason: email us from your account's address, or ask Polar directly.
        One exception: if you requested a Block and it was added to the catalog, the purchase is no longer
        refundable. See section 5 of the <Link href="/terms">Terms</Link>.
      </>
    ),
  },
  {
    q: "Can my whole team use one license?",
    a: (
      <>
        No — a license covers one developer, so a team buys one per developer working with the Pro source. Team
        licenses are on the <Link href="/roadmap">roadmap</Link>. More in the <Link href="/pro#faq">Pro FAQ</Link>.
      </>
    ),
  },
  {
    q: "How do I request a new Block?",
    a: (
      <>
        Pro license holders can email a request from the address they paid with. See{" "}
        <Link href="/block-request">Block Request</Link> for what to include.
      </>
    ),
  },
  {
    q: "Where do I report a bug?",
    a: (
      <>
        Bugs in the free primitives and components go to{" "}
        <a href={ISSUES_URL} rel="noopener noreferrer" target="_blank">
          GitHub issues
        </a>
        . For Pro Blocks, email us with the Block name and what you saw. Found a security issue? Email us before
        disclosing it.
      </>
    ),
  },
];
