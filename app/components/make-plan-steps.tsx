"use client";

import type { ReactNode } from "react";
import { Box, Flex, Link, Stack, Text, type Tokens } from "@chakra-ui/react";
import type { IconType } from "react-icons";
import {
  LuBell,
  LuFileText,
  LuHouse,
  LuPhone,
  LuUsers,
  LuWrench,
} from "react-icons/lu";

type MakePlanStep = {
  title: string;
  description: ReactNode;
  icon: IconType;
  iconBackground: Tokens["colors"];
  iconColor: Tokens["colors"];
};

const makePlanSteps: MakePlanStep[] = [
  {
    title: "Pick a meeting spot",
    description:
      "Choose a safe location outside your home where everyone gathers. Cell towers often go down — pick somewhere visible and easy to reach on foot.",
    icon: LuUsers,
    iconBackground: "blue.50",
    iconColor: "blue.600",
  },
  {
    title: "Set an out-of-area contact",
    description:
      "Choose a friend or relative outside the Bay Area. Local calls fail but long-distance often works. Everyone should memorize this number.",
    icon: LuPhone,
    iconBackground: "red.50",
    iconColor: "red.600",
  },
  {
    title: "Learn “Drop, Cover, Hold On”",
    description: (
      <>
        <strong>DROP</strong> to hands and knees. <strong>COVER</strong> under a
        sturdy desk. <strong>HOLD ON</strong> until shaking stops. Don&apos;t
        run outside.
      </>
    ),
    icon: LuHouse,
    iconBackground: "yellow.50",
    iconColor: "yellow.600",
  },
  {
    title: "Know your shutoffs",
    description:
      "Locate gas meter, water main, and electrical panel. Keep a wrench near the gas meter. If you smell gas after a quake, shut it off and leave.",
    icon: LuWrench,
    iconBackground: "green.50",
    iconColor: "green.600",
  },
  {
    title: "Sign up for alerts",
    description: (
      <>
        Text your ZIP to <strong>888-777</strong> for AlertSF notifications.{" "}
        <Link
          href="https://myshake.berkeley.edu/"
          target="_blank"
          rel="noreferrer"
          color="blue.600"
          fontWeight="semibold"
        >
          Download MyShake
        </Link>{" "}
        for early earthquake warnings.
      </>
    ),
    icon: LuBell,
    iconBackground: "purple.50",
    iconColor: "purple.600",
  },
  {
    title: "Practice yearly",
    description:
      "Run an annual earthquake drill. Walk through your meeting point, review contacts, check your emergency kit for expired items.",
    icon: LuFileText,
    iconBackground: "blue.50",
    iconColor: "blue.600",
  },
];

export function MakePlanSteps() {
  return (
    <Stack gap="0">
      {makePlanSteps.map((step, index) => {
        const StepIcon = step.icon;
        const isLast = index === makePlanSteps.length - 1;

        return (
          <Flex
            key={step.title}
            position="relative"
            gap={{ base: "3", md: "3.5" }}
            pb={isLast ? "0" : { base: "5", md: "6" }}
            _after={
              isLast
                ? undefined
                : {
                    content: '\"\"',
                    position: "absolute",
                    top: { base: "11", md: "12" },
                    bottom: "0",
                    left: { base: "4", md: "5" },
                    width: "0.5",
                    borderRadius: "full",
                    bg: "border",
                  }
            }
          >
            <Flex
              boxSize={{ base: "9", md: "10" }}
              flexShrink="0"
              align="center"
              justify="center"
              borderRadius="xl"
              bg={step.iconBackground}
              color={step.iconColor}
              position="relative"
              zIndex="base"
            >
              <StepIcon size={20} aria-hidden="true" />
            </Flex>

            <Box flex="1" pt="0.5">
              <Flex align="center" gap="2" wrap="wrap">
                <Text fontSize="sm" fontWeight="bold" color="fg">
                  {step.title}
                </Text>

                <Text
                  as="span"
                  px="1.5"
                  py="0.5"
                  borderRadius="sm"
                  bg="blue.50"
                  color="blue.700"
                  fontSize="2xs"
                  fontWeight="bold"
                  letterSpacing="wide"
                  textTransform="uppercase"
                >
                  Step {index + 1}
                </Text>
              </Flex>

              <Text mt="1" color="fg.muted" fontSize="sm" lineHeight="tall">
                {step.description}
              </Text>
            </Box>
          </Flex>
        );
      })}
    </Stack>
  );
}
