import { HeadContent, Scripts, createRootRoute, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { AppLayout } from "../components/layout/AppLayout"

import appCss from "../styles.css?url"

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
    scripts: [
      {
        // Theme initialization script - runs before React hydration
        children: `
          (function() {
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
              // Fallback to system preference if localStorage fails
              const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
              document.documentElement.classList.add(systemTheme);
            }
          })();
        `,
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

import { useEffect } from "react"
import { useUIStore } from "../store/ui"
import { ToastContainer } from "../components/ui/ToastContainer"

function RootDocument() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    // Only listen for system theme changes, don't re-apply theme
    // (theme is already applied by blocking script in <head>)
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
  }, [theme])

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <AppLayout>
          <Outlet />
        </AppLayout>
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

