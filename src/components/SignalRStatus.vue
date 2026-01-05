<template>
  <div v-if="showStatus" class="signalr-status" :class="statusClass">
    <div class="status-indicator">
      <div class="status-dot" :class="dotClass"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
    <div v-if="connectedCount !== null" class="status-details">
      <i class="fa fa-building"></i>
      <span>{{ connectedCount }} sucursales conectadas</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSignalRAuth } from '@/composables/useSignalRAuth'

const props = defineProps({
  showDetails: {
    type: Boolean,
    default: true
  },
  connectedCount: {
    type: Number,
    default: null
  }
})

// Usar el composable de SignalR
const signalR = useSignalRAuth()

const showStatus = ref(true)

const statusText = computed(() => {
  switch (signalR.connectionState.value) {
    case 'Connected':
      return 'Conectado'
    case 'Connecting':
      return 'Conectando...'
    case 'Reconnecting':
      return 'Reconectando...'
    case 'Disconnecting':
      return 'Desconectando...'
    case 'Disconnected':
      return 'Desconectado'
    default:
      return 'Desconocido'
  }
})

const statusClass = computed(() => {
  switch (signalR.connectionState.value) {
    case 'Connected':
      return 'status-connected'
    case 'Connecting':
    case 'Reconnecting':
      return 'status-connecting'
    case 'Disconnecting':
    case 'Disconnected':
      return 'status-disconnected'
    default:
      return 'status-unknown'
  }
})

const dotClass = computed(() => {
  switch (signalR.connectionState.value) {
    case 'Connected':
      return 'dot-connected'
    case 'Connecting':
    case 'Reconnecting':
      return 'dot-connecting'
    default:
      return 'dot-disconnected'
  }
})
</script>

<style scoped>
.signalr-status {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(22, 24, 29, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.signalr-status:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  position: relative;
}

.dot-connected {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  animation: pulse-connected 2s infinite;
}

.dot-connecting {
  background: #f59e0b;
  animation: pulse-connecting 1s infinite;
}

.dot-disconnected {
  background: #64748b;
}

@keyframes pulse-connected {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

@keyframes pulse-connecting {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

.status-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.status-details {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-left: 12px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.status-details i {
  font-size: 0.9rem;
}

.status-connected {
  border-left: 3px solid #10b981;
}

.status-connecting {
  border-left: 3px solid #f59e0b;
}

.status-disconnected {
  border-left: 3px solid #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .signalr-status {
    display:none;
  }
}
</style>
