"use client";

import { FlavouredPreview } from "../../flavour/flavoured-preview";
import { baseKit } from "./kit";
import { createReleasesApp } from "./releases-app";

const BaseReleasesApp = createReleasesApp(baseKit);

// A module-level loader, so the import() is a separate chunk that only a UI SDK reader fetches.
const loadUiSdk = () => import("./ui-sdk");

/**
 * The live surface in the reader's flavour: the Base UI render is server-rendered, and a UI SDK reader's
 * chunk swaps in through FlavouredPreview (the same loading, failure and retry path as every docs preview).
 */
export function HomeSurface() {
  return (
    <FlavouredPreview available folder="home/releases" importFolder={loadUiSdk} name="releases">
      <BaseReleasesApp />
    </FlavouredPreview>
  );
}
