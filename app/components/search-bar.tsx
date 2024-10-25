import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";

const SearchBar = () => {
  return (
    <InputGroup
      maxW={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
      size={{ base: "md", md: "lg", xl: "lg" }}
      data-testid="search-bar"
    >
      <InputLeftElement>
        <IoSearchSharp
          color="#2C5282"
          fontSize="1.1em"
          data-testid="search-icon"
        />
      </InputLeftElement>
      <Input
        placeholder="Search San Francisco address"
        p="0 10px 0 48px"
        borderRadius="50"
        bgColor="white"
        focusBorderColor="yellow"
      />
    </InputGroup>
  );
};

export default SearchBar;
