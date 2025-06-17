import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Heading from "../heading";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "../../../styles/theme";

describe("Heading component", () => {
  const headingData = {
    text: "Learn about your home’s earthquake readiness.",
    highlight: "Learn about",
    style: { color: "black" },
    highlightStyle: { color: "yellow" },
    maxWidth: { base: "100%", md: "50%" },
  };

  const renderComponent = () =>
    render(
      <ChakraProvider value={system}>
        <Heading headingData={headingData} />
      </ChakraProvider>
    );

  test("renders the heading with the correct text", () => {
    renderComponent();
    const firstPart = screen.getByText(/Learn about/i);
    const secondPart = screen.getByText(/your home’s earthquake readiness\./i);
    expect(firstPart).toBeInTheDocument();
    expect(secondPart).toBeInTheDocument();
  });

  test("highlights the correct text with yellow color", () => {
    renderComponent();
    const highlightedText = screen.getByText(/Learn about/i);
    expect(highlightedText).toHaveStyle("color: yellow");
  });
});
