"use client";

import { useEffect, useRef, useState } from "react";
import { getClerkIfLikelySignedIn } from "../../lib/clerk";

export function BuyLink({ checkoutUrl }: { checkoutUrl: string }) {
  const [href, setHref] = useState(checkoutUrl);

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

  return (
    <a
      className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      href={href}
      id="pro-buy"
    >
      Pre-order — $99
    </a>
  );
}
