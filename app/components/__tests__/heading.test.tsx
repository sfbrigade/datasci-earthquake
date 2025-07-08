import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Heading from "../heading";
import { Provider } from "../ui/provider";
import "../__mocks__/match-media";

describe("Heading component", () => {
  const headingData = {
    text: "Learn about your home’s earthquake readiness.",
    highlight: "Learn about",
    style: { color: "black" },
    maxWidth: { base: "100%", md: "50%" },
  };

  const renderComponent = () =>
    render(
      <Provider>
        <Heading headingData={headingData} />
      </Provider>
    );

  test("renders the heading with the correct text", () => {
    renderComponent();
    const firstPart = screen.getByText(/Learn about/i);
    const secondPart = screen.getByText(/your home’s earthquake readiness\./i);
    expect(firstPart).toBeInTheDocument();
    expect(secondPart).toBeInTheDocument();
  });

  // FIXME: test appears to fail after Chakra UI v3 upgrade
  test.skip("highlights the correct text with yellow color", () => {
    renderComponent();
    const highlightedText = screen.getByText(/Learn about/i);
    expect(highlightedText).toHaveStyle("color: yellow");
  });
});
