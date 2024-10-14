import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import MockButton from "./mock-button";
describe("MockButton Component", () => {
  it("renders with default label", () => {
    render(<MockButton />);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = jest.fn();
    render(<MockButton onClick={handleClick} />);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
