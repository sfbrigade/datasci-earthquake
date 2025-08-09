"use client";

import { useEffect } from "react";
import posthog from "../../instrumentation-client";

export function usePostHog() {
  useEffect(() => {
    // Enable PostHog in production or when explicitly enabled
    if (
      process.env.NODE_ENV === "production" ||
      process.env.NEXT_PUBLIC_POSTHOG_KEY
    ) {
      if (typeof window !== "undefined") {
        // Additional PostHog configuration can go here
      }
    }
  }, []);

  return {
    // Capture custom events
    capture: (event: string, properties?: Record<string, any>) => {
      if (typeof window !== "undefined") {
        posthog.capture(event, properties);
      }
    },

    // Identify users
    identify: (distinctId: string, properties?: Record<string, any>) => {
      if (typeof window !== "undefined") {
        posthog.identify(distinctId, properties);
      }
    },

    // Set user properties
    setPersonProperties: (properties: Record<string, any>) => {
      if (typeof window !== "undefined") {
        posthog.setPersonProperties(properties);
      }
    },

    // Reset user (logout)
    reset: () => {
      if (typeof window !== "undefined") {
        posthog.reset();
      }
    },

    // Feature flags
    isFeatureEnabled: (flag: string) => {
      if (typeof window !== "undefined") {
        return posthog.isFeatureEnabled(flag);
      }
      return false;
    },

    // Get feature flag value
    getFeatureFlag: (flag: string) => {
      if (typeof window !== "undefined") {
        return posthog.getFeatureFlag(flag);
      }
      return undefined;
    },
  };
}
