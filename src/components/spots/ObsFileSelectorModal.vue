<template>
  <Modal
    :model-value="modelValue"
    size="lg"
    :closable="true"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <i class="fas fa-cloud text-primary-400" />
        <h3 class="text-lg font-semibold text-text-primary truncate">
          Archivos OBS
        </h3>
      </div>
    </template>

    <template #default>
      <div class="space-y-4">
        <!-- Path info -->
        <div class="flex items-center gap-2 px-3 py-2 bg-dark-secondary rounded-lg border border-dark-border">
          <i class="fas fa-folder text-warning-400 text-sm" />
          <span class="text-sm font-mono text-text-secondary truncate">{{ prefix }}</span>
        </div>

        <!-- Busqueda -->
        <div class="relative">
          <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            v-model="searchQuery"
            type="text"
            class="input pl-10 pr-10"
            placeholder="Buscar por nombre..."
          >
          <button
            v-if="searchQuery"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
            @click="searchQuery = ''"
          >
            <i class="fas fa-times-circle" />
          </button>
        </div>

        <!-- Contador -->
        <div class="text-sm text-text-secondary">
          <span v-if="filteredFiles.length > 0">
            <strong class="text-text-primary">{{ filteredFiles.length }}</strong> archivo{{ filteredFiles.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <i class="fas fa-spinner fa-spin text-2xl text-primary-400" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="alert alert-danger">
          <i class="fas fa-exclamation-triangle" />
          {{ error }}
        </div>

        <!-- Empty -->
        <div v-else-if="files.length === 0 && !error" class="text-center py-12">
          <i class="fas fa-folder-open text-4xl text-text-tertiary mb-3" />
          <p class="text-text-secondary">No hay archivos en esta ruta</p>
          <p class="text-xs text-text-tertiary mt-1 font-mono">{{ prefix }}</p>
        </div>

        <!-- No results after search -->
        <div v-else-if="filteredFiles.length === 0" class="text-center py-12">
          <i class="fas fa-search text-4xl text-text-tertiary mb-3" />
          <p class="text-text-secondary">Sin resultados para "{{ searchQuery }}"</p>
        </div>

        <!-- Files list -->
        <div v-else class="max-h-[45vh] overflow-y-auto space-y-1 pr-1">
          <div
            v-for="file in filteredFiles"
            :key="file.objectKey"
            class="flex items-center gap-3 p-3 rounded-lg border border-dark-border hover:bg-dark-hover transition-colors group"
            :class="{ 'bg-primary-500/10 border-primary-500/30': previewKey === file.objectKey }"
          >
            <!-- Icono -->
            <div
              class="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
              :class="file.mediaType === 'audio' ? 'bg-primary-500/20 text-primary-400' : 'bg-success-500/20 text-success-400'"
            >
              <i :class="file.mediaType === 'audio' ? 'fas fa-file-audio' : 'fas fa-file-video'" />
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">{{ file.name }}</p>
              <p class="text-xs text-text-tertiary flex items-center gap-2">
                <span>{{ file.sizeFormatted }}</span>
                <span v-if="file.lastModified" class="hidden sm:inline">&middot; {{ file.dateFormatted }}</span>
              </p>
            </div>

            <!-- Acciones -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <button
                class="btn btn-ghost btn-sm btn-icon"
                :title="previewKey === file.objectKey ? 'Detener' : 'Preview'"
                @click="previewKey === file.objectKey ? stopPreview() : playPreview(file)"
              >
                <i :class="previewKey === file.objectKey ? 'fas fa-stop text-danger-400' : 'fas fa-play text-text-secondary'" />
              </button>
              <button
                class="btn btn-primary btn-sm"
                @click="selectFile(file)"
              >
                <i class="fas fa-check mr-1" />
                Seleccionar
              </button>
            </div>
          </div>
        </div>

        <!-- Audio preview -->
        <div v-if="previewUrl" class="p-3 bg-dark-secondary rounded-lg border border-dark-border">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs text-text-secondary flex items-center gap-1 truncate">
              <i class="fas fa-headphones text-primary-400" />
              {{ previewName }}
            </span>
            <button class="btn btn-ghost btn-xs text-text-tertiary" @click="stopPreview">
              <i class="fas fa-times" />
            </button>
          </div>
          <audio ref="audioPlayer" :src="previewUrl" controls class="w-full h-8" />
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end">
        <button class="btn btn-ghost" @click="$emit('update:modelValue', false)">
          Cancelar
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import obsServicesApi from '@/services/obsServicesApi'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  prefix: { type: String, default: '' }
})

const emit = defineEmits(['update:modelValue', 'select'])

const files = ref([])
const isLoading = ref(false)
const error = ref('')
const searchQuery = ref('')
const previewKey = ref(null)
const previewUrl = ref(null)
const previewName = ref('')
const audioPlayer = ref(null)

const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value
  const q = searchQuery.value.toLowerCase()
  return files.value.filter(f => f.name.toLowerCase().includes(q))
})

const extractFileName = (objectKey) => {
  const parts = objectKey.split('/').filter(p => p)
  return parts[parts.length - 1] || objectKey
}

const getMediaType = (filename) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'opus']
  const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv']
  if (audioExts.includes(ext)) return 'audio'
  if (videoExts.includes(ext)) return 'video'
  return 'unknown'
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' })
}

const loadFiles = async () => {
  if (!props.prefix) return
  isLoading.value = true
  error.value = ''
  files.value = []
  try {
    const result = await obsServicesApi.ListarArchivos(props.prefix)
    files.value = (result || [])
      .filter(f => f.objectKey && !f.objectKey.endsWith('/'))
      .map(f => {
        const name = extractFileName(f.objectKey)
        return {
          ...f,
          name,
          ext: name.split('.').pop()?.toLowerCase(),
          mediaType: getMediaType(name),
          sizeFormatted: formatSize(f.size),
          dateFormatted: formatDate(f.lastModified)
        }
      })
    console.log(`[OBS Browser] ${files.value.length} archivos cargados de: ${props.prefix}`)
  } catch (err) {
    error.value = err.message || 'Error al listar archivos OBS'
    console.error('[OBS Browser] Error:', err)
  } finally {
    isLoading.value = false
  }
}

const playPreview = (file) => {
  stopPreview()
  previewKey.value = file.objectKey
  previewName.value = file.name
  const relativePath = file.objectKey
  const basePrefix = 'Music/online/Spots/'
  const relativeFromSpot = relativePath.startsWith(basePrefix)
    ? relativePath.substring(basePrefix.length)
    : relativePath
  previewUrl.value = `${import.meta.env.VITE_ROOT_PATH_SPOTS}${relativeFromSpot}`
}

const stopPreview = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
  previewUrl.value = null
  previewKey.value = null
  previewName.value = ''
}

const selectFile = (file) => {
  const basePrefix = 'Music/online/Spots/'
  const relativeFromSpot = file.objectKey.startsWith(basePrefix)
    ? file.objectKey.substring(basePrefix.length)
    : file.objectKey
  const url = `${import.meta.env.VITE_ROOT_PATH_SPOTS}${relativeFromSpot}`
  stopPreview()
  emit('select', {
    objectKey: file.objectKey,
    name: file.name,
    url,
    size: file.size,
    mediaType: file.mediaType,
    source: relativeFromSpot
  })
  emit('update:modelValue', false)
}

watch(() => props.modelValue, (visible) => {
  if (visible) {
    searchQuery.value = ''
    stopPreview()
    loadFiles()
  }
})
</script>
