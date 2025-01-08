import { Flex, Text } from "@chakra-ui/react";
import Heading from "../components/heading";
import { Headings } from "../data/data";

const About = () => {
  const headingData = Headings.about;
  return (
    <Flex
      direction="column"
      w={{ base: "base", xl: "xl" }}
      p={{
        base: "23px 24px 16px 24px",
        md: "37px 27px 16px 26px",
        xl: "50px 128px 16px 127px",
      }}
      m="auto"
    >
      <Heading headingData={headingData} />
      <Text>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam eu justo
        ipsum. Nullam eleifend consectetur mauris ac porta. Fusce venenatis,
        libero vitae fringilla volutpat, odio diam maximus nibh, eu vestibulum
        lacus tellus sed felis. Suspendisse potenti. Nulla iaculis sapien vitae
        iaculis egestas.
      </Text>
    </Flex>
  );
};

export default About;
