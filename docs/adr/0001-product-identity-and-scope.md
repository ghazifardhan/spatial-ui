# 0001. Product identity and v1 scope

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

`spatial-ui` is an apartment booking product. We needed to decide whether it is a portfolio
showcase, a real commercial booking platform, or a learning experiment — because that choice
determines how much we invest in auth, payments, persistence, and polish.

## Decision

`spatial-ui` is a **real booking product where the 3D spatial walkthrough is the core
differentiator** — not a toy and not merely a demo.

**v1 scope is:**

```
browse → 3D explore → select unit/dates → request booking (no live payment)
```

**Explicitly out of scope for v1:**

- Real payment gateway (booking is a *request*, no money moves)
- Admin / listing-management dashboard
- Multi-landlord / seller support
- Reviews and ratings
- i18n / multi-currency
- Mobile-native app

**Auth for v1:** minimal — guest booking identified by email. No full account system.

## Consequences

- We build toward a product-grade seam structure (repository, domain model), not a throwaway demo.
- Payments, admin, and multi-landlord are **deferred, not designed away** — their absence must not
  force a rewrite later. This is a primary driver for the repository seam (see ADR 0004).
- Booking is a *request/confirmation* flow, so the domain model must distinguish "requested" from
  "confirmed" even though payment is out of scope.
