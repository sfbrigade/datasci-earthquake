
'use client'
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
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AddressData } from "./__mocks__/address-data";
import Link from "next/link";

const Share = () => {
  const handleClick = () => {
    console.log(currentUrl);
  };

  const [currentUrl, setCurrentUrl] = useState('');
  
  useEffect(() => {
  
 
    setCurrentUrl(window.location.href)
    console.log(currentUrl);
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
        <MenuItem gap="10px">
          <EmailIcon />
          <Link href={'mailto:'}>
          <Text>
        
            Email</Text>
            </Link>
          
        </MenuItem>
        <MenuItem gap="10px">
          <Link  href={''}/*href={"https://www.facebook.com/sharer/sharer.php?"}*/>
          <FacebookIcon />
          <Text>Facebook</Text>
          </Link>
        </MenuItem>
        <MenuItem gap="10px">""
          <Link href={"https://twitter.com/intent/tweet?"}>
          <XIcon />
          <Text>X</Text>
          </Link>
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
