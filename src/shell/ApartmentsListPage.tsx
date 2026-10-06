/**
 * ApartmentsListPage — the landing route ("/"). Lists apartments; each links to its unit page.
 */
import { Link } from 'react-router-dom'
import type { Apartment } from '../domain'

interface ApartmentsListPageProps {
  apartments: Apartment[]
}

export function ApartmentsListPage({ apartments }: ApartmentsListPageProps) {
  return (
    <div style={{ padding: '2.5rem', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 0.5rem' }}>Apartments</h2>
      <p style={{ color: 'var(--color-text-muted)', margin: '0 0 1.5rem' }}>
        Explore each unit in 3D, then request your stay.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {apartments.map((apt) => (
          <Link
            key={apt.id}
            to={`/apartments/${apt.id}`}
            style={{
              display: 'block',
              padding: '1rem 1.1rem',
              borderRadius: 12,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-2)',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{apt.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              {apt.currency} {apt.nightlyPriceMinor.toLocaleString()} / night
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-faint)', marginTop: 8 }}>
              {apt.schema.rooms.length} rooms
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
