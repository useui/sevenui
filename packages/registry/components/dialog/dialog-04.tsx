"use client";

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
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="outline">Read terms</Button>} />
      <DialogContent className="max-h-[min(32rem,80vh)] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Last updated September 1, 2026.</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto pr-1 text-sm">
          {sections.map((section) => (
            <div key={section.heading} className="flex flex-col gap-1">
              <h4 className="font-medium text-foreground">{section.heading}</h4>
              <p className="text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Decline</Button>} />
          <Button>Accept terms</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
