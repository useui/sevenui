"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/registry/base/ui/input-group";

const INSTALL_COMMAND = "npx shadcn@latest add @sevenui/input-group";

export default function InputGroupButtonDemo() {
  const [copied, setCopied] = React.useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <InputGroup>
        <InputGroupInput readOnly value={INSTALL_COMMAND} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label="Copy command"
            onClick={() => {
              navigator.clipboard.writeText(INSTALL_COMMAND);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupInput type="password" placeholder="Enter your API key" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton variant="secondary">Verify</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
