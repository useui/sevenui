"use client";

import { ArrowUpIcon, PaperclipIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/base/ui/input-group";

export default function InputGroupTextareaDemo() {
  return (
    <div className="w-full max-w-md">
      <InputGroup>
        <InputGroupAddon align="block-start" className="border-b">
          <InputGroupText>New message</InputGroupText>
        </InputGroupAddon>
        <InputGroupTextarea placeholder="Ask anything..." rows={3} />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-xs" aria-label="Attach file">
            <PaperclipIcon />
          </InputGroupButton>
          <InputGroupText className="ml-auto">12,000 tokens</InputGroupText>
          <InputGroupButton
            size="icon-xs"
            variant="default"
            aria-label="Send message"
          >
            <ArrowUpIcon />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
