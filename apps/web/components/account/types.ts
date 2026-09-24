export type Identity = { fullName: string; email: string; imageUrl: string };
export type LicenseRow = { key: string; displayKey: string };

export type LicensesState = { status: "loading" } | { status: "loaded"; licenses: LicenseRow[] } | { status: "error" };

export type View =
  | { kind: "signed-out" }
  | { kind: "loading" }
  | { kind: "signed-in"; identity: Identity }
  | { kind: "error" };

/** Everything the presentation needs; the Clerk container in account-panel.tsx owns all of it. */
export type AccountViewProps = {
  view: View;
  licenses: LicensesState;
  signingOut: boolean;
  retrying: boolean;
  onSignIn: () => void;
  onRetry: () => void;
  onRetryLicenses: () => void;
  onSignOut: () => void;
};
