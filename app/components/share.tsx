import {
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import ShareIcon from "../img/icon-share.svg";
import FacebookIcon from "../img/icon-facebook.svg";
import EmailIcon from "../img/icon-email.svg";
import XIcon from "../img/icon-x.svg";
import LinkIcon from "../img/icon-link.svg";

const Share = () => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        aria-label="Share report"
        variant="ghost"
        rightIcon={<ShareIcon />}
      >
        <Text textStyle="textMedium">Share report</Text>
      </MenuButton>
      <MenuList p={"6px 16px 6px 16px"}>
        <MenuItem gap="10px">
          <EmailIcon />
          <Text>Email</Text>
        </MenuItem>
        <MenuItem gap="10px">
          <FacebookIcon />
          <Text>Facebook</Text>
        </MenuItem>
        <MenuItem gap="10px">
          <XIcon />
          <Text>X</Text>
        </MenuItem>
        <MenuItem gap="10px">
          <LinkIcon />
          <Text>Copy Link</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default Share;
