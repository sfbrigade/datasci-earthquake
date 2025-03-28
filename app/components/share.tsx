"use client";
import {
  Text,
  Button,
  useToast,
  Box,
  HStack,
  CloseButton,
} from "@chakra-ui/react";
import ShareIcon from "../img/icon-share.svg";
import LinkIcon from "../img/icon-link.svg";
import { useSearchParams } from "next/navigation";

const Share = () => {
  const searchParams = useSearchParams();
  const toast = useToast({
    position: "top",
  });

  const copyReportToClipBoard = async () => {
    try {
      const currentUrl = `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
      await navigator.clipboard.writeText(currentUrl);
      toast({
        duration: 3000,
        render: ({ onClose }) => (
          <Box
            bg="white"
            color="black"
            p={3}
            borderRadius="md"
            boxShadow="md"
            position="relative"
          >
            <HStack>
              <LinkIcon />
              <Text>Link copied</Text>
            </HStack>
            <CloseButton
              position="absolute"
              right="8px"
              top="8px"
              onClick={onClose}
            />
          </Box>
        ),
      });
    } catch (err) {
      console.error("Failed to copy: ", err);
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Button
      aria-label="Share report"
      variant="link"
      rightIcon={<ShareIcon />}
      onClick={copyReportToClipBoard}
      background={"transparent"}
    >
      <Text textStyle="textMedium" color="blue">
        Share report
      </Text>
    </Button>
  );
};

export default Share;
