"use client";

import React from "react";
import { Box } from "@chakra-ui/react";

interface PageSectionProps {
  children: React.ReactNode;
}

// TODO: pass in Header and Footer instead (alongside children)
const PageSection: React.FC<PageSectionProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
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
        {children}
      </Box>
    </Box>
  );
};

/* section 1 */
// base: "45px 23px 50px 23px",
// md: "52px 260px 56px 26px",
// xl: "53px 470px 46px 127px",

/* section 2 */
// base: "23px 24px 16px 24px",
// md: "37px 27px 16px 26px",
// xl: "50px 128px 16px 127px",

/* section 3 */
// base: "26px 23px 28px 23px",
// md: "37px 23px 28px 24px",
// xl: "24px 127px 22px 127px",

export default PageSection;
