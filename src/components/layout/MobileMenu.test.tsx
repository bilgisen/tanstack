import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { RouterContextProvider, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { routeTree } from "../../routeTree.gen";
import { MobileMenu } from "./MobileMenu";
import { useIsMobile } from "@/hooks/useIsMobile";

vi.mock("@/hooks/useIsMobile", () => ({
  useIsMobile: vi.fn(),
}));

const mockUseIsMobile = vi.mocked(useIsMobile);

const testItems = [
  { id: "endeksler", label: "Endeksler", icon: () => <span>chart</span>, path: "/endeksler" },
  { id: "siralamalar", label: "Sıralamalar", icon: () => <span>rank</span>, path: "/siralamalar" },
  { id: "takip-listesi", label: "Takip Listesi", icon: () => <span>star</span>, path: "/takip-listesi" },
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

function renderMenu() {
  const router = createTestRouter();
  return render(
    <RouterContextProvider router={router}>
      <MobileMenu items={testItems} />
    </RouterContextProvider>
  );
}

describe("MobileMenu", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    mockUseIsMobile.mockReturnValue(false);
  });

  it("renders all menu items", () => {
    const { container } = renderMenu();

    expect(container.querySelector('[title="Endeksler"]')).toBeTruthy();
    expect(container.querySelector('[title="Sıralamalar"]')).toBeTruthy();
    expect(container.querySelector('[title="Takip Listesi"]')).toBeTruthy();
  });

  it("renders icon-only links on mobile screens", () => {
    mockUseIsMobile.mockReturnValue(true);
    const { container } = renderMenu();

    const link = container.querySelector('[title="Endeksler"]');
    expect(link).toBeTruthy();
    expect(container.textContent).not.toContain("Endeksler");
  });

  it("renders icon and text on desktop screens", () => {
    mockUseIsMobile.mockReturnValue(false);
    const { container } = renderMenu();

    expect(container.textContent).toContain("Endeksler");
    expect(container.textContent).toContain("Sıralamalar");
    expect(container.textContent).toContain("Takip Listesi");
  });

  it("links to the correct paths", () => {
    const { container } = renderMenu();

    const link = container.querySelector('[title="Endeksler"]');
    expect(link).toHaveAttribute("href", "/endeksler");
  });
});
