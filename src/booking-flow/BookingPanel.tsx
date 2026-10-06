/**
 * BookingPanel — the booking-flow UI: guest email + date range + submit (ADR 0030, 0032, 0033).
 *
 * Interface (what a caller must know):
 *   - `<BookingPanel apartment={apt} bookingRepository={repo} />` renders a self-contained form.
 *   - It is independent of the 3D scene (ADR 0034): it needs only an Apartment and the booking repo.
 *   - On submit it validates (email → range → availability) and, if valid, creates a `requested`
 *     booking via the repository, then shows a confirmation. No email is actually sent (ADR 0032).
 *   - Validation errors are shown on submit, never by disabling the button (ADR 0033).
 *   - A live price summary (nights × nightly price = total) is shown (ADR 0051).
 *
 * Styled with CSS Modules (ADR 0049).
 */

import { useState, type FormEvent } from 'react'
import { nights as nightsInRange, type Apartment, type DateRange } from '../domain'
import type { BookingRepository } from '../repository'
import { useAvailability } from './use-availability'
import { toConfirmation, validateBookingForm, type BookingConfirmation } from './validation'
import styles from './BookingPanel.module.css'

export interface BookingPanelProps {
  apartment: Apartment
  bookingRepository: BookingRepository
}

export function BookingPanel({ apartment, bookingRepository }: BookingPanelProps) {
  const [email, setEmail] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null)

  const bookings = useAvailability(apartment, bookingRepository)

  function reset() {
    setEmail('')
    setStart('')
    setEnd('')
    setError(null)
    setConfirmation(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const range: DateRange = { start, end }
    const validation = validateBookingForm({ email, range }, { apartment, bookings })
    if (!validation.ok) {
      setError(validation.message)
      return
    }

    setSubmitting(true)
    try {
      const booking = await bookingRepository.create({
        apartmentId: apartment.id,
        range,
        guestEmail: email.trim(),
      })
      setConfirmation(toConfirmation(booking, email.trim()))
    } catch {
      setError('Something went wrong submitting your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <section className={styles.panel} aria-label="Booking confirmation">
        <div className={styles.confirmation}>
          <span className={styles.successBadge}>✓ Request submitted</span>
          <p className={styles.mutedText}>
            <span className={styles.bookingId}>{confirmation.id}</span> ·{' '}
            {confirmation.nights} night{confirmation.nights === 1 ? '' : 's'} (
            {confirmation.range.start} → {confirmation.range.end})
          </p>
          <p className={styles.mutedText}>
            We’ll confirm to <strong>{confirmation.email}</strong>. This is a request, not a
            confirmed stay.
          </p>
          <button type="button" onClick={reset} className={styles.secondaryBtn}>
            Book another stay
          </button>
        </div>
      </section>
    )
  }

  // Live price estimate from the chosen dates.
  const nights = start && end && end >= start ? nightsInRange({ start, end }) : 0
  const total = nights * apartment.nightlyPriceMinor

  return (
    <section className={styles.panel} aria-label="Book this apartment">
      <h2 className={styles.heading}>Request a booking</h2>
      <form onSubmit={handleSubmit} noValidate className={styles.form}>
        <label className={styles.label}>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={styles.input}
          />
        </label>

        <div className={styles.dates}>
          <label className={styles.label}>
            Check-in
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={styles.input}
            />
          </label>
          <label className={styles.label}>
            Check-out
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={styles.input}
            />
          </label>
        </div>

        <div className={styles.summary}>
          {nights > 0 ? (
            <>
              <div className={styles.summaryRow}>
                <span>
                  {apartment.currency} {apartment.nightlyPriceMinor.toLocaleString()} × {nights}{' '}
                  night{nights === 1 ? '' : 's'}
                </span>
                <span>
                  {apartment.currency} {total.toLocaleString()}
                </span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span className={styles.summaryTotalAmount}>
                  {apartment.currency} {total.toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <span className={styles.summaryEmpty}>
              Pick your dates to see the total.
            </span>
          )}
        </div>

        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}

        <button type="submit" disabled={submitting} className={styles.submit}>
          {submitting ? 'Submitting…' : 'Request booking'}
        </button>
      </form>
    </section>
  )
}
