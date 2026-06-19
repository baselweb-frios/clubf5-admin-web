import { useRegisterSW } from 'virtual:pwa-register/vue'

/**
 * Composable para detectar y aplicar actualizaciones del Service Worker (PWA).
 * Expone `needRefresh` (ref boolean) y `updateNow()` para forzar la actualización.
 */
export function useAppUpdate() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(registration) {
      // Verificar actualizaciones cada hora
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000)
      }
    }
  })

  function updateNow() {
    updateServiceWorker(true)
  }

  return { needRefresh, updateNow }
}
