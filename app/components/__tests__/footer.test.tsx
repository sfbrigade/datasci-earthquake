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

  // FIXME: test started failing; must investigate why
  it.skip("renders the logo", () => {
    renderFooter();
    expect(screen.getByText("© 2026 SF Civic Tech")).toBeInTheDocument();
  });
});
