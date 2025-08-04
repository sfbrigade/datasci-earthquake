import React from "react";
import { render, screen } from "@testing-library/react";
import CardHazard from "../card-hazard";
import { Hazards } from "../../data/data";
import "@testing-library/jest-dom";
import { Provider } from "../ui/provider";
import "../__mocks__/match-media";

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
      info: [
        "A soft story building is a structure built before 1978 that contains an open-floor level, such as a garage or retail space, below one or more living spaces.",
        "According to DataSF, there are 4,943 soft story buildings in SF. But not all are at risk!",
        "Some have been retrofitted to reinforce their lower levels and are generally considered earthquake-safe.",
        "Those that haven't made the required upgrades may face a greater risk of damage in an earthquake.",
      ],
      link: {
        label: "Soft story dataset",
        url: "https://data.sfgov.org/Housing-and-Buildings/Soft-Story-Properties/beah-shgi/about_data",
      },
    };
  });

  it("renders without crashing", () => {
    render(
      <Provider>
        <CardHazard
          hazard={Hazards[0]}
          showData={true}
          isHazardDataLoading={true}
        />
      </Provider>
    );
    expect(screen.getByText("Earthquake")).toBeInTheDocument();
  });

  it("displays the hazard title and description", () => {
    render(
      <Provider>
        <CardHazard
          hazard={Hazards[0]}
          showData={true}
          isHazardDataLoading={true}
        />
      </Provider>
    );
    expect(screen.getByText("Earthquake")).toBeInTheDocument();
    expect(
      screen.getByText("Potential hazard in the area.")
    ).toBeInTheDocument();
  });
});
