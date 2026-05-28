import fs from "fs";
import path from "path";

const SECONDS_PER_DAY = 24 * 60 * 60;

export const fetchData = async (cdnEndpoint: string, apiEndpoint: string) => {
  if (["ci", "local"].includes(process.env.ENVIRONMENT || "")) {
    // Try reading local geojsons from public/data
    try {
      const filePath = path.join(process.cwd(), "public", cdnEndpoint);
      const json = JSON.parse(await fs.promises.readFile(filePath, "utf-8"));
      console.log(`Successfully read local file ${filePath}`);
      return json;
    } catch (error: any) {
      console.error(`Error reading local file: ${error.message}`);
      return { error: true, message: error.message };
    }
  } else {
    try {
      // Try fetching from CDN first
      const cdnResponse = await fetch(cdnEndpoint, {
        next: { revalidate: SECONDS_PER_DAY },
      });
      if (cdnResponse.ok) {
        console.log(`CDN fetch successful from ${cdnEndpoint}`);
        return await cdnResponse.json();
      } else {
        console.warn(
          `CDN fetch failed with: ${cdnResponse.status} (${cdnResponse.statusText}). Falling back to API.`
        );
      }
    } catch (error: any) {
      console.warn(`CDN fetch error: ${error.message}. Falling back to API.`);
    }

    // TODO: prevent this fallback from running if the CDN call successfully returns valid data
    // Fallback to API
    try {
      const apiResponse = await fetch(apiEndpoint, {
        next: { revalidate: SECONDS_PER_DAY },
      });
      if (!apiResponse.ok) {
        switch (apiResponse.status) {
          case 404:
            throw new Error("404 Not Found");
          case 500:
            throw new Error("500 Internal Server Error");
          default:
            throw new Error(apiResponse.status + " Unexpected Error");
        }
      }
      console.log(`API fetch successful from ${apiEndpoint}`);
      const data = await apiResponse.json();
      return data;
    } catch (error: any) {
      console.log("Error: " + error.message);
      return { error: true, message: error.message };
    }
  }
};
