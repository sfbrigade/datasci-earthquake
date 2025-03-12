// import { render, screen } from "@testing-library/react";
// import { ChakraProvider } from "@chakra-ui/react";
// import "@testing-library/jest-dom";
// import Header from "../header";
// import theme from "../../../styles/theme";

// describe("Header Component", () => {
//   const renderHeader = () =>
//     render(
//       <ChakraProvider theme={theme}>
//         <Header />
//       </ChakraProvider>
//     );

//   it("renders the logo and About links", () => {
//     renderHeader();
//     expect(screen.getByText("SF QuakeSafe")).toBeInTheDocument();
//     expect(screen.getByText("About")).toBeInTheDocument();
//   });

//   it("has correct hrefs for links", () => {
//     renderHeader();
//     expect(screen.getByText("SF QuakeSafe").closest("a")).toHaveAttribute(
//       "href",
//       "/"
//     );
//     expect(screen.getByText("About").closest("a")).toHaveAttribute(
//       "href",
//       "/about"
//     );
//   });
// });

import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChakraProvider } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import Header from "../header";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Header component", () => {
  const renderComponent = () =>
    render(
      <ChakraProvider>
        <Header />
      </ChakraProvider>
    );

  test("renders home page content correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/");
    renderComponent();

    expect(screen.getByText("SafeHome")).toBeInTheDocument();
    const aboutLink = screen.getByRole("link", { name: /about/i });
    expect(aboutLink).toHaveAttribute("href", "/about");
  });

  test("renders non-home page content correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/about");
    renderComponent();

    expect(screen.getByText("SafeHome")).toBeInTheDocument();

    const backToHomeLink = screen.getByRole("link", { name: /back to home/i });
    expect(backToHomeLink).toHaveAttribute("href", "/");
  });
});
