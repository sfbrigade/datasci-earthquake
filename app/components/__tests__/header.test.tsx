import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import "@testing-library/jest-dom";
import Header from "../header";
import theme from "../../../styles/theme";

describe("Header Component", () => {
  const renderHeader = () =>
    render(
      <ChakraProvider theme={theme}>
        <Header />
      </ChakraProvider>
    );

  it("renders the logo and About links", () => {
    renderHeader();
    expect(screen.getByText("SF QuakeSafe")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("has correct hrefs for links", () => {
    renderHeader();
    expect(screen.getByText("SF QuakeSafe").closest("a")).toHaveAttribute(
      "href",
      "/"
    );
    expect(screen.getByText("About").closest("a")).toHaveAttribute(
      "href",
      "/about"
    );
  });
});
