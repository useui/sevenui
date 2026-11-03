"use client";

import { CopyIcon, SearchIcon, XIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/base/ui/input-group";
import { LabSection } from "../lab-frame";

export default function InputGroupMatrix() {
  return (
    <div>
      <LabSection title="addons">
        <InputGroup className="w-64">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search" />
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>.dev</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupInput placeholder="Search docs" />
          <InputGroupAddon align="inline-end">
            <kbd className="bg-muted px-1 font-mono text-xs">⌘K</kbd>
          </InputGroupAddon>
        </InputGroup>
      </LabSection>
      <LabSection title="buttons (xs, icon-xs, sm, icon-sm)">
        <InputGroup className="w-64">
          <InputGroupInput defaultValue="npx shadcn add @sevenui/input" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="xs">Copy</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupInput defaultValue="Clearable" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-xs" aria-label="Clear">
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupInput defaultValue="Small button" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="sm">Send</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupInput defaultValue="Icon small" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="icon-sm" aria-label="Copy">
              <CopyIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </LabSection>
      <LabSection title="states">
        <InputGroup className="w-64">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder="Disabled" disabled />
        </InputGroup>
        <InputGroup className="w-64">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput defaultValue="Invalid" aria-invalid />
        </InputGroup>
      </LabSection>
      <LabSection title="block addons + textarea">
        <InputGroup className="w-72">
          <InputGroupAddon align="block-start">
            <InputGroupText>Label above</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Block start" />
        </InputGroup>
        <InputGroup className="w-72">
          <InputGroupTextarea placeholder="Write a message" />
          <InputGroupAddon align="block-end">
            <InputGroupText>0 / 280</InputGroupText>
            <InputGroupButton size="xs" className="ml-auto">
              Post
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </LabSection>
    </div>
  );
}
