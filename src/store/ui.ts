import { create } from 'zustand';

export type Theme = 'dark' | 'light' | 'system';

interface UIState {
  isRightSidebarOpen: boolean;
  toggleRightSidebar: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
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

export const useUIStore = create<UIState>((set) => ({
  isRightSidebarOpen: true,
  toggleRightSidebar: () => set((state) => ({ isRightSidebarOpen: !state.isRightSidebarOpen })),
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  theme: getInitialTheme(),
  setTheme: (theme) => set(() => {
    localStorage.setItem('theme', theme);
    applyTheme(theme);
    return { theme };
  }),
}));

