import type { ManifestAsset } from "../../lib/pro-manifest";
import { cx } from "../../lib/cx";

/** A real Pro cover screenshot, light and dark. */
export function BlockCover({
  cover,
  alt,
  className,
  aspect = "aspect-video",
}: {
  cover?: ManifestAsset;
  alt: string;
  className?: string;
  aspect?: string;
}) {
  const frame = cx("relative overflow-hidden bg-muted", aspect, className);
  if (!cover) return <div aria-hidden className={cx(frame, "border-dashed")} />;
  return (
    <div className={frame}>
      {/* biome-ignore lint/performance/noImgElement: remote pro covers; no next/image remote pattern, same as /blocks */}
      <img
        alt={alt}
        className={cx("absolute inset-0 size-full object-cover object-top", cover.darkSrc && "dark:hidden")}
        decoding="async"
        height={1440}
        loading="lazy"
        src={cover.src}
        width={2560}
      />
      {cover.darkSrc ? (
        // biome-ignore lint/performance/noImgElement: remote pro covers, as above
        <img
          alt={alt}
          className="absolute inset-0 hidden size-full object-cover object-top dark:block"
          decoding="async"
          height={1440}
          loading="lazy"
          src={cover.darkSrc}
          width={2560}
        />
      ) : null}
    </div>
  );
}
