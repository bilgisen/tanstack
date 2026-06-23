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
import { useUIStore, applyTheme } from "../store/ui"
import { ToastContainer } from "../components/ui/ToastContainer"

function RootDocument() {
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    applyTheme(theme)
    // Setup listener for system theme changes if theme is 'system'
    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)')
      const listener = () => applyTheme('system')
      media.addEventListener('change', listener)
      return () => media.removeEventListener('change', listener)
    }
  }, [theme])

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
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

