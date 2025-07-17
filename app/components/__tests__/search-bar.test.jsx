import { render, fireEvent, screen } from "@testing-library/react";
import SearchBar from "../search-bar";
import "@testing-library/jest-dom";
import { Provider } from "../ui/provider";
import "../__mocks__/match-media";

// FIXME: to be able to re-enable this test suite, modify the mock etc to handle the usage
// of Next's `dynamic()` in `address-autofill.tsx` to get the tests running again
jest.mock("@mapbox/search-js-react", () => ({
  AddressAutofill: ({ children, onRetrieve }) => (
    <div
      onClick={() => onRetrieve({ features: [{ place_name: "Mock Address" }] })}
    >
      {children}
    </div>
  ),
}));

describe.skip("SearchBar Component", () => {
  it("renders search input and icons correctly", () => {
    render(
      <Provider>
        <SearchBar />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Search San Francisco address");
    const searchIcon = screen.getByTestId("search-icon");
    const clearIcon = screen.getByTestId("clear-icon");

    expect(input).toBeInTheDocument();
    expect(searchIcon).toBeInTheDocument();
    expect(clearIcon).toBeInTheDocument();
    expect(searchIcon).toHaveStyle({ color: "rgb(23, 25, 35" });
  });

  it("updates address state when typing", () => {
    render(
      <Provider>
        <SearchBar />
      </Provider>
    );
    const input = screen.getByPlaceholderText("Search San Francisco address");

    fireEvent.change(input, { target: { value: "123 Main St" } });
    expect(input.value).toBe("123 Main St");
  });

  it("clears the address field when clear icon is clicked", () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText("Search San Francisco address");
    const clearIcon = screen.getByTestId("clear-icon");

    fireEvent.change(input, { target: { value: "123 Main St" } });
    fireEvent.click(clearIcon);
    expect(input.value).toBe("");
  });

  it("calls handleRetrieve and updates fullAddress on retrieve event", () => {
    render(
      <Provider>
        <SearchBar />
      </Provider>
    );
    const input = screen.getByPlaceholderText("Search San Francisco address");

    fireEvent.click(input);
  });
});
