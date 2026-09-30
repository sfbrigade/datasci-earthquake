import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("renders the FEMA legend with its themed gradient and risk labels", () => {
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
    // Chakra applies the gradient through a stylesheet, not an inline style.
    // JSDOM exposes the CSS variable but does not resolve its color stops.
    expect(femaLegend).toHaveStyle({
      backgroundImage: "var(--chakra-gradients-fema)",
    });
    for (const label of ["Low", "Moderate", "High", "Very High"]) {
      expect(screen.getByText(label, { exact: true })).toBeVisible();
    }
  });

  it.each([true, false])(
    "toggles every liquefaction layer when initially checked=%s",
    async (checked) => {
      const user = userEvent.setup();
      const setToggledStates = jest.fn();
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
            toggledStates={[true, checked, true]}
            setToggledStates={setToggledStates}
            setLayerToggleObj={setLayerToggleObj}
          />
        </Provider>
      );

      expect(
        screen.getByTestId("hazard-legend-liquefaction")
      ).toBeInTheDocument();

      const toggle = screen.getByRole("checkbox", {
        name: "Show Liquefaction zones on map",
        checked,
      });
      await user.click(toggle);

      expect(setToggledStates).toHaveBeenCalledWith([true, !checked, true]);
      expect(setLayerToggleObj).toHaveBeenCalledWith({
        layerIds: [
          "seismicBackgroundLayer",
          "seismicBorderOuterLayer",
          "seismicBorderInnerLayer",
        ],
        toggleState: !checked,
      });
    }
  );

  it("toggles the landslide layer from its legend card", async () => {
    const user = userEvent.setup();
    const setToggledStates = jest.fn();
    const setLayerToggleObj = jest.fn();
    const landslideHazard: HazardProps = {
      ...softStoryHazard,
      id: 3,
      name: "landslide",
      title: "Landslide zones",
    };

    render(
      <Provider>
        <CardHazard
          hazard={landslideHazard}
          showData={true}
          isHazardDataLoading={false}
          toggledStates={[true, true, true, true]}
          setToggledStates={setToggledStates}
          setLayerToggleObj={setLayerToggleObj}
        />
      </Provider>
    );

    expect(screen.getByTestId("hazard-legend-landslide")).toBeInTheDocument();

    await user.click(
      screen.getByRole("checkbox", { name: "Show Landslide zones on map" })
    );

    expect(setToggledStates).toHaveBeenCalledWith([true, true, true, false]);
    expect(setLayerToggleObj).toHaveBeenCalledWith({
      layerIds: ["landslideLayer"],
      toggleState: false,
    });
  });
});
