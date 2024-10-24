import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";

const SearchBar = () => {
  return (
    <InputGroup
      maxW={{ base: "303px", md: "371px", xl: "417px" }}
      size={{ base: "md", md: "lg", xl: "lg" }}
    >
      <InputLeftElement>
        <IoSearchSharp color="#2C5282" fontSize="1.1em" />
      </InputLeftElement>
      <Input
        placeholder="Search San Francisco address"
        p="0 10px 0 48px"
        borderRadius="50"
        bgColor="white"
        focusBorderColor="grey.400"
        // maxW={{ base: "303px", md: "371px", xl: "417px" }}
        // size={{ base: "md", md: "lg", xl: "lg" }}
      />
    </InputGroup>
  );
};

export default SearchBar;
