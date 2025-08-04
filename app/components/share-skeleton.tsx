import { Button } from "@chakra-ui/react";
import ShareIcon from "../img/icon-share.svg";

const ShareSkeleton = () => {
  return (
    <Button
      aria-label="Share report"
      variant="ghost"
      disabled={true}
      background={"transparent"}
      textStyle="textMedium"
      color="white"
    >
      Share report <ShareIcon />
    </Button>
  );
};

export default ShareSkeleton;
