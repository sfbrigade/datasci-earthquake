export const fetchSoftStory = async () => {
  let loading = true;
  try {
    const response = await fetch("http://localhost:8000/soft-stories/");
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("404 Not Found");
      } else if (response.status === 500) {
        throw new Error("500 Internal Server Error")
      } else {
        throw new Error(response.status + " Unexpected Error")
      }
    }
    const data = await response.json();
    loading = false;
    return [data, loading];
  } catch (error: any) {
    console.log("Error: " + error.message)
  }
};
