	import theme from "./theme";
	
	// Type for mapColors object as used in app/components/map.tsx
	export type MapColors = {
	  tsunamiColor: string;
	  liquefactionColor: string;
	  softStoryColor: string;
	  // Add other color keys as needed for additional layers
	};
	
	export const mapColors: MapColors = {
    // NOTE: Accessing internal properties like `_config` can be risky.
    // It's recommended to use a public API for theme tokens if available.
    tsunamiColor:
      (theme._config.theme?.tokens?.colors?.tsunamiColor?.value ?? "#FF5733") as string,
    liquefactionColor:
      (theme._config.theme?.tokens?.colors?.liquefactionColor?.value ??"#F6AD55") as string,
    softStoryColor:
      (theme._config.theme?.tokens?.colors?.softStoryColor?.value ?? "#F6AD55") as string,
  };
