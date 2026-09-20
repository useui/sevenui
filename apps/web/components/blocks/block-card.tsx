import { BlockPreview } from "./block-preview";

/**
 * One gallery card, top to bottom: the block's title (h2) plus an optional
 * badge, its description, then the live preview frame. Ported from the markup
 * half of `legacy-components/block-frame.astro`.
 *
 * THE SPLIT. This half is a Server Component and renders on the server with
 * no client bundle of its own; everything interactive — the toolbar, the
 * width presets, the drag handle, both full-screen flavours, the install
 * control — lives below the boundary in `block-preview.tsx`. The Astro source
 * had no such line to draw: it emitted all of it as markup and drove it from
 * one delegated document script, because the alternative in Astro was a React
 * island per control (54 of them on a six-card category page). React has no
 * such cost, so the split lands where the data/behaviour seam actually is
 * rather than where Astro's island budget forced it.
 *
 * WHAT THE /blocks LAYOUT (Task 5.2) MUST MOUNT ONCE, above every card —
 * these are the page singletons the Astro `blocks-prefs.astro` component used
 * to carry, and none of them belongs to a card:
 *   - `<TooltipProvider>` from `@/registry/base/ui/tooltip`, for the toolbar
 *     hints;
 *   - `<BlocksAnnouncer>` (`blocks-announcer.tsx`), the one live region;
 *   - `<BlocksLoadGate>` (`blocks-load-gate.tsx`), the preview loading queue
 *     and its concurrency cap;
 *   - `<PackageManagerIcons />` (`package-manager-icons.tsx`), the one brand
 *     -mark sprite every install control's `<use href="#pm-icon-*">` points
 *     at.
 * The fourth job of `blocks-prefs.astro` — the package-manager preference
 * itself — already has a home and is NOT rebuilt here:
 * `components/package-manager-script.tsx` writes `<html data-pm>` pre-paint
 * and `app/globals.css` carries the unlayered `.pm-only` / `.pm-only-{pm}`
 * rules that reveal exactly one of four server-rendered commands.
 *
 * `data-title` rather than reading the h2: the heading also contains the "Pro"
 * badge, so its textContent is "Dashboard 01Pro". Nothing queries the
 * attribute any more — the title travels as a prop — but the reason it was
 * never derived from the heading is exactly why `title` stays a separate
 * value here instead of being reconstructed from what the heading renders.
 */
export interface BlockCardProps {
  /** Also the card's anchor id, which the permalink button copies. */
  name: string;
  title: string;
  description: string;
  height: number;
  /** Registry item id passed to `installCommand()`, e.g. "pro/dashboard-01". */
  installItem: string;
  /** iframe src + "open in new tab" target. */
  previewUrl: string;
  /** GitHub source link; the control is not rendered when absent. */
  sourceUrl?: string;
  /** Optional chip rendered next to the title, e.g. "Pro". */
  badge?: string;
}

export function BlockCard({
  name,
  title,
  description,
  height,
  installItem,
  previewUrl,
  sourceUrl,
  badge,
}: BlockCardProps) {
  return (
    <article
      className="flex scroll-mt-24 flex-col gap-4 py-10"
      data-block={name}
      data-preview-url={previewUrl}
      data-title={title}
      id={name}
    >
      <div>
        {/*
          The legacy Astro site set tight letter-spacing on every bare
          `h1`-`h6` globally; this port declares no such bare-selector rule,
          on the assumption that the chrome's headings all carry their own
          spacing class. This title is one of the two chrome headings that
          assumption missed, so the class below restores production's
          measured spacing by hand. The "Pro" badge span inherits it and
          needs no class of its own.
        */}
        <h2 className="flex items-center gap-2 text-sm font-medium tracking-tighter">
          {title}
          {badge && (
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
              {badge}
            </span>
          )}
        </h2>
        <p className="text-sm text-muted-foreground" data-block-description="">
          {description}
        </p>
      </div>
      <BlockPreview
        description={description}
        height={height}
        installItem={installItem}
        name={name}
        previewUrl={previewUrl}
        sourceUrl={sourceUrl}
        title={title}
      />
    </article>
  );
}
