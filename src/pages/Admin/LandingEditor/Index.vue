<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-edit mr-3" />
          Editor Landing Page
        </h1>
        <p class="page-subtitle">
          Personaliza el contenido de la pagina principal
        </p>
      </div>
      <div class="header-actions">
        <base-button
          variant="secondary"
          @click="showPreview = true"
        >
          <i class="fas fa-eye mr-2" />
          Vista Previa
        </base-button>
        <base-button
          variant="ghost"
          @click="resetAllToDefault"
        >
          <i class="fas fa-undo mr-2" />
          Restaurar Todo
        </base-button>
        <base-button
          variant="primary"
          :loading="saving"
          @click="saveConfig"
        >
          <i class="fas fa-save mr-2" />
          Guardar Cambios
        </base-button>
      </div>
    </div>

    <!-- Status Alert -->
    <transition name="fade">
      <div
        v-if="statusAlert.show"
        class="status-alert"
        :class="statusAlert.type"
      >
        <i
:class="statusAlert.icon"
class="mr-2"
/>
        {{ statusAlert.message }}
        <button
class="alert-close"
@click="statusAlert.show = false"
>
          <i class="fas fa-times" />
        </button>
      </div>
    </transition>

    <!-- Loading State -->
    <div
v-if="loading"
class="loading-state"
>
      <loading-overlay
:show="true"
fullscreen
text="Cargando configuracion..."
/>
    </div>

    <!-- Editor Content -->
    <div
v-else
class="editor-content"
>
      <!-- Navigation Tabs -->
      <div class="section-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="section-tab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <i :class="tab.icon" />
          <span>{{ tab.name }}</span>
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <transition
name="fade"
mode="out-in"
>
          <hero-section
            v-if="activeTab === 'hero'"
            :key="'hero'"
            v-model="config.hero"
            :default-data="defaultConfig.hero"
          />
          <platforms-section
            v-else-if="activeTab === 'platforms'"
            :key="'platforms'"
            v-model="config.platforms"
            :default-data="defaultConfig.platforms"
          />
          <features-section
            v-else-if="activeTab === 'features'"
            :key="'features'"
            v-model="config.features"
            :default-data="defaultConfig.features"
          />
          <stats-section
            v-else-if="activeTab === 'stats'"
            :key="'stats'"
            v-model="config.stats"
            :default-data="defaultConfig.stats"
          />
          <footer-section
            v-else-if="activeTab === 'footer'"
            :key="'footer'"
            v-model="config.footer"
            :default-data="defaultConfig.footer"
          />
        </transition>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <base-card>
          <div class="actions-grid">
            <button
class="action-item"
@click="showPreview = true"
>
              <i class="fas fa-eye" />
              <span>Vista Previa</span>
            </button>
            <a
              href="/"
              target="_blank"
              class="action-item"
            >
              <i class="fas fa-external-link-alt" />
              <span>Ver Landing</span>
            </a>
            <button
class="action-item"
@click="exportConfig"
>
              <i class="fas fa-download" />
              <span>Exportar JSON</span>
            </button>
            <button
class="action-item"
@click="triggerImport"
>
              <i class="fas fa-upload" />
              <span>Importar JSON</span>
            </button>
          </div>
        </base-card>
      </div>
    </div>

    <!-- Preview Modal -->
    <preview-modal v-model="showPreview" />

    <!-- Hidden file input for import -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      class="hidden"
      @change="handleFileImport"
    >
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import LandingPageService from '@/services/LandingPageService'
import HeroSection from './components/HeroSection.vue'
import PlatformsSection from './components/PlatformsSection.vue'
import FeaturesSection from './components/FeaturesSection.vue'
import StatsSection from './components/StatsSection.vue'
import FooterSection from './components/FooterSection.vue'
import PreviewModal from './components/PreviewModal.vue'

const toast = useToast()

// State
const loading = ref(true)
const saving = ref(false)
const activeTab = ref('hero')
const showPreview = ref(false)
const config = ref({})
const defaultConfig = ref({})
const fileInput = ref(null)

const statusAlert = reactive({
  show: false,
  type: 'success',
  message: '',
  icon: 'fas fa-check-circle'
})

const tabs = [
  { id: 'hero', name: 'Hero', icon: 'fas fa-home' },
  { id: 'platforms', name: 'Plataformas', icon: 'fas fa-desktop' },
  { id: 'features', name: 'Caracteristicas', icon: 'fas fa-star' },
  { id: 'stats', name: 'Estadisticas', icon: 'fas fa-chart-bar' },
  { id: 'footer', name: 'Footer', icon: 'fas fa-shoe-prints' }
]

