"use client";
import { Text, Button, Box, HStack, CloseButton } from "@chakra-ui/react";
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
        duration: 3000,
      });
      // TODO FIXME: do we need to have this custom render? is it good enough to add the icon as is done in `components/ui/toaster.tsx`?
      // toast({
      //   duration: 3000,
      //   render: ({ onClose }) => (
      //     <Box
      //       bg="white"
      //       color="black"
      //       p={3}
      //       borderRadius="md"
      //       boxShadow="md"
      //       position="relative"
      //     >
      //       <HStack>
      //         <LinkIcon />
      //         <Text>Link copied</Text>
      //       </HStack>
      //       <CloseButton
      //         position="absolute"
      //         right="8px"
      //         top="8px"
      //         onClick={onClose}
      //       />
      //     </Box>
      //   ),
      // });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toaster.create({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        type: "error",
        duration: 3000,
        closable: true,
      });
    }
  };

  return (
    <Button
      aria-label="Share report"
      // TODO: add missing link styling to button b/c `variant="link"` no longer exists
      variant="ghost"
      onClick={copyReportToClipBoard}
      background={"transparent"}
    >
      <Text textStyle="textMedium" color="white">
        {/* TODO FIXME: does putting ShareIcon here replace putting in in Button's rightIcon prop? (going from v2 to v3)? */}
        Share report <ShareIcon />
      </Text>
    </Button>
  );
};

export default Share;
