// Type for mapColors object as used in app/components/map.tsx
export type MapColors = {
  tsunamiColor: string;
  // Add other color keys as needed for additional layers
};
import theme from "./theme";

export const mapColors = {
  tsunamiColor: theme._config.theme?.tokens?.colors?.tsunamiColor?.value
    ? String(theme._config.theme.tokens.colors.tsunamiColor?.value)
    : "#FF5733",
  // Example of how to add more colors if needed:
  //orange: theme._config.theme?.tokens?.colors?.orange.value,
  // softStoryGrey: theme.config.theme.tokens.colors.grey[400].value,
  //white: theme._config.theme?.tokens?.colors?.white.value,
};
