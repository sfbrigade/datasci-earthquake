import Link from "next/link";
import { Heading, Text } from "@chakra-ui/react";

interface Building {
  id: string;
  name: string;
}

export default function Home() {
  const buildings: Building[] = [
    { id: "1", name: "Building 1" },
    { id: "2", name: "Building 2" },
  ];

  return (
    <>
      <Heading>Welcome to SF Quake Safe</Heading>
      <Text>Learn about San Francisco earthquake safety.</Text>
      <ul>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/methodology">Methodology</Link>
        </li>
        <li>
          <Link href="/map-view">Map View</Link>
        </li>
        {buildings.map((building) => (
          <li key={building.id}>
            <Link href={`/buildings/${building.id}`}>{building.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
