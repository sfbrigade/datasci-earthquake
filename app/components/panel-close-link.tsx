"use client";

import { useSearchParams } from "next/navigation";
import NextLink from "@/components/custom-next-link";
import { IconButton } from "@chakra-ui/react";
import { LuX } from "react-icons/lu";

export const PanelCloseLink = () => {
  // TODO:merge this logic with getNavigationHref
  const searchParams = useSearchParams();
  const currentQueryString = searchParams.toString();
  const homeHref = currentQueryString ? `/?${currentQueryString}` : "/";

  return (
    <IconButton asChild aria-label="Close" variant="ghost" size="xl">
      <NextLink href={homeHref}>
        <LuX />
      </NextLink>
    </IconButton>
  );
};
