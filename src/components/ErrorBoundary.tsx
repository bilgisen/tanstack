import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="container mx-auto p-4 pt-16 flex flex-col items-center justify-center h-full text-center">
          <h1 className="text-3xl font-bold mb-3">Bir hata oluştu</h1>
          <p className="text-muted-foreground mb-6 max-w-md">
            Beklenmeyen bir sorun oluştu. Sayfayı yenileyerek devam edebilirsiniz.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null })
            }}
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            Tekrar dene
          </button>
        </main>
      )
    }

    return this.props.children
  }
}
