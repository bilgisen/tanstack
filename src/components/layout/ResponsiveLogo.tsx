import { useState, useEffect, useCallback, useRef } from "react";
import { Logo } from "./Logo";

interface ResponsiveLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  mobileSize?: number;
  desktopSize?: number;
}

function ResponsiveLogo({ 
  size = 24, 
  mobileSize, 
  desktopSize,
  className, 
  ...props 
}: ResponsiveLogoProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // SSR safety: default to false (desktop) during server-side rendering
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < 768;
  });
  const debounceTimerRef = useRef<number | null>(null);

  const handleResize = useCallback(() => {
    // SSR safety: only run on client-side
    if (typeof window === 'undefined') {
      return;
    }

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    // Debounce resize events to prevent excessive re-renders
    debounceTimerRef.current = window.setTimeout(() => {
      setIsMobile(window.innerWidth < 768);
    }, 100);
  }, []);

  useEffect(() => {
    // SSR safety: only run on client-side
    if (typeof window === 'undefined') {
      return;
    }

    // Set initial state based on current window width
    setIsMobile(window.innerWidth < 768);

    // Add resize event listener with debouncing
    window.addEventListener("resize", handleResize);

    // Cleanup on unmount to prevent memory leaks
    return () => {
      window.removeEventListener("resize", handleResize);
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handleResize]);

  // Determine which logo variant to render based on screen size
  if (isMobile) {
    const effectiveSize = mobileSize ?? size;
    return (
      <Logo
        variant="full"
        size={effectiveSize}
        className={className}
        role="img"
        aria-label="Company logo"
        {...props}
      />
    );
  }

  const effectiveSize = desktopSize ?? size;
  return (
    <Logo
      variant="full"
      size={effectiveSize}
      className={className}
      role="img"
      aria-label="Company logo"
      {...props}
    />
  );
}

export { ResponsiveLogo };
