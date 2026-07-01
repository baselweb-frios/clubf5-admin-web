/**
 * ============================================================================
 * useContextualTours - Sistema de Tours Contextuales Inteligentes
 * ============================================================================
 *
 * Sistema mejorado de onboarding que muestra tooltips/tours en el momento
 * justo, basado en el comportamiento del usuario.
 *
 * Características:
 * - Tours activados por acción del usuario (contextual)
 * - Tooltips progresivos (se muestran cuando son relevantes)
 * - Métricas de completitud
 * - Persistencia en localStorage
 * - Integración con Driver.js
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const STORAGE_KEY = 'clubf5-onboarding'

/**
 * Gestor global de estado de onboarding
 */
class OnboardingManager {
  constructor() {
    this.state = this.loadState()
  }

  loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (error) {
      console.error('Error loading onboarding state:', error)
    }

    return {
      tours: {}, // { tourId: { completed: true, completedAt: timestamp, attempts: 0 } }
      tooltips: {}, // { tooltipId: { shown: true, shownAt: timestamp, dismissed: false } }
      actions: {}, // { actionKey: { count: 0, firstAt: timestamp, lastAt: timestamp } }
      version: 1
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state))
    } catch (error) {
      console.error('Error saving onboarding state:', error)
    }
  }

  // Tours
  markTourCompleted(tourId) {
    this.state.tours[tourId] = {
      completed: true,
      completedAt: Date.now(),
      attempts: (this.state.tours[tourId]?.attempts || 0) + 1
    }
    this.saveState()
  }

  isTourCompleted(tourId) {
    return this.state.tours[tourId]?.completed === true
  }

  getTourAttempts(tourId) {
    return this.state.tours[tourId]?.attempts || 0
  }

  // Tooltips
  markTooltipShown(tooltipId) {
    if (!this.state.tooltips[tooltipId]) {
      this.state.tooltips[tooltipId] = {
        shown: true,
        shownAt: Date.now(),
        dismissed: false
      }
      this.saveState()
    }
  }

  markTooltipDismissed(tooltipId) {
    if (this.state.tooltips[tooltipId]) {
      this.state.tooltips[tooltipId].dismissed = true
      this.state.tooltips[tooltipId].dismissedAt = Date.now()
      this.saveState()
    }
  }

  shouldShowTooltip(tooltipId) {
    const tooltip = this.state.tooltips[tooltipId]
    if (!tooltip) return true
    return !tooltip.dismissed
  }

  // Actions tracking
  trackAction(actionKey) {
    if (!this.state.actions[actionKey]) {
      this.state.actions[actionKey] = {
        count: 0,
        firstAt: Date.now()
      }
    }

    this.state.actions[actionKey].count++
    this.state.actions[actionKey].lastAt = Date.now()
    this.saveState()
  }

  getActionCount(actionKey) {
    return this.state.actions[actionKey]?.count || 0
  }

  hasPerformedAction(actionKey) {
    return this.getActionCount(actionKey) > 0
  }

  // Métricas
  getCompletionPercentage(tourIds) {
    if (!tourIds || tourIds.length === 0) return 0
    const completed = tourIds.filter(id => this.isTourCompleted(id)).length
    return Math.round((completed / tourIds.length) * 100)
  }

  getAllToursStatus() {
    return {
      completed: Object.entries(this.state.tours)
        .filter(([_, data]) => data.completed)
        .map(([id]) => id),
      pending: Object.entries(this.state.tours)
        .filter(([_, data]) => !data.completed)
        .map(([id]) => id)
    }
  }

  // Reset
  resetAllProgress() {
    this.state = {
      tours: {},
      tooltips: {},
      actions: {},
      version: 1
    }
    this.saveState()
  }

  resetTour(tourId) {
    delete this.state.tours[tourId]
    this.saveState()
  }
}

// Instancia singleton
const manager = new OnboardingManager()

/**
 * Composable principal para tours contextuales
 */
