"use client";

import { CodeIcon, EyeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/base/ui/tabs";
import { LabSection } from "../lab-frame";

const VARIANTS = ["default", "line"] as const;

export default function TabsMatrix() {
  return (
    <div>
      {VARIANTS.map((variant) => (
        <LabSection key={variant} title={`variant=${variant} / horizontal`}>
          <Tabs defaultValue="preview">
            <TabsList variant={variant}>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
              <TabsTrigger value="agents">For agents</TabsTrigger>
              <TabsTrigger value="disabled" disabled>
                Disabled
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="text-muted-foreground">
              Preview panel
            </TabsContent>
            <TabsContent value="code" className="text-muted-foreground">
              Code panel
            </TabsContent>
            <TabsContent value="agents" className="text-muted-foreground">
              Agents panel
            </TabsContent>
          </Tabs>
          <Tabs defaultValue="preview">
            <TabsList variant={variant}>
              <TabsTrigger value="preview">
                <EyeIcon data-icon="inline-start" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code">
                <CodeIcon data-icon="inline-start" />
                Code
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </LabSection>
      ))}
      {VARIANTS.map((variant) => (
        <LabSection key={`v-${variant}`} title={`variant=${variant} / vertical`}>
          <Tabs defaultValue="account" orientation="vertical">
            <TabsList variant={variant}>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="text-muted-foreground">
              Account panel
            </TabsContent>
            <TabsContent value="password" className="text-muted-foreground">
              Password panel
            </TabsContent>
            <TabsContent value="billing" className="text-muted-foreground">
              Billing panel
            </TabsContent>
          </Tabs>
        </LabSection>
      ))}
    </div>
  );
}
