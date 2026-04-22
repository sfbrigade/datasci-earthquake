import { render, screen } from "@testing-library/react";
import { Provider } from "../ui/provider";
import "@testing-library/jest-dom";
import FooterVerbose from "../footer-verbose";
import "../__mocks__/match-media";

describe("Footer Component", () => {
  const renderFooter = () =>
    render(
      <Provider>
        <FooterVerbose />
      </Provider>
    );

  it("renders the logo", () => {
    renderFooter();
    expect(screen.getByText("© 2026 SF Civic Tech")).toBeInTheDocument();
  });
});
