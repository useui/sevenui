"use client";

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

const tabClassName = "data-[active]:bg-transparent data-[active]:shadow-none";

export default function TabsIndicatorDemo() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-sm">
      <TabsList className="relative isolate w-full">
        <TabsPrimitive.Indicator className="absolute inset-y-0.5 left-0 z-[-1] w-(--active-tab-width) translate-x-(--active-tab-left) rounded-md bg-background shadow-sm transition-[translate,width] duration-200 ease-in-out" />
        <TabsTrigger value="overview" className={tabClassName}>
          Overview
        </TabsTrigger>
        <TabsTrigger value="reports" className={tabClassName}>
          Reports
        </TabsTrigger>
        <TabsTrigger value="settings" className={tabClassName}>
          Settings
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <p className="text-sm text-muted-foreground">
          The indicator slides between tabs using the --active-tab-* variables.
        </p>
      </TabsContent>
      <TabsContent value="reports">
        <p className="text-sm text-muted-foreground">Reports content.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm text-muted-foreground">Settings content.</p>
      </TabsContent>
    </Tabs>
  );
}
