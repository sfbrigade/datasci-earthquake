import React from "react";
import { chakra, Alert } from "@chakra-ui/react";
import { IoIosWarning } from "react-icons/io";

interface AlertInfoProps {
  message: string;
}

const AlertInfo: React.FC<AlertInfoProps> = ({ message }) => (
  <Alert.Root status="error">
    <Alert.Indicator>
      <IoIosWarning />
    </Alert.Indicator>
    <Alert.Title>{message}</Alert.Title>
  </Alert.Root>
);

const AlertInfoChakra = chakra(AlertInfo);

export default AlertInfoChakra;
