<template>
  <Modal
    v-model="showModal"
    title="Vista Previa - Landing Page"
    size="full"
    @close="handleClose"
  >
    <div class="preview-container">
      <div class="preview-toolbar">
        <div class="device-buttons">
          <button
            class="device-btn"
            :class="{ active: device === 'desktop' }"
            title="Vista Desktop"
            @click="device = 'desktop'"
          >
            <i class="fas fa-desktop" />
          </button>
          <button
            class="device-btn"
            :class="{ active: device === 'tablet' }"
            title="Vista Tablet"
            @click="device = 'tablet'"
          >
            <i class="fas fa-tablet-alt" />
          </button>
          <button
            class="device-btn"
            :class="{ active: device === 'mobile' }"
            title="Vista Mobile"
            @click="device = 'mobile'"
          >
            <i class="fas fa-mobile-alt" />
          </button>
        </div>
        <span class="device-label">{{ deviceLabel }}</span>
      </div>

      <div
class="preview-frame-wrapper"
:class="`frame-${device}`"
>
        <div class="preview-frame">
          <div class="frame-header">
            <div class="frame-dots">
              <span class="dot red" />
              <span class="dot yellow" />
              <span class="dot green" />
            </div>
            <span class="frame-url">clubf5.com</span>
          </div>
          <iframe
            ref="iframeRef"
            :src="previewUrl"
            class="preview-iframe"
            title="Vista previa de la landing page"
          />
        </div>
      </div>

      <div class="preview-notice">
        <i class="fas fa-info-circle mr-2" />
        Los cambios guardados se reflejaran en la vista previa.
        Guarda tus cambios antes de previsualizar.
      </div>
    </div>

    <template #footer>
      <base-button
        variant="secondary"
        @click="refreshPreview"
      >
        <i class="fas fa-sync mr-2" />
        Actualizar
      </base-button>
      <base-button
        variant="primary"
        @click="openInNewTab"
      >
        <i class="fas fa-external-link-alt mr-2" />
        Abrir en Nueva Pestana
      </base-button>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const iframeRef = ref(null)
const device = ref('desktop')
const previewKey = ref(0)

const previewUrl = computed(() => {
  // Add key to force refresh
  return `/?preview=true&t=${previewKey.value}`
})

const deviceLabel = computed(() => {
  const labels = {
    desktop: 'Desktop (1920px)',
    tablet: 'Tablet (768px)',
    mobile: 'Mobile (375px)'
  }
  return labels[device.value]
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const refreshPreview = () => {
  previewKey.value = Date.now()
  if (iframeRef.value) {
    iframeRef.value.src = previewUrl.value
  }
}

const openInNewTab = () => {
  window.open('/', '_blank')
}

// Refresh preview when modal opens
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    refreshPreview()
  }
})
</script>

<style scoped>
.preview-container {
  @apply flex flex-col h-full gap-4;
  min-height: 70vh;
}

.preview-toolbar {
  @apply flex items-center justify-between px-4 py-2;
  @apply bg-dark-secondary rounded-lg;
}

.device-buttons {
  @apply flex gap-2;
}

.device-btn {
  @apply p-2 rounded-lg text-text-tertiary;
  @apply transition-all duration-200;
  @apply hover:bg-dark-hover hover:text-text-primary;
}

.device-btn.active {
  @apply bg-primary-500/20 text-primary-400;
}

.device-label {
  @apply text-sm text-text-secondary;
}

.preview-frame-wrapper {
  @apply flex-1 flex items-center justify-center p-4;
  @apply bg-dark-secondary/50 rounded-lg overflow-hidden;
  transition: all 0.3s ease;
}

.preview-frame-wrapper.frame-desktop {
  @apply w-full;
}

.preview-frame-wrapper.frame-tablet .preview-frame {
  max-width: 768px;
}

.preview-frame-wrapper.frame-mobile .preview-frame {
  max-width: 375px;
}

.preview-frame {
  @apply w-full h-full bg-dark-primary rounded-lg overflow-hidden;
  @apply border border-dark-border;
  @apply shadow-2xl;
  min-height: 500px;
}

.frame-header {
  @apply flex items-center gap-3 px-4 py-2;
  @apply bg-dark-tertiary border-b border-dark-border;
}

.frame-dots {
  @apply flex gap-1.5;
}

.dot {
  @apply w-3 h-3 rounded-full;
}

.dot.red {
  @apply bg-red-500;
}

.dot.yellow {
  @apply bg-yellow-500;
}

.dot.green {
  @apply bg-green-500;
}

.frame-url {
  @apply text-xs text-text-tertiary;
}

.preview-iframe {
  @apply w-full border-0;
  height: calc(100% - 36px);
}

.preview-notice {
  @apply text-xs text-text-tertiary text-center;
  @apply p-3 rounded-lg bg-dark-secondary;
}
</style>
