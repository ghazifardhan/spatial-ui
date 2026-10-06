/**
 * ErrorBoundary — catches render errors in the tree below and shows a readable fallback instead of
 * a blank screen. A small, self-contained class component (the only lifecycle React offers for this).
 */

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}
interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[spatial-ui] render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            fontFamily: 'system-ui',
            padding: '2.5rem',
            color: 'var(--color-danger)',
            background: 'var(--color-bg)',
            minHeight: '100vh',
          }}
        >
          <h1 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem' }}>Something went wrong</h1>
          <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
