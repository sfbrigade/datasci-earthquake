import { Input, InputGroup } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";

const SearchBarSkeleton = () => {
  return (
    <form>
      <InputGroup
        w={{
          base: "full",
          sm: "xs",
          md: "sm",
          lg: "md",
        }}
        data-testid="search-bar"
        startElement={
          <IoSearchSharp
            color="grey.900"
            fontSize="1.1em"
            size="20"
            data-testid="search-icon"
          />
        }
      >
        <Input
          placeholder="Search San Francisco address"
          fontFamily="body"
          fontSize={{
            base: "sm",
            sm: "md",
            md: "md",
            lg: "md",
          }}
          size={{ base: "lg", md: "xl", xl: "xl" }}
          pt="0"
          pr="2.5"
          pb="0"
          pl={{ base: "9", md: "12" }}
          borderRadius="full"
          border="search"
          bgColor="white"
          shadow="search"
          type="text"
          name="address-1"
          value={""}
          _focus={{ borderColor: "yellow" }}
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
