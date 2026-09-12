import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/base/ui/tabs";

export default function TabsLine() {
  return (
    <Tabs defaultValue="overview" className="w-full max-w-md">
      <TabsList variant="line">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-sm text-muted-foreground">
        A quick summary of your workspace activity.
      </TabsContent>
      <TabsContent value="analytics" className="text-sm text-muted-foreground">
        Traffic and engagement over time.
      </TabsContent>
      <TabsContent value="reports" className="text-sm text-muted-foreground">
        Exportable monthly reports.
      </TabsContent>
    </Tabs>
  );
}
