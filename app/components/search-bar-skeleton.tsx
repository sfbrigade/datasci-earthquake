import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";

const SearchBarSkeleton = () => {
  return (
    <form>
      <InputGroup
        w={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
        size={{ base: "md", md: "lg", xl: "lg" }}
        mb={"24px"}
        data-testid="search-bar"
      >
        <InputLeftElement>
          <IoSearchSharp
            color="grey.900"
            fontSize="1.1em"
            data-testid="search-icon"
          />
        </InputLeftElement>
        <Input
          placeholder="Search San Francisco address"
          fontFamily="Inter, sans-serif"
          fontSize={{ base: "md", sm: "md", md: "md", lg: "md" }}
          p={{
            base: "0 10px 0 35px",
            sm: "0 10px 0 35px",
            md: "0 10px 0 48px",
            lg: "0 10px 0 48px",
          }}
          borderRadius="50"
          border="1px solid #4A5568"
          bgColor="white"
          focusBorderColor="yellow"
          boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
          type="text"
          name="address-1"
          value=""
          _hover={{
            borderColor: "yellow",
            _placeholder: { color: "grey.900" },
          }}
          _invalid={{ borderColor: "red" }}
          autoComplete="address-line1"
          disabled={true}
        />
      </InputGroup>
    </form>
  );
};

export default SearchBarSkeleton;
