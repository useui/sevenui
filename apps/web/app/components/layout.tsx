import { GalleryNav } from "../../components/gallery/nav";
import { galleryComponents } from "../../lib/gallery";

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:border-r lg:border-border lg:px-5 lg:py-8">
        <GalleryNav components={galleryComponents} />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
