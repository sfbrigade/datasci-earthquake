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

import { Badge, Box, Flex, Stack, Strong, Text } from "@chakra-ui/react";

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
        forget pets. Replace every 6 months to keep it fresh. You can use up the
        old water supply by drinking it, watering plants, doing dishes or other
        cleaning.
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
        <p>A basic first aid kit should contain at least:</p>

        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          <li>Adhesive bandages (all sizes)</li>
          <li>Butterfly closures (all sizes)</li>
          <li>Tape roll</li>
          <li>Gauze pads and gauze roll</li>
          <li>Scissors</li>
          <li>Foil blankets</li>
          <li>Examination gloves</li>
          <li>Flashlight or glow sticks</li>
          <li>Instant cold pack</li>
          <li>Hot pack (body warmer)</li>
          <li>Antiseptic cream</li>
          <li>Aspirin or Acetaminophen</li>
          <li>Allergy medication</li>
          <li>Tweezers</li>
          <li>Burn cream</li>
          <li>Alcohol pads</li>
          <li>Antiseptic towelettes</li>
          <li>Finger splints or tongue depressors</li>
          <li>Cotton swabs</li>
          <li>Eye wash</li>
        </ul>
      </>
    ),
  },
  {
    title: "Light & power",
    tag: "Essential",
    icon: LuSun,
    iconBackground: "yellow.50",
    iconColor: "yellow.600",
    description: (
      <>
        <p>
          Pack a battery-powered flashlight and extra batteries for it (not
          candles which are a fire hazard), a portable phone charger, a
          solar-charging backup power bank with the correct ports for all of
          your critical devices, a battery-powered or hand-crank radio with its
          extra batteries.
        </p>
        Write down the following Emergency Alert System (EAS) radio stations for
        San Francisco on a clean adhesive label and stick it to the back of your
        radio:
        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          <li>
            <Strong>Primary EAS:</Strong> KCBS 740 AM and 106.9 FM{" "}
          </li>
          <li>
            <Strong>Secondary EAS:</Strong> KQED 88.5 FM
          </li>
          <li>
            <Strong>Back-up radio:</Strong> KALW 91.7 FM (while it is not an EAS
            station, the City and KALW have an agreement that allows the City to
            broadcast emergency information and updates, if needed).
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Food",
    tag: "3-day supply",
    icon: LuUtensils,
    iconBackground: "green.50",
    iconColor: "green.600",
    description: (
      <>
        <p>
          Pack non-perishable foods with expiration dates that are ideally a
          year out, but at least 6 months out. These can include:
        </p>

        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          <li>Ready-to-eat canned meats, fruits, or vegetables</li>
          <li>Canned juices, milk, and soup</li>
          <li>Sweetened cereals</li>
          <li>Small salt, pepper, and sugar packets</li>
          <li>Peanut butter, jelly, and dry crackers</li>
          <li>Granola or energy bars, trail mix, and dried fruit</li>
          <li>Hard candy, instant coffee, and sealed tea bags</li>
          <li>Dry ramen packs</li>
          <li>Dry pet food, if needed</li>
        </ul>

        <p style={{ marginTop: "12px" }}>
          Set a recurring calendar reminder every 6 months to check, use up, and
          replace these items.
        </p>
      </>
    ),
  },
  {
    title: "Important documents",
    tag: "Critical",
    icon: LuFileText,
    iconBackground: "purple.50",
    iconColor: "purple.600",
    description: (
      <>
        <p>Each person should carry printed copies of:</p>

        <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
          <li>
            ID cards for themselves and for each person they may need to locate
            or identify in the household
          </li>
          <li>Health insurance cards</li>
          <li>Blood type cards, if available</li>
          <li>
            Property insurance documents (renter&apos;s, earthquake, fire,
            flooding )
          </li>
          <li>List of local and out-of-area emergency contacts</li>
        </ul>

        <p style={{ marginTop: "12px" }}>
          Store these documents in a waterproof bag or laminate them.
        </p>
      </>
    ),
  },
  {
    title: "Cash & extras",
    tag: "Important",
    icon: LuCreditCard,
    iconBackground: "blue.50",
    iconColor: "blue.600",
    description: (
      <>
        <p>
          ATMs may not work, so keep small bills of cash to last at least 3-7
          days and let each person carry their own cash supply in case of
          separation.
        </p>
        <p>
          Also for each person&apos;s emergency bag: a pair of long-legged
          foldable and reusable waterproof shoe covers for floods, tough but
          flexible work gloves, N95 dust masks or a more protective respirator,
          loud whistle, pepper spray, swiss army knife, portable utensils,
          travel/swim towel, spare copy of house keys without the address
          labelled.
        </p>
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
      "Baby formula, diapers, pet food, leashes, extra eyeglasses, hearing aid batteries, mobility device supplies." +
      "Think of daily items that you can't do without and how to pack a portable version or substitute for them.",
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
