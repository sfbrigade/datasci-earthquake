"use client";
// TODO: double check why this directive is needed for prepare page, but not for if it was in drawer

import { Center } from "@chakra-ui/react";
import { CardContainer } from "./card-container";
import { Card, Link } from "@chakra-ui/react";
import { FaArrowRight } from "react-icons/fa6";
import {
  LuBriefcaseMedical,
  LuClock,
  LuHardHat,
  LuSmartphone,
} from "react-icons/lu";
import NextLink from "next/link";
import { MakePlanDialog } from "./make-plan-dialog";
import { ChecklistDialog } from "./checklist-dialog";
import { IconWrapper } from "./icon-wrapper";

const EarthquakeReadyCards = () => (
  <Center>
    <CardContainer stackDirectionResponsive={true}>
      <Card.Root size="md">
        <Card.Body gap="2">
          <IconWrapper icon={LuClock} />
          <Card.Title mt="2">Make a plan</Card.Title>
          <Card.Description>
            Know what to do when shaking starts. Get alerts and prepare in
            advance.
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-start">
          <MakePlanDialog />
        </Card.Footer>
      </Card.Root>
      <Card.Root size="md">
        <Card.Body gap="2">
          <IconWrapper icon={LuBriefcaseMedical} />
          <Card.Title mt="2">Build your kit</Card.Title>
          <Card.Description>
            First aid, flashlight, food, water, medications - what will you need
            in an emergency? Pack a 3-day supply per person.
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-start">
          <ChecklistDialog />
        </Card.Footer>
      </Card.Root>
      <Card.Root size="md">
        <Card.Body gap="2">
          <IconWrapper icon={LuHardHat} />

          <Card.Title mt="2">Find a contractor</Card.Title>
          <Card.Description>
            If your building needs retrofitting, find a licensed seismic
            contractor. You may qualify for a state grant to cover costs.
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-start">
          <Link
            as={NextLink}
            href="https://www.crmp.org/resources/find-a-contractor/"
            target="_blank"
            rel="noopener noreferrer"
            color="blue.text"
          >
            Find contractors
          </Link>
          <FaArrowRight />
        </Card.Footer>
      </Card.Root>
      <Card.Root size="md">
        <Card.Body gap="2">
          <IconWrapper icon={LuSmartphone} />

          <Card.Title mt="2">Get early warnings</Card.Title>
          <Card.Description>
            Download the MyShake app for real-time earthquake warnings. Every
            second counts.
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-start">
          <Link
            as={NextLink}
            href="https://myshake.berkeley.edu/"
            target="_blank"
            rel="noopener noreferrer"
            color="blue.text"
          >
            Download MyShake
          </Link>
          <FaArrowRight />
        </Card.Footer>
      </Card.Root>
    </CardContainer>
  </Center>
);

export default EarthquakeReadyCards;
