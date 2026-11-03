"use client";

import { CheckIcon } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/registry/base/ui/avatar";
import { LabSection } from "../lab-frame";

const SIZES = ["sm", "default", "lg"] as const;

export default function AvatarMatrix() {
  return (
    <div>
      <LabSection title="image / fallback / badge per size">
        {SIZES.map((size) => (
          <div key={size} className="flex items-center gap-2">
            <Avatar size={size}>
              <AvatarImage src="/placeholder.svg" alt="Ada Lovelace" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar size={size}>
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
            <Avatar size={size}>
              <AvatarFallback>AT</AvatarFallback>
              <AvatarBadge>
                <CheckIcon />
              </AvatarBadge>
            </Avatar>
          </div>
        ))}
      </LabSection>
      <LabSection title="group with count">
        {SIZES.map((size) => (
          <AvatarGroup key={size}>
            <Avatar size={size}>
              <AvatarImage src="/placeholder.svg" alt="Ada Lovelace" />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <Avatar size={size}>
              <AvatarFallback>GH</AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+3</AvatarGroupCount>
          </AvatarGroup>
        ))}
      </LabSection>
    </div>
  );
}
