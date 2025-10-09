import { Button } from "@chakra-ui/react";
import { IoIosLink } from "react-icons/io";

const ShareSkeleton = () => {
  return (
    <Button
      aria-label="Copy link to this page"
      variant="ghost"
      disabled={true}
      background={"transparent"}
      textStyle="textMedium"
      color="white"
    >
      <IoIosLink /> Copy link to this page
    </Button>
  );
};

export default ShareSkeleton;
