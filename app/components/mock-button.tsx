import { Button } from "@chakra-ui/react";

interface MockButtonProps {
  label?: string;
  onClick?: () => void;
}

const MockButton = ({ label = "Click Me", onClick }: MockButtonProps) => {
  return <Button onClick={onClick}>{label}</Button>;
};

export default MockButton;
