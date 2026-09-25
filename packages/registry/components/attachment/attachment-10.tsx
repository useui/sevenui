"use client";

import * as React from "react";
import { CheckIcon, DownloadIcon, ReceiptTextIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/registry/base/ui/attachment";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/registry/base/ui/card";

const invoices = [
  {
    file: "invoice-2026-09.pdf",
    period: "Sep 1 – Sep 30",
    amount: "$240.00",
    status: "due",
  },
  {
    file: "invoice-2026-08.pdf",
    period: "Aug 1 – Aug 31",
    amount: "$240.00",
    status: "paid",
  },
  {
    file: "invoice-2026-07.pdf",
    period: "Jul 1 – Jul 31",
    amount: "$192.00",
    status: "paid",
  },
] as const;

export default function Attachment10() {
  const [downloaded, setDownloaded] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!downloaded) return;
    const timeout = window.setTimeout(() => setDownloaded(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [downloaded]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <CardDescription>Team plan · billed monthly to Visa 4242</CardDescription>
        <CardAction>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDownloaded("all")}
          >
            {downloaded === "all" ? (
              <>
                <CheckIcon aria-hidden="true" data-icon="inline-start" />
                Downloaded
              </>
            ) : (
              "Download all"
            )}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {invoices.map((invoice) => {
            const done = downloaded === "all" || downloaded === invoice.file;
            return (
              <li key={invoice.file}>
                <Attachment className="w-full">
                  <AttachmentMedia>
                    <ReceiptTextIcon aria-hidden="true" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{invoice.file}</AttachmentTitle>
                    <AttachmentDescription>
                      <span className="max-sm:hidden">{invoice.period} · </span>
                      <span className="tabular-nums">{invoice.amount}</span>
                      <span className="sm:hidden">
                        {" · "}
                        {invoice.status === "due" ? "Due Oct 1" : "Paid"}
                      </span>
                    </AttachmentDescription>
                  </AttachmentContent>
                  <AttachmentActions className="gap-2">
                    {invoice.status === "due" ? (
                      <Badge variant="outline" className="max-sm:hidden">
                        Due Oct 1
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="max-sm:hidden">
                        Paid
                      </Badge>
                    )}
                    <AttachmentAction
                      aria-label={
                        done
                          ? `Downloaded ${invoice.file}`
                          : `Download ${invoice.file}`
                      }
                      onClick={() => setDownloaded(invoice.file)}
                    >
                      {done ? (
                        <CheckIcon aria-hidden="true" />
                      ) : (
                        <DownloadIcon aria-hidden="true" />
                      )}
                    </AttachmentAction>
                  </AttachmentActions>
                </Attachment>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
