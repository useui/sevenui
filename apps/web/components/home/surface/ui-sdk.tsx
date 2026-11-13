"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/registry/ui-sdk/ui/avatar";
import { Badge } from "@/registry/ui-sdk/ui/badge";
import { Button } from "@/registry/ui-sdk/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/ui-sdk/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/ui-sdk/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/ui-sdk/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/registry/ui-sdk/ui/field";
import { Input } from "@/registry/ui-sdk/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/ui-sdk/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/ui-sdk/ui/select";
import { Switch } from "@/registry/ui-sdk/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/ui-sdk/ui/tabs";
import { Toaster, toast } from "@/registry/ui-sdk/ui/toast";
import type { PreviewFolder } from "../../flavour/generated";
import type { Kit } from "./kit";
import { createReleasesApp } from "./releases-app";

// The UI SDK half of the home surface, loaded only after a reader picks UI SDK. Same names, same
// composition as kit.ts. Every name must be here (`satisfies` fails the build on a missing or extra one).
// The flavours share exports and props (packages/registry/tests/api-freeze.test.ts), but the detail objects
// their callbacks receive are typed differently, so TypeScript cannot equate the two modules; the cast below
// is that and nothing more. The composition only uses props both flavours accept.
const uiSdkKit = {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Calendar: React.lazy(() => import("@/registry/ui-sdk/ui/calendar").then((m) => ({ default: m.Calendar }))),
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
  toast,
} satisfies Record<keyof Kit, unknown>;

const folder: PreviewFolder["default"] = { releases: createReleasesApp(uiSdkKit as unknown as Kit) };

export default folder;
