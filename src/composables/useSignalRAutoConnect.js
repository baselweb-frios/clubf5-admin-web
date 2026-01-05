// composables/useSignalRAutoConnect.js
import { onMounted, onUnmounted } from 'vue'
import { useSignalRAuth } from './useSignalRAuth'

export function useSignalRAutoConnect(hubUrl) {
  const signalR = useSignalRAuth()

  onMounted(async () => {
    try {
      await signalR.connect(hubUrl)
    } catch (error) {
      console.error('[SignalR] Error en auto-conexion:', error)
    }
  })

  onUnmounted(async () => {
    await signalR.disconnect()
  })

  return signalR
}
