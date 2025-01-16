import React from "react";
import { Box } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading, { HeadingProps } from "./heading";
import Map from "./map";
import Report from "./report";

interface AddressMapperProps {
  headingData: HeadingProps;
}

const AddressMapper: React.FC<AddressMapperProps> = ({ headingData }) => {
  return (
    <>
      <Box bgColor="blue">
        <Box
          w={{ base: "base", xl: "xl" }}
          p={{
            base: "45px 23px 50px 23px",
            md: "52px 260px 56px 26px",
            xl: "53px 470px 46px 127px",
          }}
          m="auto"
        >
          <Heading headingData={headingData} />
          <SearchBar />
        </Box>
      </Box>
      <Box
        w={{ base: "base", xl: "xl" }}
        p={{
          base: "23px 24px 16px 24px",
          md: "37px 27px 16px 26px",
          xl: "50px 128px 16px 127px",
        }}
        m="auto"
      >
        <Report />
      </Box>
      <Box w="base" h={{ base: "323px", md: "411px", xl: "462px" }} m="auto">
        <Box
          h="100%"
          border="1px solid"
          borderColor="grey.400"
          overflow="hidden"
        >
          {/* <Map coordinates={[inputValue, input2Value]} /> */}
          <Map coordinates={[0, 0]} />
        </Box>
      </Box>
    </>
  );
};

export default AddressMapper;
