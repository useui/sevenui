"use client";

import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/registry/base/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";

export default function ButtonGroupSeparatorDemo() {
  return (
    <ButtonGroup>
      <Button variant="secondary">Merge pull request</Button>
      <ButtonGroupSeparator />
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="secondary"
              size="icon"
              aria-label="More merge options"
            >
              <ChevronDownIcon />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Create a merge commit</DropdownMenuItem>
          <DropdownMenuItem>Squash and merge</DropdownMenuItem>
          <DropdownMenuItem>Rebase and merge</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </ButtonGroup>
  );
}
