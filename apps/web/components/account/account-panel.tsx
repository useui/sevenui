"use client";

import type { Clerk } from "@clerk/clerk-js";
import { useEffect, useRef, useState } from "react";
import { getClerkAlways, getClerkIfLikelySignedIn } from "../../lib/clerk";
import { AccountView } from "./account-view";
import type { LicensesState, View } from "./types";

export function AccountPanel() {
  const [view, setView] = useState<View>({ kind: "signed-out" });
  const [licenses, setLicenses] = useState<LicensesState>({ status: "loading" });
  const [signingOut, setSigningOut] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const clerkRef = useRef<Clerk | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function applyClerk(clerk: Clerk) {
    clerkRef.current = clerk;
    const user = clerk.user;
    if (!user) {
      setView({ kind: "signed-out" });
      return;
    }
    setView({
      kind: "signed-in",
      identity: {
        fullName: user.fullName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        imageUrl: user.imageUrl,
      },
    });
    // Identity and sign-out above never depend on this call resolving.
    setLicenses({ status: "loading" });
    void loadLicenses(clerk);
  }

  async function loadLicenses(clerk: Clerk) {
    try {
      const token = await clerk.session?.getToken();
      const res = await fetch("/api/me/licenses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`licenses request failed: ${res.status}`);
      const body = await res.json();
      if (!Array.isArray(body.licenses)) throw new Error("unexpected licenses shape");
      if (!mountedRef.current) return;
      setLicenses({ status: "loaded", licenses: body.licenses });
    } catch (e) {
      console.error("account:", e);
      if (!mountedRef.current) return;
      setLicenses({ status: "error" });
    }
  }

  useEffect(() => {
    const pending = getClerkIfLikelySignedIn();
    if (!pending) return; // no hint: the hero is never touched at all
    setView({ kind: "loading" }); // reached only when a boot is genuinely in flight
    (async () => {
      try {
        const clerk = await pending;
        if (!mountedRef.current) return;
        applyClerk(clerk);
      } catch (e) {
        console.error("account:", e);
        if (!mountedRef.current) return;
        setView({ kind: "error" });
      }
    })();
  }, []);

  async function handleSignIn() {
    try {
      const clerk = await getClerkAlways();
      clerkRef.current = clerk;
      await clerk.redirectToSignIn({ signInForceRedirectUrl: `${window.location.origin}/account` });
    } catch (e) {
      console.error("account:", e);
      if (!mountedRef.current) return;
      setView({ kind: "error" });
    }
  }

  async function handleRetry() {
    setRetrying(true);
    try {
      const clerk = await getClerkAlways();
      if (!mountedRef.current) return;
      applyClerk(clerk);
    } catch (e) {
      console.error("account:", e);
      if (!mountedRef.current) return;
      setView({ kind: "error" });
    } finally {
      if (mountedRef.current) setRetrying(false);
    }
  }

  async function handleSignOut() {
    const clerk = clerkRef.current;
    if (!clerk) return;
    setSigningOut(true);
    try {
      await clerk.signOut();
    } catch (e) {
      console.error("account:", e);
    }
    window.location.assign("/account");
  }

  return (
    <div id="account-root">
      <AccountView
        licenses={licenses}
        onRetry={handleRetry}
        onRetryLicenses={() => {
          const clerk = clerkRef.current;
          if (!clerk) return;
          setLicenses({ status: "loading" });
          void loadLicenses(clerk);
        }}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        retrying={retrying}
        signingOut={signingOut}
        view={view}
      />
    </div>
  );
}