// Methods
const loadConfig = async () => {
  try {
    loading.value = true
    config.value = await LandingPageService.get()
    defaultConfig.value = LandingPageService.getDefaultConfig()
  } catch (error) {
    console.error('Error loading config:', error)
    showAlert('Error al cargar la configuracion', 'error')
    config.value = LandingPageService.getDefaultConfig()
    defaultConfig.value = LandingPageService.getDefaultConfig()
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  try {
    saving.value = true
    await LandingPageService.update(config.value)
    showAlert('Configuracion guardada exitosamente', 'success')
    toast('Cambios guardados', 'success')
  } catch (error) {
    console.error('Error saving config:', error)
    showAlert('Error al guardar la configuracion', 'error')
    toast('Error al guardar', 'error')
  } finally {
    saving.value = false
  }
}

const resetAllToDefault = async () => {
  if (!confirm('Se restaurara toda la configuracion a los valores por defecto. Esta accion no se puede deshacer.')) {
    return
  }

  try {
    loading.value = true
    config.value = await LandingPageService.resetToDefault()
    showAlert('Configuracion restaurada a valores por defecto', 'success')
  } catch (error) {
    console.error('Error resetting config:', error)
    showAlert('Error al restaurar la configuracion', 'error')
  } finally {
    loading.value = false
  }
}

const showAlert = (message, type = 'success') => {
  statusAlert.message = message
  statusAlert.type = type
  statusAlert.icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'
  statusAlert.show = true

  setTimeout(() => {
    statusAlert.show = false
  }, 5000)
}

const exportConfig = () => {
  const dataStr = JSON.stringify(config.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)

  const exportFileName = `landing-config-${new Date().toISOString().split('T')[0]}.json`

  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileName)
  linkElement.click()

  toast('Configuracion exportada', 'success')
}

const triggerImport = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const importedConfig = JSON.parse(text)

    // Validate structure
    if (!importedConfig.hero || !importedConfig.platforms) {
      throw new Error('Formato de archivo invalido')
    }

    config.value = importedConfig
    showAlert('Configuracion importada. Guarda para aplicar los cambios.', 'success')
  } catch (error) {
    console.error('Error importing config:', error)
    showAlert('Error al importar: ' + error.message, 'error')
  }

  // Reset file input
  event.target.value = ''
}

// Lifecycle
onMounted(() => {
  loadConfig()
})
</script>

<style scoped>
.page-wrapper {
  @apply space-y-6 p-6;
}

.page-header {
  @apply flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4;
}

.header-content {
  @apply space-y-1;
}

.page-title {
  @apply text-2xl font-bold text-white flex items-center;
}

.page-subtitle {
  @apply text-gray-400 text-sm;
}

.header-actions {
  @apply flex flex-wrap gap-3;
}

.status-alert {
  @apply flex items-center px-4 py-3 rounded-lg;
}

.status-alert.success {
  @apply bg-success-500/20 text-success-400 border border-success-500/30;
}

.status-alert.error {
  @apply bg-danger-500/20 text-danger-400 border border-danger-500/30;
}

.alert-close {
  @apply ml-auto pl-4 text-current opacity-60;
  @apply transition-opacity hover:opacity-100;
}

.loading-state {
  @apply flex items-center justify-center min-h-[400px];
}

.editor-content {
  @apply space-y-6;
}

.section-tabs {
  @apply flex flex-wrap gap-2 p-2;
  @apply bg-dark-tertiary rounded-xl border border-dark-border;
}

.section-tab {
  @apply flex items-center gap-2 px-4 py-2.5 rounded-lg;
  @apply text-sm font-medium text-text-secondary;
  @apply transition-all duration-200;
  @apply hover:bg-dark-hover hover:text-text-primary;
}

.section-tab.active {
  @apply bg-primary-500/20 text-primary-400;
}

.section-tab i {
  @apply text-sm;
}

.tab-content {
  @apply min-h-[400px];
}

.quick-actions {
  @apply mt-8;
}

.actions-grid {
  @apply grid grid-cols-2 sm:grid-cols-4 gap-4;
}

.action-item {
  @apply flex flex-col items-center gap-2 p-4 rounded-lg;
  @apply text-text-secondary bg-dark-secondary;
  @apply transition-all duration-200;
  @apply hover:bg-dark-hover hover:text-text-primary;
  @apply cursor-pointer no-underline;
}

.action-item i {
  @apply text-xl;
}

.action-item span {
  @apply text-sm font-medium;
}

.hidden {
  @apply sr-only;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  @apply transition-all duration-200;
}

.fade-enter-from,
.fade-leave-to {
  @apply opacity-0 translate-y-2;
}
</style>
