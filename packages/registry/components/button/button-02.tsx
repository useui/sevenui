"use client";

import { ArrowRight, Download, Mail } from "lucide-react";

import { Button } from "@/registry/base/ui/button";

export default function Button02() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>
        <Mail aria-hidden="true" />
        Email us
      </Button>
      <Button variant="outline">
        Continue
        <ArrowRight aria-hidden="true" />
      </Button>
      <Button variant="secondary">
        <Download aria-hidden="true" />
        Download report
      </Button>
    </div>
  );
}
