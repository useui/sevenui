import { TooltipProvider } from "@/registry/base/ui/tooltip";
import { Announcer } from "../../components/announcer";
import { PackageManagerIcons } from "../../components/blocks/package-manager-icons";
import { CustomizerProvider } from "../../components/customizer/customizer-provider";
import { BlocksCta } from "../../components/gallery/blocks-cta";
import { SiteSidebar } from "../../components/shell/site-sidebar";
import { getShellNav } from "../../lib/shell-nav";

export default async function GalleryLayout({ children }: { children: React.ReactNode }) {
  const nav = await getShellNav();

  return (
    <TooltipProvider>
      <Announcer>
        <CustomizerProvider>
          <PackageManagerIcons />
          <div className="grid grid-cols-1 items-start lg:grid-cols-[17.75rem_minmax(0,1fr)] lg:gap-x-10">
            <SiteSidebar nav={nav} />
            <main className="min-w-0 px-6 pt-6 pb-12 lg:ps-0 lg:pe-8 lg:pt-10" id="content">
              {children}
              {/* Inside the content column, so it never runs under the sidebar. */}
              <BlocksCta />
            </main>
          </div>
        </CustomizerProvider>
      </Announcer>
    </TooltipProvider>
  );
}
