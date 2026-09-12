"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/registry/base/ui/button";
import { Input } from "@/registry/base/ui/input";
import { Label } from "@/registry/base/ui/label";

export default function Input03() {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <Label htmlFor="input-03-password">Password</Label>
      <div className="relative">
        <Input
          id="input-03-password"
          type={visible ? "text" : "password"}
          defaultValue="sevenui-secret"
          className="pr-9"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((prev) => !prev)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
    </div>
  );
}
