/**
 * AppRoutes — loads the apartment list and wires the routes (ADR 0035). The landing route redirects
 * to the first unit so a bare visit lands somewhere useful.
 */

import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { Apartment } from '../domain'
import { useRepositories } from './use-repositories'
import { AppLayout } from './AppLayout'
import { ApartmentsListPage } from './ApartmentsListPage'
import { ApartmentDetailPage } from './ApartmentDetailPage'

export function AppRoutes() {
  const { apartments: apartmentRepo } = useRepositories()
  const [apartments, setApartments] = useState<Apartment[] | null>(null)

  useEffect(() => {
    let cancelled = false
    apartmentRepo.list().then((list) => {
      if (!cancelled) setApartments(list)
    })
    return () => {
      cancelled = true
    }
  }, [apartmentRepo])

  if (!apartments) {
    return (
      <div
        style={{
          display: 'grid',
          placeItems: 'center',
          height: '100vh',
          fontFamily: 'system-ui',
          color: 'var(--color-text)',
          background: 'var(--color-bg)',
        }}
      >
        Loading…
      </div>
    )
  }

  return (
    <Routes>
      <Route element={<AppLayout apartments={apartments} />}>
        <Route index element={<ApartmentsListPage apartments={apartments} />} />
        <Route path="apartments/:id" element={<ApartmentDetailPage apartments={apartments} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
