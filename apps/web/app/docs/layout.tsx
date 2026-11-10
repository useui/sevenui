import { TooltipProvider } from "@/registry/base/ui/tooltip";
import { Announcer } from "../../components/announcer";
import { PackageManagerIcons } from "../../components/blocks/package-manager-icons";
import { CustomizerProvider } from "../../components/customizer/customizer-provider";
import { SiteSidebar } from "../../components/shell/site-sidebar";
import { getShellNav } from "../../lib/shell-nav";

// Each page renders its own <main> and "On this page" aside, so the layout's
// RSC payload carries no per-page data: a page ships its own headings and
// breadcrumb instead of every page's.
export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const nav = await getShellNav();

  // The same providers as the gallery: every <Component> demo carries the gallery's toolbar, whose
  // install menu announces its copies and whose Customize button drives the page's one panel.
  return (
    <TooltipProvider>
      <Announcer>
        <CustomizerProvider>
          <PackageManagerIcons />
          <div
            className="grid grid-cols-1 items-start lg:grid-cols-[17.75rem_minmax(0,1fr)] lg:gap-x-10 xl:grid-cols-[17.75rem_minmax(0,1fr)_16.25rem]"
          >
            <SiteSidebar nav={nav} />
            {children}
          </div>
        </CustomizerProvider>
      </Announcer>
    </TooltipProvider>
  );
}
