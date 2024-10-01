"use client";

import { Heading, useToast } from "@chakra-ui/react";
import MockButton from "../components/mock-button";

const ComponentsTestLib = () => {
  const toast = useToast();

  if (process.env.NODE_ENV !== "development") {
    return <div>Page not available in production.</div>;
  }

  const showToast = () => {
    toast({
      title: "Action Successful.",
      description: "You've clicked the button!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <>
      <Heading>This is Components Test Library</Heading>
      <MockButton label="Click me!" onClick={showToast} />
    </>
  );
};

export default ComponentsTestLib;
