import { create } from 'zustand';

export type Theme = 'dark' | 'light' | 'system';

interface UIState {
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  openRightSidebar: () => void;
  isRightSidebarExpanded: boolean;
  toggleRightSidebarExpanded: () => void;
  isLeftSidebarExpanded: boolean;
  toggleLeftSidebarExpanded: () => void;
  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  globalPrompt: string | null;
  setGlobalPrompt: (prompt: string | null) => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    return (localStorage.getItem('theme') as Theme) || 'system';
  }
  return 'system';
};

export const applyTheme = (theme: Theme) => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

const getInitialLeftSidebar = (): boolean => {
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth < 1024;
    const stored = localStorage.getItem(isMobile ? 'left_sidebar_expanded_mobile' : 'left_sidebar_expanded_desktop');
    if (stored !== null) {
      return stored === 'true';
    }
    return false;
  }
  return false;
};

const getInitialRightSidebar = (): boolean => {
  if (typeof window !== 'undefined') {
    const isMobile = window.innerWidth < 1024;
    const stored = localStorage.getItem(isMobile ? 'right_sidebar_open_mobile' : 'right_sidebar_open_desktop');
    if (stored !== null) {
      return stored === 'true';
    }
    return isMobile ? false : true;
  }
  return true;
};

export const useUIStore = create<UIState>((set) => ({
  isRightSidebarOpen: getInitialRightSidebar(),
  toggleRightSidebar: () => set((state) => {
    const newVal = !state.isRightSidebarOpen;
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      localStorage.setItem(isMobile ? 'right_sidebar_open_mobile' : 'right_sidebar_open_desktop', String(newVal));
    }
    return { isRightSidebarOpen: newVal };
  }),
  openRightSidebar: () => set(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      localStorage.setItem(isMobile ? 'right_sidebar_open_mobile' : 'right_sidebar_open_desktop', 'true');
    }
    return { isRightSidebarOpen: true };
  }),
  isRightSidebarExpanded: false,
  toggleRightSidebarExpanded: () => set((state) => ({ isRightSidebarExpanded: !state.isRightSidebarExpanded })),
  isLeftSidebarExpanded: getInitialLeftSidebar(),
  toggleLeftSidebarExpanded: () => set((state) => {
    const newVal = !state.isLeftSidebarExpanded;
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      localStorage.setItem(isMobile ? 'left_sidebar_expanded_mobile' : 'left_sidebar_expanded_desktop', String(newVal));
    }
    return { isLeftSidebarExpanded: newVal };
  }),
  isCommandPaletteOpen: false,
  openCommandPalette: () => set({ isCommandPaletteOpen: true }),
  closeCommandPalette: () => set({ isCommandPaletteOpen: false }),
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  theme: getInitialTheme(),
  setTheme: (theme) => set(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    return { theme };
  }),
  globalPrompt: null,
  setGlobalPrompt: (prompt) => set({ globalPrompt: prompt }),
}));

