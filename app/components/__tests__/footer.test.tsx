import { render, screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import "@testing-library/jest-dom";
import Footer from "../footer";
import theme from "../../../styles/theme";

describe("Footer Component", () => {
  const renderFooter = () =>
    render(
      <ChakraProvider theme={theme}>
        <Footer />
      </ChakraProvider>
    );

  it("renders the logo", () => {
    renderFooter();
    expect(screen.getByText("© 2024 SF Civic Tech")).toBeInTheDocument();
  });
});
