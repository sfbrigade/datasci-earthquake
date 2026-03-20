type PosthogProperties = Record<string, string | number | boolean | null | undefined>;

let posthogModulePromise: Promise<typeof import("posthog-js")["default"] | null> | null = null;

const hasPosthogConfig = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST
);

const loadPosthog = async () => {
  if (!hasPosthogConfig || typeof window === "undefined") {
    return null;
  }

  if (!posthogModulePromise) {
    posthogModulePromise = import("posthog-js")
      .then((module) => module.default)
      .catch(() => null);
  }

  return posthogModulePromise;
};

export const capturePosthogEvent = async (
  eventName: string,
  properties?: PosthogProperties
) => {
  const posthog = await loadPosthog();
  posthog?.capture(eventName, properties);
};