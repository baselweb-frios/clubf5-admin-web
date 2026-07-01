<template>
  <div class="page-wrapper">
    <div class="page-content space-y-6">
      <!-- Header -->
      <header class="page-header">
        <h1 class="page-title flex items-center gap-3">
          <i class="fas fa-cloud text-primary-400" />
          Gestor de Archivos OBS
        </h1>
        <p class="text-text-secondary light:text-text-light-secondary mt-2">
          Navegue por las carpetas y suba archivos arrastrando o seleccionándolos
        </p>
      </header>

      <!-- Breadcrumb navigation -->
      <div class="card">
        <div class="flex items-center gap-2 text-sm">
          <button
            class="btn btn-ghost btn-sm"
            @click="navigateToRoot"
          >
            <i class="fas fa-home" />
          </button>
          <template v-if="currentPath">
            <i class="fas fa-chevron-right text-text-tertiary" />
            <template
              v-for="(segment, index) in pathSegments"
              :key="index"
            >
              <button
                class="btn btn-ghost btn-sm"
                @click="navigateToSegment(index)"
              >
                {{ segment }}
              </button>
              <i
                v-if="index < pathSegments.length - 1"
                class="fas fa-chevron-right text-text-tertiary"
              />
            </template>
          </template>
        </div>
      </div>

      <!-- Drop zone & Upload area -->
      <div
        class="card relative"
        :class="{ 'ring-2 ring-primary-500 bg-primary-500/5': isDragging }"
        @dragover.prevent="handleDragOver"
        @dragleave.prevent="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <div class="flex flex-col items-center justify-center py-8 space-y-4">
          <div class="text-center">
            <i
              class="fas fa-cloud-upload-alt text-6xl mb-4"
              :class="isDragging ? 'text-primary-500' : 'text-text-tertiary'"
            />
            <p class="text-lg font-semibold text-text-primary light:text-text-light-primary">
              {{ isDragging ? '¡Suelta los archivos aquí!' : 'Arrastra archivos aquí' }}
            </p>
            <p class="text-sm text-text-secondary light:text-text-light-secondary mt-1">
              o haz clic en el botón para seleccionar
            </p>
          </div>

          <input
            ref="fileInput"
            type="file"
            multiple
            class="hidden"
            @change="handleFileSelect"
          >

          <button
            class="btn btn-primary"
            :disabled="loading"
            @click="openFileDialog"
          >
            <i class="fas fa-folder-open" />
            Seleccionar archivos
          </button>

          <!-- Selected files preview -->
          <div
            v-if="selectedFiles.length > 0"
            class="w-full max-w-2xl mt-4"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold text-text-primary">
                {{ selectedFiles.length }} archivo(s) seleccionado(s)
              </span>
              <button
                class="btn btn-ghost btn-sm"
                @click="clearSelectedFiles"
              >
                <i class="fas fa-times" />
              </button>
            </div>
            <div class="max-h-40 overflow-y-auto space-y-1">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="flex items-center justify-between gap-2 p-2 rounded bg-dark-secondary light:bg-light-secondary text-sm"
              >
                <span class="truncate">{{ file.name }}</span>
                <span class="text-xs text-text-tertiary whitespace-nowrap">
                  {{ formatFileSize(file.size) }}
                </span>
              </div>
            </div>
            <button
              class="btn btn-success w-full mt-3"
              :disabled="loading"
              @click="uploadFiles"
            >
              <i class="fas fa-upload" />
              Subir {{ selectedFiles.length }} archivo(s)
            </button>
          </div>

          <!-- Upload progress -->
          <div
            v-if="uploadProgress > 0 && uploadProgress < 100"
            class="w-full max-w-2xl"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-semibold">Subiendo archivos...</span>
              <span class="text-sm font-semibold">{{ uploadProgress }}%</span>
            </div>
            <div class="h-2 rounded bg-dark-secondary overflow-hidden light:bg-light-secondary">
              <div
                class="h-full bg-primary-500 transition-all duration-200"
                :style="{ width: uploadProgress + '%' }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Folders list -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
            <i class="fas fa-folder-open mr-2" />
            Carpetas
          </h2>
          <div class="flex items-center gap-2">
            <span class="badge badge-info">{{ folders.length }} carpetas</span>
            <button
              class="btn btn-secondary btn-sm"
              :disabled="loading"
              @click="loadFolders"
            >
              <i class="fas fa-sync-alt" />
              Actualizar
            </button>
          </div>
        </div>

        <!-- Loading state -->
        <div
          v-if="loading"
          class="flex items-center justify-center py-12"
        >
          <div class="text-center">
            <i class="fas fa-spinner fa-spin text-4xl text-primary-500 mb-3" />
            <p class="text-text-secondary">Cargando...</p>
          </div>
        </div>

        <!-- Folders grid -->
        <div
          v-else-if="folders.length > 0"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <button
            v-for="folder in folders"
            :key="folder.objectKey"
            class="card hover:border-primary-500 transition-colors text-left p-4"
            @click="navigateToFolder(folder.objectKey)"
          >
            <div class="flex items-center gap-3">
              <i class="fas fa-folder text-3xl text-warning-500" />
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-text-primary light:text-text-light-primary truncate">
                  {{ getFolderName(folder.objectKey) }}
                </p>
                <p class="text-xs text-text-tertiary mt-1">
                  {{ formatDate(folder.lastModified) }}
                </p>
              </div>
            </div>
          </button>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="text-center py-12"
        >
          <i class="fas fa-folder-open text-6xl text-text-tertiary mb-4" />
          <p class="text-text-secondary">
            No hay carpetas en esta ubicación
          </p>
        </div>
      </div>

      <!-- Files list -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
            <i class="fas fa-file mr-2" />
            Archivos
          </h2>
          <span class="badge badge-success">{{ files.length }} archivos</span>
        </div>

        <!-- Files table -->
        <div
          v-if="files.length > 0"
          class="overflow-x-auto"
        >
          <table class="w-full">
            <thead class="border-b border-border-light dark:border-border-dark">
              <tr class="text-left text-sm">
                <th class="pb-3 px-4 font-semibold text-text-primary light:text-text-light-primary">
                  Nombre
                </th>
                <th class="pb-3 px-4 font-semibold text-text-primary light:text-text-light-primary">
                  Tamaño
                </th>
                <th class="pb-3 px-4 font-semibold text-text-primary light:text-text-light-primary">
                  Fecha
                </th>
                <th class="pb-3 px-4 font-semibold text-text-primary light:text-text-light-primary">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="file in files"
                :key="file.objectKey"
                class="border-b border-border-light dark:border-border-dark hover:bg-dark-secondary/50 dark:hover:bg-dark-secondary/50 light:hover:bg-light-secondary/50 transition-colors"
              >
                <td class="py-3 px-4">
                  <div class="flex items-center gap-3">
                    <i
                      :class="getFileIcon(file.objectKey)"
                      class="text-xl text-primary-500"
                    />
                    <span class="text-sm text-text-primary light:text-text-light-primary truncate">
                      {{ getFileName(file.objectKey) }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4 text-sm text-text-secondary light:text-text-light-secondary">
                  {{ formatFileSize(file.size) }}
                </td>
                <td class="py-3 px-4 text-sm text-text-secondary light:text-text-light-secondary">
                  {{ formatDate(file.lastModified) }}
                </td>
                <td class="py-3 px-4">
                  <div class="flex items-center gap-2">
                    <button
                      class="btn btn-ghost btn-sm"
                      title="Descargar"
                      :disabled="loading"
                      @click="downloadFile(file.objectKey)"
                    >
                      <i class="fas fa-download" />
                    </button>
                    <button
                      class="btn btn-ghost btn-sm text-error-500"
                      title="Eliminar"
                      :disabled="loading"
                      @click="deleteFile(file.objectKey)"
                    >
                      <i class="fas fa-trash" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="text-center py-12"
        >
          <i class="fas fa-file text-6xl text-text-tertiary mb-4" />
          <p class="text-text-secondary">
            No hay archivos en esta ubicación
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import obsServices from '@/services/obsServicesApi'
import { useToast } from '@/composables/useToast'

const toast = useToast()

// State
const loading = ref(false)
const isDragging = ref(false)
const currentPath = ref(import.meta.env.VITE_PATH_MUSIC || 'Music/online/')
const folders = ref([])
const files = ref([])
const selectedFiles = ref([])
const uploadProgress = ref(0)
const fileInput = ref(null)

// Computed
const pathSegments = computed(() => {
  return currentPath.value ? currentPath.value.split('/').filter(Boolean) : []
})

// Methods
const loadFolders = async () => {
  try {
    loading.value = true
    console.log('[ObsConsole] Cargando carpetas desde:', currentPath.value)
    
    const result = await obsServices.ListarObject(currentPath.value)
    console.log('[ObsConsole] Resultado de ListarObject:', result)
    console.log('[ObsConsole] Tipo de resultado:', typeof result, Array.isArray(result) ? 'es array' : 'NO es array')
    
    const objects = Array.isArray(result) ? result : (result?.objects || [])
    console.log('[ObsConsole] Objetos procesados:', objects.length, 'elementos')
    console.log('[ObsConsole] Detalle de objetos:', objects)

    // Separar carpetas y archivos
    folders.value = objects.filter(obj => obj.objectKey && obj.objectKey.endsWith('/'))
    files.value = objects.filter(obj => obj.objectKey && !obj.objectKey.endsWith('/'))
    
    console.log('[ObsConsole] Carpetas encontradas:', folders.value.length)
    console.log('[ObsConsole] Archivos encontrados:', files.value.length)
    console.log('[ObsConsole] Modo de operación OBS:', obsServices.getOperationMode?.())
  } catch (error) {
    console.error('[ObsConsole] Error loading folders:', error)
    console.error('[ObsConsole] Error completo:', error.response?.data || error.message)
    toast('Error al cargar las carpetas: ' + (error.message || 'Error desconocido'), 'error')
  } finally {
    loading.value = false
  }
}

const navigateToFolder = (folderKey) => {
  currentPath.value = folderKey
  loadFolders()
}

const navigateToRoot = () => {
  currentPath.value = ''
  loadFolders()
}

const navigateToSegment = (index) => {
  const segments = pathSegments.value.slice(0, index + 1)
  currentPath.value = segments.join('/') + '/'
  loadFolders()
}

const getFolderName = (folderKey) => {
  const parts = folderKey.replace(/\/$/, '').split('/')
  return parts[parts.length - 1] || folderKey
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-AR')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const getFileName = (objectKey) => {
  const parts = objectKey.split('/').filter(p => p)
  return parts[parts.length - 1] || objectKey
}

const getFileIcon = (filename) => {
  return obsServices.GetFileIcon(filename)
}

const downloadFile = async (objectKey) => {
  try {
    loading.value = true
    await obsServices.DownloadYGuardar(objectKey)
    toast('Archivo descargado exitosamente', 'success')
  } catch (error) {
    console.error('Error downloading file:', error)
    toast('Error al descargar el archivo', 'error')
  } finally {
    loading.value = false
  }
}

const deleteFile = async (objectKey) => {
  if (!confirm('¿Estás seguro de eliminar este archivo?')) return

  try {
    loading.value = true
    await obsServices.EliminarArchivo(objectKey)
    toast('Archivo eliminado exitosamente', 'success')
    await loadFolders()
  } catch (error) {
    console.error('Error deleting file:', error)
    toast('Error al eliminar el archivo', 'error')
  } finally {
    loading.value = false
  }
}

// File handling
const handleDragOver = () => {
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e) => {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) {
    selectedFiles.value = files
    toast(`${files.length} archivo(s) seleccionado(s)`, 'success')
  }
}

const openFileDialog = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const target = e.target
  const files = Array.from(target.files || [])
  if (files.length > 0) {
    selectedFiles.value = files
    toast(`${files.length} archivo(s) seleccionado(s)`, 'success')
  }
}

const clearSelectedFiles = () => {
  selectedFiles.value = []
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const uploadFiles = async () => {
  if (selectedFiles.value.length === 0) return

  try {
    loading.value = true
    uploadProgress.value = 0

    const archivos = selectedFiles.value.map(file => ({
      file,
      objectKey: `${currentPath.value}${file.name}`
    }))

    await obsServices.SubirMultiples(archivos, {
      concurrency: 3,
      onTotalProgress: (progress) => {
        uploadProgress.value = progress
      }
    })

    toast(`${selectedFiles.value.length} archivo(s) subido(s) exitosamente`, 'success')
    clearSelectedFiles()
    uploadProgress.value = 0
    await loadFolders()
  } catch (error) {
    console.error('Error uploading files:', error)
    toast('Error al subir los archivos', 'error')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  loadFolders()
})
</script>
