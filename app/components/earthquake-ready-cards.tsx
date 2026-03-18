import { Center } from "@chakra-ui/react";
import { CardContainer } from "./card-container";
import { Card, Icon, Link } from "@chakra-ui/react";
import { FaRegClock } from "react-icons/fa";
import { TiDocumentText } from "react-icons/ti";
import { FaRedhat } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import NextLink from "next/link";

const EarthquakeReadyCards = () => (
  <Center py="4" px="8">
    <CardContainer stackDirectionResponsive={true}>
      <Card.Root size="md">
        <Card.Body gap="2">
          <Icon size="lg">
            <FaRegClock />
          </Icon>
          <Card.Title mt="2">Make a plan</Card.Title>
          <Card.Description>
            Know what to do when shaking starts. Cell service will likely be
            down - agree on a meeting point with family ahead of time.
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-left">
          <Link
            as={NextLink}
            href="https://www.ready.gov/earthquakes"
            target="_blank"
            rel="noopener noreferrer"
            color="blue.text"
          >
            Learn the steps
          </Link>
          <FaArrowRight color="blue.text" />
        </Card.Footer>
      </Card.Root>
      <Card.Root size="md">
        <Card.Body gap="2">
          <Icon size="lg">
            <TiDocumentText />
          </Icon>
          <Card.Title mt="2">Build your kit</Card.Title>
          <Card.Description>
            Water, first aid, flashlight, batteries, medications, and important
            documents. Enough for 72 hours for every person in your home.
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-left">
          <Link
            as={NextLink}
            href="https://www.ready.gov/kit"
            target="_blank"
            rel="noopener noreferrer"
            color="blue.text"
          >
            See the checklist
          </Link>
          <FaArrowRight />
        </Card.Footer>
      </Card.Root>
      <Card.Root size="md">
        <Card.Body gap="2">
          <Icon size="lg">
            <FaRedhat />
          </Icon>
          <Card.Title mt="2">Find a contractor</Card.Title>
          <Card.Description>
            If your building needs retrofitting, find a licensed seismic
            contractor. You may qualify for a state grant to cover costs.
          </Card.Description>
        </Card.Body>
        <Card.Footer justifyContent="flex-left">
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
    </CardContainer>
  </Center>
);

export default EarthquakeReadyCards;
