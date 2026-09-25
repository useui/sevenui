"use client";

import * as React from "react";
import { CircleCheckIcon, GlobeIcon, TriangleAlertIcon } from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/registry/base/ui/alert";
import { Button } from "@/registry/base/ui/button";
import { Spinner } from "@/registry/base/ui/spinner";

const records = [
  { type: "TXT", host: "_verify", value: "sevn-site-verification=8f3a2c91" },
  { type: "CNAME", host: "www", value: "edge.acme-hosting.net" },
];

type Status = "pending" | "checking" | "failed" | "verified";

export default function Alert16() {
  const [status, setStatus] = React.useState<Status>("pending");
  const [attempts, setAttempts] = React.useState(0);

  React.useEffect(() => {
    if (status !== "checking") return;
    // The first lookup misses so the failure path is visible; the second passes.
    const timer = setTimeout(
      () => setStatus(attempts > 1 ? "verified" : "failed"),
      1400,
    );
    return () => clearTimeout(timer);
  }, [status, attempts]);

  function check() {
    setAttempts((count) => count + 1);
    setStatus("checking");
  }

  return (
    <section
      aria-labelledby="alert-16-heading"
      className="grid w-full max-w-md gap-4 rounded-xl border bg-card p-4"
    >
      <div className="grid gap-1">
        <h3 id="alert-16-heading" className="font-medium">
          Connect harborcoffee.com
        </h3>
        <p className="text-sm text-muted-foreground">
          Add these records at your DNS provider, then check the connection.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full table-fixed text-left text-xs">
          <thead className="bg-muted/60 text-muted-foreground">
            <tr>
              <th scope="col" className="w-16 px-2.5 py-1.5 font-medium">
                Type
              </th>
              <th scope="col" className="w-20 px-2.5 py-1.5 font-medium">
                Host
              </th>
              <th scope="col" className="px-2.5 py-1.5 font-medium">
                Value
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {records.map((record) => (
              <tr key={record.type} className="border-t">
                <td className="px-2.5 py-2">{record.type}</td>
                <td className="px-2.5 py-2">{record.host}</td>
                <td className="px-2.5 py-2 break-all select-all" title={record.value}>
                  {record.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div aria-live="polite">
        {status === "pending" && (
          <Alert>
            <GlobeIcon aria-hidden="true" />
            <AlertTitle>Waiting for DNS records</AlertTitle>
            <AlertDescription>
              Most providers publish changes within 10 minutes; some take up to
              48 hours.
            </AlertDescription>
          </Alert>
        )}
        {status === "checking" && (
          <Alert>
            <Spinner aria-hidden="true" role="presentation" />
            <AlertTitle>Looking up harborcoffee.com…</AlertTitle>
            <AlertDescription>Querying public resolvers.</AlertDescription>
          </Alert>
        )}
        {status === "failed" && (
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden="true" />
            <AlertTitle>TXT record not found yet</AlertTitle>
            <AlertDescription>
              We found the CNAME but not _verify. Check the host name has no
              trailing domain, then try again.
            </AlertDescription>
          </Alert>
        )}
        {status === "verified" && (
          <Alert>
            <CircleCheckIcon aria-hidden="true" className="text-success!" />
            <AlertTitle>harborcoffee.com is connected</AlertTitle>
            <AlertDescription>
              HTTPS certificate issued. Your site is live on the new domain.
            </AlertDescription>
          </Alert>
        )}
      </div>
      <div className="flex justify-end gap-2">
        {status === "verified" ? (
          <Button variant="outline">
            Continue to site settings
          </Button>
        ) : (
          <Button onClick={check} disabled={status === "checking"}>
            {status === "failed" ? "Check again" : "Verify records"}
          </Button>
        )}
      </div>
    </section>
  );
}
