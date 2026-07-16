"use client";

import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import type { Tokens } from "@chakra-ui/react";
import {
  LuCreditCard,
  LuDroplets,
  LuFileText,
  LuHeartHandshake,
  LuHeartPulse,
  LuSun,
  LuUtensils,
} from "react-icons/lu";

import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/react";

type EmergencyKitItem = {
  title: string;
  tag: string;
  description: ReactNode;
  icon: IconType;
  iconBackground: Tokens["colors"];
  iconColor: Tokens["colors"];
};

const items: EmergencyKitItem[] = [
  {
    title: "Water",
    tag: "Essential",
    icon: LuDroplets,
    iconBackground: "blue.50",
    iconColor: "blue.600",
    description: (
      <>
        <strong>1 gallon per person per day</strong> for at least 3 days. Don’t
        forget pets. Replace every 6 months.
      </>
    ),
  },
  {
    title: "First aid kit",
    tag: "Essential",
    icon: LuHeartPulse,
    iconBackground: "red.50",
    iconColor: "red.600",
    description: (
      <>
        Bandages, gauze, antiseptic, tape, pain relievers, and{" "}
        <strong>prescription medications</strong> (keep a 7-day supply).
      </>
    ),
  },
  {
    title: "Light & power",
    tag: "Essential",
    icon: LuSun,
    iconBackground: "yellow.50",
    iconColor: "yellow.600",
    description:
      "Flashlight + extra batteries (not candles). Portable phone charger. Battery-powered or hand-crank radio.",
  },
  {
    title: "Food",
    tag: "3-day supply",
    icon: LuUtensils,
    iconBackground: "green.50",
    iconColor: "green.600",
    description:
      "Non-perishable: canned goods (with manual opener), energy bars, dried fruit, peanut butter. Check dates every 6 months.",
  },
  {
    title: "Important documents",
    tag: "Critical",
    icon: LuFileText,
    iconBackground: "purple.50",
    iconColor: "purple.600",
    description:
      "Copies of ID, insurance, bank info, medical records, contacts. Waterproof bag. USB drive or cloud backup.",
  },
  {
    title: "Cash & extras",
    tag: "Important",
    icon: LuCreditCard,
    iconBackground: "blue.50",
    iconColor: "blue.600",
    description: (
      <>
        <strong>Cash in small bills</strong> — ATMs won’t work. Also: sturdy
        shoes, work gloves, dust masks, wrench for gas shutoff, whistle.
      </>
    ),
  },
  {
    title: "Special needs",
    tag: "Don’t forget",
    icon: LuHeartHandshake,
    iconBackground: "red.50",
    iconColor: "red.600",
    description:
      "Baby formula, diapers, pet food, leashes, extra eyeglasses, hearing aid batteries, mobility device supplies.",
  },
];

export function EmergencyKitSteps() {
  return (
    <Stack gap="0">
      {items.map((item, index) => {
        const Icon = item.icon;
        const isLast = index === items.length - 1;

        return (
          <Flex
            key={item.title}
            position="relative"
            gap={{ base: "3", md: "3.5" }}
            pb={isLast ? "0" : "6"}
            _after={
              isLast
                ? undefined
                : {
                    content: '""',
                    position: "absolute",
                    top: "12",
                    bottom: "0",
                    left: { base: "4", md: "5" },
                    width: "0.5",
                    background: "border",
                    borderRadius: "full",
                  }
            }
          >
            <Flex
              boxSize={{ base: "9", md: "10" }}
              flexShrink="0"
              align="center"
              justify="center"
              position="relative"
              zIndex="base"
              borderRadius="xl"
              background={item.iconBackground}
              color={item.iconColor}
            >
              <Icon size={20} aria-hidden="true" />
            </Flex>

            <Box flex="1" pt="0.5">
              <Flex align="center" gap="2" wrap="wrap" marginBottom="1">
                <Text fontSize="sm" fontWeight="bold" color="fg">
                  {item.title}
                </Text>

                <Badge
                  size="sm"
                  variant="subtle"
                  colorPalette="blue"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {item.tag}
                </Badge>
              </Flex>

              <Text fontSize="sm" color="fg.muted" lineHeight="tall">
                {item.description}
              </Text>
            </Box>
          </Flex>
        );
      })}
    </Stack>
  );
}
