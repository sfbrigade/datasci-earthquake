import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Share from "../share";
import "@testing-library/jest-dom";

describe("Share Component", () => {
  it("renders the Share button", () => {
    render(<Share />);
    const button = screen.getByText(/share report/i);
    expect(button).toBeInTheDocument();
  });

  it("renders the menu options when the Share button is clicked", async () => {
    render(<Share />);
    const user = userEvent.setup();
    const button = screen.getByText(/share report/i);

    button.style.pointerEvents = "auto";

    await user.click(button);

    const emailOption = screen.getByText(/email/i);
    const facebookOption = screen.getByText(/facebook/i);
    const xOption = screen.getByText(/x/i);
    expect(emailOption).toBeInTheDocument();
    expect(facebookOption).toBeInTheDocument();
    expect(xOption).toBeInTheDocument();
  });

  it("triggers a click on a menu item", async () => {
    render(<Share />);
    const user = userEvent.setup();

    const button = screen.getByText(/share report/i);
    button.style.pointerEvents = "auto";
    await user.click(button);

    const emailOption = await screen.getByText(/email/i);
    await waitFor(() => expect(emailOption).toBeVisible());

    await userEvent.click(emailOption);
    expect(emailOption).toBeDefined();
  });
});
