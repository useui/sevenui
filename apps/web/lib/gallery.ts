import "server-only";

import componentsRegistry from "../../../packages/registry/components/registry.json";
import mainRegistry from "../../../packages/registry/registry.json";

export interface GalleryComponent {
  slug: string;
  label: string;
  count: number;
}

export interface GalleryFamily {
  id: string;
  label: string;
  components: GalleryComponent[];
}

export interface GalleryExample {
  /** Registry item name; also the anchor id, e.g. "accordion-01". */
  id: string;
  title: string;
  description: string;
}

export const GALLERY_SLUGS = [
  "accordion",
  "alert",
  "alert-dialog",
  "aspect-ratio",
  "attachment",
  "avatar",
  "badge",
  "breadcrumb",
  "bubble",
  "button",
  "button-group",
  "calendar",
  "card",
  "carousel",
  "chart",
  "checkbox",
  "collapsible",
  "combobox",
  "command",
  "context-menu",
  "dialog",
  "drawer",
  "dropdown-menu",
  "empty",
  "field",
  "form",
  "hover-card",
  "input",
  "input-group",
  "input-otp",
  "item",
  "kbd",
  "label",
  "marker",
  "menubar",
  "message",
  "message-scroller",
  "meter",
  "native-select",
  "navigation-menu",
  "number-field",
  "pagination",
  "popover",
  "progress",
  "questionnaire",
  "radio-group",
  "resizable",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "skeleton",
  "slider",
  "spinner",
  "switch",
  "table",
  "tabs",
  "textarea",
  "toast",
  "toggle",
  "toggle-group",
  "toolbar",
  "tooltip",
] as const;

export type GallerySlug = (typeof GALLERY_SLUGS)[number];

const uiTitles = new Map(
  mainRegistry.items.filter((item) => item.type === "registry:ui").map((item) => [item.name, item.title]),
);

const examplesBySlug = new Map<string, GalleryExample[]>();
for (const item of componentsRegistry.items) {
  const slug = item.files[0].path.split("/")[0];
  const list = examplesBySlug.get(slug);
  const example = { id: item.name, title: item.title, description: item.description };
  if (list) list.push(example);
  else examplesBySlug.set(slug, [example]);
}

export const galleryComponents: GalleryComponent[] = [...examplesBySlug.entries()]
  .map(([slug, examples]) => {
    const label = uiTitles.get(slug);
    if (!label) {
      throw new Error(
        `components/${slug} has no matching registry:ui item — gallery folders must be named after a ui component.`,
      );
    }
    return { slug, label, count: examples.length };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

{
  const derived = galleryComponents.map((component) => component.slug);
  const pinned = [...GALLERY_SLUGS].sort((a, b) => a.localeCompare(b));
  if (derived.join(",") !== pinned.join(",")) {
    const missingPages = derived.filter((slug) => !pinned.includes(slug as GallerySlug));
    const missingFolders = pinned.filter((slug) => !derived.includes(slug));
    throw new Error(
      "lib/gallery.ts: GALLERY_SLUGS and packages/registry/components/registry.json disagree. " +
        (missingPages.length
          ? `Registry folder(s) with no gallery page: ${missingPages.join(", ")} — add them to GALLERY_SLUGS. `
          : "") +
        (missingFolders.length
          ? `GALLERY_SLUGS entr(ies) with no registry folder: ${missingFolders.join(", ")} — the route would 404. `
          : ""),
    );
  }
}

/** Family order is the sidebar order; a Record keyed by slug makes an unfiled primitive a type error. */
const FAMILIES = [
  { id: "actions", label: "Actions" },
  { id: "forms", label: "Forms" },
  { id: "overlays", label: "Overlays & Menus" },
  { id: "navigation", label: "Navigation" },
  { id: "layout", label: "Layout" },
  { id: "data", label: "Data Display" },
  { id: "feedback", label: "Feedback" },
  { id: "chat", label: "Chat" },
] as const;

type FamilyId = (typeof FAMILIES)[number]["id"];

const FAMILY_OF: Record<GallerySlug, FamilyId> = {
  button: "actions",
  "button-group": "actions",
  kbd: "actions",
  toggle: "actions",
  "toggle-group": "actions",
  toolbar: "actions",
  calendar: "forms",
  checkbox: "forms",
  combobox: "forms",
  field: "forms",
  form: "forms",
  input: "forms",
  "input-group": "forms",
  "input-otp": "forms",
  label: "forms",
  "native-select": "forms",
  "number-field": "forms",
  questionnaire: "forms",
  "radio-group": "forms",
  select: "forms",
  slider: "forms",
  switch: "forms",
  textarea: "forms",
  "alert-dialog": "overlays",
  command: "overlays",
  "context-menu": "overlays",
  dialog: "overlays",
  drawer: "overlays",
  "dropdown-menu": "overlays",
  "hover-card": "overlays",
  menubar: "overlays",
  popover: "overlays",
  sheet: "overlays",
  tooltip: "overlays",
  breadcrumb: "navigation",
  "navigation-menu": "navigation",
  pagination: "navigation",
  sidebar: "navigation",
  tabs: "navigation",
  accordion: "layout",
  "aspect-ratio": "layout",
  collapsible: "layout",
  resizable: "layout",
  "scroll-area": "layout",
  separator: "layout",
  avatar: "data",
  badge: "data",
  card: "data",
  carousel: "data",
  chart: "data",
  item: "data",
  marker: "data",
  table: "data",
  alert: "feedback",
  empty: "feedback",
  meter: "feedback",
  progress: "feedback",
  skeleton: "feedback",
  spinner: "feedback",
  toast: "feedback",
  attachment: "chat",
  bubble: "chat",
  message: "chat",
  "message-scroller": "chat",
};

export const galleryFamilies: GalleryFamily[] = FAMILIES.map(({ id, label }) => ({
  id,
  label,
  components: galleryComponents.filter((component) => FAMILY_OF[component.slug as GallerySlug] === id),
}));

/** The primitives either side of `slug` in sidebar order, for the page-end pager. */
export function galleryNeighbors(slug: string): { prev?: GalleryComponent; next?: GalleryComponent } {
  const ordered = galleryFamilies.flatMap((family) => family.components);
  const at = ordered.findIndex((component) => component.slug === slug);
  return { prev: ordered[at - 1], next: ordered[at + 1] };
}

/** Look up a gallery component, or fail loudly if the pairing is broken. */
export function galleryComponent(slug: string): GalleryComponent {
  const component = galleryComponents.find((candidate) => candidate.slug === slug);
  if (!component) {
    throw new Error(
      `/components/${slug}: no gallery data — the route exists but packages/registry/components/${slug} has no items.`,
    );
  }
  return component;
}

/** The examples one gallery page renders, in registry order. */
export function galleryExamples(slug: string): GalleryExample[] {
  const examples = examplesBySlug.get(slug);
  if (!examples) {
    throw new Error(
      `/components/${slug}: no gallery examples — the route exists but packages/registry/components/${slug} has no items.`,
    );
  }
  return examples;
}
