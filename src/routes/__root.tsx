import { HeadContent, Outlet, Scripts, createRootRoute, useNavigate } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { QueryClientProvider } from "@tanstack/react-query"
import { useEffect } from "react"
import { AppLayout } from "../components/layout/AppLayout"
import { queryClient } from "../lib/queryClient"

import appCss from "../styles.css?url"

import { useUIStore } from "../store/ui"
import { ToastContainer } from "../components/ui/ToastContainer"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Jetborsa | BIST Uzmanı Tek Yapay Zeka",
      },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: () => (
    <AppLayout>
      <main className="container mx-auto p-4 pt-16 flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-zinc-300">404</h1>
        <p className="text-zinc-500">Sayfa bulunamadı.</p>
      </main>
    </AppLayout>
  ),
  component: RootDocument,
})

function RootDocument() {
  const theme = useUIStore((s) => s.theme)
  const hydrateFromStorage = useUIStore((s) => s.hydrateFromStorage)
  const navigate = useNavigate()

  useEffect(() => {
    // Hydrate sidebar states from localStorage after mount
    hydrateFromStorage()
    
    // Apply theme after mount
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      root.classList.remove('light', 'dark')
      
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      } else {
        root.classList.add(theme)
      }
    }
    
    // Setup listener for system theme changes if theme is 'system'
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        const systemTheme = media.matches ? 'dark' : 'light'
        root.classList.add(systemTheme)
      }
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [theme, hydrateFromStorage])

  // Global app-navigate handler for seamless cross-page navigation triggered by AI
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.path) {
        navigate({ to: detail.path } as any)
      }
    }
    window.addEventListener('app-navigate', handleNavigate)
    return () => window.removeEventListener('app-navigate', handleNavigate)
  }, [navigate])

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <HeadContent />
        {/* Blocking script to apply theme before hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const root = document.documentElement;
                root.classList.remove('light', 'dark');
                
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              } catch (e) {
                const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                document.documentElement.classList.add(systemTheme);
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
      <QueryClientProvider client={queryClient}>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </QueryClientProvider>
        <ToastContainer />
        <TanStackDevtools
          config={{
            position: "bottom-left",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

