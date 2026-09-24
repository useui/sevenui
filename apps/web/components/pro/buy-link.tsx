"use client";

import { useEffect, useRef, useState } from "react";
import { getClerkIfLikelySignedIn } from "../../lib/clerk";
import { Spinner } from "@/registry/base/ui/spinner";
import { cx } from "../../lib/cx";

/**
 * The Polar checkout link, enhanced with the signed-in email when a session
 * hint exists. Only the primary instance carries id="pro-buy".
 */
export function BuyLink({
  checkoutUrl,
  primary = true,
  className,
}: {
  checkoutUrl: string;
  primary?: boolean;
  className?: string;
}) {
  const [href, setHref] = useState(checkoutUrl);
  const [opening, setOpening] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const pending = getClerkIfLikelySignedIn();
    if (!pending) return; // no hint: nothing to enhance, the plain link stays

    (async () => {
      try {
        const clerk = await pending;
        const email = clerk.user?.primaryEmailAddress?.emailAddress;
        if (!email || !mountedRef.current) return;
        const url = new URL(checkoutUrl);
        url.searchParams.set("customer_email", email);
        url.searchParams.set("reference_id", clerk.user!.id);
        setHref(url.toString());
      } catch (e) {
        console.error("pro:", e);
      }
    })();
  }, [checkoutUrl]);

  // Back/forward cache restores the page as it was left; clear the pending look.
  useEffect(() => {
    const reset = () => setOpening(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  return (
    <a
      aria-busy={opening || undefined}
      className={cx(
        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className,
      )}
      href={href}
      id={primary ? "pro-buy" : undefined}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        setOpening(true);
      }}
    >
      {opening ? <Spinner aria-hidden className="size-4" /> : null}
      {opening ? "Opening checkout…" : "Get Pro — $99"}
    </a>
  );
}
