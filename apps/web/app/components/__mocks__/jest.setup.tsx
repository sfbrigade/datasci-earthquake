import { jest } from "@jest/globals";
import React from "react";

// Mocking window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});

const createMockIcon = (testId: string) => {
  const MockIcon = () => <svg data-testid={testId} />;
  MockIcon.displayName = `Mock${testId.charAt(0).toUpperCase() + testId.slice(1)}Icon`;
  return MockIcon;
};

jest.mock("../../img/icon-share.svg", () => createMockIcon("share-icon"));
jest.mock("../../img/icon-facebook.svg", () => createMockIcon("facebook-icon"));
jest.mock("../../img/icon-email.svg", () => createMockIcon("email-icon"));
jest.mock("../../img/icon-x.svg", () => createMockIcon("x-icon"));
jest.mock("../../img/icon-link.svg", () => createMockIcon("link-icon"));
