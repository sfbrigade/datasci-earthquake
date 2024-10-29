import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SearchBar from "../search-bar";
import { ChakraProvider } from "@chakra-ui/react";

describe("SearchBar component", () => {
  const renderComponent = () =>
    render(
      <ChakraProvider>
        <SearchBar />
      </ChakraProvider>
    );

  test("renders search icon with correct color", () => {
    renderComponent();
    const icon = screen.getByTestId("search-icon");
    expect(icon).toHaveStyle({ color: "#2C5282" });
  });

  test("renders the input field with the correct placeholder", () => {
    renderComponent();
    const inputElement = screen.getByPlaceholderText(
      "Search San Francisco address"
    );
    expect(inputElement).toBeInTheDocument();
  });
});
