/**
 * App — the shell entry. Provides repositories, mounts the router, and wraps everything in an
 * error boundary so a rendering fault degrades gracefully.
 */

import { BrowserRouter } from 'react-router-dom'
import { RepositoriesProvider } from './RepositoriesProvider'
import { ThemeProvider } from './ThemeProvider'
import { AppRoutes } from './AppRoutes'
import { ErrorBoundary } from './ErrorBoundary'

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RepositoriesProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </RepositoriesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
