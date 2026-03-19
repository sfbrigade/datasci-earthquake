import posthog from "posthog-js";

export default function posthogInit() {
  if (
    process.env.NEXT_PUBLIC_POSTHOG_KEY !== undefined &&
    process.env.NEXT_PUBLIC_POSTHOG_HOST !== undefined
  ) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      defaults: "2025-05-24",
      external_scripts_inject_target: "head", // ensures posthog script is injected in the <head> of the document, preventing hydration errors
    });
  }
}
