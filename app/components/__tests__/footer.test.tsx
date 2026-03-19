import { render, screen } from "@testing-library/react";
import { Providers } from "../../providers/providers";
import "@testing-library/jest-dom";
import Footer from "../footer";
import "../__mocks__/match-media";

describe("Footer Component", () => {
  const renderFooter = () =>
    render(
      <Providers>
        <Footer />
      </Providers>
    );

  it("renders the logo", () => {
    renderFooter();
    expect(screen.getByText("© 2025 SF Civic Tech")).toBeInTheDocument();
  });
});
