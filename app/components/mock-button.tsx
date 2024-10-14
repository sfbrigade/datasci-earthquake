import { Button, Spinner } from "@chakra-ui/react";

interface MockButtonProps {
  label?: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const MockButton = ({
  label = "Click Me",
  onClick,
  isLoading = false,
  disabled = false,
}: MockButtonProps) => {
  return (
    <Button onClick={onClick} isDisabled={disabled} minWidth="100px">
      {isLoading ? <Spinner size="sm" /> : label}
    </Button>
  );
};

export default MockButton;
