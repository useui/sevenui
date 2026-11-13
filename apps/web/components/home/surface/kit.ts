"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/registry/base/ui/avatar";
import { Badge } from "@/registry/base/ui/badge";
import { Button } from "@/registry/base/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/registry/base/ui/combobox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/base/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/base/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/registry/base/ui/field";
import { Input } from "@/registry/base/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/registry/base/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/base/ui/select";
import { Switch } from "@/registry/base/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";
import { Toaster, toast } from "@/registry/base/ui/toast";

/**
 * The SevenUI primitives the home page's live surface is composed from, as a Base UI project has them.
 * `surface/ui-sdk.tsx` hands the same composition the UI SDK flavour of each one, under the same names.
 * The calendar loads when its popover first opens, in either flavour, so it costs the page nothing up front.
 */
export const baseKit = {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Calendar: React.lazy(() => import("@/registry/base/ui/calendar").then((m) => ({ default: m.Calendar }))),
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
};

export type Kit = typeof baseKit;
