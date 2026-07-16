import { useSearchParams } from "next/navigation";
import NextLink from "@/components/custom-next-link";
import { CloseButton } from "@chakra-ui/react";

export const PanelCloseLink = () => {
  // TODO:merge this logic with getNavigationHref
  const searchParams = useSearchParams();
  const currentQueryString = searchParams.toString();
  const homeHref = currentQueryString ? `/?${currentQueryString}` : "/";

  return (
    <NextLink href={homeHref}>
      <CloseButton />
    </NextLink>
  );
};
