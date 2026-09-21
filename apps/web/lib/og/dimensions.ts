// The OG card's canvas size, in one place (task-9.2b fix round 1). Blume kept
// exactly one `og/dimensions.ts` shared between its card renderer and the
// endpoints that declared `og:image:width`/`og:image:height`, for a concrete
// reason: if the card's own canvas size and a consumer's declared size ever
// drift apart, Satori silently letterboxes or clips the render — no error,
// no failing check, just a wrong-looking card nothing points at, and a
// crawler that pre-allocates layout from the declared box gets it wrong too.
//
// Three consumers import these two numbers rather than each carrying its own
// copy: `lib/og/card.tsx` (`OgCard`'s root `<div>` is sized to exactly this),
// `app/og/[...slug]/route.tsx` (`ImageResponse`'s own `width`/`height`
// options), and `lib/metadata.tsx` (`og:image:width`/`og:image:height`, the
// declared box a social platform reserves before the image itself loads).
export const WIDTH = 1200;
export const HEIGHT = 630;
