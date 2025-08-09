import posthog from "posthog-js";

if (typeof window !== "undefined") {
  posthog.init("phc_i31362DEdeHty6QpUfc5kdpAkwgxTLu5dppb2eALWQ7", {
    api_host: "https://us.posthog.com",
    person_profiles: "identified_only", // or 'always' to create profiles for anonymous users as well
    capture_pageview: true, // enable automatic pageview capture, as we capture manually
  });
}

export default posthog;
