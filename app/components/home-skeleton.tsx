import React from "react";
import { Box, Flex, Skeleton, Stack, HStack } from "@chakra-ui/react";

const HomeSkeleton = () => {
  return (
    <Flex direction="column">
      <Skeleton height="400px" width="100%" />
      <Flex
        w={{ base: "full", xl: "7xl" }}
        p={{
          base: "24px 24px 24px 24px",
          md: "36px 28px 16px 28px",
          xl: "96px 128px 96px 128px",
        }}
        m="auto"
        gap="46px"
      >
        <HStack alignItems={"start"}>
          <Box flex="1">
            <Stack gap={4}>
              <Skeleton height="40px" width="300px" />
              <Skeleton height="20px" width="500px" />
              <Skeleton height="30px" width="200px" mt="4" />
              <Skeleton height="20px" width="400px" mt="2" />
              <Skeleton height="20px" width="600px" mt="4" />
              <Skeleton height="20px" width="600px" mt="2" />
              <Skeleton height="20px" width="600px" mt="2" />
              <Skeleton height="30px" width="200px" mt="4" />
              <Skeleton height="20px" width="400px" mt="2" />
              <Skeleton height="20px" width="600px" mt="4" />
              <Skeleton height="20px" width="600px" mt="2" />
              <Skeleton height="20px" width="600px" mt="2" />
              <Skeleton height="30px" width="300px" mt="4" />
              <Skeleton height="20px" width="500px" mt="2" />
              <Skeleton height="20px" width="600px" mt="4" />
              <Skeleton height="20px" width="600px" mt="2" />
              <Skeleton height="20px" width="600px" mt="2" />
              <Skeleton height="30px" width="250px" mt="4" />
              <Skeleton height="20px" width="450px" mt="2" />
              <Skeleton height="20px" width="600px" mt="4" />
              <Skeleton height="20px" width="600px" mt="2" />
            </Stack>
          </Box>
          <Box flexShrink={0} display={{ base: "none", lg: "block" }}>
            <Skeleton height="300px" width="300px" />
          </Box>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default HomeSkeleton;
