import { Heading } from "@chakra-ui/react";

const ComponentsTestLib = () => {
  if (process.env.NODE_ENV !== "development") {
    return <div>Page not available in production.</div>;
  }

  return (
    <>
      <Heading>This is Components Test Library</Heading>;
    </>
  );
};

export default ComponentsTestLib;
