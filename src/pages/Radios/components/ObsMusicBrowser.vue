<template>
  <div
v-if="localShow"
class="modal-backdrop"
@click.self="handleClose"
>
    <div class="modal max-w-2xl">
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-text-primary">
          Música en OBS - {{ radio?.rad_nombre }}
        </h3>
        <button
class="btn btn-ghost btn-icon"
@click="handleClose"
>
          <i class="fas fa-times" />
        </button>
      </div>
      <div class="modal-body space-y-4">
        <!-- Controles de navegación y búsqueda -->
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <button
class="btn btn-secondary btn-sm"
:disabled="!currentPrefix || loading"
@click="navigateUp"
>
              <svg
class="w-4 h-4"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M10 19l-7-7m0 0l7-7m-7 7h18"
/>
              </svg>
              Volver
            </button>
            <span class="text-sm text-text-secondary">
              {{ currentPath || '/' }}
            </span>
          </div>
          <button
class="btn btn-secondary btn-sm"
:disabled="loading"
@click="loadMusic"
>
            <svg
class="w-4 h-4"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
              <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
/>
            </svg>
          </button>
        </div>

        <!-- Loading state -->
        <loading-spinner
v-if="loading"
class="py-12"
/>

        <!-- Lista de archivos y carpetas -->
        <div
v-else-if="objects.length > 0"
class="border border-dark-border rounded-lg overflow-hidden"
>
          <div class="max-h-96 overflow-y-auto">
            <div
v-for="(object, index) in objects"
:key="index"
              class="flex items-center p-3 border-b border-dark-border last:border-b-0 hover:bg-dark-hover transition-colors cursor-pointer"
              @click="handleObjectClick(object)"
>
              <div class="flex-shrink-0 mr-3">
                <svg
v-if="object.IsFolder"
class="w-6 h-6 text-primary-400"
fill="none"
stroke="currentColor"
                  viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
/>
                </svg>
                <svg
v-else
class="w-6 h-6 text-success-400"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-text-primary truncate">
                  {{ object.Name }}
                </div>
                <div class="text-xs text-text-secondary">
                  <span v-if="!object.IsFolder">
                    {{ formatSize(object.Size) }} • {{ formatDate(object.LastModified) }}
                  </span>
                  <span v-else>
                    Carpeta
                  </span>
                </div>
              </div>
              <div
v-if="!object.IsFolder"
class="flex-shrink-0 ml-3 flex items-center gap-2"
>
                <button
class="btn btn-ghost btn-icon text-primary-400 hover:text-primary-300"
title="Reproducir"
                  @click.stop="playAudio(object)"
>
                  <svg
class="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                    <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
/>
                    <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
/>
                  </svg>
                </button>
                <button
class="btn btn-ghost btn-icon text-danger-400 hover:text-danger-300"
title="Eliminar archivo"
                  @click.stop="confirmDelete(object)"
>
                  <svg
class="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                    <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
v-else
class="text-center py-12"
>
          <svg
class="mx-auto h-12 w-12 text-text-tertiary"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-text-secondary">
            No hay archivos
          </h3>
          <p class="mt-1 text-sm text-text-tertiary">
            Esta carpeta está vacía
          </p>
        </div>
      </div>

      <div class="modal-footer flex-col gap-3">
        <!-- Audio Player -->
        <div
v-if="currentAudio"
class="border-b border-dark-border pb-3 w-full"
>
          <div class="flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-text-primary truncate">
                {{ currentAudio.Name }}
              </div>
              <div class="text-xs text-text-secondary">
                Reproduciendo...
              </div>
            </div>
            <button
class="btn btn-ghost btn-icon text-danger-400 hover:text-danger-300"
title="Detener"
              @click="stopAudio"
>
              <svg
class="w-5 h-5"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
/>
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M9 10h6v4H9z"
/>
              </svg>
            </button>
          </div>
          <audio
ref="audioPlayer"
controls
class="w-full mt-2"
@ended="stopAudio"
/>
        </div>
        <!-- Botón cerrar -->
        <div
v-else
class="flex justify-end w-full"
>
          <button
class="btn btn-secondary"
@click="handleClose"
>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import obsServicesApi from '@/services/obsServicesApi'

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
    currentPrefix.value = props.radio.rad_identi
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
    const result = await obsServicesApi.ListarObject(currentPrefix.value)

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
    const link = await obsServicesApi.GetLink(object.ObjectKey)

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
    await obsServicesApi.EliminarArchivoYNotificar(
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
