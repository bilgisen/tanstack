import { useCallback, useEffect, useState } from 'react';

// Breakpoint threshold for mobile detection
const MOBILE_BREAKPOINT = 768;

// Media query for mobile screens
const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px`;

// Debounce delay for resize events (in milliseconds)
const RESIZE_DEBOUNCE_DELAY = 100;

/**
 * Hook that detects if the current screen is mobile-sized
 * Uses matchMedia API for efficient breakpoint monitoring with debouncing
 * @returns boolean indicating if screen is mobile (< 768px)
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Check initial state on mount (only on client side)
    if (typeof window !== 'undefined') {
      return window.matchMedia(MOBILE_MEDIA_QUERY).matches;
    }
    // Default to false for SSR
    return false;
  });

  // Use useCallback to create a stable debounced function
  const handleResize = useCallback(() => {
    // Set a timeout to debounce the resize events
    const timeoutId = setTimeout(() => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.matchMedia(MOBILE_MEDIA_QUERY).matches);
      }
    }, RESIZE_DEBOUNCE_DELAY);

    // Clear timeout on subsequent calls within the debounce period
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(MOBILE_MEDIA_QUERY);

    // Set initial state based on current match
    setIsMobile(mediaQueryList.matches);

    // Use addEventListener for modern browsers
    const handleChange = (_event: MediaQueryListEvent) => {
      handleResize();
    };

    // Add event listener for media query changes
    mediaQueryList.addEventListener('change', handleChange);

    // Also listen to window resize for additional coverage
    const resizeHandler = handleResize();
    window.addEventListener('resize', resizeHandler);

    // Cleanup function to prevent memory leaks
    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
      window.removeEventListener('resize', resizeHandler);
      // Clear any pending debounced calls
      if (resizeHandler) {
        resizeHandler();
      }
    };
  }, [handleResize]);

  return isMobile;
}

export default useIsMobile;
