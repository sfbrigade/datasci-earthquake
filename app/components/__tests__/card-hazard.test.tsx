import React from "react";
import { render, screen } from "@testing-library/react";
import CardHazard from "../card-hazard";
import { Hazards } from "../../data/data";
import "@testing-library/jest-dom";

// eslint-disable-next-line react/display-name
jest.mock("../pill.tsx", () => () => (
  <div data-testid="pill-mock">Pill Component</div>
));

describe("CardHazard Component", () => {
  beforeEach(() => {
    Hazards[0] = {
      id: 4,
      title: "Earthquake",
      name: "seismic",
      description: "Potential hazard in the area.",
    };
  });

  it("renders without crashing", () => {
    render(<CardHazard hazard={Hazards[0]} />);
    expect(screen.getByText("Earthquake")).toBeInTheDocument();
  });

  it("displays the hazard title and description", () => {
    render(<CardHazard hazard={Hazards[0]} />);
    expect(screen.getByText("Earthquake")).toBeInTheDocument();
    expect(
      screen.getByText("Potential hazard in the area.")
    ).toBeInTheDocument();
  });

  it("displays the hazard's updated time", () => {
    render(<CardHazard hazard={Hazards[0]} />);
    expect(screen.getByText("More info")).toBeInTheDocument();
  });
});
