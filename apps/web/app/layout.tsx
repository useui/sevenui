import "./globals.css";
import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { CookieConsentBanner } from "../components/cookie-consent";
import { DrawerProvider } from "../components/drawer-context";
import { PackageManagerScript } from "../components/package-manager-script";
import { SiteDrawer } from "../components/site-drawer";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { ThemeProvider } from "../components/theme-provider";
import { getNavTree, isNavGroup, resolvePrimitivesHref } from "../lib/docs/nav";
import { getHeaderNav } from "../lib/header-nav";
import { galleryComponents, galleryFamilies } from "../lib/gallery";
import { site } from "../lib/site";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.name,
  description: site.description,
  icons: { icon: "/icon.svg" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tree = await getNavTree();
  const primitivesHref = resolvePrimitivesHref(tree);
  if (!primitivesHref) {
    throw new Error("app/layout.tsx: nav tree has no Primitives group with a resolvable href");
  }

  const primitiveCount = tree.find(isNavGroup)?.children.length ?? 0;
  const componentCount = galleryComponents.reduce((sum, component) => sum + component.count, 0);
  const componentFamilies = galleryFamilies.map(({ id, label }) => ({ id, label }));
  const headerNav = await getHeaderNav(primitivesHref);

  return (
    <html
      className={`${inter.variable} ${ibmPlexMono.variable}`}
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <PackageManagerScript />
      </head>
      <body className="bg-background font-sans text-foreground antialiased">
        <ThemeProvider>
          {/*
            `#content` is supplied by each section's own layout or page, not
            here, so that a section's navigation aside can sit OUTSIDE <main>
            and the skip link actually skips it (§17.6 #36).
          */}
          <a
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
            href="#content"
          >
            Skip to content
          </a>
          <DrawerProvider>
            <SiteHeader nav={headerNav} />
            {children}
            <SiteDrawer primitivesHref={primitivesHref} />
            <SiteFooter
              componentCount={componentCount}
              componentFamilies={componentFamilies}
              primitiveCount={primitiveCount}
              primitivesHref={primitivesHref}
            />
          </DrawerProvider>
        </ThemeProvider>
        <CookieConsentBanner />
      </body>
    </html>
  );
}
