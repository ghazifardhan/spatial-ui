import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BookingPanel } from './BookingPanel'
import type { Apartment } from '../domain'
import type { BookingRepository } from '../repository'

const apartment: Apartment = {
  id: 'apt-1',
  name: 'Test Unit',
  nightlyPriceMinor: 100_000,
  currency: 'IDR',
  unavailableDates: [{ start: '2025-02-10', end: '2025-02-12' }],
  schema: { id: 'apt-1', rooms: [], openings: [], furniture: [] },
}

function fakeRepo(overrides: Partial<BookingRepository> = {}): BookingRepository {
  return {
    listByApartment: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({
      id: 'booking-1',
      apartmentId: 'apt-1',
      range: { start: '2025-05-01', end: '2025-05-03' },
      guestEmail: 'a@b.co',
      status: 'requested',
      createdAt: '2025-04-01T00:00:00.000Z',
    }),
    ...overrides,
  }
}

describe('BookingPanel', () => {
  it('shows an email error on submit when the email is invalid', async () => {
    const user = userEvent.setup()
    render(<BookingPanel apartment={apartment} bookingRepository={fakeRepo()} />)

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Check-in'), '2025-05-01')
    await user.type(screen.getByLabelText('Check-out'), '2025-05-03')
    await user.click(screen.getByRole('button', { name: /request booking/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/valid email/i)
  })

  it('shows a live price summary once dates are chosen (ADR 0051)', async () => {
    const user = userEvent.setup()
    render(<BookingPanel apartment={apartment} bookingRepository={fakeRepo()} />)

    // Before dates: an empty-state prompt, no total.
    expect(screen.getByText(/pick your dates/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText('Check-in'), '2025-05-01')
    await user.type(screen.getByLabelText('Check-out'), '2025-05-03')

    // 3 nights × 100,000 = 300,000.
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getAllByText(/300,000/).length).toBeGreaterThan(0)
  })

  it('shows an availability error when the range is blacked out', async () => {
    const user = userEvent.setup()
    render(<BookingPanel apartment={apartment} bookingRepository={fakeRepo()} />)

    await user.type(screen.getByLabelText('Email'), 'a@b.co')
    await user.type(screen.getByLabelText('Check-in'), '2025-02-11')
    await user.type(screen.getByLabelText('Check-out'), '2025-02-13')
    await user.click(screen.getByRole('button', { name: /request booking/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/unavailable/i)
  })

  it('creates a booking and shows a confirmation on a valid submit', async () => {
    const user = userEvent.setup()
    const repo = fakeRepo()
    render(<BookingPanel apartment={apartment} bookingRepository={repo} />)

    await user.type(screen.getByLabelText('Email'), 'a@b.co')
    await user.type(screen.getByLabelText('Check-in'), '2025-05-01')
    await user.type(screen.getByLabelText('Check-out'), '2025-05-03')
    await user.click(screen.getByRole('button', { name: /request booking/i }))

    await waitFor(() => expect(repo.create).toHaveBeenCalledTimes(1))
    expect(repo.create).toHaveBeenCalledWith({
      apartmentId: 'apt-1',
      range: { start: '2025-05-01', end: '2025-05-03' },
      guestEmail: 'a@b.co',
    })

    expect(await screen.findByText(/request submitted/i)).toBeInTheDocument()
    expect(screen.getByText(/booking-1/)).toBeInTheDocument()
  })

  it('surfaces a generic error when the repository rejects', async () => {
    const user = userEvent.setup()
    const repo = fakeRepo({ create: vi.fn().mockRejectedValue(new Error('boom')) })
    render(<BookingPanel apartment={apartment} bookingRepository={repo} />)

    await user.type(screen.getByLabelText('Email'), 'a@b.co')
    await user.type(screen.getByLabelText('Check-in'), '2025-05-01')
    await user.type(screen.getByLabelText('Check-out'), '2025-05-03')
    await user.click(screen.getByRole('button', { name: /request booking/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/went wrong/i)
  })
})
