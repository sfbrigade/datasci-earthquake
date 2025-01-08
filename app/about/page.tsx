import { Flex, Link, Text, Box, VStack, HStack } from "@chakra-ui/react";
import Heading from "../components/heading";
import { Headings } from "../data/data";
import NextLink from "next/link";

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
      <Text textStyle="textBig" fontWeight="400" color="grey.900" mb="8">
        Quisque nec sagittis sapien. Proin vestibulum purus nec tellus molestie
        tempus. Pellentesque at vestibulum ipsum.{" "}
        <Link
          as={NextLink}
          href="https://www.lipsum.com/"
          color="blue"
          target="_blank"
        >
          Link to another website
        </Link>{" "}
        neque vel laoreet tempor. Proin non lobortis urna. Praesent sodales
        molestie augue sed posuere. Cras non iaculis nisi, eu placerat leo.
        Phasellus in lobortis metus, vel euismod turpis. Proin in placerat elit.
        Nullam ornare elementum lectus blandit convallis.
      </Text>
      <Flex as="section" direction="column" gap="5">
        <Box>
          <Text
            as="h3"
            textStyle="headerMedium"
            fontWeight="400"
            color="grey.900"
          >
            Subhead
          </Text>
          <Text textStyle="textMedium">
            Quisque nec sagittis sapien. Proin vestibulum purus nec tellus
            molestie tempus. Pellentesque at vestibulum ipsum. Praesent maximus
            neque vel laoreet tempor. Proin non lobortis urna. Praesent sodales
            molestie augue sed posuere. Cras non iaculis nisi, eu placerat leo.
            Phasellus in lobortis metus, vel euismod turpis. Proin in placerat
            elit. Nullam ornare elementum lectus blandit convallis.
          </Text>
        </Box>
        <Flex direction={{ base: "column", md: "row" }} gap="3">
          <Box>
            <Text
              as="h3"
              textStyle="headerMedium"
              fontWeight="400"
              color="grey.900"
            >
              Subhead
            </Text>
            <Text textStyle="textMedium">
              Quisque nec sagittis sapien. Proin vestibulum purus nec tellus
              molestie tempus. Pellentesque at vestibulum ipsum. Praesent
              maximus neque vel laoreet tempor. Proin non lobortis urna.
              Praesent sodales molestie augue sed posuere. Cras non iaculis
              nisi, eu placerat leo. Phasellus in lobortis metus, vel euismod
              turpis. Proin in placerat elit. Nullam ornare elementum lectus
              blandit convallis.
            </Text>
          </Box>
          <Box>
            <Text
              as="h3"
              textStyle="headerMedium"
              fontWeight="400"
              color="grey.900"
            >
              Subhead
            </Text>
            <Text textStyle="textMedium">
              Quisque nec sagittis sapien. Proin vestibulum purus nec tellus
              molestie tempus. Pellentesque at vestibulum ipsum. Praesent
              maximus neque vel laoreet tempor. Proin non lobortis urna.
              Praesent sodales molestie augue sed posuere. Cras non iaculis
              nisi, eu placerat leo. Phasellus in lobortis metus, vel euismod
              turpis. Proin in placerat elit. Nullam ornare elementum lectus
              blandit convallis.
            </Text>
          </Box>
          <Box>
            <Text
              as="h3"
              textStyle="headerMedium"
              fontWeight="400"
              color="grey.900"
            >
              Subhead
            </Text>
            <Text textStyle="textMedium">
              Quisque nec sagittis sapien. Proin vestibulum purus nec tellus
              molestie tempus. Pellentesque at vestibulum ipsum. Praesent
              maximus neque vel laoreet tempor. Proin non lobortis urna.
              Praesent sodales molestie augue sed posuere. Cras non iaculis
              nisi, eu placerat leo. Phasellus in lobortis metus, vel euismod
              turpis. Proin in placerat elit. Nullam ornare elementum lectus
              blandit convallis.
            </Text>
          </Box>
        </Flex>
        <Box>
          <Text
            as="h3"
            textStyle="headerMedium"
            fontWeight="400"
            color="grey.900"
          >
            Subhead
          </Text>
          <Text textStyle="textMedium">
            Quisque nec sagittis sapien. Proin vestibulum purus nec tellus
            molestie tempus. Pellentesque at vestibulum ipsum. Praesent maximus
            neque vel laoreet tempor. Proin non lobortis urna. Praesent sodales
            molestie augue sed posuere. Cras non iaculis nisi, eu placerat leo.
            Phasellus in lobortis metus, vel euismod turpis. Proin in placerat
            elit. Nullam ornare elementum lectus blandit convallis.
          </Text>
        </Box>
        <Box>
          <Text
            as="h3"
            textStyle="headerMedium"
            fontWeight="400"
            color="grey.900"
          >
            Subhead
          </Text>
          <Text textStyle="textMedium">
            Quisque nec sagittis sapien. Proin vestibulum purus nec tellus
            molestie tempus. Pellentesque at vestibulum ipsum. Praesent maximus
            neque vel laoreet tempor. Proin non lobortis urna. Praesent sodales
            molestie augue sed posuere. Cras non iaculis nisi, eu placerat leo.
            Phasellus in lobortis metus, vel euismod turpis. Proin in placerat
            elit. Nullam ornare elementum lectus blandit convallis.
          </Text>
        </Box>
      </Flex>
    </Flex>
  );
};

export default About;
