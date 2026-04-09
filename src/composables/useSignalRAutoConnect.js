// composables/useSignalRAutoConnect.js
import { onMounted } from 'vue'
import { useSignalRAuth } from './useSignalRAuth'

/**
 * Composable para auto-conectar SignalR al montar el componente.
 * 
 * NOTA: Este composable NO desconecta SignalR en onUnmounted porque
 * useSignalRAuth usa un patrón singleton. La desconexión debe manejarse
 * explícitamente cuando el usuario hace logout o cuando el layout principal
 * se desmonta.
 * 
 * @param {string} [hubUrl] - URL del hub SignalR (opcional)
 * @returns {Object} Instancia de SignalR
 */
export function useSignalRAutoConnect(hubUrl) {
  const signalR = useSignalRAuth()

  onMounted(async () => {
    try {
      await signalR.connect(hubUrl)
    } catch (error) {
      console.error('[SignalR] Error en auto-conexion:', error)
    }
  })

  // IMPORTANTE: No llamamos disconnect() aquí porque useSignalRAuth
  // es un singleton compartido. La desconexión se maneja en:
  // - DashboardLayout.vue (onBeforeUnmount)
  // - Cuando el usuario hace logout

  return signalR
}
