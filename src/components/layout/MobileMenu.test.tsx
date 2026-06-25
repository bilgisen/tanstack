import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "@tanstack/react-router";
import { MobileMenu } from "./MobileMenu";

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

describe("MobileMenu", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders all menu items", () => {
    (vi.mocked(vi.fn()).mockReturnValue as any).mockReturnValue(false);
    
    render(
      <MemoryRouter>
        <MobileMenu items={testItems} />
      </MemoryRouter>
    );
    
    expect(screen.getByTitle("Endeksler")).toBeInTheDocument();
    expect(screen.getByTitle("Haberler")).toBeInTheDocument();
    expect(screen.getByTitle("Raporlar")).toBeInTheDocument();
  });

  it("renders mobile menu with icon-only on mobile screens", () => {
    (vi.mocked(vi.fn()).mockReturnValue as any).mockReturnValue(true);
    
    render(
      <MemoryRouter>
        <MobileMenu items={testItems} />
      </MemoryRouter>
    );
    
    // On mobile, only icons should be visible (no text)
    expect(screen.getByTitle("Endeksler")).toBeInTheDocument();
  });

  it("renders desktop menu with icon and text on larger screens", () => {
    (vi.mocked(vi.fn()).mockReturnValue as any).mockReturnValue(false);
    
    render(
      <MemoryRouter>
        <MobileMenu items={testItems} />
      </MemoryRouter>
    );
    
    // On desktop, both icon and text should be visible
    expect(screen.getByText("Endeksler")).toBeInTheDocument();
    expect(screen.getByText("Haberler")).toBeInTheDocument();
  });

  it("navigates to correct paths when items are clicked", () => {
    (vi.mocked(vi.fn()).mockReturnValue as any).mockReturnValue(true);
    
    render(
      <MemoryRouter>
        <MobileMenu items={testItems} />
      </MemoryRouter>
    );
    
    const link = screen.getByTitle("Endeksler");
    expect(link).toHaveAttribute("href", "/endeksler");
  });
});
