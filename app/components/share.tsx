"use client";
import {
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import Image from 'next/image';
import emailIcon from "../img/icon-email.svg";
import facebookIcon from "../img/icon-facebook.svg";
import xIcon from "../img/icon-x.svg";
import linkIcon from "../img/icon-link.svg";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AddressData } from "./__mocks__/address-data";
import Link from "next/link";

const Share = () => {
  const copyReportToClipBoard = () => {
    navigator.clipboard.writeText(currentUrl);
  };

  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.location.href.includes("address-1")) {
        setCurrentUrl(window.location.href);
      } else {
        const addressParts = AddressData.address.split("");
        const joinedstring = addressParts.join("+");
        const urlString = `${window.location.href}/?address-1=${joinedstring}`;
        setCurrentUrl(urlString);
      }
    }
  }, []);

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={
        <Image src={linkIcon} alt="Link" width={24} height={24} />
      }>
        <Text textStyle="textMedium">Share report</Text>
      </MenuButton>
      <MenuList p={"6px 16px 6px 16px"}>
        <Link href={`mailto:placeholder@example.com?subject=Share Report&body=${currentUrl}`}>
          <MenuItem gap="10px">
            <Image src={emailIcon} alt="Email" width={24} height={24} />
            <Text>Email</Text>
          </MenuItem>
        </Link>

        <Link href={`https://www.facebook.com/sharer/sharer.php?u=${currentUrl}`}>
          <MenuItem gap="10px">
            <Image src={facebookIcon} alt="Facebook" width={24} height={24} />
            <Text>Facebook</Text>
          </MenuItem>
        </Link>

        <Link href={`https://twitter.com/intent/tweet?url=${currentUrl}`}>
          <MenuItem gap="10px">
            <Image src={xIcon} alt="X" width={24} height={24} />
            <Text>X</Text>
          </MenuItem>
        </Link>

        <MenuItem gap="10px" onClick={copyReportToClipBoard}>
          <Image src={linkIcon} alt="Link" width={24} height={24} />
          <Text>Copy Link</Text>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default Share;
