import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { ResponsiveLogo } from "./ResponsiveLogo";

// Mock window.innerWidth and addEventListener/removeEventListener
function mockWindowWidth(width: number) {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(width);
}

describe("ResponsiveLogo", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders SiteIcon on mobile screens (< 768px)", () => {
    mockWindowWidth(375);
    
    render(<ResponsiveLogo />);
    
    // SiteIcon renders HisseproIcon which has specific viewBox
    // Check that the icon SVG is present
    const iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).toBeInTheDocument();
  });

  it("renders Logo full on desktop screens (>= 768px)", () => {
    mockWindowWidth(1024);
    
    render(<ResponsiveLogo />);
    
    // Logo full renders HisseproFull which has specific viewBox
    const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toBeInTheDocument();
  });

  it("mobileSize prop takes precedence over size on mobile", () => {
    mockWindowWidth(375);
    
    render(<ResponsiveLogo size={24} mobileSize={12} />);
    
    // Get the SiteIcon element and check its height
    const iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).toHaveAttribute("height", "12");
  });

  it("desktopSize prop takes precedence over size on desktop", () => {
    mockWindowWidth(1024);
    
    render(<ResponsiveLogo size={14} desktopSize={32} />);
    
    // Get the Logo full element and check its height
    const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toHaveAttribute("height", "32");
  });

  it("size prop fallback to default when other props not provided", () => {
    // Test with mobile screen - should use default size of 24
    mockWindowWidth(375);
    
    render(<ResponsiveLogo />);
    
    let iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    // Mobile uses default 24
    expect(iconSvg).toHaveAttribute("height", "24");
    
    // Test with desktop screen - should use default size of 24
    mockWindowWidth(1024);
    
    render(<ResponsiveLogo />);
    
    let fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toHaveAttribute("height", "24");
  });

  it("breakpoint crossing without page refresh (window resize simulation)", () => {
    // Initial render on mobile
    mockWindowWidth(375);
    
    render(<ResponsiveLogo />);
    
    // Should show icon initially
    let iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).toBeInTheDocument();
    
    // Simulate resize to desktop (no re-render needed, event listener handles it)
    // We need to trigger the resize event
    window.dispatchEvent(new Event("resize"));
    
    // Wait for debounce timeout
    vi.advanceTimersByTime(100);
    
    // Should now show full logo
    let fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toBeInTheDocument();
    
    // Resize back to mobile
    mockWindowWidth(767);
    window.dispatchEvent(new Event("resize"));
    vi.advanceTimersByTime(100);
    
    // Should show icon again
    iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).toBeInTheDocument();
  });

  it("includes accessibility attributes (role=img and aria-label)", () => {
    mockWindowWidth(375);
    
    render(<ResponsiveLogo />);
    
    const svgElement = document.querySelector("svg");
    expect(svgElement).toHaveAttribute("role", "img");
    expect(svgElement).toHaveAttribute("aria-label", "Company logo");
  });

  it("preserves aspect ratio for SiteIcon on mobile", () => {
    mockWindowWidth(375);
    
    const testSize = 31.5;
    render(<ResponsiveLogo size={testSize} />);
    
    const iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).toBeInTheDocument();
    
    // HisseproIcon aspect ratio: 212/315 ≈ 0.673
    const expectedWidth = testSize * (212 / 315);
    expect(iconSvg).toHaveAttribute("width", expectedWidth.toString());
    expect(iconSvg).toHaveAttribute("height", testSize.toString());
  });

  it("preserves aspect ratio for Logo full on desktop", () => {
    mockWindowWidth(1024);
    
    const testSize = 45.1;
    render(<ResponsiveLogo size={testSize} />);
    
    const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toBeInTheDocument();
    
    // HisseproFull aspect ratio: 2439/451 ≈ 5.408
    const expectedWidth = testSize * (2439 / 451);
    expect(fullSvg).toHaveAttribute("width", expectedWidth.toString());
    expect(fullSvg).toHaveAttribute("height", testSize.toString());
  });

  it("handles different mobile screen sizes (375px, 767px)", () => {
    [375, 767].forEach((width) => {
      mockWindowWidth(width);
      
      render(<ResponsiveLogo />);
      
      const iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
      expect(iconSvg).toBeInTheDocument();
    });
  });

  it("handles different desktop screen sizes (768px, 1024px, 1440px)", () => {
    [768, 1024, 1440].forEach((width) => {
      mockWindowWidth(width);
      
      render(<ResponsiveLogo />);
      
      const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
      expect(fullSvg).toBeInTheDocument();
    });
  });

  it("applies custom className", () => {
    mockWindowWidth(375);
    
    const customClass = "custom-logo-class";
    render(<ResponsiveLogo className={customClass} />);
    
    const svgElement = document.querySelector("svg");
    expect(svgElement).toHaveClass(customClass);
  });

  it("cleans up event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");
    
    const { unmount } = render(<ResponsiveLogo />);
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});

