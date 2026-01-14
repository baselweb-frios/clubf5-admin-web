<template>
  <div
  v-if="showStatus"
  class="fixed bottom-4 right-4 z-fixed"
  >
    <div class="card-glass p-3">
      <div class="flex-start gap-2">
        <!-- Status Badge with Indicator -->
        <div :class="['badge', badgeClass]">
          <div
          class="w-1.5 h-1.5 rounded-full"
          :class="dotClass"
          />
          <span>{{ statusText }}</span>
        </div>

        <!-- Connected Count -->
        <div
        v-if="connectedCount !== null"
        class="badge badge-info"
        >
          <i class="fas fa-building" />
          <span>{{ connectedCount }} sucursales</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSignalRAuth } from '@/composables/useSignalRAuth';

const { connectedCount } = defineProps({
  showDetails: {
    type: Boolean,
    default: true,
  },
  connectedCount: {
    type: Number,
    default: null,
  },
});

// Usar el composable de SignalR
const signalR = useSignalRAuth();

const showStatus = ref(true);

const statusText = computed(() => {
  switch (signalR.connectionState.value) {
    case 'Connected':
      return 'Conectado';
    case 'Connecting':
      return 'Conectando...';
    case 'Reconnecting':
      return 'Reconectando...';
    case 'Disconnecting':
      return 'Desconectando...';
    case 'Disconnected':
      return 'Desconectado';
    default:
      return 'Desconocido';
  }
});

const badgeClass = computed(() => {
  switch (signalR.connectionState.value) {
    case 'Connected':
      return 'badge-success';
    case 'Connecting':
    case 'Reconnecting':
      return 'badge-warning';
    case 'Disconnecting':
    case 'Disconnected':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
});

const dotClass = computed(() => {
  switch (signalR.connectionState.value) {
    case 'Connected':
      return 'bg-success-500';
    case 'Connecting':
    case 'Reconnecting':
      return 'bg-warning-500 animate-pulse';
    default:
      return 'bg-danger-500';
  }
});
</script>

<style scoped>
/* Status Container */
.status-container {
  @apply fixed bottom-4 right-4 z-fixed;
}

/* Status Card */
.status-card {
  @apply bg-glass-medium backdrop-blur-xl rounded-xl;
  @apply border border-glass-border;
  @apply p-3 shadow-lg;
}

/* Status Content */
.status-content {
  @apply flex items-center gap-2;
}

/* Status Badge */
.status-badge {
  @apply inline-flex items-center gap-1.5;
  @apply px-2.5 py-1 rounded-full;
  @apply text-xs font-medium;
}

.status-badge.connected {
  @apply bg-success-500/20 text-success-400;
}

.status-badge.connecting {
  @apply bg-warning-500/20 text-warning-400;
}

.status-badge.disconnected {
  @apply bg-danger-500/20 text-danger-400;
}

/* Status Dot Indicator */
.status-dot {
  @apply w-1.5 h-1.5 rounded-full;
}

.status-dot.connected {
  @apply bg-success-500;
}

.status-dot.connecting {
  @apply bg-warning-500 animate-pulse;
}

.status-dot.disconnected {
  @apply bg-danger-500;
}

/* Connection Count Badge */
.count-badge {
  @apply inline-flex items-center gap-1.5;
  @apply px-2.5 py-1 rounded-full;
  @apply text-xs font-medium;
  @apply bg-info-500/20 text-info-400;
}

.count-badge i {
  @apply text-xs;
}

/* Light Mode */
.light .status-badge.connected {
  @apply text-success-600;
}

.light .status-badge.connecting {
  @apply text-warning-600;
}

.light .status-badge.disconnected {
  @apply text-danger-600;
}

.light .count-badge {
  @apply text-info-600;
}
</style>

