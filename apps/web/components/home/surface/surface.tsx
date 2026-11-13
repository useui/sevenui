"use client";

import { InlineFlavouredPreview } from "../inline-preview";
import { baseKit } from "./kit";
import { createReleasesApp } from "./releases-app";

const BaseReleasesApp = createReleasesApp(baseKit);

// A module-level loader, so the import() is a separate chunk that only a UI SDK reader fetches.
const loadUiSdk = () => import("./ui-sdk");

/**
 * The live surface in the reader's flavour: the Base UI render is server-rendered, and a UI SDK reader's
 * chunk swaps in through FlavouredPreview (the same loading, failure and retry path as every docs preview),
 * kept out of a Suspense boundary until then so the Base UI render works without JavaScript.
 */
export function HomeSurface() {
  return (
    <InlineFlavouredPreview available folder="home/releases" importFolder={loadUiSdk} name="releases">
      <BaseReleasesApp />
    </InlineFlavouredPreview>
  );
}
