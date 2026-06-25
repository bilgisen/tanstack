import { useState, useEffect, useCallback, useRef } from "react";
import { Logo } from "./Logo";

interface ResponsiveLogoProps {
  size?: number;
  mobileSize?: number;
  desktopSize?: number;
  className?: string;
}

function ResponsiveLogo({ 
  size = 24, 
  mobileSize, 
  desktopSize,
  className, 
}: ResponsiveLogoProps) {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.innerWidth < 768;
  });
  const debounceTimerRef = useRef<number | null>(null);

  const handleResize = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = window.setTimeout(() => {
      setIsMobile(window.innerWidth < 768);
    }, 100);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [handleResize]);

  // Mobile: icon only, Desktop: icon + "borsa" text
  if (isMobile) {
    const effectiveSize = mobileSize ?? size;
    return (
      <Logo
        variant="icon"
        size={effectiveSize}
        className={className}
        role="img"
        aria-label="Jetborsa logo"
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
      aria-label="Jetborsa logo"
    />
  );
}

export { ResponsiveLogo };
