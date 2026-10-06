import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RepositoriesProvider } from './RepositoriesProvider'
import { useRepositories } from './use-repositories'
import { AppRoutes } from './AppRoutes'
import { APARTMENT_FIXTURES } from '../repository'
import type { ApartmentRepository, BookingRepository } from '../repository'

function fakeRepos() {
  const apartments: ApartmentRepository = {
    list: vi.fn().mockResolvedValue(APARTMENT_FIXTURES),
    findById: vi.fn().mockResolvedValue(null),
  }
  const bookings: BookingRepository = {
    listByApartment: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
  }
  return { apartments, bookings }
}

describe('RepositoriesProvider / useRepositories', () => {
  it('throws when used outside a provider', () => {
    function Probe() {
      useRepositories()
      return null
    }
    expect(() => render(<Probe />)).toThrow(/within a <RepositoriesProvider>/)
  })

  it('supplies injected repositories', () => {
    const repos = fakeRepos()
    const capture = vi.fn()
    function Probe() {
      capture(useRepositories())
      return null
    }
    render(
      <RepositoriesProvider value={repos}>
        <Probe />
      </RepositoriesProvider>,
    )
    expect(capture).toHaveBeenCalledWith(repos)
  })
})

describe('AppRoutes', () => {
  it('renders the apartment list on the index route', async () => {
    render(
      <RepositoriesProvider value={fakeRepos()}>
        <MemoryRouter initialEntries={['/']}>
          <AppRoutes />
        </MemoryRouter>
      </RepositoriesProvider>,
    )
    // The name appears both in the sidebar nav and the list card, so expect multiple.
    expect(await screen.findAllByText(/studio/i)).not.toHaveLength(0)
    expect(screen.getAllByText('Riverside Two-Bedroom').length).toBeGreaterThan(0)
  })

  it('shows a not-found message for an unknown apartment id', async () => {
    render(
      <RepositoriesProvider value={fakeRepos()}>
        <MemoryRouter initialEntries={['/apartments/does-not-exist']}>
          <AppRoutes />
        </MemoryRouter>
      </RepositoriesProvider>,
    )
    expect(await screen.findByText(/apartment not found/i)).toBeInTheDocument()
  })
})
