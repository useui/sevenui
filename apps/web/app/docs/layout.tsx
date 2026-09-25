import { TooltipProvider } from "@/registry/base/ui/tooltip";
import { Announcer } from "../../components/announcer";
import { PackageManagerIcons } from "../../components/blocks/package-manager-icons";
import { CustomizerProvider } from "../../components/customizer/customizer-provider";
import { DocsSidebar } from "../../components/docs/sidebar";
import { getNavTree, resolvePrimitivesHref } from "../../lib/docs/nav";

// Each page renders its own <main> and "On this page" aside, so the layout's
// RSC payload carries no per-page data: a page ships its own headings and
// breadcrumb instead of every page's.
export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const tree = await getNavTree();
  const primitivesHref = resolvePrimitivesHref(tree);
  if (!primitivesHref) {
    throw new Error("app/docs/layout.tsx: nav tree has no Primitives group with a resolvable href");
  }

  // The same providers as the gallery: every <Component> demo carries the gallery's toolbar, whose
  // install menu announces its copies and whose Customize button drives the page's one panel.
  return (
    <TooltipProvider>
      <Announcer>
        <CustomizerProvider>
          <PackageManagerIcons />
          <div className="mx-auto grid grid-cols-1 items-start lg:grid-cols-[17.5rem_minmax(0,1fr)] xl:grid-cols-[17.5rem_minmax(0,1fr)_17.5rem]">
            <DocsSidebar primitivesHref={primitivesHref} tree={tree} />
            {children}
          </div>
        </CustomizerProvider>
      </Announcer>
    </TooltipProvider>
  );
}
