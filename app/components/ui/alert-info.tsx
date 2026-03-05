import React from "react";
import { Alert } from "@chakra-ui/react";
import { IoIosWarning } from "react-icons/io";
import { CiWarning } from "react-icons/ci";

interface AlertInfoProps {
  message: string;
}

const AlertInfo: React.FC<AlertInfoProps> = ({ message }) => (
  <div>
    <Alert.Root status="error" colorPalette="red">
      <Alert.Indicator>
        <IoIosWarning />
      </Alert.Indicator>
      <Alert.Title>{message}</Alert.Title>
    </Alert.Root>
  </div>
);

export default AlertInfo;
