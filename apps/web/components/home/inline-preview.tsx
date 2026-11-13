"use client";

import * as React from "react";
import { DEFAULT_FLAVOUR } from "../../lib/flavour";
import { FlavouredPreview } from "../flavour/flavoured-preview";
import { useFlavour } from "../flavour/use-flavour";

/**
 * FlavouredPreview, with the Base UI render kept out of a Suspense boundary until it is needed.
 *
 * React's server renderer outlines a Suspense boundary whose content is large: it sends the fallback in
 * place and the content later, in a hidden element that a script moves into place. FlavouredPreview wraps
 * every preview in one, so without JavaScript its Base UI preview never shows. Here the Base UI render is
 * plain markup until the reader's flavour first differs from the default; from then on FlavouredPreview
 * (and its boundary, loading, failure and retry handling) takes over and stays.
 */
export function InlineFlavouredPreview(props: React.ComponentProps<typeof FlavouredPreview>) {
  const flavour = useFlavour();
  const [handedOff, setHandedOff] = React.useState(false);
  React.useEffect(() => {
    if (flavour !== DEFAULT_FLAVOUR) setHandedOff(true);
  }, [flavour]);

  if (!handedOff) return <div data-preview-flavour="base-ui">{props.children}</div>;
  return <FlavouredPreview {...props} />;
}
