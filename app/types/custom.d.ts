import { PostHog } from "posthog-js";

// to allow adding `posthog` to the `windcow` object without TypeScript errors
declare global {
  interface Window {
    posthog: PostHog;
  }
}

export {}; // Essential for TypeScript to treat this as a module
