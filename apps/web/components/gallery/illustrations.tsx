import type { ReactNode } from "react";
import type { GallerySlug } from "../../lib/gallery";

/*
 * Schematic drawings for the /components index: one per primitive, all on a 200×120 canvas and
 * drawn from the same few parts, so the grid reads as one set. Every color is a theme token, so the
 * drawings follow light/dark and the theme customizer like the real components do.
 */

const STROKE = { strokeWidth: 1, vectorEffect: "non-scaling-stroke" } as const;

type Tone = "muted" | "soft" | "strong" | "primary" | "destructive" | "background";

const FILL: Record<Tone, string> = {
  muted: "fill-muted",
  soft: "fill-muted-foreground/25",
  strong: "fill-foreground/75",
  primary: "fill-primary",
  destructive: "fill-destructive",
  background: "fill-background",
};

function Panel({ x, y, w, h, r = 6, dashed }: { x: number; y: number; w: number; h: number; r?: number; dashed?: boolean }) {
  return (
    <rect
      className="fill-background stroke-border"
      height={h}
      rx={r}
      strokeDasharray={dashed ? "4 3" : undefined}
      width={w}
      x={x}
      y={y}
      {...STROKE}
    />
  );
}

function Box({ x, y, w, h, r = 3, tone = "muted" }: { x: number; y: number; w: number; h: number; r?: number; tone?: Tone }) {
  return <rect className={FILL[tone]} height={h} rx={r} width={w} x={x} y={y} />;
}

/** A line of text. */
function Text({ x, y, w, strong, tone }: { x: number; y: number; w: number; strong?: boolean; tone?: Tone }) {
  return <Box h={4} r={2} tone={tone ?? (strong ? "strong" : "soft")} w={w} x={x} y={y - 2} />;
}

function Dot({ cx, cy, r, tone = "muted" }: { cx: number; cy: number; r: number; tone?: Tone }) {
  return <circle className={FILL[tone]} cx={cx} cy={cy} r={r} />;
}

function Ring({ cx, cy, r, strong }: { cx: number; cy: number; r: number; strong?: boolean }) {
  return (
    <circle
      className={strong ? "fill-background stroke-primary" : "fill-background stroke-border"}
      cx={cx}
      cy={cy}
      r={r}
      {...STROKE}
    />
  );
}

function Rule({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line className="stroke-border" x1={x1} x2={x2} y1={y1} y2={y2} {...STROKE} />;
}

/** A small stroked glyph (chevron, check, plus…) drawn in muted or primary-foreground ink. */
function Glyph({ d, tone = "muted" }: { d: string; tone?: "muted" | "strong" | "on-primary" }) {
  const ink = { muted: "stroke-muted-foreground", strong: "stroke-foreground", "on-primary": "stroke-primary-foreground" }[
    tone
  ];
  return (
    <path
      className={ink}
      d={d}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.4}
      vectorEffect="non-scaling-stroke"
    />
  );
}

const chevron = {
  down: (x: number, y: number) => `M${x - 3} ${y - 1.5}l3 3l3 -3`,
  up: (x: number, y: number) => `M${x - 3} ${y + 1.5}l3 -3l3 3`,
  right: (x: number, y: number) => `M${x - 1.5} ${y - 3}l3 3l-3 3`,
  left: (x: number, y: number) => `M${x + 1.5} ${y - 3}l-3 3l3 3`,
};
const check = (x: number, y: number) => `M${x - 3} ${y}l2 2l4 -4.5`;
const cross = (x: number, y: number) => `M${x - 2.5} ${y - 2.5}l5 5M${x + 2.5} ${y - 2.5}l-5 5`;

function Button({
  x,
  y,
  w,
  h = 14,
  variant = "primary",
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  variant?: "primary" | "outline" | "destructive" | "muted";
}) {
  const label = Math.max(8, w - 16);
  return (
    <g>
      {variant === "outline" ? (
        <Panel h={h} r={4} w={w} x={x} y={y} />
      ) : (
        <Box h={h} r={4} tone={variant} w={w} x={x} y={y} />
      )}
      <Box
        h={3}
        r={1.5}
        tone={variant === "outline" || variant === "muted" ? "strong" : "background"}
        w={label}
        x={x + (w - label) / 2}
        y={y + h / 2 - 1.5}
      />
    </g>
  );
}

function Backdrop() {
  return <rect className="fill-foreground/5" height={120} width={200} />;
}

