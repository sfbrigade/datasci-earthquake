"use client";

import {
  Toaster as ChakraToaster,
  Portal,
  Spinner,
  Stack,
  Toast,
  createToaster,
} from "@chakra-ui/react";
import * as toast from "@zag-js/toast"; // TODO: remove this if not needed (`toast` can likely use type inference instead)
import LinkIcon from "../../img/icon-link.svg";
import { ReactNode } from "react";

export const toaster = createToaster({
  placement: "top",
  pauseOnPageIdle: true,
});

const ToasterIcon = ({ type = "info" }: { type?: string }) => {
  switch (type) {
    case "loading":
      return <Spinner size="sm" color="blue.solid" />;
    case "link":
      return <LinkIcon />;
    default:
      return <Toast.Indicator />;
  }
};

export const Toaster = () => {
  return (
    <Portal>
      <ChakraToaster toaster={toaster}>
        {(toast: toast.Options<ReactNode>) => (
          <Toast.Root
            width={{ md: "lg" }}
            insetInline={{ mdDown: "4" }}
            borderRadius="xl"
            // TODO: how to tie this to Chakra theme? also, should `warning` and other types have different colors?
            bg={
              toast.type === "error" || toast.type === "warning"
                ? "#b53d37"
                : "white"
            }
          >
            <ToasterIcon type={toast.type} />
            <Stack gap="1" flex="1" maxWidth="100%">
              {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description>{toast.description}</Toast.Description>
              )}
            </Stack>
            {toast.action && (
              <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
            )}
            {toast.closable && <Toast.CloseTrigger />}
          </Toast.Root>
        )}
      </ChakraToaster>
    </Portal>
  );
};