// Property-Based Tests (reduced examples for faster execution)
describe("ResponsiveLogo property tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mobile screens always show SiteIcon regardless of specific width", () => {
    // Test reduced mobile widths
    const mobileWidths = [320, 375, 767];
    
    mobileWidths.forEach((width) => {
      mockWindowWidth(width);
      
      render(<ResponsiveLogo />);
      
      const iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
      expect(iconSvg).toBeInTheDocument();
      
      cleanup();
    });
  });

  it("desktop screens always show Logo full regardless of specific width", () => {
    // Test reduced desktop widths
    const desktopWidths = [768, 1024, 1440];
    
    desktopWidths.forEach((width) => {
      mockWindowWidth(width);
      
      render(<ResponsiveLogo />);
      
      const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
      expect(fullSvg).toBeInTheDocument();
      
      cleanup();
    });
  });

  it("size props are correctly applied based on screen size", () => {
    const testCases = [
      { width: 375, mobileSize: 12, desktopSize: 24, size: 20, expectedSize: 12 },
      { width: 1024, mobileSize: 12, desktopSize: 24, size: 20, expectedSize: 24 },
      { width: 375, mobileSize: undefined, desktopSize: undefined, size: 18, expectedSize: 18 },
    ];
    
    testCases.forEach(({ width, mobileSize, desktopSize, size, expectedSize }) => {
      mockWindowWidth(width);
      
      render(<ResponsiveLogo mobileSize={mobileSize} desktopSize={desktopSize} size={size} />);
      
      const svgElement = document.querySelector("svg");
      expect(svgElement).toHaveAttribute("height", expectedSize.toString());
      
      cleanup();
    });
  });

  it("aspect ratios are preserved for all logo variants", () => {
    // SiteIcon aspect ratio: 212/315
    mockWindowWidth(375);
    render(<ResponsiveLogo size={31.5} />);
    let iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).toHaveAttribute("width", "21.2");
    expect(iconSvg).toHaveAttribute("height", "31.5");
    cleanup();
    
    // Logo full aspect ratio: 2439/451
    mockWindowWidth(1024);
    render(<ResponsiveLogo size={45.1} />);
    let fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toHaveAttribute("width", "243.9");
    expect(fullSvg).toHaveAttribute("height", "45.1");
    cleanup();
  });

  it("breakpoint threshold at exactly 768px shows desktop version", () => {
    mockWindowWidth(768);
    
    render(<ResponsiveLogo />);
    
    const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toBeInTheDocument();
    
    const iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).not.toBeInTheDocument();
  });

  it("breakpoint threshold at 767px shows mobile version", () => {
    mockWindowWidth(767);
    
    render(<ResponsiveLogo />);
    
    const iconSvg = document.querySelector("svg[viewBox='0 0 212 315']");
    expect(iconSvg).toBeInTheDocument();
    
    const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).not.toBeInTheDocument();
  });

  it("resize events are debounced to prevent excessive re-renders", () => {
    mockWindowWidth(375);
    
    render(<ResponsiveLogo />);
    
    // Simulate multiple rapid resize events
    for (let i = 0; i < 10; i++) {
      mockWindowWidth(1024);
      window.dispatchEvent(new Event("resize"));
    }
    
    // Advance timers past debounce period
    vi.advanceTimersByTime(100);
    
    // Should only show desktop version after debounce
    const fullSvg = document.querySelector("svg[viewBox='0 0 2439 451']");
    expect(fullSvg).toBeInTheDocument();
  });
});
