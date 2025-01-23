export const fetchData = async ( endpoint: string ) => {
  let loading = true;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      switch (response.status) {
        case 404:
          throw new Error("404 Not Found");
        case 500:
          throw new Error("500 Internal Server Error")
        default:
          throw new Error(response.status + " Unexpected Error")
      }
    }
    const data = await response.json();
    loading = false;
    return [data, loading];
  } catch (error: any) {
    console.log("Error: " + error.message);
    return [null, false];
  }
};
