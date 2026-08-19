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

import { Badge, Box, Flex, List, Stack, Strong, Text } from "@chakra-ui/react";

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
        <Text as="p">A basic first aid kit should contain at least:</Text>

        <List.Root pl="5" mt="1">
          <List.Item>Adhesive bandages (all sizes)</List.Item>
          <List.Item>Butterfly closures (all sizes)</List.Item>
          <List.Item>Tape roll</List.Item>
          <List.Item>Gauze pads and gauze roll</List.Item>
          <List.Item>Scissors</List.Item>
          <List.Item>Foil blankets</List.Item>
          <List.Item>Examination gloves</List.Item>
          <List.Item>Flashlight or glow sticks</List.Item>
          <List.Item>Instant cold pack</List.Item>
          <List.Item>Hot pack (body warmer)</List.Item>
          <List.Item>Antiseptic cream</List.Item>
          <List.Item>Aspirin or Acetaminophen</List.Item>
          <List.Item>Allergy medication</List.Item>
          <List.Item>Tweezers</List.Item>
          <List.Item>Burn cream</List.Item>
          <List.Item>Alcohol pads</List.Item>
          <List.Item>Antiseptic towelettes</List.Item>
          <List.Item>Finger splints or tongue depressors</List.Item>
          <List.Item>Cotton swabs</List.Item>
          <List.Item>Eye wash</List.Item>
        </List.Root>
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
        <Text as="p">
          Pack a battery-powered flashlight and extra batteries for it (not
          candles which are a fire hazard), a portable phone charger, a
          solar-charging backup power bank with the correct ports for all of
          your critical devices, a battery-powered or hand-crank radio with its
          extra batteries.
        </Text>
        Write down the following Emergency Alert System (EAS) radio stations for
        San Francisco on a clean adhesive label and stick it to the back of your
        radio:
        <List.Root pl="5" mt="1">
          <List.Item>
            <Strong>Primary EAS:</Strong> KCBS 740 AM and 106.9 FM{" "}
          </List.Item>
          <List.Item>
            <Strong>Secondary EAS:</Strong> KQED 88.5 FM
          </List.Item>
          <List.Item>
            <Strong>Back-up radio:</Strong> KALW 91.7 FM (while it is not an EAS
            station, the City and KALW have an agreement that allows the City to
            broadcast emergency information and updates, if needed).
          </List.Item>
        </List.Root>
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
        <Text as="p">
          Pack non-perishable foods with expiration dates that are ideally a
          year out, but at least 6 months out. These can include:
        </Text>

        <List.Root pl="5" mt="1">
          <List.Item>
            Ready-to-eat canned meats, fruits, or vegetables
          </List.Item>
          <List.Item>Canned juices, milk, and soup</List.Item>
          <List.Item>Sweetened cereals</List.Item>
          <List.Item>Small salt, pepper, and sugar packets</List.Item>
          <List.Item>Peanut butter, jelly, and dry crackers</List.Item>
          <List.Item>
            Granola or energy bars, trail mix, and dried fruit
          </List.Item>
          <List.Item>Hard candy, instant coffee, and sealed tea bags</List.Item>
          <List.Item>Dry ramen packs</List.Item>
          <List.Item>Dry pet food, if needed</List.Item>
        </List.Root>

        <Text mt="3">
          Set a recurring calendar reminder every 6 months to check, use up, and
          replace these items.
        </Text>
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
        <Text as="p">Each person should carry printed copies of:</Text>

        <List.Root pl="5" mt="1">
          <List.Item>
            ID cards for themselves and for each person they may need to locate
            or identify in the household
          </List.Item>
          <List.Item>Health insurance cards</List.Item>
          <List.Item>Blood type cards, if available</List.Item>
          <List.Item>
            Property insurance documents (renter&apos;s, earthquake, fire,
            flooding )
          </List.Item>
          <List.Item>
            List of local and out-of-area emergency contacts
          </List.Item>
        </List.Root>

        <Text mt="3">
          Store these documents in a waterproof bag or laminate them.
        </Text>
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
        <Text as="p">
          ATMs may not work, so keep small bills of cash to last at least 3-7
          days and let each person carry their own cash supply in case of
          separation.
        </Text>
        <Text as="p" mt="2">
          Also for each person&apos;s emergency bag:
        </Text>
        <List.Root pl="5" mt="1">
          <List.Item>
            A pair of long-legged foldable and reusable waterproof shoe-covers
          </List.Item>
          <List.Item>A pair of tough but flexible work gloves</List.Item>
          <List.Item>N95 dust mask, or a more protective respirator</List.Item>
          <List.Item>Loud whistle</List.Item>
          <List.Item>Pepper spray</List.Item>
          <List.Item>Swiss army knife</List.Item>
          <List.Item>Portable utensils</List.Item>
          <List.Item>Travel/swim towel</List.Item>
          <List.Item>Spare copy of house keys</List.Item>
        </List.Root>
      </>
    ),
  },
  {
    title: "Special needs",
    tag: "Don’t forget",
    icon: LuHeartHandshake,
    iconBackground: "red.50",
    iconColor: "red.600",
    description: (
      <>
        <Text as="p" mt="2">
          Think of daily items that you can&apos;t do without and how to pack a
          portable version or substitute for them.
        </Text>
        <List.Root pl="5" mt="1">
          <List.Item>Baby formula</List.Item>
          <List.Item>Baby items such as diapers</List.Item>
          <List.Item>Pet food</List.Item>
          <List.Item>Leashes</List.Item>
          <List.Item>Extra eyeglasses</List.Item>
          <List.Item>Hearing aid batteries</List.Item>
          <List.Item>Mobility device supplies</List.Item>
        </List.Root>
      </>
    ),
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
