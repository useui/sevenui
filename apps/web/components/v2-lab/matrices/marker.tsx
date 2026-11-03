"use client";

import { CheckCheckIcon, UserPlusIcon } from "lucide-react";
import { Marker, MarkerContent, MarkerIcon } from "@/registry/base/ui/marker";
import { LabSection } from "../lab-frame";

const VARIANTS = ["default", "separator", "border"] as const;

export default function MarkerMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`variant=${variant}`}>
          <div className="flex w-full max-w-sm flex-col gap-4">
            <Marker variant={variant}>
              <MarkerContent>Today</MarkerContent>
            </Marker>
            <Marker variant={variant}>
              <MarkerIcon>
                <UserPlusIcon />
              </MarkerIcon>
              <MarkerContent>Alex joined the conversation</MarkerContent>
            </Marker>
            <Marker variant={variant} role="status">
              <MarkerIcon>
                <CheckCheckIcon />
              </MarkerIcon>
              <MarkerContent>
                All messages read · <a href="#history">View history</a>
              </MarkerContent>
            </Marker>
          </div>
        </LabSection>
      ))}
    </div>
  );
}
