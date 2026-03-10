import { render, screen } from "@testing-library/react";
import { Provider } from "../ui/provider";
import "@testing-library/jest-dom";
import Footer from "../footer";
import "../__mocks__/match-media";

describe("Footer Component", () => {
  const renderFooter = () =>
    render(
      <Provider>
        <Footer />
      </Provider>
    );

  it("renders the logo", () => {
    renderFooter();
    expect(screen.getByText("© 2025 SF Civic Tech")).toBeInTheDocument();
  });
});
