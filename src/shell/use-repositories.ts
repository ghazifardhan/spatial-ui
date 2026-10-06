/** The repositories context object + its reader hook. Split from the provider for fast-refresh. */

import { createContext, useContext } from 'react'
import type { Repositories } from '../repository'

export const RepositoriesContext = createContext<Repositories | null>(null)

export function useRepositories(): Repositories {
  const repositories = useContext(RepositoriesContext)
  if (!repositories) {
    throw new Error('useRepositories must be used within a <RepositoriesProvider>')
  }
  return repositories
}
