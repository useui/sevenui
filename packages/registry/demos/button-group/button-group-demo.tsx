"use client";

import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
} from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import {
  ButtonGroup,
  ButtonGroupText,
} from "@/registry/base/ui/button-group";

export default function ButtonGroupDemo() {
  return (
    <div className="flex items-center gap-6">
      <ButtonGroup>
        <Button variant="outline" size="icon" aria-label="Previous page">
          <ChevronLeftIcon />
        </Button>
        <ButtonGroupText>Page 3 of 12</ButtonGroupText>
        <Button variant="outline" size="icon" aria-label="Next page">
          <ChevronRightIcon />
        </Button>
      </ButtonGroup>
      <ButtonGroup orientation="vertical">
        <Button variant="outline" size="icon" aria-label="Move up">
          <ChevronUpIcon />
        </Button>
        <Button variant="outline" size="icon" aria-label="Move down">
          <ChevronDownIcon />
        </Button>
      </ButtonGroup>
    </div>
  );
}
