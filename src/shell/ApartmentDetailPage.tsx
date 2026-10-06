/**
 * ApartmentDetailPage — the unit route ("/apartments/:id").
 *
 * Composes the modules for one unit (ADR 0034, 0036):
 *   - the active apartment comes from the URL param (ADR 0036),
 *   - scene-gen builds the scene, the (lazy) viewer mounts it, interactions make rooms selectable,
 *   - booking-flow renders in the sidebar and is independent of the 3D scene (ADR 0034),
 *   - selected-room state lives here in the shell (ADR 0025),
 *   - the sidebar offers a clickable room list, price summary, breadcrumb and a loading skeleton
 *     (ADR 0051).
 */

import { Suspense, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Apartment, Room } from '../domain'
import { BookingPanel } from '../booking-flow'
import { useRepositories } from './use-repositories'
import { LazyApartmentScene } from './LazyApartmentScene'
import styles from './ApartmentDetailPage.module.css'

interface ApartmentDetailPageProps {
  apartments: Apartment[]
}

/**
 * The route wrapper keys the inner view on the apartment id, so switching units remounts it and
 * resets selection state without a setState-in-effect (ADR 0036).
 */
export function ApartmentDetailPage({ apartments }: ApartmentDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const active = useMemo(() => apartments.find((a) => a.id === id) ?? null, [apartments, id])

  if (!active) return <NotFound />

  return <ApartmentDetail key={active.id} apartment={active} />
}

function NotFound() {
  return (
    <div className={styles.notFound}>
      <p>Apartment not found.</p>
      <Link to="/">← Back to all apartments</Link>
    </div>
  )
}

function formatPrice(currency: string, minor: number): string {
  // Prices are stored in the smallest unit; assume 2 decimals for display grouping.
  return `${currency} ${minor.toLocaleString()}`
}

function ApartmentDetail({ apartment }: { apartment: Apartment }) {
  const { bookings } = useRepositories()
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  // Ceiling hidden by default so users land in interior-inspection mode (ADR 0048).
  const [showCeiling, setShowCeiling] = useState(false)

  const selectedRoom = useMemo(
    () => apartment.schema.rooms.find((r) => r.id === selectedRoomId) ?? null,
    [apartment, selectedRoomId],
  )

  return (
    <div className={styles.page}>
      <div className={styles.canvasWrap}>
        <Suspense fallback={<SceneSkeleton />}>
          <LazyApartmentScene
            apartment={apartment}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
            showCeiling={showCeiling}
            onToggleCeiling={setShowCeiling}
          />
        </Suspense>
      </div>

      <aside className={styles.aside}>
        <header className={styles.header}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link to="/">Apartments</Link>
            <span aria-hidden>›</span>
            <span>{apartment.name}</span>
          </nav>
          <h1 className={styles.title}>{apartment.name}</h1>
          <div className={styles.priceRow}>
            <span className={styles.priceAmount}>
              {formatPrice(apartment.currency, apartment.nightlyPriceMinor)}
            </span>
            <span className={styles.priceUnit}>/ night</span>
          </div>
        </header>

        <div className={styles.body}>
          <section>
            <div className={styles.sectionLabel}>Rooms · {apartment.schema.rooms.length}</div>
            <ul className={styles.roomList}>
              {apartment.schema.rooms.map((room) => (
                <li key={room.id}>
                  <RoomCard
                    room={room}
                    active={room.id === selectedRoomId}
                    onSelect={() =>
                      setSelectedRoomId((current) => (current === room.id ? null : room.id))
                    }
                  />
                </li>
              ))}
            </ul>
            {!selectedRoom && (
              <p className={styles.hint} style={{ marginTop: 'var(--space-3)' }}>
                Tip: click a room here, or directly in the 3D view, to highlight it.
              </p>
            )}
          </section>

          <section className={styles.booking}>
            <BookingPanel apartment={apartment} bookingRepository={bookings} />
          </section>
        </div>
      </aside>
    </div>
  )
}

function RoomCard({
  room,
  active,
  onSelect,
}: {
  room: Room
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={active ? `${styles.roomCard} ${styles.roomCardActive}` : styles.roomCard}
    >
      <span className={styles.roomSwatch} aria-hidden>
        {roomIcon(room)}
      </span>
      <span>
        <span className={styles.roomName}>{room.name}</span>
        <span className={styles.roomDims}>
          {room.rect.w} × {room.rect.d} m · {room.ceilingHeight} m ceiling
        </span>
      </span>
    </button>
  )
}

/** A small glyph hint per room name; falls back to a neutral marker. */
function roomIcon(room: Room): string {
  const name = room.name.toLowerCase()
  if (name.includes('bath')) return '🛁'
  if (name.includes('bed')) return '🛏️'
  if (name.includes('kitchen')) return '🍳'
  if (name.includes('living') || name.includes('sleep')) return '🛋️'
  return '▦'
}

function SceneSkeleton() {
  return (
    <div className={styles.skeletonWrap} aria-hidden>
      <div className={styles.shimmer}>
        <div className={styles.shimmerBar} />
        <div className={styles.shimmerBar} />
        <div className={styles.shimmerBar} />
      </div>
    </div>
  )
}
