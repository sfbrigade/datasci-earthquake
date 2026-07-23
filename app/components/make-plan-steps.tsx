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
      "Choose a safe location outside your home where everyone gathers. Cell towers often go down — pick somewhere visible and easy to reach on foot. Make sure to practice meeting there in Step 8. Let everyone agree on a backup location in case this one is inaccessible.",
    icon: LuUsers,
    iconBackground: "blue.50",
    iconColor: "blue.600",
  },
  {
    title: "Set an out-of-area contact",
    description:
      "Choose a friend or relative outside of the Bay Area. Long-distance calls might work when local calls fail. Everyone should keep this number written down on their person and also as part of the contacts list in their emergency kit.",
    icon: LuPhone,
    iconBackground: "red.50",
    iconColor: "red.600",
  },
  {
    title: "Learn “Drop, Cover, Hold On”",
    description: (
      <>
        <strong>DROP</strong> to hands and knees. <strong>COVER</strong> under a
        sturdy desk or other safe,stable furniture. <strong>HOLD ON</strong>
        until shaking stops. Don&apos;t run outside while things are moving.
      </>
    ),
    icon: LuHouse,
    iconBackground: "yellow.50",
    iconColor: "yellow.600",
  },
  {
    title: "Know your shutoffs",
    description: (
      <>
        <p>Locate your home's gas meter, water main and electricity panel.</p>

        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          <li>
            <strong>NATURAL GAS:</strong> Know where the shutoff valve is and
            how to operate it. Label it clearly. Keep the required wrench
            attached or near to the valve at all times. Once turned off, do not
            restore gas service yourself but get a qualified professional to do
            it from your utility. If you smell gas, do not light a candle, turn
            on a light switch or otherwise cause a spark and leave the area.
          </li>
          <li>
            <strong>ELECTRICITY:</strong> Identify the main breaker and label it
            clearly ahead of time. Switch off the main breaker if you think
            there may be a risk of damaged wiring, sparking, smoke, fire,
            flooding around electrical equipment, or other electrical hazards.
            If there is no electrical hazard, you can turn the main breaker back
            on.
          </li>
          <li>
            <strong>WATER:</strong> Locate the water main shutoff and label it.
            Turn off if it seems that the plumbing is leaking or has been
            damaged. Once the hazard has been addressed, you can restore water
            service yourself.
          </li>
        </ul>
      </>
    ),
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
        for early earthquake warnings.Turn on the Wireless Emergency Alerts
        setting on your cell phone.
      </>
    ),
    icon: LuBell,
    iconBackground: "purple.50",
    iconColor: "purple.600",
  },
  {
    title: "Practice yearly",
    description:
      "Run an annual earthquake drill. Walk through your meeting point, review contacts, check your emergency kit for expired items. " +
      "During a stressful and chaotic event with or without injury, people may not rise to the occasion, but they are likely to fall back on their training.",
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
