import { Text, Button } from "@chakra-ui/react";
import ShareIcon from "../img/icon-share.svg";

const ShareSkeleton = () => {
  return (
    <Button
      aria-label="Share report"
      // TODO: add missing link styling to button b/c `variant="link"` no longer exists
      variant="ghost"
      disabled={true}
      background={"transparent"}
    >
      <Text textStyle="textMedium" color="white">
        {/* TODO FIXME: does putting ShareIcon here replace putting in in Button's rightIcon prop? (going from v2 to v3)? */}
        Share report <ShareIcon />
      </Text>
    </Button>
  );
};

export default ShareSkeleton;