const DRAWINGS: Record<GallerySlug, ReactNode> = {
  accordion: (
    <>
      <Panel h={84} w={120} x={40} y={18} />
      <Text strong w={48} x={52} y={29} />
      <Glyph d={chevron.up(147, 29)} />
      <Text w={84} x={52} y={44} />
      <Text w={64} x={52} y={52} />
      <Rule x1={40} x2={160} y1={62} y2={62} />
      <Text strong w={56} x={52} y={72} />
      <Glyph d={chevron.down(147, 72)} />
      <Rule x1={40} x2={160} y1={82} y2={82} />
      <Text strong w={40} x={52} y={92} />
      <Glyph d={chevron.down(147, 92)} />
    </>
  ),
  alert: (
    <>
      <Panel h={48} w={140} x={30} y={36} />
      <Ring cx={46} cy={50} r={6} />
      <Box h={4} r={1} tone="strong" w={1.6} x={45.2} y={47} />
      <Text strong w={54} x={60} y={49} />
      <Text w={96} x={60} y={60} />
      <Text w={70} x={60} y={69} />
    </>
  ),
  "alert-dialog": (
    <>
      <Backdrop />
      <Panel h={76} w={104} x={48} y={22} />
      <Text strong w={56} x={60} y={36} />
      <Text w={80} x={60} y={48} />
      <Text w={62} x={60} y={56} />
      <Button variant="outline" w={30} x={84} y={74} />
      <Button variant="destructive" w={26} x={118} y={74} />
    </>
  ),
  "aspect-ratio": (
    <>
      <Box h={63} r={6} w={112} x={44} y={18} />
      <Dot cx={70} cy={38} r={6} tone="soft" />
      <path className="fill-muted-foreground/20" d="M44 72l30 -22l20 14l16 -10l46 30v1a6 6 0 0 1 -6 6h-100a6 6 0 0 1 -6 -6z" />
      <Text w={22} x={89} y={94} />
      <Rule x1={44} x2={156} y1={100} y2={100} />
    </>
  ),
  attachment: (
    <>
      <Panel h={52} w={62} x={32} y={34} />
      <Box h={24} r={4} w={50} x={38} y={40} />
      <Text strong w={34} x={38} y={72} />
      <Text w={24} x={38} y={79} />
      <Panel h={52} w={62} x={106} y={34} />
      <Box h={24} r={4} tone="soft" w={14} x={112} y={40} />
      <Text strong w={30} x={130} y={46} />
      <Text w={22} x={130} y={54} />
      <Text strong w={38} x={112} y={72} />
      <Text w={20} x={112} y={79} />
      <Dot cx={94} cy={34} r={5} tone="strong" />
      <Glyph d={cross(94, 34)} tone="on-primary" />
    </>
  ),
  avatar: (
    <>
      {[70, 90, 110, 130].map((cx, index) => (
        <g key={cx}>
          <circle className="fill-muted stroke-background" cx={cx} cy={50} r={15} strokeWidth={3} />
          {index < 3 ? (
            <>
              <Dot cx={cx} cy={46} r={4.5} tone="soft" />
              <path className="fill-muted-foreground/25" d={`M${cx - 8} ${59}a8 6 0 0 1 16 0z`} />
            </>
          ) : (
            <Text strong w={10} x={cx - 5} y={50} />
          )}
        </g>
      ))}
      <Text strong w={44} x={78} y={82} />
      <Text w={30} x={85} y={91} />
    </>
  ),
  badge: (
    <>
      <Box h={14} r={7} tone="primary" w={38} x={38} y={38} />
      <Text tone="background" w={22} x={46} y={45} />
      <Panel h={14} r={7} w={42} x={82} y={38} />
      <Text strong w={26} x={90} y={45} />
      <Box h={14} r={7} w={32} x={130} y={38} />
      <Text strong w={16} x={138} y={45} />
      <Panel h={14} r={7} w={50} x={56} y={62} />
      <Dot cx={65} cy={69} r={2.5} tone="primary" />
      <Text strong w={30} x={71} y={69} />
      <Box h={14} r={7} tone="destructive" w={36} x={112} y={62} />
      <Text tone="background" w={20} x={120} y={69} />
    </>
  ),
  breadcrumb: (
    <>
      <Text w={24} x={30} y={60} />
      <Glyph d={chevron.right(63, 60)} />
      <Text w={32} x={71} y={60} />
      <Glyph d={chevron.right(112, 60)} />
      <Text strong w={40} x={120} y={60} />
      <Rule x1={120} x2={160} y1={68} y2={68} />
    </>
  ),
  bubble: (
    <>
      <Box h={22} r={10} w={86} x={30} y={24} />
      <Text strong w={60} x={40} y={35} />
      <Box h={22} r={10} tone="primary" w={80} x={90} y={52} />
      <Text tone="background" w={54} x={102} y={63} />
      <Box h={18} r={9} w={56} x={30} y={82} />
      <Dot cx={46} cy={91} r={2} tone="soft" />
      <Dot cx={54} cy={91} r={2} tone="soft" />
      <Dot cx={62} cy={91} r={2} tone="soft" />
    </>
  ),
  button: (
    <>
      <Button h={20} w={58} x={36} y={36} />
      <Button h={20} variant="outline" w={58} x={104} y={36} />
      <Button h={20} variant="muted" w={46} x={50} y={66} />
      <Panel h={20} r={4} w={20} x={104} y={66} />
      <Glyph d={`M110 76h8M114 72v8`} tone="strong" />
      <Box h={20} r={4} tone="destructive" w={20} x={130} y={66} />
      <Glyph d={cross(140, 76)} tone="on-primary" />
    </>
  ),
  "button-group": (
    <>
      <Panel h={24} w={126} x={37} y={48} />
      <Box h={22} r={5} w={41} x={38} y={49} />
      <Rule x1={79} x2={79} y1={48} y2={72} />
      <Rule x1={121} x2={121} y1={48} y2={72} />
      <Text strong w={24} x={46} y={60} />
      <Text strong w={24} x={88} y={60} />
      <Text strong w={24} x={130} y={60} />
    </>
  ),
  calendar: (
    <>
      <Panel h={94} w={104} x={48} y={13} />
      <Glyph d={chevron.left(60, 25)} />
      <Text strong w={40} x={80} y={25} />
      <Glyph d={chevron.right(140, 25)} />
      {Array.from({ length: 35 }, (_, day) => day).map((index) => {
        const col = index % 7;
        const row = Math.floor(index / 7);
        const x = 56 + col * 13;
        const y = 38 + row * 13;
        const inRange = index >= 16 && index <= 19;
        const edge = index === 15 || index === 20;
        return (
          <rect
            className={edge ? "fill-primary" : inRange ? "fill-muted" : "fill-muted-foreground/15"}
            height={edge || inRange ? 11 : 4}
            key={index}
            rx={edge || inRange ? 3 : 2}
            width={edge || inRange ? 11 : 4}
            x={edge || inRange ? x : x + 3.5}
            y={edge || inRange ? y : y + 3.5}
          />
        );
      })}
    </>
  ),
  card: (
    <>
      <Panel h={90} w={108} x={46} y={15} />
      <path className="fill-muted" d="M52 15h96a6 6 0 0 1 6 6v30h-108v-30a6 6 0 0 1 6 -6z" />
      <Text strong w={56} x={56} y={62} />
      <Text w={84} x={56} y={72} />
      <Text w={64} x={56} y={80} />
      <Button h={12} w={36} x={56} y={88} />
    </>
  ),
  carousel: (
    <>
      <Box h={46} r={6} tone="muted" w={34} x={16} y={30} />
      <Box h={46} r={6} tone="muted" w={34} x={150} y={30} />
      <Panel h={60} w={88} x={56} y={23} />
      <Box h={36} r={4} tone="soft" w={76} x={62} y={29} />
      <Text strong w={40} x={62} y={73} />
      <Ring cx={46} cy={53} r={8} />
      <Glyph d={chevron.left(46, 53)} tone="strong" />
      <Ring cx={154} cy={53} r={8} />
      <Glyph d={chevron.right(154, 53)} tone="strong" />
      <Box h={4} r={2} tone="primary" w={12} x={88} y={94} />
      <Dot cx={106} cy={96} r={2} tone="soft" />
      <Dot cx={113} cy={96} r={2} tone="soft" />
    </>
  ),
  chart: (
    <>
      <Rule x1={40} x2={164} y1={96} y2={96} />
      {[28, 44, 36, 58, 50, 70, 62].map((h, index) => (
        <Box h={h} key={h} r={2} tone={index === 5 ? "primary" : "soft"} w={12} x={46 + index * 16} y={96 - h} />
      ))}
      <Text w={20} x={40} y={104} />
      <Text w={20} x={144} y={104} />
    </>
  ),
  checkbox: (
    <>
      {[36, 60, 84].map((y, index) => (
        <g key={y}>
          {index === 1 ? (
            <rect className="fill-background stroke-border" height={12} rx={3} width={12} x={62} y={y - 6} {...STROKE} />
          ) : (
            <>
              <Box h={12} r={3} tone="primary" w={12} x={62} y={y - 6} />
              <Glyph d={check(68, y)} tone="on-primary" />
            </>
          )}
          <Text strong={index !== 1} w={[56, 44, 64][index]} x={82} y={y} />
        </g>
      ))}
    </>
  ),
  collapsible: (
    <>
      <Text strong w={60} x={40} y={24} />
      <Panel h={16} r={4} w={16} x={144} y={16} />
      <Glyph d="M149 23l3 -3l3 3M149 27l3 3l3 -3" />
      <Panel h={18} r={4} w={120} x={40} y={36} />
      <Text w={50} x={50} y={45} />
      <Panel h={18} r={4} w={120} x={40} y={60} />
      <Text w={62} x={50} y={69} />
      <Panel h={18} r={4} w={120} x={40} y={84} />
      <Text w={42} x={50} y={93} />
    </>
  ),
  combobox: (
    <>
      <Panel h={20} r={5} w={120} x={40} y={18} />
      <Text strong w={40} x={48} y={28} />
      <Box h={10} r={0.5} tone="strong" w={1} x={90} y={23} />
      <Glyph d={chevron.down(150, 28)} />
      <Panel h={60} w={120} x={40} y={44} />
      <Box h={16} r={4} w={112} x={44} y={48} />
      <Text strong w={46} x={52} y={56} />
      <Glyph d={check(146, 56)} tone="strong" />
      <Text w={56} x={52} y={74} />
      <Text w={38} x={52} y={90} />
    </>
  ),
  command: (
    <>
      <Panel h={90} w={130} x={35} y={15} />
      <Ring cx={48} cy={27} r={4} />
      <Glyph d="M51 30l3 3" />
      <Text w={50} x={60} y={27} />
      <Rule x1={35} x2={165} y1={38} y2={38} />
      <Text tone="soft" w={24} x={45} y={47} />
      <Box h={16} r={4} w={120} x={40} y={52} />
      <Box h={8} r={2} tone="soft" w={8} x={46} y={56} />
      <Text strong w={46} x={60} y={60} />
      <Panel h={10} r={2} w={18} x={136} y={55} />
      <Box h={8} r={2} tone="soft" w={8} x={46} y={72} />
      <Text w={54} x={60} y={76} />
      <Box h={8} r={2} tone="soft" w={8} x={46} y={88} />
      <Text w={38} x={60} y={92} />
    </>
  ),
  "context-menu": (
    <>
      <Panel dashed h={70} r={8} w={96} x={24} y={20} />
      <Text w={40} x={52} y={55} />
      <Panel h={60} w={80} x={90} y={46} />
      <Box h={14} r={3} w={72} x={94} y={50} />
      <Text strong w={36} x={100} y={57} />
      <Text w={10} x={148} y={57} />
      <Text w={44} x={100} y={73} />
      <Rule x1={90} x2={170} y1={82} y2={82} />
      <Text tone="destructive" w={30} x={100} y={94} />
      <path className="fill-foreground stroke-background" d="M86 44l0 13l3.5 -3l2.5 5.5l2 -1l-2.5 -5.5l4.5 0z" strokeWidth={1} />
    </>
  ),
  dialog: (
    <>
      <Backdrop />
      <Panel h={84} w={116} x={42} y={18} />
      <Text strong w={52} x={54} y={31} />
      <Glyph d={cross(146, 30)} />
      <Text w={84} x={54} y={43} />
      <Panel h={16} r={4} w={92} x={54} y={52} />
      <Text w={40} x={60} y={60} />
      <Button w={34} x={112} y={78} />
      <Button variant="outline" w={30} x={78} y={78} />
    </>
  ),
  drawer: (
    <>
      <Backdrop />
      <path className="fill-background stroke-border" d="M34 50a8 8 0 0 1 8 -8h116a8 8 0 0 1 8 8v70h-132z" {...STROKE} />
      <Box h={4} r={2} tone="soft" w={28} x={86} y={48} />
      <Text strong w={50} x={75} y={64} />
      <Text w={80} x={60} y={74} />
      <Button h={16} w={108} x={46} y={86} />
    </>
  ),
  "dropdown-menu": (
    <>
      <Panel h={18} r={4} w={58} x={40} y={18} />
      <Text strong w={30} x={48} y={27} />
      <Glyph d={chevron.down(88, 27)} />
      <Panel h={64} w={90} x={40} y={42} />
      <Box h={14} r={3} w={82} x={44} y={46} />
      <Box h={7} r={2} tone="soft" w={7} x={50} y={49.5} />
      <Text strong w={36} x={62} y={53} />
      <Text w={12} x={108} y={53} />
      <Box h={7} r={2} tone="soft" w={7} x={50} y={65.5} />
      <Text w={44} x={62} y={69} />
      <Rule x1={40} x2={130} y1={80} y2={80} />
      <Box h={7} r={2} tone="destructive" w={7} x={50} y={89.5} />
      <Text tone="destructive" w={32} x={62} y={93} />
    </>
  ),
  empty: (
    <>
      <Panel dashed h={90} r={8} w={124} x={38} y={15} />
      <Dot cx={100} cy={40} r={12} />
      <Box h={10} r={2} tone="soft" w={12} x={94} y={35} />
      <Text strong w={50} x={75} y={62} />
      <Text w={76} x={62} y={71} />
      <Button h={14} variant="outline" w={40} x={80} y={82} />
    </>
  ),
  field: (
    <>
      <Text strong w={32} x={44} y={24} />
      <Panel h={20} r={5} w={112} x={44} y={31} />
      <Text w={56} x={52} y={41} />
      <Text w={84} x={44} y={60} />
      <Text strong w={40} x={44} y={78} />
      <rect className="fill-background stroke-destructive" height={20} rx={5} width={112} x={44} y={85} {...STROKE} />
      <Text tone="destructive" w={60} x={44} y={112} />
    </>
  ),
  form: (
    <>
      <Panel h={100} w={120} x={40} y={10} />
      <Text strong w={30} x={52} y={22} />
      <Panel h={14} r={4} w={96} x={52} y={27} />
      <Text strong w={36} x={52} y={50} />
      <Panel h={14} r={4} w={96} x={52} y={55} />
      <Box h={9} r={2} tone="primary" w={9} x={52} y={76} />
      <Glyph d={check(56.5, 80.5)} tone="on-primary" />
      <Text w={48} x={66} y={80.5} />
      <Button w={96} x={52} y={90} />
    </>
  ),
  "hover-card": (
    <>
      <Text strong w={40} x={40} y={22} />
      <Rule x1={40} x2={80} y1={27} y2={27} />
      <Panel h={70} w={124} x={38} y={34} />
      <Dot cx={56} cy={52} r={9} />
      <Text strong w={44} x={72} y={48} />
      <Text w={30} x={72} y={57} />
      <Text w={96} x={48} y={74} />
      <Text w={70} x={48} y={82} />
      <Text w={24} x={48} y={94} />
      <Text w={24} x={80} y={94} />
    </>
  ),
  input: (
    <>
      <Text strong w={30} x={40} y={26} />
      <Panel h={22} r={5} w={120} x={40} y={33} />
      <Text w={54} x={49} y={44} />
      <rect className="fill-background stroke-primary" height={22} rx={5} width={120} x={40} y={66} {...STROKE} />
      <Ring cx={52} cy={77} r={3.5} />
      <Glyph d="M54.5 79.5l2 2" />
      <Text strong w={34} x={62} y={77} />
      <Box h={10} r={0.5} tone="strong" w={1} x={98} y={72} />
    </>
  ),
  "input-group": (
    <>
      <Panel h={24} r={5} w={132} x={34} y={48} />
      <path className="fill-muted" d="M39 48h31v24h-31a5 5 0 0 1 -5 -5v-14a5 5 0 0 1 5 -5z" />
      <Rule x1={70} x2={70} y1={48} y2={72} />
      <Text w={22} x={41} y={60} />
      <Text strong w={48} x={78} y={60} />
      <Box h={16} r={4} w={16} x={146} y={52} />
      <rect className="fill-none stroke-foreground" height={6} rx={1.5} width={6} x={151} y={58.5} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      <path className="stroke-foreground" d="M153 56.5h4.5a1.5 1.5 0 0 1 1.5 1.5v4.5" fill="none" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
    </>
  ),
  "input-otp": (
    <>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const x = 36 + index * 20 + (index > 2 ? 12 : 0);
        return (
          <g key={index}>
            <rect
              className={index === 3 ? "fill-background stroke-primary" : "fill-background stroke-border"}
              height={24}
              rx={4}
              width={17}
              x={x}
              y={48}
              {...STROKE}
            />
            {index < 3 && <Box h={8} r={1.5} tone="strong" w={5} x={x + 6} y={56} />}
            {index === 3 && <Box h={10} r={0.5} tone="strong" w={1} x={x + 8} y={55} />}
          </g>
        );
      })}
      <Box h={2} r={1} tone="soft" w={6} x={97} y={59} />
    </>
  ),
  item: (
    <>
      {[26, 64].map((y, index) => (
        <g key={y}>
          <Panel h={30} w={140} x={30} y={y} />
          <Box h={16} r={4} tone={index === 0 ? "soft" : "muted"} w={16} x={38} y={y + 7} />
          <Text strong w={48} x={62} y={y + 11} />
          <Text w={64} x={62} y={y + 19} />
          <Button h={12} variant="outline" w={28} x={134} y={y + 9} />
        </g>
      ))}
    </>
  ),
  kbd: (
    <>
      {[
        { x: 58, w: 26, label: "⌘" },
        { x: 90, w: 26, label: "⇧" },
        { x: 122, w: 22, label: "K" },
      ].map((key) => (
        <g key={key.label}>
          <rect className="fill-muted-foreground/25" height={26} rx={5} width={key.w} x={key.x} y={48} />
          <rect className="fill-background stroke-border" height={24} rx={5} width={key.w} x={key.x} y={45} {...STROKE} />
          <text
            className="fill-foreground font-sans text-[11px] font-medium"
            textAnchor="middle"
            x={key.x + key.w / 2}
            y={61}
          >
            {key.label}
          </text>
        </g>
      ))}
      <Text w={50} x={75} y={88} />
    </>
  ),
  label: (
    <>
      <Text strong w={40} x={44} y={34} />
      <Dot cx={89} cy={34} r={2} tone="destructive" />
      <Panel h={20} r={5} w={112} x={44} y={41} />
      <Text w={48} x={52} y={51} />
      <rect className="fill-background stroke-border" height={11} rx={3} width={11} x={44} y={74} {...STROKE} />
      <Text strong w={60} x={62} y={79.5} />
    </>
  ),
  marker: (
    <>
      <Text w={120} x={40} y={36} />
      <Text w={34} x={40} y={50} />
      <Box h={14} r={7} w={52} x={78} y={43} />
      <Dot cx={86} cy={50} r={3} tone="primary" />
      <Text strong w={32} x={93} y={50} />
      <Text w={26} x={134} y={50} />
      <Text w={112} x={40} y={64} />
      <Text w={80} x={40} y={78} />
    </>
  ),
  menubar: (
    <>
      <Panel h={20} r={5} w={150} x={25} y={18} />
      <Box h={14} r={3} w={28} x={28} y={21} />
      <Text strong w={16} x={34} y={28} />
      <Text strong w={16} x={66} y={28} />
      <Text strong w={18} x={92} y={28} />
      <Text strong w={20} x={120} y={28} />
      <Panel h={64} w={86} x={28} y={42} />
      <Text strong w={34} x={38} y={54} />
      <Text w={14} x={92} y={54} />
      <Text w={40} x={38} y={68} />
      <Text w={14} x={92} y={68} />
      <Rule x1={28} x2={114} y1={77} y2={77} />
      <Text w={30} x={38} y={87} />
      <Glyph d={chevron.right(102, 87)} />
      <Text w={36} x={38} y={98} />
    </>
  ),
  message: (
    <>
      {[26, 70].map((y, index) => (
        <g key={y}>
          <Dot cx={42} cy={y + 4} r={9} tone={index === 0 ? "soft" : "muted"} />
          <Text strong w={36} x={58} y={y} />
          <Text w={18} x={98} y={y} />
          <Text w={100} x={58} y={y + 10} />
          <Text w={[76, 54][index]} x={58} y={y + 18} />
        </g>
      ))}
    </>
  ),
  "message-scroller": (
    <>
      <Panel h={98} w={116} x={42} y={11} />
      <Box h={14} r={7} w={62} x={50} y={18} />
      <Box h={14} r={7} tone="primary" w={56} x={94} y={38} />
      <Box h={14} r={7} w={74} x={50} y={58} />
      <Box h={14} r={7} tone="primary" w={44} x={106} y={78} />
      <Ring cx={100} cy={98} r={8} />
      <Glyph d={chevron.down(100, 98)} tone="strong" />
    </>
  ),
  meter: (
    <>
      <Text strong w={40} x={40} y={42} />
      <Text w={20} x={140} y={42} />
      <Box h={8} r={4} w={120} x={40} y={50} />
      <Box h={8} r={4} tone="primary" w={82} x={40} y={50} />
      <Text strong w={32} x={40} y={76} />
      <Text w={20} x={140} y={76} />
      <Box h={8} r={4} w={120} x={40} y={84} />
      <Box h={8} r={4} tone="destructive" w={108} x={40} y={84} />
    </>
  ),
  "native-select": (
    <>
      <Text strong w={36} x={50} y={42} />
      <Panel h={22} r={5} w={100} x={50} y={50} />
      <Text strong w={44} x={59} y={61} />
      <Glyph d="M136 58l3 -3l3 3M136 64l3 3l3 -3" />
    </>
  ),
  "navigation-menu": (
    <>
      <Box h={14} r={4} w={40} x={30} y={16} />
      <Text strong w={22} x={36} y={23} />
      <Glyph d={chevron.down(63, 23)} tone="strong" />
      <Text strong w={24} x={80} y={23} />
      <Text strong w={24} x={114} y={23} />
      <Panel h={68} w={140} x={30} y={36} />
      <Box h={56} r={4} w={46} x={36} y={42} />
      <Text strong w={28} x={42} y={88} />
      {[48, 66, 84].map((y) => (
        <g key={y}>
          <Text strong w={36} x={92} y={y} />
          <Text w={64} x={92} y={y + 8} />
        </g>
      ))}
    </>
  ),
  "number-field": (
    <>
      <Text strong w={36} x={56} y={42} />
      <Panel h={22} r={5} w={88} x={56} y={50} />
      <Rule x1={78} x2={78} y1={50} y2={72} />
      <Rule x1={122} x2={122} y1={50} y2={72} />
      <Glyph d="M63 61h8" tone="strong" />
      <Glyph d="M129 61h8M133 57v8" tone="strong" />
      <Text strong w={16} x={92} y={61} />
    </>
  ),
  pagination: (
    <>
      <Glyph d={chevron.left(30, 60)} />
      <Text w={24} x={36} y={60} />
      {[
        { x: 74, n: "1" },
        { x: 91, n: "2" },
        { x: 108, n: "3" },
      ].map((page) => (
        <g key={page.n}>
          {page.n === "2" && <Panel h={18} r={4} w={18} x={page.x - 9} y={51} />}
          <text className="fill-foreground font-sans text-[9px] font-medium" textAnchor="middle" x={page.x} y={63}>
            {page.n}
          </text>
        </g>
      ))}
      <Dot cx={124} cy={60} r={1.3} tone="soft" />
      <Dot cx={129} cy={60} r={1.3} tone="soft" />
      <Dot cx={134} cy={60} r={1.3} tone="soft" />
      <Text w={20} x={144} y={60} />
      <Glyph d={chevron.right(170, 60)} />
    </>
  ),
  popover: (
    <>
      <Button h={16} variant="outline" w={50} x={40} y={16} />
      <path className="fill-background stroke-border" d="M60 40l5 -6l5 6" {...STROKE} />
      <Panel h={64} w={112} x={40} y={40} />
      <rect className="fill-background" height={3} width={9} x={60.5} y={39} />
      <Text strong w={46} x={50} y={52} />
      <Text w={80} x={50} y={61} />
      <Panel h={14} r={4} w={92} x={50} y={70} />
      <Text w={30} x={56} y={77} />
      <Button h={12} w={30} x={112} y={88} />
    </>
  ),
  progress: (
    <>
      <Text strong w={48} x={40} y={36} />
      <Text w={16} x={144} y={36} />
      <Box h={6} r={3} w={120} x={40} y={43} />
      <Box h={6} r={3} tone="primary" w={78} x={40} y={43} />
      <Text strong w={36} x={40} y={70} />
      <Text w={16} x={144} y={70} />
      <Box h={6} r={3} w={120} x={40} y={77} />
      <Box h={6} r={3} tone="primary" w={30} x={40} y={77} />
    </>
  ),
  questionnaire: (
    <>
      <Box h={4} r={2} tone="primary" w={28} x={48} y={14} />
      <Box h={4} r={2} tone="primary" w={28} x={80} y={14} />
      <Box h={4} r={2} w={28} x={112} y={14} />
      <Text strong w={84} x={48} y={30} />
      {[38, 58].map((y, index) => (
        <g key={y}>
          {index === 1 ? (
            <rect className="fill-muted stroke-primary" height={16} rx={4} width={104} x={48} y={y} {...STROKE} />
          ) : (
            <Panel h={16} r={4} w={104} x={48} y={y} />
          )}
          <Ring cx={57} cy={y + 8} r={3.5} strong={index === 1} />
          {index === 1 && <Dot cx={57} cy={y + 8} r={1.8} tone="primary" />}
          <Text strong={index === 1} w={[40, 52][index]} x={66} y={y + 8} />
        </g>
      ))}
      <Button w={36} x={116} y={84} />
    </>
  ),
  "radio-group": (
    <>
      {[36, 60, 84].map((y, index) => (
        <g key={y}>
          <Ring cx={68} cy={y} r={6} strong={index === 0} />
          {index === 0 && <Dot cx={68} cy={y} r={3} tone="primary" />}
          <Text strong={index === 0} w={[52, 60, 40][index]} x={82} y={y} />
        </g>
      ))}
    </>
  ),
  resizable: (
    <>
      <Panel h={82} w={140} x={30} y={19} />
      <Rule x1={86} x2={86} y1={19} y2={101} />
      <Rule x1={86} x2={170} y1={60} y2={60} />
      <Box h={14} r={2} tone="soft" w={5} x={83.5} y={53} />
      <Box h={5} r={2} tone="soft" w={14} x={121} y={57.5} />
      <Text strong w={30} x={40} y={32} />
      <Text w={36} x={40} y={42} />
      <Text w={28} x={40} y={50} />
      <Text strong w={34} x={96} y={32} />
      <Text w={50} x={96} y={42} />
      <Text strong w={28} x={96} y={73} />
      <Text w={44} x={96} y={83} />
    </>
  ),
  "scroll-area": (
    <>
      <Panel h={90} w={104} x={48} y={15} />
      {[26, 38, 50, 62, 74, 86, 98].map((y, index) => (
        <Text key={y} strong={index === 0} w={[40, 64, 56, 70, 48, 62, 52][index]} x={58} y={y} />
      ))}
      <Box h={78} r={2} w={4} x={142} y={21} />
      <Box h={28} r={2} tone="soft" w={4} x={142} y={30} />
    </>
  ),
  select: (
    <>
      <Panel h={20} r={5} w={112} x={44} y={18} />
      <Text strong w={44} x={52} y={28} />
      <Glyph d={chevron.down(146, 28)} />
      <Panel h={62} w={112} x={44} y={42} />
      <Text w={50} x={56} y={54} />
      <Box h={16} r={4} w={104} x={48} y={62} />
      <Glyph d={check(58, 70)} tone="strong" />
      <Text strong w={44} x={66} y={70} />
      <Text w={38} x={56} y={90} />
    </>
  ),
  separator: (
    <>
      <Text strong w={60} x={40} y={34} />
      <Text w={90} x={40} y={44} />
      <Rule x1={40} x2={160} y1={58} y2={58} />
      <Text w={24} x={40} y={74} />
      <Rule x1={72} x2={72} y1={67} y2={81} />
      <Text w={24} x={80} y={74} />
      <Rule x1={112} x2={112} y1={67} y2={81} />
      <Text w={24} x={120} y={74} />
    </>
  ),
  sheet: (
    <>
      <Backdrop />
      <Text w={50} x={20} y={24} />
      <Text w={36} x={20} y={34} />
      <path className="fill-background stroke-border" d="M200 0h-88v120h88" {...STROKE} />
      <Text strong w={40} x={122} y={20} />
      <Glyph d={cross(188, 20)} />
      <Text w={60} x={122} y={31} />
      <Text strong w={26} x={122} y={48} />
      <Panel h={14} r={4} w={66} x={122} y={53} />
      <Text strong w={30} x={122} y={78} />
      <Panel h={14} r={4} w={66} x={122} y={83} />
      <Button h={12} w={66} x={122} y={102} />
    </>
  ),
  sidebar: (
    <>
      <Panel h={94} w={152} x={24} y={13} />
      <path className="fill-muted/70" d="M30 13h44v94h-44a6 6 0 0 1 -6 -6v-82a6 6 0 0 1 6 -6z" />
      <Rule x1={74} x2={74} y1={13} y2={107} />
      <Box h={10} r={3} tone="primary" w={10} x={31} y={20} />
      <Text strong w={20} x={45} y={25} />
      <Box h={12} r={3} tone="background" w={38} x={30} y={38} />
      <Text strong w={22} x={36} y={44} />
      <Text w={26} x={36} y={60} />
      <Text w={20} x={36} y={72} />
      <Text w={24} x={36} y={84} />
      <Text strong w={40} x={84} y={25} />
      <Box h={30} r={4} w={40} x={84} y={36} />
      <Box h={30} r={4} w={40} x={128} y={36} />
      <Box h={30} r={4} w={84} x={84} y={70} />
    </>
  ),
  skeleton: (
    <>
      <Dot cx={54} cy={40} r={13} />
      <Box h={8} r={4} w={80} x={76} y={31} />
      <Box h={8} r={4} w={56} x={76} y={43} />
      <Box h={36} r={6} w={116} x={41} y={64} />
    </>
  ),
  slider: (
    <>
      <Box h={5} r={2.5} w={120} x={40} y={40} />
      <Box h={5} r={2.5} tone="primary" w={70} x={40} y={40} />
      <circle className="fill-background stroke-primary" cx={110} cy={42.5} r={7} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <Box h={5} r={2.5} w={120} x={40} y={78} />
      <Box h={5} r={2.5} tone="primary" w={52} x={62} y={78} />
      <circle className="fill-background stroke-primary" cx={62} cy={80.5} r={7} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      <circle className="fill-background stroke-primary" cx={114} cy={80.5} r={7} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </>
  ),
  spinner: (
    <>
      <circle className="fill-none stroke-muted" cx={100} cy={44} r={16} strokeWidth={4} />
      <circle
        className="fill-none stroke-primary"
        cx={100}
        cy={44}
        r={16}
        strokeDasharray="30 100"
        strokeLinecap="round"
        strokeWidth={4}
        transform="rotate(-90 100 44)"
      />
      <Box h={18} r={4} tone="primary" w={64} x={68} y={78} />
      <circle className="fill-none stroke-primary-foreground/40" cx={80} cy={87} r={4} strokeWidth={1.5} />
      <path className="fill-none stroke-primary-foreground" d="M80 83a4 4 0 0 1 4 4" strokeLinecap="round" strokeWidth={1.5} />
      <Text tone="background" w={36} x={90} y={87} />
    </>
  ),
  switch: (
    <>
      {[40, 72].map((y, index) => (
        <g key={y}>
          <Box h={16} r={8} tone={index === 0 ? "primary" : "muted"} w={28} x={58} y={y - 8} />
          <Dot cx={index === 0 ? 78 : 66} cy={y} r={6} tone="background" />
          <Text strong={index === 0} w={[52, 44][index]} x={96} y={y} />
        </g>
      ))}
    </>
  ),
  table: (
    <>
      <Panel h={82} w={146} x={27} y={19} />
      <path className="fill-muted" d="M33 19h134a6 6 0 0 1 6 6v10h-146v-10a6 6 0 0 1 6 -6z" />
      <Text strong w={26} x={36} y={27} />
      <Text strong w={20} x={98} y={27} />
      <Text strong w={20} x={144} y={27} />
      {[47, 63, 79, 93].map((y, index) => (
        <g key={y}>
          {index > 0 && <Rule x1={27} x2={173} y1={y - 8} y2={y - 8} />}
          <Text w={[40, 34, 46, 30][index]} x={36} y={y} />
          <Text w={22} x={96} y={y} />
          <Text strong w={18} x={146} y={y} />
        </g>
      ))}
    </>
  ),
  tabs: (
    <>
      <Box h={20} r={5} w={120} x={40} y={20} />
      <rect className="fill-background stroke-border" height={16} rx={4} width={38} x={42} y={22} {...STROKE} />
      <Text strong w={22} x={50} y={30} />
      <Text w={22} x={89} y={30} />
      <Text w={22} x={128} y={30} />
      <Panel h={56} w={120} x={40} y={46} />
      <Text strong w={50} x={50} y={58} />
      <Text w={96} x={50} y={68} />
      <Text w={76} x={50} y={76} />
      <Button h={12} w={32} x={50} y={84} />
    </>
  ),
  textarea: (
    <>
      <Text strong w={36} x={40} y={26} />
      <Panel h={56} r={5} w={120} x={40} y={33} />
      <Text w={96} x={49} y={45} />
      <Text w={100} x={49} y={54} />
      <Text w={62} x={49} y={63} />
      <Glyph d="M148 84l6 -6M152 84l2 -2" />
      <Text w={24} x={136} y={98} />
    </>
  ),
  toast: (
    <>
      <Panel h={30} r={6} w={104} x={62} y={46} />
      <Panel h={32} r={6} w={116} x={56} y={56} />
      <Panel h={36} w={128} x={50} y={68} />
      <Dot cx={66} cy={86} r={7} tone="primary" />
      <Glyph d={check(66, 86)} tone="on-primary" />
      <Text strong w={50} x={80} y={81} />
      <Text w={64} x={80} y={91} />
      <Button h={12} variant="outline" w={22} x={148} y={80} />
    </>
  ),
  toggle: (
    <>
      <Box h={24} r={5} w={24} x={62} y={48} />
      <text className="fill-foreground font-sans text-[13px] font-bold" textAnchor="middle" x={74} y={64.5}>
        B
      </text>
      <Panel h={24} r={5} w={24} x={94} y={48} />
      <text className="fill-muted-foreground font-serif text-[13px] italic" textAnchor="middle" x={106} y={64.5}>
        I
      </text>
      <Panel h={24} r={5} w={24} x={126} y={48} />
      <text className="fill-muted-foreground font-sans text-[13px] underline" textAnchor="middle" x={138} y={64}>
        U
      </text>
    </>
  ),
  "toggle-group": (
    <>
      <Panel h={26} r={6} w={96} x={52} y={47} />
      <Rule x1={84} x2={84} y1={47} y2={73} />
      <Rule x1={116} x2={116} y1={47} y2={73} />
      <Box h={22} r={4} w={30} x={86} y={49} />
      {[
        { x: 60, align: "left" },
        { x: 92, align: "center" },
        { x: 124, align: "right" },
      ].map((group) =>
        [
          { w: 16, y: 54 },
          { w: 10, y: 59 },
          { w: 14, y: 64 },
        ].map((line) => {
          const offset = { left: 0, center: (16 - line.w) / 2, right: 16 - line.w }[group.align] ?? 0;
          return (
            <Box
              h={2}
              key={`${group.align}-${line.y}`}
              r={1}
              tone={group.align === "center" ? "strong" : "soft"}
              w={line.w}
              x={group.x + offset}
              y={line.y}
            />
          );
        }),
      )}
    </>
  ),
  toolbar: (
    <>
      <Panel h={26} r={6} w={154} x={23} y={47} />
      <Box h={18} r={4} w={18} x={28} y={51} />
      <Box h={8} r={2} tone="strong" w={8} x={33} y={56} />
      <Box h={8} r={2} tone="soft" w={8} x={55} y={56} />
      <Box h={8} r={2} tone="soft" w={8} x={73} y={56} />
      <Rule x1={88} x2={88} y1={52} y2={68} />
      <Text strong w={24} x={96} y={60} />
      <Box h={8} r={2} tone="soft" w={8} x={128} y={56} />
      <Rule x1={144} x2={144} y1={52} y2={68} />
      <Box h={8} r={2} tone="destructive" w={8} x={154} y={56} />
    </>
  ),
  tooltip: (
    <>
      <Box h={20} r={5} tone="strong" w={76} x={62} y={32} />
      <path className="fill-foreground/75" d="M95 52l5 5l5 -5z" />
      <Text tone="background" w={52} x={74} y={42} />
      <Button h={18} variant="outline" w={48} x={76} y={66} />
    </>
  ),
};

export function PrimitiveIllustration({ slug, className }: { slug: GallerySlug; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg">
      {DRAWINGS[slug]}
    </svg>
  );
}
