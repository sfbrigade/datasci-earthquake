"use client";
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
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AddressData } from "./__mocks__/address-data";
import Link from "next/link";

const Share = () => {
  const copyReportToClipBoard = () => {
    // copy the current url to the clipboard
    navigator.clipboard.writeText(currentUrl);
  };
  const [currentUrl, setCurrentUrl] = useState("");
  useEffect(() => {
    // get the current url
    if (window.location.href.includes("address-1")) {
      // address does not need to be formated
      setCurrentUrl(window.location.href);
    } else {
      // format the adress using addressData.address
      const addreessParts = AddressData.address.split("");
      let joinedstring = addreessParts.join("+");

      const urlString = `${window.location.href}/?address-1=${joinedstring}`;

      setCurrentUrl(urlString);
    }
  }, []);

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
        <Link
          href={
            "mailto:placeholder@example.com?subject=Share Report&body=" +
            currentUrl
          }
        >
          <MenuItem gap="10px">
            <EmailIcon />
            <Text>Email</Text>
          </MenuItem>
        </Link>

        <Link
          href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}
        >
          <MenuItem gap="10px">
            <FacebookIcon />
            <Text>Facebook</Text>
          </MenuItem>
        </Link>

        <Link href={`https://twitter.com/intent/tweet?url=${currentUrl}`}>
          <MenuItem gap="10px">
            <XIcon />
            <Text>X</Text>
          </MenuItem>
        </Link>

        <MenuItem gap="10px" onClick={copyReportToClipBoard}>
          <LinkIcon />
          <Text>Copy Link</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default Share;
