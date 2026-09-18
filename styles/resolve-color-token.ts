import system from "./theme";

const CSS_VAR_RE = /^var\(\s*(--[\w-]+)\s*\)$/;

// resolves a Chakra color token to its computed CSS value in the browser
// currently used for MapBox fill colors, which don't support Chakra color tokens or CSS variables
export function resolveColorToken(token: `colors.${string}`): string {
  if (typeof window === "undefined") {
    throw new Error(
      `Chakra color token "${token}" requires browser CSS resolution.`
    );
  }

  const tokenVar = system.token.var(token);

  if (typeof tokenVar !== "string") {
    throw new Error(`Unknown Chakra color token "${token}".`);
  }

  const styles = getComputedStyle(document.documentElement);
  const seen = new Set<string>();

  let value = tokenVar.trim();

  while (true) {
    const cssVar = CSS_VAR_RE.exec(value)?.[1];

    if (!cssVar) break;

    if (seen.has(cssVar)) {
      throw new Error(
        `Circular CSS variable reference while resolving "${token}".`
      );
    }

    seen.add(cssVar);

    value = styles.getPropertyValue(cssVar).trim();

    if (!value) {
      throw new Error(
        `Chakra color token "${token}" (${cssVar}) has no computed value.`
      );
    }
  }

  return value;
}
