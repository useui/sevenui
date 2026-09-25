"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const snippets = [
  {
    value: "curl",
    label: "cURL",
    code: `curl https://api.parcelhub.dev/v1/shipments \\
  -H "Authorization: Bearer $PARCELHUB_KEY" \\
  -d carrier=ups \\
  -d service=ground \\
  -d to_zip=94107`,
  },
  {
    value: "node",
    label: "Node.js",
    code: `const shipment = await parcelhub.shipments.create({
  carrier: "ups",
  service: "ground",
  toZip: "94107",
});`,
  },
  {
    value: "python",
    label: "Python",
    code: `shipment = parcelhub.Shipment.create(
    carrier="ups",
    service="ground",
    to_zip="94107",
)`,
  },
];

export default function Tabs11() {
  const [language, setLanguage] = React.useState(snippets[0].value);
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    const snippet = snippets.find((item) => item.value === language);
    if (!snippet) return;
    try {
      await navigator.clipboard?.writeText(snippet.code);
    } catch {
      // Clipboard can be blocked in sandboxed frames; still confirm the action.
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      aria-labelledby="tabs-11-title"
      className="flex w-full max-w-md flex-col gap-3"
    >
      <div className="flex flex-col gap-1">
        <h3 id="tabs-11-title" className="text-sm font-semibold">
          <span className="mr-2 rounded-md bg-success/10 px-1.5 py-0.5 font-mono text-xs font-medium text-success">
            POST
          </span>
          <span className="font-mono">/v1/shipments</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          Create a shipment and get a label back in one request.
        </p>
      </div>

      <Tabs
        value={language}
        onValueChange={(value) => {
          setLanguage(value as string);
          setCopied(false);
        }}
        className="gap-0 overflow-hidden rounded-lg border bg-muted/40"
      >
        <div className="flex items-center justify-between gap-2 border-b bg-muted/60 pt-1 pr-1.5 pb-px pl-2">
          <TabsList
            variant="line"
            aria-label="Code language"
            className="min-w-0"
          >
            {snippets.map((snippet) => (
              <TabsTrigger
                key={snippet.value}
                value={snippet.value}
                className="px-2 text-xs"
              >
                {snippet.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={copy}
            aria-label={copied ? "Copied to clipboard" : "Copy code"}
          >
            {copied ? (
              <Check aria-hidden="true" className="text-success" />
            ) : (
              <Copy aria-hidden="true" />
            )}
          </Button>
        </div>
        {snippets.map((snippet) => (
          <TabsContent key={snippet.value} value={snippet.value}>
            <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed">
              <code>{snippet.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
      <p aria-live="polite" className="sr-only">
        {copied ? "Code copied to clipboard" : ""}
      </p>
    </section>
  );
}
