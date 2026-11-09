"use client";

import { ArrowRightIcon } from "lucide-react";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import { DirectionProvider } from "@/registry/base/ui/direction";
import { Item, ItemActions, ItemContent, ItemDescription, ItemTitle } from "@/registry/base/ui/item";
import { LabSection } from "../lab-frame";

function Row() {
  return (
    <Item variant="outline" className="w-80">
      <ItemContent>
        <ItemTitle>
          Deployments <Badge variant="secondary">New</Badge>
        </ItemTitle>
        <ItemDescription>Start-aligned text and trailing actions.</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Button size="sm" variant="outline">
          Open
          <ArrowRightIcon data-icon="inline-end" className="rtl:rotate-180" />
        </Button>
      </ItemActions>
    </Item>
  );
}

// DirectionProvider is a re-export with no look; the rows show other
// primitives laid out in each direction.
export default function DirectionMatrix() {
  return (
    <div>
      <LabSection title="dir=ltr">
        <DirectionProvider direction="ltr">
          <div dir="ltr">
            <Row />
          </div>
        </DirectionProvider>
      </LabSection>
      <LabSection title="dir=rtl">
        <DirectionProvider direction="rtl">
          <div dir="rtl">
            <Row />
          </div>
        </DirectionProvider>
      </LabSection>
    </div>
  );
}
