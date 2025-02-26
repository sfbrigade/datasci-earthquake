export const fetchData = async (cdnEndpoint: string, apiEndpoint: string) => {
  try {
    // Try fetching from CDN first
    console.log("CDN endpoint: ", cdnEndpoint)
    const cdnResponse = await fetch(cdnEndpoint, { cache: "no-store" });
    if (cdnResponse.ok) {
      return await cdnResponse.json();
    } else {
      console.warn(`CDN fetch failed: ${cdnResponse.status}. Falling back to API.`);
    }
  } catch (error: any) {
    console.warn(`CDN fetch error: ${error.message}. Falling back to API.`);
  }

  // Fallback to API
  try {
    const apiResponse = await fetch(apiEndpoint, {
      cache: 'no-store',
    });
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
  } catch (error: any) {
    console.log("Error: " + error.message);
    return null;
  }
};
