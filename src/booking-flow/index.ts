/**
 * booking-flow — Module #6 interface surface.
 *
 * Callers mount `<BookingPanel>` (independent of the 3D scene, ADR 0034). The pure validation and
 * its messages are exported because they are the module's tested seams.
 */
export { BookingPanel } from './BookingPanel'
export type { BookingPanelProps } from './BookingPanel'
export {
  isValidEmail,
  messageForReason,
  validateBookingForm,
  toConfirmation,
  type BookingFormInput,
  type BookingValidation,
  type BookingConfirmation,
} from './validation'
export { useAvailability } from './use-availability'