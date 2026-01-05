import { getCurrentInstance } from 'vue'

/**
 * Composable para usar el sistema de toast notifications
 * Wrapper para el plugin $toast registrado globalmente
 *
 * @returns {Function} toast - Función para mostrar notificaciones
 */
export function useToast() {
  const instance = getCurrentInstance()

  if (!instance) {
    console.warn('useToast() debe ser llamado dentro del contexto de setup()')
    // Fallback: retornar función que usa el toast directamente desde window
    return (message, type = 'info', duration = 3000) => {
      if (window.$toast) {
        window.$toast(message, type, duration)
      } else {
        console.warn('Toast plugin no está disponible')
      }
    }
  }

  const toast = instance.appContext.config.globalProperties.$toast

  if (!toast) {
    console.warn('Toast plugin no está registrado. Asegúrate de importar y usar el plugin de toast.')
    return (message) => console.log('Toast:', message)
  }

  return toast
}

export default useToast
