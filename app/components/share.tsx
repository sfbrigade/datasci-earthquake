"use client";
import {
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
    }
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        aria-label="Share report"
        variant="ghost"
        rightIcon={<ShareIcon />}
      >
        <Text textStyle="textMedium" color="blue">
          Share report
        </Text>
      </MenuButton>
      <MenuList zIndex={20} p={"6px 16px 6px 16px"}>
        <MenuItem gap="10px" onClick={copyReportToClipBoard}>
          <LinkIcon />
          <Text>Copy Link</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default Share;
