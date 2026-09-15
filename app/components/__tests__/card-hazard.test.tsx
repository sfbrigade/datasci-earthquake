import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import CardHazard, { HazardProps } from "../card-hazard";
import "@testing-library/jest-dom";
import { Provider } from "../ui/provider";
import "../__mocks__/match-media";

// eslint-disable-next-line react/display-name
jest.mock("../pill.tsx", () => () => (
  <div data-testid="pill-mock">Pill Component</div>
));

describe("CardHazard Component", () => {
  const softStoryHazard: HazardProps = {
    id: 0,
    title: "Earthquake",
    name: "softStory",
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
    icon: "circle",
    iconColor: "grey.400",
  };

  it("renders without crashing", () => {
    render(
      <Provider>
        <CardHazard
          hazard={softStoryHazard}
          showData={true}
          isHazardDataLoading={true}
          toggledStates={[true, true, true]}
          setToggledStates={jest.fn()}
          setLayerToggleObj={jest.fn()}
        />
      </Provider>
    );

    expect(screen.getByText("Earthquake")).toBeInTheDocument();
    expect(screen.getByTestId("hazard-legend-softStory")).toBeInTheDocument();
  });

  it("displays the hazard title and description", () => {
    render(
      <Provider>
        <CardHazard
          hazard={softStoryHazard}
          showData={true}
          isHazardDataLoading={true}
          toggledStates={[true, true, true]}
          setToggledStates={jest.fn()}
          setLayerToggleObj={jest.fn()}
        />
      </Provider>
    );

    expect(screen.getByText("Earthquake")).toBeInTheDocument();
    expect(
      screen.getByText("Potential hazard in the area.")
    ).toBeInTheDocument();
  });

  it("renders the FEMA legend with the rose opacity scale", () => {
    const femaHazard: HazardProps = {
      ...softStoryHazard,
      id: 3,
      name: "femaRisk",
      title: "Earthquake risk",
    };

    render(
      <Provider>
        <CardHazard
          hazard={femaHazard}
          showData={false}
          isHazardDataLoading={false}
          toggledStates={[true, true, true, true]}
          setToggledStates={jest.fn()}
          setLayerToggleObj={jest.fn()}
        />
      </Provider>
    );

    const femaLegend = screen.getByTestId("hazard-legend-femaRisk");
    expect(femaLegend).toBeInTheDocument();
    expect(femaLegend.style.backgroundImage).toContain(
      "rgba(190, 18, 60, 0.18)"
    );
  });

  it("toggles every Mapbox layer used by liquefaction", () => {
    const setLayerToggleObj = jest.fn();
    const liquefactionHazard: HazardProps = {
      ...softStoryHazard,
      id: 1,
      name: "liquefaction",
      title: "Liquefaction zones",
    };

    render(
      <Provider>
        <CardHazard
          hazard={liquefactionHazard}
          showData={true}
          isHazardDataLoading={false}
          toggledStates={[true, true, true]}
          setToggledStates={jest.fn()}
          setLayerToggleObj={setLayerToggleObj}
        />
      </Provider>
    );

    expect(screen.getByTestId("hazard-legend-liquefaction")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox"));

    expect(setLayerToggleObj).toHaveBeenCalledWith({
      layerIds: [
        "seismicBackgroundLayer",
        "seismicOuterLayer",
        "seismicLayer",
      ],
      toggleState: false,
    });
  });
});
