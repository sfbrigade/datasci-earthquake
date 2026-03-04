import React from "react";
import { Alert } from "@chakra-ui/react";
import { LuAlarmClockPlus } from "react-icons/lu";

interface AlertInfoProps {
  message: string;
}

const AlertInfo: React.FC<AlertInfoProps> = ({ message }) => (
  <div>
    <Alert.Root status="error">
      <Alert.Indicator>
        <LuAlarmClockPlus />
      </Alert.Indicator>
      <Alert.Title>{message}</Alert.Title>
    </Alert.Root>
  </div>
);

export default AlertInfo;
