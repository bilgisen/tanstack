import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { ResponsiveLogo } from "./ResponsiveLogo";

const ICON_VIEWBOX = "0 0 1163 1520";
const ICON_RATIO = 1163 / 1520;
const BRAND_TEXT = "JetBorsa";
const ARIA_LABEL = "Jetborsa logo";

function mockWindowWidth(width: number) {
  vi.spyOn(window, "innerWidth", "get").mockReturnValue(width);
}

// The JetIcon is rendered at 55% of the logo box size, rounded to 2 decimals
const iconHeight = (size: number) => Math.round(size * 0.55 * 100) / 100;
const iconWidth = (size: number) => Math.round(iconHeight(size) * ICON_RATIO * 100) / 100;

function getIconSvg() {
  return document.querySelector(`svg[viewBox="${ICON_VIEWBOX}"]`);
}

function getBrandWrapper() {
  const svg = getIconSvg();
  return svg ? svg.parentElement : null;
}

function renderAt(width: number, props?: { size?: number; mobileSize?: number; desktopSize?: number; className?: string }) {
  mockWindowWidth(width);
  return render(<ResponsiveLogo {...props} />);
}

describe("ResponsiveLogo", () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the full brand (icon + text) on mobile screens", () => {
    renderAt(375);

    expect(getIconSvg()).toBeInTheDocument();
    expect(document.body.textContent).toContain(BRAND_TEXT);
  });

  it("renders the full brand (icon + text) on desktop screens", () => {
    renderAt(1024);

    expect(getIconSvg()).toBeInTheDocument();
    expect(document.body.textContent).toContain(BRAND_TEXT);
  });

  it("mobileSize prop takes precedence over size on mobile", () => {
    renderAt(375, { size: 24, mobileSize: 12 });

    expect(getIconSvg()).toHaveAttribute("height", iconHeight(12).toString());
    expect(getBrandWrapper()).toHaveStyle({ height: "12px" });
  });

  it("desktopSize prop takes precedence over size on desktop", () => {
    renderAt(1024, { size: 14, desktopSize: 32 });

    expect(getIconSvg()).toHaveAttribute("height", iconHeight(32).toString());
    expect(getBrandWrapper()).toHaveStyle({ height: "32px" });
  });

  it("size prop is the fallback when specific size props are not provided", () => {
    renderAt(375, { size: 24 });
    expect(getIconSvg()).toHaveAttribute("height", iconHeight(24).toString());

    cleanup();

    renderAt(1024, { size: 24 });
    expect(getIconSvg()).toHaveAttribute("height", iconHeight(24).toString());
  });

  it("switchs between mobile and desktop sizes on window resize", () => {
    vi.useFakeTimers();
    renderAt(375, { mobileSize: 10, desktopSize: 20 });
    expect(getIconSvg()).toHaveAttribute("height", iconHeight(10).toString());

    mockWindowWidth(1024);
    act(() => {
      window.dispatchEvent(new Event("resize"));
      vi.advanceTimersByTime(100);
    });

    expect(getIconSvg()).toHaveAttribute("height", iconHeight(20).toString());
  });

  it("includes accessibility attributes (role=img and aria-label)", () => {
    renderAt(375);

    const brandElement = document.querySelector('[role="img"]');
    expect(brandElement).toBeInTheDocument();
    expect(brandElement).toHaveAttribute("aria-label", ARIA_LABEL);
  });

  it("preserves the icon aspect ratio", () => {
    const testSize = 31.5;
    renderAt(375, { size: testSize });

    expect(getIconSvg()).toHaveAttribute("width", iconWidth(testSize).toString());
    expect(getIconSvg()).toHaveAttribute("height", iconHeight(testSize).toString());
  });

  it("renders the brand across common screen widths", () => {
    [320, 375, 767, 768, 1024, 1440].forEach((width) => {
      cleanup();
      renderAt(width);
      expect(getIconSvg()).toBeInTheDocument();
      expect(document.body.textContent).toContain(BRAND_TEXT);
    });
  });

  it("applies custom className to the brand wrapper", () => {
    renderAt(375, { className: "custom-logo-class" });

    expect(document.querySelector(".custom-logo-class")).toBeTruthy();
  });

  it("cleans up the resize event listener on unmount", () => {
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderAt(375);
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("resize", expect.any(Function));
  });

  it("debounces resize events", () => {
    vi.useFakeTimers();
    renderAt(375, { mobileSize: 10, desktopSize: 20 });

    // Rapid resizes; only the debounced (final) state should apply
    act(() => {
      for (let i = 0; i < 10; i++) {
        mockWindowWidth(1024);
        window.dispatchEvent(new Event("resize"));
      }
      vi.advanceTimersByTime(100);
    });

    expect(getIconSvg()).toHaveAttribute("height", iconHeight(20).toString());
  });
});