export function useContextualTours() {
  const route = useRoute()

  return {
    // Tours
    startTour: (tourId, config) => {
      if (manager.isTourCompleted(tourId)) {
        console.log(`Tour ${tourId} already completed`)
        return false
      }

      // Aquí integramos con Driver.js
      // config debe tener { steps, onComplete, ... }
      if (window.driver) {
        const driver = window.driver(config)
        driver.drive()

        // Marcar como completado cuando termine
        if (config.onDestroyed) {
          const originalOnDestroyed = config.onDestroyed
          config.onDestroyed = (...args) => {
            manager.markTourCompleted(tourId)
            originalOnDestroyed(...args)
          }
        } else {
          config.onDestroyed = () => {
            manager.markTourCompleted(tourId)
          }
        }

        return true
      }

      return false
    },

    isTourCompleted: (tourId) => manager.isTourCompleted(tourId),
    getTourAttempts: (tourId) => manager.getTourAttempts(tourId),
    resetTour: (tourId) => manager.resetTour(tourId),

    // Tooltips
    shouldShowTooltip: (tooltipId) => manager.shouldShowTooltip(tooltipId),
    markTooltipShown: (tooltipId) => manager.markTooltipShown(tooltipId),
    markTooltipDismissed: (tooltipId) => manager.markTooltipDismissed(tooltipId),

    // Actions
    trackAction: (actionKey) => manager.trackAction(actionKey),
    getActionCount: (actionKey) => manager.getActionCount(actionKey),
    hasPerformedAction: (actionKey) => manager.hasPerformedAction(actionKey),

    // Métricas
    getCompletionPercentage: (tourIds) => manager.getCompletionPercentage(tourIds),
    getAllToursStatus: () => manager.getAllToursStatus(),

    // Reset
    resetAllProgress: () => manager.resetAllProgress()
  }
}

/**
 * Composable para tooltips contextuales específicos
 * Se muestra solo cuando se cumple una condición
 *
 * @example
 * const { show, hide, isVisible } = useContextualTooltip('first-spot-upload', {
 *   condition: () => !hasPerformedAction('upload-spot'),
 *   onFirstShow: () => trackAction('saw-upload-tooltip')
 * })
 */
export function useContextualTooltip(tooltipId, options = {}) {
  const {
    condition = () => true,
    autoShow = true,
    delay = 500,
    onFirstShow = null
  } = options

  const isVisible = ref(false)
  const { shouldShowTooltip, markTooltipShown, markTooltipDismissed } = useContextualTours()

  const canShow = computed(() => {
    return shouldShowTooltip(tooltipId) && condition()
  })

  const show = () => {
    if (!canShow.value) return

    setTimeout(() => {
      isVisible.value = true
      markTooltipShown(tooltipId)
      onFirstShow?.()
    }, delay)
  }

  const hide = () => {
    isVisible.value = false
  }

  const dismiss = () => {
    hide()
    markTooltipDismissed(tooltipId)
  }

  onMounted(() => {
    if (autoShow && canShow.value) {
      show()
    }
  })

  return {
    isVisible,
    canShow,
    show,
    hide,
    dismiss
  }
}

/**
 * Hook para ejecutar tours cuando el usuario llega a una ruta por primera vez
 */
export function useRouteOnboarding(tourConfig) {
  const route = useRoute()
  const { startTour, isTourCompleted, trackAction } = useContextualTours()

  onMounted(() => {
    const currentPath = route.path
    const tour = tourConfig[currentPath]

    if (tour && tour.showOnFirstVisit && !isTourCompleted(tour.id)) {
      // Pequeño delay para que la página se renderice
      setTimeout(() => {
        trackAction(`visited-${currentPath}`)
        startTour(tour.id, tour.driverConfig)
      }, 1000)
    }
  })
}

/**
 * Store reactivo para métricas de onboarding
 */
export function useOnboardingMetrics() {
  const metrics = ref({
    toursCompleted: 0,
    totalTours: 0,
    completionPercentage: 0,
    actionsTracked: {},
    lastActivity: null
  })

  const { getAllToursStatus, getCompletionPercentage } = useContextualTours()

  const refresh = () => {
    const status = getAllToursStatus()
    const state = manager.state

    metrics.value = {
      toursCompleted: status.completed.length,
      totalTours: Object.keys(state.tours).length,
      completionPercentage: getCompletionPercentage(Object.keys(state.tours)),
      actionsTracked: { ...state.actions },
      lastActivity: Math.max(
        ...Object.values(state.actions).map(a => a.lastAt || 0),
        ...Object.values(state.tours).map(t => t.completedAt || 0)
      )
    }
  }

  onMounted(() => {
    refresh()
  })

  return {
    metrics,
    refresh
  }
}
