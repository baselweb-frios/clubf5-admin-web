<template>
  <modal v-model="localShow" :title="`Música en OBS - ${radio?.rad_nombre}`" size="xl" @close="handleClose">
    <div class="space-y-4">
      <!-- Controles de navegación y búsqueda -->
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <base-button
            variant="secondary"
            size="sm"
            @click="navigateUp"
            :disabled="!currentPrefix || loading"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Volver
          </base-button>
          <span class="text-sm text-gray-400">
            {{ currentPath || '/' }}
          </span>
        </div>
        <base-button variant="secondary" size="sm" @click="loadMusic" :disabled="loading">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </base-button>
      </div>

      <!-- Loading state -->
      <loading-spinner v-if="loading" class="py-12" />

      <!-- Lista de archivos y carpetas -->
      <div v-else-if="objects.length > 0" class="border border-gray-700 rounded-lg overflow-hidden">
        <div class="max-h-96 overflow-y-auto">
          <div
            v-for="(object, index) in objects"
            :key="index"
            class="flex items-center p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800 transition-colors cursor-pointer"
            @click="handleObjectClick(object)"
          >
            <div class="flex-shrink-0 mr-3">
              <svg
                v-if="object.IsFolder"
                class="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
              </svg>
              <svg
                v-else
                class="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">
                {{ object.Name }}
              </div>
              <div class="text-xs text-gray-400">
                <span v-if="!object.IsFolder">
                  {{ formatSize(object.Size) }} • {{ formatDate(object.LastModified) }}
                </span>
                <span v-else>
                  Carpeta
                </span>
              </div>
            </div>
            <div v-if="!object.IsFolder" class="flex-shrink-0 ml-3 flex items-center gap-2">
              <button
                @click.stop="playAudio(object)"
                class="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                title="Reproducir"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>
              <button
                @click.stop="confirmDelete(object)"
                class="p-2 text-red-400 hover:text-red-300 transition-colors"
                title="Eliminar archivo"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-300">No hay archivos</h3>
        <p class="mt-1 text-sm text-gray-500">Esta carpeta está vacía</p>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col w-full gap-3">
        <!-- Audio Player -->
        <div v-if="currentAudio" class="border-b border-gray-700 pb-3">
          <div class="flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-white truncate">
                {{ currentAudio.Name }}
              </div>
              <div class="text-xs text-gray-400">
                Reproduciendo...
              </div>
            </div>
            <button
              @click="stopAudio"
              class="p-2 text-red-400 hover:text-red-300 transition-colors"
              title="Detener"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10h6v4H9z"></path>
              </svg>
            </button>
          </div>
          <audio
            ref="audioPlayer"
            controls
            class="w-full mt-2"
            @ended="stopAudio"
          ></audio>
        </div>
        <!-- Botón cerrar -->
        <div class="flex justify-end">
          <base-button variant="secondary" @click="handleClose">
            Cerrar
          </base-button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import obsServices from '@/services/obsServices'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  radio: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:show'])

const localShow = ref(props.show)
const loading = ref(false)
const objects = ref([])
const currentPrefix = ref('')
const currentAudio = ref(null)
const audioPlayer = ref(null)

const currentPath = computed(() => {
  if (!currentPrefix.value) return '/'
  return '/' + currentPrefix.value
})

watch(() => props.show, (newVal) => {
  localShow.value = newVal
  if (newVal && props.radio) {
    currentPrefix.value = props.radio.rad_nombre
    loadMusic()
  }
})

watch(localShow, (newVal) => {
  emit('update:show', newVal)
  if (!newVal) {
    stopAudio()
  }
})

const loadMusic = async () => {
  if (!props.radio) return

  try {
    loading.value = true
    const result = await obsServices.ListarObject(currentPrefix.value)

    // Procesar objetos
    objects.value = result.map(obj => {
      const isFolder = obj.objectKey.endsWith('/')
      const name = isFolder
        ? obj.objectKey.slice(currentPrefix.value.length, -1)
        : obj.objectKey.slice(currentPrefix.value.length)

      return {
        Name: name,
        ObjectKey: obj.objectKey,
        Size: obj.size,
        LastModified: obj.lastModified,
        IsFolder: isFolder
      }
    }).filter(obj => obj.Name) // Filtrar objetos sin nombre

  } catch (error) {
    console.error('Error al cargar música:', error)
    objects.value = []
  } finally {
    loading.value = false
  }
}

const handleObjectClick = (object) => {
  if (object.IsFolder) {
    currentPrefix.value = object.ObjectKey
    loadMusic()
  } else {
    playAudio(object)
  }
}

const navigateUp = () => {
  if (!currentPrefix.value) return

  const parts = currentPrefix.value.split('/').filter(p => p)
  parts.pop()

  if (parts.length > 0) {
    currentPrefix.value = parts.join('/') + '/'
  } else {
    currentPrefix.value = props.radio.rad_nombre + '/'
  }

  loadMusic()
}

const playAudio = async (object) => {
  try {
    stopAudio()
    currentAudio.value = object

    // Generar link temporal
    const link = await obsServices.GetLink(object.ObjectKey)

    if (audioPlayer.value) {
      audioPlayer.value.src = link
      audioPlayer.value.play()
    }
  } catch (error) {
    console.error('Error al reproducir audio:', error)
    currentAudio.value = null
  }
}

const stopAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.src = ''
  }
  currentAudio.value = null
}

const confirmDelete = (object) => {
  if (confirm(`¿Estás seguro de que deseas eliminar el archivo "${object.Name}"?\n\nEsta acción no se puede deshacer.`)) {
    deleteFile(object)
  }
}

const deleteFile = async (object) => {
  try {
    loading.value = true

    // Si el archivo que se está reproduciendo es el que se va a eliminar, detenerlo
    if (currentAudio.value && currentAudio.value.ObjectKey === object.ObjectKey) {
      stopAudio()
    }

    // Usar el nuevo método que notifica por SignalR
    await obsServices.EliminarArchivoYNotificar(
      object.ObjectKey,
      object.Name,
      props.radio?.rad_nombre // Pasar el nombre de la radio para contexto
    )

    // Recargar la lista de archivos
    await loadMusic()

    // Mostrar mensaje de éxito (puedes usar tu sistema de toast si lo tienes)
    if (window.$toast) {
      window.$toast('Archivo eliminado y notificado a clientes reproductores', 'success')
    }
  } catch (error) {
    console.error('Error al eliminar archivo:', error)

    // Mostrar mensaje de error
    if (window.$toast) {
      window.$toast('Error al eliminar el archivo', 'error')
    } else {
      alert('Error al eliminar el archivo: ' + (error.message || 'Error desconocido'))
    }
  } finally {
    loading.value = false
  }
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const handleClose = () => {
  localShow.value = false
  stopAudio()
  currentPrefix.value = ''
  objects.value = []
}
</script>
