/**
 * ============================================================================
 * UI Composables - Barrel Export
 * ============================================================================
 *
 * Punto central de importación para todos los composables de UI.
 */

// Accesibilidad
export {
  useUniqueId,
  useFocusTrap,
  useScreenReaderAnnouncer,
  useKeyboardNavigation,
  usePrefersReducedMotion,
  useAriaDescribedBy
} from './useA11y'

// Tours Contextuales
export {
  useContextualTours,
  useContextualTooltip,
  useRouteOnboarding,
  useOnboardingMetrics
} from './useContextualTours'

// Programación en Lotes
export { useBatchProgramming } from './useBatchProgramming'
