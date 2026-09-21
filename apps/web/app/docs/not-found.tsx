import type { Metadata } from "next";
import { notFoundMetadata } from "../../lib/metadata";
import RootNotFound from "../not-found";

export const metadata: Metadata = notFoundMetadata();

export default function DocsNotFound() {
  return <RootNotFound />;
}
