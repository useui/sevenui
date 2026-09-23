import type { CSSProperties } from "react";
import { LOGOMARK_PATHS, LOGOMARK_VIEWBOX } from "../../components/logomark";
import { site } from "../site";
import { HEIGHT, WIDTH } from "./dimensions";

const BACKGROUND = "#fafafa";
const FOREGROUND = "#0a0a0a";
const MUTED = "#737373";
const BORDER = "#e5e5e5";
const FOOTER_FAINT = "#a3a3a3";

const PADDING = 72;
const MARK_SIZE = 32;

const TITLE_SIZE = 76;

const TITLE_MAX_CHARS = 64;
const DESCRIPTION_MAX_CHARS = 160;

const truncate = (value: string, max: number): string => {
  const chars = [...value];
  return chars.length > max ? `${chars.slice(0, max - 1).join("").trimEnd()}…` : value;
};

const LOGOMARK_SVG =
  `<svg viewBox="${LOGOMARK_VIEWBOX}" fill="none" xmlns="http://www.w3.org/2000/svg">` +
  LOGOMARK_PATHS.map((d) => `<path d="${d}" fill="${FOREGROUND}"/>`).join("") +
  `</svg>`;

const LOGOMARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(LOGOMARK_SVG).toString("base64")}`;

const FOOTER_REPO = `${site.github.owner}/${site.github.repo}`;
const FOOTER_SITE = site.url.replace(/^https?:\/\//, "");

const rootStyle: CSSProperties = {
  backgroundColor: BACKGROUND,
  color: FOREGROUND,
  display: "flex",
  flexDirection: "column",
  fontFamily: "Geist",
  height: HEIGHT,
  justifyContent: "space-between",
  padding: PADDING,
  width: WIDTH,
};

export type OgCardProps = {
  /** The page's own bare title (§16.4) — never `pageTitle()`'s suffixed form. */
  title: string;
  /** The page's own description, or `site.description` for a page with none. */
  description: string;
};

/** The 1200x630 OG card JSX tree. See this module's header for provenance. */
export function OgCard({ title, description }: OgCardProps) {
  return (
    <div style={rootStyle}>
      {/* Header: the logomark alone, 32x32, no wordmark (§16.2). */}
      <div style={{ alignItems: "center", display: "flex" }}>
        <img alt="" height={MARK_SIZE} src={LOGOMARK_DATA_URI} width={MARK_SIZE} />
      </div>

      {/* Headline + description. */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            color: FOREGROUND,
            fontSize: TITLE_SIZE,
            fontWeight: 600,
            letterSpacing: "-0.05em",
            lineHeight: 1.05,
            maxWidth: 1010,
            textWrap: "balance",
          }}
        >
          {truncate(title, TITLE_MAX_CHARS)}
        </div>
        <div
          style={{
            color: MUTED,
            fontSize: 30,
            lineHeight: 1.4,
            marginTop: 28,
            maxWidth: 900,
            textWrap: "balance",
          }}
        >
          {truncate(description, DESCRIPTION_MAX_CHARS)}
        </div>
      </div>

      {/* Footer: a 1px rule, then the repo/site row. */}
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <div style={{ backgroundColor: BORDER, height: 1, width: "100%" }} />
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            marginTop: 28,
            width: "100%",
          }}
        >
          <div style={{ color: MUTED, fontSize: 22 }}>{FOOTER_REPO}</div>
          <div style={{ color: FOOTER_FAINT, fontSize: 22 }}>{FOOTER_SITE}</div>
        </div>
      </div>
    </div>
  );
}
