/**
 * RepositoriesProvider — the app's composition root (ADR 0038).
 *
 * Interface (what a caller must know):
 *   - `<RepositoriesProvider>` supplies `ApartmentRepository` + `BookingRepository` to the tree.
 *   - Read them with `useRepositories()` (from './use-repositories').
 *   - The default value is the in-memory set (ADR 0004); swapping to a backend is a one-line change
 *     here. Tests may pass an explicit `value` to inject fakes.
 */

import { useMemo, type ReactNode } from 'react'
import { createInMemoryRepositories, type Repositories } from '../repository'
import { RepositoriesContext } from './use-repositories'

export interface RepositoriesProviderProps {
  children: ReactNode
  /** Override for tests / a backend build. Defaults to the in-memory composition. */
  value?: Repositories
}

export function RepositoriesProvider({ children, value }: RepositoriesProviderProps) {
  const repositories = useMemo(() => value ?? createInMemoryRepositories(), [value])
  return (
    <RepositoriesContext.Provider value={repositories}>{children}</RepositoriesContext.Provider>
  )
}
