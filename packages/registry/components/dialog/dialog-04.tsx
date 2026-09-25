"use client";

import * as React from "react";

import { Button } from "@/registry/base/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";

const sections = [
  {
    heading: "1. Acceptance of terms",
    body: "By creating an account or using any part of the service, you agree to be bound by these terms. If you do not agree, you may not access or use the service.",
  },
  {
    heading: "2. Use of the service",
    body: "You may use the service only for lawful purposes and in accordance with these terms. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
  },
  {
    heading: "3. Subscription and billing",
    body: "Paid plans renew automatically at the end of each billing cycle unless cancelled beforehand. Fees are non-refundable except where required by law, and we may change pricing with 30 days' notice.",
  },
  {
    heading: "4. Content ownership",
    body: "You retain ownership of any content you upload. By uploading content, you grant us a limited license to host, display, and process it solely to provide the service to you.",
  },
  {
    heading: "5. Termination",
    body: "We may suspend or terminate your access if you violate these terms. You may cancel your account at any time from your account settings; your data is retained for 30 days after cancellation.",
  },
  {
    heading: "6. Limitation of liability",
    body: 'The service is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the service.',
  },
  {
    heading: "7. Changes to these terms",
    body: "We may update these terms from time to time. Continued use of the service after changes take effect constitutes acceptance of the revised terms.",
  },
];

export default function Dialog04() {
  const [reachedEnd, setReachedEnd] = React.useState(false);

  // Accept unlocks once the reader has scrolled to the last section, or
  // right away when everything already fits on screen.
  const checkEnd = (node: HTMLElement | null) => {
    if (node && node.scrollTop + node.clientHeight >= node.scrollHeight - 8) {
      setReachedEnd(true);
    }
  };

  return (
    <Dialog
      onOpenChangeComplete={(open) => {
        if (!open) setReachedEnd(false);
      }}
    >
      <DialogTrigger render={<Button variant="outline">Read terms</Button>} />
      <DialogContent className="max-h-[min(32rem,80vh)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Last updated September 1, 2026.</DialogDescription>
        </DialogHeader>
        <section
          ref={checkEnd}
          aria-label="Terms of service text"
          // biome-ignore lint/a11y/noNoninteractiveTabindex: the scroll region must be keyboard scrollable
          tabIndex={0}
          onScroll={(event) => checkEnd(event.currentTarget)}
          className="-mx-1 flex min-h-0 flex-col gap-4 overflow-y-auto rounded-md px-1 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {sections.map((section) => (
            <div key={section.heading} className="flex flex-col gap-1">
              <h3 className="font-medium text-foreground">{section.heading}</h3>
              <p className="text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </section>
        <DialogFooter className="sm:items-center">
          <p
            aria-live="polite"
            className="text-center text-xs text-muted-foreground sm:mr-auto sm:text-left"
          >
            {reachedEnd ? "Thanks for reading." : "Scroll to the end to accept."}
          </p>
          <DialogClose render={<Button variant="outline">Decline</Button>} />
          <DialogClose
            render={<Button disabled={!reachedEnd}>Accept terms</Button>}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
