"use client";

import { useEffect } from "react";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import posthogInit from "./posthog-init";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthogInit();
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
