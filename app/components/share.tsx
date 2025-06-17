"use client";
import { Text, Button, Box, HStack, CloseButton } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import ShareIcon from "../img/icon-share.svg";
import { useSearchParams } from "next/navigation";

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
      // TODO: do we need to have this custom render? is it good enough to add the icon as is done in `components/ui/toaster.tsx`?
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
      variant="ghost"
      // TODO: add missing link styling to button
      onClick={copyReportToClipBoard}
      background={"transparent"}
    >
      <Text textStyle="textMedium" color="white">
        Share report <ShareIcon />
      </Text>
    </Button>
  );
};

export default Share;
