"use client";

import React, { useCallback, useRef, useState } from "react";
import { Box, chakra, Drawer, IconButton, Portal } from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
const AngleLeft = chakra(FaAngleLeft);
const AngleRight = chakra(FaAngleRight);

// Must match the `h={{ base: "1/2" }}` token on `Drawer.Content`.
export const MOBILE_DRAWER_HEIGHT_RATIO = 0.5;

interface DrawerProps {
  children: React.ReactNode;
  title: string;
  footerText: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHDrawer = ({
  children,
  title,
  footerText,
  open,
  onOpenChange,
}: DrawerProps) => {
  const drawerContainerRef = useRef<HTMLDivElement>(null);
  const [drawerContainer, setDrawerContainer] = useState<HTMLDivElement | null>(
    null
  );

  const setContainer = useCallback((node: HTMLDivElement | null) => {
    drawerContainerRef.current = node;
    setDrawerContainer(node);
  }, []);

  return (
    <Box ref={setContainer}>
      <>
        {drawerContainer && !open && (
          <Portal container={drawerContainerRef}>
            <Box
              position="absolute"
              zIndex="overlay"
              top={{ base: "auto", md: "0" }}
              left="0"
              bottom="0"
              right={{ base: "0", md: "auto" }}
              w={{ base: "auto", md: "5" }}
              h={{ base: "5", md: "auto" }}
              backgroundColor="white"
            >
              <Box
                onClick={() => onOpenChange(true)}
                asChild
                position="absolute"
                // Mobile: center horizontally at bottom.
                left={{ base: "0", md: "0" }}
                right={{ base: "0", md: "auto" }}
                bottom={{ base: "0", md: "auto" }}
                // Desktop: vertically center relative to container.
                top={{ base: "auto", md: "1/2" }}
                w={{ base: "fit", md: "auto" }}
                mx={{ base: "auto", md: "0" }}
                transform={{ base: "none", md: "translateY(-50%)" }}
              >
                <IconButton
                  aria-label="Open risk layers"
                  variant="subtle"
                  rounded="full"
                  size="md"
                >
                  <AngleRight rotate={{ base: "270deg", md: "0deg" }} />
                </IconButton>
              </Box>
            </Box>
          </Portal>
        )}
        {/* actual drawer, open */}
        {drawerContainer && (
          <Drawer.Root
            placement={{ mdDown: "bottom", md: "start" }}
            open={open}
            onOpenChange={(details) => onOpenChange(details.open)}
            modal={false}
            closeOnInteractOutside={false}
            lazyMount
          >
            <Portal container={drawerContainerRef}>
              <Drawer.Positioner
                h="full"
                w="full"
                position="absolute"
                pointerEvents="none"
              >
                <Drawer.Content
                  // NOTE: the following props are used because the `size` prop values of `Drawer.Root` are too limited (and do not directly correspond to the theme `sizes` tokens)
                  w={{ base: "full", md: "sm" }}
                  maxW={{ base: "full", md: "sm" }}
                  // Must match `MOBILE_DRAWER_HEIGHT_RATIO`.
                  h={{ base: "1/2", md: "full" }}
                  maxH={{ base: "1/2", md: "full" }}
                  pointerEvents="auto"
                  css={{
                    "&[data-state='open']": { animationName: "none" }, // prevent slide-in animation (`skipAnimationOnMount` on `Drawer.Root` doesn't appear to work)
                  }}
                >
                  <Drawer.CloseTrigger
                    onClick={() => onOpenChange(false)}
                    asChild
                    position="absolute"
                    // Mobile: centered above drawer edge.
                    // Desktop: right edge, vertically centered.
                    left={{ base: "0", md: "auto" }}
                    right={{ base: "0", md: "-5" }}
                    top={{ base: "-5", md: "1/2" }}
                    w={{ base: "fit", md: "auto" }}
                    mx={{ base: "auto", md: "0" }}
                    transform={{ base: "none", md: "translateY(-50%)" }}
                  >
                    <IconButton
                      aria-label="Close risk layers"
                      variant="subtle"
                      rounded="full"
                      size="md"
                    >
                      <AngleLeft rotate={{ base: "270deg", md: "0deg" }} />
                    </IconButton>
                  </Drawer.CloseTrigger>
                  <Drawer.Header>
                    <Drawer.Title>{title}</Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body>{children}</Drawer.Body>
                  <Drawer.Footer>{footerText}</Drawer.Footer>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
        )}
      </>
    </Box>
  );
};

export default SHDrawer;
