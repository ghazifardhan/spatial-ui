# 0032. Booking submission creates a request and shows a confirmation

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

v1 moves no money (ADR 0001), but the booking loop should be functionally complete.

## Decision

Submission collects a **guest email + date range**, calls `bookingRepository.create` (status
`requested`), and shows a **confirmation** with the booking id and guest email. **No email is
actually sent.**

## Consequences

- The booking loop is functionally complete against the in-memory repository.
- Confirmation copy must be honest: the booking is *requested*, not confirmed (ADR 0001's
  request→confirmation model).
- Real email/notification is deferred and would slot in behind the repository or a notifier seam.
