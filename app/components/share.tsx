"use client";

import { Button } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { IoIosLink } from "react-icons/io";

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `share-skeleton.tsx` and vice versa
// TODO: isolate the usage of `useSearchParams()` (and/or `window`) so that the Suspense boundary can be even more narrow if possible
const Share = () => {
  const copyLinkToClipBoard = async () => {
    try {
      // TODO: consider stripping out extraneous query params for a cleaner URL
      const currentUrl = window.location.toString();
      await navigator.clipboard.writeText(currentUrl);
      toaster.create({
        description: "Link copied",
        type: "link",
        duration: 5000,
        closable: true,
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toaster.create({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  return (
    <Button
      aria-label="Copy link to this page"
      variant="ghost"
      onClick={copyLinkToClipBoard}
      background={"transparent"}
      textStyle="textMedium"
      color="white"
      p="0"
      _hover={{ color: "grey.400" }}
    >
      <IoIosLink /> Copy link to this page
    </Button>
  );
};

export default Share;
