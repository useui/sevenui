"use client";

import { ChevronRightIcon, HardDriveIcon } from "lucide-react";
import { Button } from "@/registry/base/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/base/ui/item";
import { LabSection } from "../lab-frame";

const VARIANTS = ["default", "outline", "muted"] as const;
const SIZES = ["default", "sm", "xs"] as const;

export default function ItemMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`variant=${variant}`}>
          {SIZES.map((size) => (
            <Item key={size} variant={variant} size={size} className="w-72">
              <ItemMedia variant="icon">
                <HardDriveIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Storage size={size}</ItemTitle>
                <ItemDescription>82% of 50 GB used.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button variant="outline" size="xs">
                  Upgrade
                </Button>
              </ItemActions>
            </Item>
          ))}
          <Item variant={variant} className="w-72" render={<a href="#item" />}>
            <ItemMedia variant="image">
              <img src="/placeholder.svg" alt="" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Link row (tab to focus)</ItemTitle>
            </ItemContent>
            <ChevronRightIcon className="size-4" />
          </Item>
        </LabSection>
      ))}
      <LabSection title="group with hairline separators">
        <ItemGroup className="w-72 gap-0">
          {["Ada Lovelace", "Grace Hopper", "Alan Turing"].map((name, i) => (
            <div key={name}>
              {i > 0 && <ItemSeparator className="my-0" />}
              <Item size="sm">
                <ItemContent>
                  <ItemTitle>{name}</ItemTitle>
                </ItemContent>
              </Item>
            </div>
          ))}
        </ItemGroup>
      </LabSection>
    </div>
  );
}
