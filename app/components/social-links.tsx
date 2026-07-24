import { VStack, HStack, IconButton, Text, Flex } from "@chakra-ui/react";
import { FaInstagram, FaLinkedinIn, FaEnvelope } from "react-icons/fa6";
import NextLink from "@/components/custom-next-link";
import NextImage from "next/image";

export function SocialLinks() {
  return (
    <VStack>
      <Text
        textStyle="headerBig"
        layerStyle="headerMain"
        color="blue.text"
        fontWeight="light"
      >
        Contact Us
      </Text>
      <HStack>
        <IconButton asChild aria-label="Email" variant="ghost" size="2xl">
          <a
            href="mailto:sfcivictech.datascience@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaEnvelope />
          </a>
        </IconButton>

        <IconButton asChild aria-label="LinkedIn" variant="ghost" size="2xl">
          <a
            href="https://www.linkedin.com/company/safehome-civictech"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedinIn />
          </a>
        </IconButton>
        <IconButton asChild aria-label="Instagram" variant="ghost" size="2xl">
          <a
            href="https://www.instagram.com/safehome.report"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
        </IconButton>
      </HStack>
      <Flex w="full" gap="3.5" mt="4" justify="flex-end">
        <NextImage
          width={27.5} // 619 real width?
          height={37} // 122 real height?
          alt="SafeHome logo"
          role="img" // needed for VoiceOver bug for SVGs: https://bugs.webkit.org/show_bug.cgi?id=216364
          src="/images/sfcivictechlogo.svg"
          priority
        />
        <NextImage
          width={101.5} // 619 real width?
          height={17.5} // 122 real height?
          alt="SafeHome logo"
          role="img" // needed for VoiceOver bug for SVGs: https://bugs.webkit.org/show_bug.cgi?id=216364
          src="/images/sfcivictechlogo2.svg"
          priority
        />
      </Flex>
    </VStack>
  );
}
