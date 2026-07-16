import { VStack, HStack, IconButton, Text } from "@chakra-ui/react";
import { FaInstagram, FaLinkedinIn } from "react-icons/fa6";

export function SocialLinks() {
  return (
    <VStack>
      <Text
        textStyle="headerBig"
        layerStyle="headerMain"
        color="blue.text"
        fontWeight="light"
        marginBottom="8"
      >
        Contact Us
      </Text>
      <HStack>
        <IconButton asChild aria-label="LinkedIn" variant="ghost">
          <a
            href="https://www.linkedin.com/company/safehome-civictech"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedinIn />
          </a>
        </IconButton>

        <IconButton asChild aria-label="Instagram" variant="ghost">
          <a
            href="https://www.instagram.com/safehome.report"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </IconButton>
      </HStack>
    </VStack>
  );
}
