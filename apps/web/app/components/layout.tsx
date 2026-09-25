import { GalleryNav } from "../../components/gallery/nav";
import { galleryFamilies } from "../../lib/gallery";

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto lg:scrollbar-thin lg:scrollbar-thumb-border lg:scrollbar-track-transparent lg:border-r lg:border-border lg:px-5 lg:py-8">
        <GalleryNav families={galleryFamilies} />
      </aside>
      <main className="min-w-0" id="content">
        {children}
      </main>
    </div>
  );
}
