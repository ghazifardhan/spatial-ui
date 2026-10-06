/**
 * AppLayout — the desktop-first shell layout (ADR 0037): a navigation column beside the content
 * area. The nav lists apartments as links (the URL is the source of truth, ADR 0036).
 *
 * Styled with CSS Modules + design tokens (ADR 0049, 0050).
 */

import { NavLink, Outlet } from 'react-router-dom'
import type { Apartment } from '../domain'
import { ThemeToggle } from './ThemeToggle'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  apartments: Apartment[]
}

export function AppLayout({ apartments }: AppLayoutProps) {
  return (
    <div className={styles.layout}>
      <nav className={styles.nav} aria-label="Apartments">
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden>
            S
          </span>
          <span className={styles.brandText}>
            <span className={styles.brandName}>spatial-ui</span>
            <span className={styles.brandTagline}>apartment booking in 3D</span>
          </span>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>Apartments</div>
          <ul className={styles.list}>
            {apartments.map((apt) => (
              <li key={apt.id}>
                <NavLink
                  to={`/apartments/${apt.id}`}
                  className={({ isActive }) =>
                    isActive ? `${styles.card} ${styles.cardActive}` : styles.card
                  }
                >
                  <span className={styles.cardTop}>
                    <span className={styles.cardName}>{apt.name}</span>
                    <span className={styles.cardPrice}>
                      {apt.currency} {Math.round(apt.nightlyPriceMinor / 1000)}k
                    </span>
                  </span>
                  <span className={styles.cardMeta}>
                    <span>{apt.schema.rooms.length} rooms</span>
                    <span className={styles.metaDot}>·</span>
                    <span>{apt.schema.furniture.length} pieces</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footer}>
          <ThemeToggle />
          <div className={styles.footerNote}>Explore each unit in 3D, then request your stay.</div>
        </div>
      </nav>

      <main className={styles.main}>
        <Outlet context={{ apartments }} />
      </main>
    </div>
  )
}
