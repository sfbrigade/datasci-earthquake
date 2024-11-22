import React from "react";
import { render, screen } from "@testing-library/react";
import CardHazard from "../card-hazard";
import { Hazards } from "../__mocks__/hazards";
import "@testing-library/jest-dom";

// eslint-disable-next-line react/display-name
jest.mock("../pill.tsx", () => () => (
  <div data-testid="pill-mock">Pill Component</div>
));

describe("CardHazard Component", () => {
  beforeEach(() => {
    Hazards[0] = {
      title: "Earthquake",
      description: "Potential hazard in the area.",
      color: "#FF0000",
      update: "2 days ago",
    };
  });

  it("renders without crashing", () => {
    render(<CardHazard />);
    expect(screen.getByText("Earthquake")).toBeInTheDocument();
  });

  it("displays the hazard title and description", () => {
    render(<CardHazard />);
    expect(screen.getByText("Earthquake")).toBeInTheDocument();
    expect(
      screen.getByText("Potential hazard in the area.")
    ).toBeInTheDocument();
  });

  it("displays the hazard's updated time", () => {
    render(<CardHazard />);
    expect(screen.getByText("Updated 2 days ago")).toBeInTheDocument();
  });

  it("displays the hazard's color in the SVG circle", () => {
    render(<CardHazard />);
    const svgCircle = screen.getByRole("img", { hidden: true });
    expect(svgCircle).toHaveAttribute("fill", "#FF0000");
  });
});
