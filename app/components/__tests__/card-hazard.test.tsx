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
      color: "#FF0000",
      update: "2 days ago",
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
    expect(screen.getByText("Updated 2 days ago")).toBeInTheDocument();
  });

  it("displays the hazard's color in the SVG circle", () => {
    render(<CardHazard hazard={Hazards[0]} />);
    const svgCircle = screen.getByRole("img", { hidden: true });
    expect(svgCircle).toHaveAttribute("fill", "#FF0000");
  });
});
