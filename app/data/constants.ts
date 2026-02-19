// Font CSS variable names
export const ManropeVariableName = "--font-manrope" as const;
export const InterVariableName = "--font-inter" as const;

// AB testing variant placeholders (to be replaced with e.g. PostHog)
export type Variant = "map-centric" | "data-centric";
export const CurrentVariant: Variant = "map-centric";
