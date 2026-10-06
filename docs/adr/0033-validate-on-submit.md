# 0033. Validate on submit, never disable buttons

- **Status:** Accepted
- **Date:** 2025-10-06

## Context

The submit action must be guarded. Guards could run up front (disabling the button) or on submit.

## Decision

**Validate on submit**, not by disabling the button. Guards run in order: email format → range
validity → availability. The domain's discriminated `UnavailableReason` (ADR 0008) maps directly to
a readable message.

## Consequences

- Users are told **why** something is blocked instead of facing an inert button — better UX.
- Easier to test: submit and assert the error message, rather than testing a disabled state.
- Preserves the domain's reason-carrying result as the driver of user-facing messages.
- The form uses **`noValidate`** so browser-native constraint validation does not intercept submit
  before our handler runs; `type="email"` is kept only as a mobile keyboard hint. (Discovered during
  testing: native validation would otherwise pre-empt our specific messages.)
