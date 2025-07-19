"use client";

import { Button } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import ShareIcon from "../img/icon-share.svg";
import { useSearchParams } from "next/navigation";

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `share-skeleton.tsx` and vice versa
// TODO: isolate the usage of `useSearchParams()` so that the Suspense boundary can be even more narrow if possible
const Share = () => {
  const searchParams = useSearchParams();

  const copyReportToClipBoard = async () => {
    try {
      const currentUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
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
      aria-label="Share report"
      variant="ghost"
      onClick={copyReportToClipBoard}
      background={"transparent"}
      textStyle="textMedium"
      color="white"
    >
      Share report <ShareIcon />
    </Button>
  );
};

export default Share;
