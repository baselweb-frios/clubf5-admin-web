/**
 * ============================================================================
 * COMPOSABLE: useDriverTour
 * ============================================================================
 *
 * Composable para integrar driver.js fácilmente en cualquier vista.
 *
 * USO BÁSICO:
 * ```js
 * import { useDriverTour } from '@/composables/useDriverTour'
 *
 * const { startTour, isActive } = useDriverTour()
 *
 * // Iniciar tour automáticamente al montar
 * onMounted(() => {
 *   startTour() // Usa la configuración de la ruta actual
 * })
 * ```
 *
 * USO AVANZADO:
 * ```js
 * const { startTour, startCustomTour, stopTour, resetTour } = useDriverTour({
 *   autoStart: true,           // Iniciar automáticamente si es primera visita
 *   onComplete: () => {},      // Callback al completar
 *   onClose: () => {}          // Callback al cerrar
 * })
 *
 * // Tour personalizado
 * startCustomTour([
 *   { element: '#btn', popover: { title: 'Botón', description: 'Haz clic aquí' } }
 * ])
 * ```
 */

import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

import {
  driverGlobalConfig,
  getTourByRoute,
  shouldShowTour,
  markTourAsViewed
} from '@/config/driverTours'

// Estado global del driver (singleton)
let driverInstance = null

