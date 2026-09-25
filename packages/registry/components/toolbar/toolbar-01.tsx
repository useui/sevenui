"use client";

import * as React from "react";
import {
  CalendarClock,
  Copy,
  FolderInput,
  Tag,
  Trash2,
  UserPlus,
} from "lucide-react";

import {
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/registry/base/ui/toolbar";

const groups = [
  {
    label: "Plan",
    actions: [
      { label: "Assign", icon: UserPlus },
      { label: "Due date", icon: CalendarClock },
      { label: "Label", icon: Tag },
    ],
  },
  {
    label: "Organize",
    actions: [
      { label: "Move", icon: FolderInput },
      { label: "Duplicate", icon: Copy },
    ],
  },
];

export default function Toolbar01() {
  return (
    <Toolbar aria-label="Task actions" className="max-w-full">
      {groups.map((group, index) => (
        <React.Fragment key={group.label}>
          {index > 0 ? <ToolbarSeparator /> : null}
          <ToolbarGroup aria-label={group.label}>
            {group.actions.map((action) => (
              <ToolbarButton key={action.label} aria-label={action.label}>
                <action.icon aria-hidden="true" />
                <span className="hidden md:inline">{action.label}</span>
              </ToolbarButton>
            ))}
          </ToolbarGroup>
        </React.Fragment>
      ))}
      <ToolbarSeparator />
      <ToolbarButton
        aria-label="Delete task"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 aria-hidden="true" />
        <span className="hidden md:inline">Delete</span>
      </ToolbarButton>
    </Toolbar>
  );
}
