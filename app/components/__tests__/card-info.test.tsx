import { render, screen } from "@testing-library/react";
import CardInfo from "../card-info";
import { ChakraProvider } from "@chakra-ui/react";
import "@testing-library/jest-dom";

const mockInfo = {
  id: 1,
  name: "Preparedness",
  title: "Preparedness Resources",
  list: [
    { id: 1, title: "Ready.gov", url: "https://www.ready.gov/" },
    {
      id: 2,
      title: "Earthquake Authority",
      url: "https://www.earthquakeauthority.com/",
    },
    { id: 3, title: "MyShake App", url: "https://myshake.berkeley.edu/" },
  ],
};

describe("CardInfo Component", () => {
  const renderWithChakra = (ui: React.ReactElement) =>
    render(<ChakraProvider>{ui}</ChakraProvider>);

  it("renders the card title", () => {
    renderWithChakra(<CardInfo info={mockInfo} />);

    const titleElement = screen.getByText("Preparedness Resources");
    expect(titleElement).toBeInTheDocument();
  });

  it("renders the correct number of list items", () => {
    renderWithChakra(<CardInfo info={mockInfo} />);

    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(mockInfo.list.length);
  });

  it("renders links with correct href attributes", () => {
    renderWithChakra(<CardInfo info={mockInfo} />);

    mockInfo.list.forEach((item) => {
      const linkElement = screen.getByText(item.title);
      expect(linkElement).toBeInTheDocument();
      expect(linkElement.closest("a")).toHaveAttribute("href", item.url);
    });
  });

  it("opens links in a new tab", () => {
    renderWithChakra(<CardInfo info={mockInfo} />);

    const linkElement = screen.getByText("Ready.gov");
    expect(linkElement.closest("a")).toHaveAttribute("target", "_blank");
  });
});
