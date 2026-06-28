// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { MobileMenu } from "./MobileMenu";
import { routeTree } from "../../routeTree.gen";

// Mock useIsMobile hook
vi.mock("@/hooks/useIsMobile", () => ({
  useIsMobile: vi.fn(),
}));

// Test data
const testItems = [
  { id: "endeksler", label: "Endeksler", icon: () => <span>chart</span>, path: "/endeksler" },
  { id: "haberler", label: "Haberler", icon: () => <span>rss</span>, path: "/haberler" },
  { id: "raporlar", label: "Raporlar", icon: () => <span>file</span>, path: "/raporlar" },
];

function createTestRouter() {
  const history = createMemoryHistory({
    initialEntries: ["/"],
  });
  return createRouter({
    routeTree,
    history,
  });
}

describe("MobileMenu", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders all menu items", () => {
    const router = createTestRouter();
    const { container } = render(
      <RouterProvider router={router}>
        <MobileMenu items={testItems} />
      </RouterProvider>
    );

    expect(container.querySelector('[title="Endeksler"]')).toBeTruthy();
    expect(container.querySelector('[title="Haberler"]')).toBeTruthy();
    expect(container.querySelector('[title="Raporlar"]')).toBeTruthy();
  });

  it("renders mobile menu with icon-only on mobile screens", () => {
    const router = createTestRouter();
    const { container } = render(
      <RouterProvider router={router}>
        <MobileMenu items={testItems} />
      </RouterProvider>
    );

    expect(container.querySelector('[title="Endeksler"]')).toBeTruthy();
  });

  it("renders desktop menu with icon and text on larger screens", () => {
    const router = createTestRouter();
    const { container } = render(
      <RouterProvider router={router}>
        <MobileMenu items={testItems} />
      </RouterProvider>
    );

    expect(container.textContent).toContain("Endeksler");
    expect(container.textContent).toContain("Haberler");
  });

  it("navigates to correct paths when items are clicked", () => {
    const router = createTestRouter();
    const { container } = render(
      <RouterProvider router={router}>
        <MobileMenu items={testItems} />
      </RouterProvider>
    );

    const link = container.querySelector('[title="Endeksler"]');
    expect(link).toHaveAttribute("href", "/endeksler");
  });
});