export function useDriverTour(options = {}) {
  const {
    autoStart = false,
    forceShow = false,
    onStart = null,
    onComplete = null,
    onClose = null,
    onHighlightStarted = null,
    onHighlighted = null,
    onDeselected = null,
    onDestroyed = null,
    customConfig = {}
  } = options

  const route = useRoute()
  const isActive = ref(false)
  const currentStep = ref(0)
  const totalSteps = ref(0)
  const currentTourId = ref(null)

  /**
   * Crea o retorna la instancia del driver
   */
  const getDriver = () => {
    if (!driverInstance) {
      driverInstance = driver({
        ...driverGlobalConfig,
        ...customConfig,
        onHighlightStarted: (element, step, options) => {
          currentStep.value = options.state.activeIndex + 1
          onHighlightStarted?.(element, step, options)
        },
        onHighlighted: (element, step, options) => {
          onHighlighted?.(element, step, options)
        },
        onDeselected: (element, step, options) => {
          onDeselected?.(element, step, options)
        },
        onDestroyed: (element, step, options) => {
          isActive.value = false
          if (currentTourId.value) {
            markTourAsViewed(currentTourId.value)
          }
          onDestroyed?.(element, step, options)
        },
        onCloseClick: () => {
          stopTour()
          onClose?.()
        },
        onPopoverRender: (popover, options) => {
          // Añadir botón de "No mostrar de nuevo" si es primera visita
          if (options.state.activeIndex === 0 && currentTourId.value) {
            const skipBtn = document.createElement('button')
            skipBtn.className = 'driver-skip-btn'
            skipBtn.innerHTML = 'No mostrar de nuevo'
            skipBtn.onclick = () => {
              markTourAsViewed(currentTourId.value)
              stopTour()
            }
            popover.footerButtons.prepend(skipBtn)
          }
        }
      })
    }
    return driverInstance
  }

  /**
   * Inicia el tour de la ruta actual
   */
  const startTour = async (tourConfig = null) => {
    const config = tourConfig || getTourByRoute(route.path)

    if (!config) {
      console.warn(`[useDriverTour] No hay tour configurado para: ${route.path}`)
      return false
    }

    // Verificar si debe mostrarse
    if (!forceShow && config.showOnFirstVisit && !shouldShowTour(config.id)) {
      console.log(`[useDriverTour] Tour "${config.id}" ya fue visto`)
      return false
    }

    // Esperar a que el DOM esté listo
    await nextTick()

    // Dar tiempo extra para que los elementos se rendericen
    await new Promise(resolve => setTimeout(resolve, 500))

    const driverObj = getDriver()
    currentTourId.value = config.id
    totalSteps.value = config.steps.length
    currentStep.value = 1

    // Filtrar steps cuyos elementos no existen
    const validSteps = config.steps.filter(step => {
      if (!step.element) return true // Steps sin elemento (overlay)
      const el = document.querySelector(step.element)
      if (!el) {
        console.warn(`[useDriverTour] Elemento no encontrado: ${step.element}`)
        return false
      }
      return true
    })

    if (validSteps.length === 0) {
      console.warn(`[useDriverTour] No hay steps válidos para el tour "${config.id}"`)
      return false
    }

    totalSteps.value = validSteps.length

    onStart?.()
    isActive.value = false
    driverObj.setSteps(validSteps)
    driverObj.drive()

    return true
  }

  /**
   * Inicia un tour con steps personalizados
   */
  const startCustomTour = async (steps, tourId = 'custom-tour') => {
    if (!steps || steps.length === 0) {
      console.warn('[useDriverTour] No se proporcionaron steps para el tour')
      return false
    }

    await nextTick()

    const driverObj = getDriver()
    currentTourId.value = tourId
    totalSteps.value = steps.length
    currentStep.value = 1

    onStart?.()
    isActive.value = true
    driverObj.setSteps(steps)
    driverObj.drive()

    return true
  }

  /**
   * Detiene el tour actual
   */
  const stopTour = () => {
    if (driverInstance) {
      driverInstance.destroy()
      isActive.value = false
      currentStep.value = 0
      onComplete?.()
    }
  }

  /**
   * Avanza al siguiente step
   */
  const nextStep = () => {
    if (driverInstance && isActive.value) {
      driverInstance.moveNext()
    }
  }

  /**
   * Retrocede al step anterior
   */
  const prevStep = () => {
    if (driverInstance && isActive.value) {
      driverInstance.movePrevious()
    }
  }

  /**
   * Va a un step específico
   */
  const goToStep = (index) => {
    if (driverInstance && isActive.value) {
      driverInstance.moveTo(index)
    }
  }

  /**
   * Destaca un elemento específico
   */
  const highlightElement = (selector, popoverConfig = {}) => {
    const driverObj = getDriver()
    driverObj.highlight({
      element: selector,
      popover: {
        title: popoverConfig.title || '',
        description: popoverConfig.description || '',
        side: popoverConfig.side || 'bottom',
        align: popoverConfig.align || 'center'
      }
    })
    isActive.value = true
  }

  /**
   * Resetea el tour actual (permite verlo de nuevo)
   */
  const resetTour = () => {
    const config = getTourByRoute(route.path)
    if (config) {
      const viewedTours = JSON.parse(localStorage.getItem('viewedTours') || '[]')
      const index = viewedTours.indexOf(config.id)
      if (index > -1) {
        viewedTours.splice(index, 1)
        localStorage.setItem('viewedTours', JSON.stringify(viewedTours))
      }
    }
  }

  /**
   * Verifica si hay un tour disponible para la ruta actual
   */
  const hasTour = () => {
    return !!getTourByRoute(route.path)
  }

  /**
   * Verifica si el tour de la ruta actual ya fue visto
   */
  const isTourViewed = () => {
    const config = getTourByRoute(route.path)
    return config ? !shouldShowTour(config.id) : true
  }

  // Auto-start si está configurado
  onMounted(() => {
    if (autoStart) {
      const config = getTourByRoute(route.path)
      if (config && config.showOnFirstVisit && shouldShowTour(config.id)) {
        startTour()
      }
    }
  })

  // Cleanup
  onUnmounted(() => {
    if (driverInstance && isActive.value) {
      stopTour()
    }
  })

  // Watch route changes para detener tour si cambia la ruta
  watch(() => route.path, () => {
    if (isActive.value) {
      stopTour()
    }
  })

  return {
    // Estado
    isActive,
    currentStep,
    totalSteps,
    currentTourId,

    // Métodos
    startTour,
    startCustomTour,
    stopTour,
    nextStep,
    prevStep,
    goToStep,
    highlightElement,
    resetTour,
    hasTour,
    isTourViewed,

    // Exponer driver para uso avanzado
    getDriver
  }
}

export default useDriverTour
