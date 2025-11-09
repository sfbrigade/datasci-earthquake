const SECONDS_PER_DAY = 24 * 60 * 60;

export const fetchData = async (cdnEndpoint: string, apiEndpoint: string) => {
  try {
    // Try fetching from CDN first
    const cdnResponse = await fetch(cdnEndpoint, { next: { revalidate: SECONDS_PER_DAY } });
    if (cdnResponse.ok) {
      return await cdnResponse.json();
    } else {
      console.warn(`CDN fetch failed with: ${cdnResponse.status} (${cdnResponse.statusText}). Falling back to API.`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.warn(`CDN fetch error: ${error.message}. Falling back to API.`);
      } else {
        console.warn(`CDN fetch error: Unexpected error. Falling back to API.`);
      }
      // Fallback to API only proceeds if an error is thrown or CDN response is not ok.
      }
  // Fallback to API
  try {
    const apiResponse = await fetch(apiEndpoint, { next: { revalidate: SECONDS_PER_DAY } });
    if (!apiResponse.ok) {
      switch (apiResponse.status) {
        case 404:
          throw new Error("404 Not Found");
        case 500:
          throw new Error("500 Internal Server Error")
        default:
          throw new Error(apiResponse.status + " Unexpected Error")
      }
    }
    const data = await apiResponse.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error: " + error.message);
      return { error: true, message: error.message };
    } else {
      console.log("Error: Unexpected error");
      return { error: true, message: "Unexpected error" };
    }
  }
}
