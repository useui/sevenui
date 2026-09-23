import { BlockPreview } from "./block-preview";

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
