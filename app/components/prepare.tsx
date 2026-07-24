import {
  Flex,
  Text,
  Box,
  Heading,
  HStack,
  Center,
  Image,
} from "@chakra-ui/react";
import NextImage from "next/image";
import EarthquakeReadyCards from "@/components/earthquake-ready-cards";

const Prepare = () => {
  // // TODO: either add heading information or replace this with whatever is in `address-mapper`
  // const headingData = Headings.about;

  return (
    <Flex
      w="full"
      p="8"
      direction="column"
      justifyContent="space-between"
      gap="11"
    >
      <HStack alignItems={"start"}>
        <div>
          <Heading as="h2">
            <Text
              as="span"
              textStyle="headerBig"
              layerStyle="headerMain"
              color="blue.text"
              fontWeight="light"
            >
              How to be earthquake-ready
            </Text>
          </Heading>
          <Text as="p" mt="2" textStyle="textBig" layerStyle="text">
            Whether you’re a renter, homeowner, or property manager, these
            resources can help you make confident, informed decisions around
            earthquake safety.
          </Text>

          <EarthquakeReadyCards></EarthquakeReadyCards>
          <Center>
            <Flex bg="blue.50" p="4" borderRadius="md" mt="4" gap="6">
              <div>
                <Image
                  src="/images/SFCivicTech-Rights.svg"
                  alt="Rights icon"
                  role="img" // needed for VoiceOver bug: https://bugs.webkit.org/show_bug.cgi?id=216364
                  height="8"
                  width="8"
                  display="inline"
                />
              </div>
              <div>
                <Text fontSize="lg" fontWeight="bold" mb="3">
                  Renting? Know your rights.
                </Text>
                <Text>
                  If you live in a non-compliant building or high-risk zone, you
                  have options. Get earthquake renters insurance to protect your
                  belongings, or learn about your right to report unsafe living
                  conditions to the city.
                </Text>
              </div>
            </Flex>
          </Center>
        </div>
      </HStack>
      <Box flexShrink={0}>
        <NextImage
          width={303} // 606px real width?
          height={292} // 584px real height?
          src="/images/earthquake-ready.png"
          alt="Illustration of person standing with their dog, who is looking up from a ball on the ground"
        />
      </Box>
    </Flex>
  );
};

export default Prepare;
