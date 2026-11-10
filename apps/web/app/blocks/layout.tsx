import type { ReactNode } from "react";
import { TooltipProvider } from "@/registry/base/ui/tooltip";
import { Announcer } from "../../components/announcer";
import { BlocksLoadGate } from "../../components/blocks/blocks-load-gate";
import { CustomizerProvider } from "../../components/customizer/customizer-provider";
import { SiteSidebar } from "../../components/shell/site-sidebar";
import { getBlocksNav, getShellNav } from "../../lib/shell-nav";

export const revalidate = 300;

export default async function BlocksLayout({ children }: { children: ReactNode }) {
  const [nav, blocks] = await Promise.all([getShellNav(), getBlocksNav()]);

  return (
    <TooltipProvider>
      <Announcer>
        <CustomizerProvider>
          <BlocksLoadGate>
            <div className="grid grid-cols-1 items-start lg:grid-cols-[17.75rem_minmax(0,1fr)] lg:gap-x-10">
              <SiteSidebar blocks={blocks} nav={nav} />
              <main className="min-w-0 px-6 pt-6 pb-12 lg:ps-0 lg:pe-8 lg:pt-10" id="content">
                {children}
              </main>
            </div>
          </BlocksLoadGate>
        </CustomizerProvider>
      </Announcer>
    </TooltipProvider>
  );
}
