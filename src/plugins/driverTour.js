/**
 * ============================================================================
 * PLUGIN: Driver.js Tour
 * ============================================================================
 *
 * Plugin global que agrega soporte de tours guiados a toda la aplicación.
 * Se registra automáticamente el composable y el componente TourButton.
 */

import TourButton from '@/components/TourButton.vue'
import { useDriverTour } from '@/composables/useDriverTour'

export default {
  install(app) {
    // Registrar componente globalmente
    app.component('TourButton', TourButton)

    // Agregar el composable al contexto global
    app.config.globalProperties.$tour = useDriverTour

    // Proveer el composable para Composition API
    app.provide('driverTour', useDriverTour)
  }
}

/**
 * Composable helper para usar en setup()
 */
export { useDriverTour }
