import { Text, Button } from "@chakra-ui/react";
import ShareIcon from "../img/icon-share.svg";

const ShareSkeleton = () => {
  return (
    <Button
      aria-label="Share report"
      variant="link"
      rightIcon={<ShareIcon />}
      disabled={true}
      background={"transparent"}
    >
      <Text textStyle="textMedium" color="white">
        Share report
      </Text>
    </Button>
  );
};

export default ShareSkeleton;
