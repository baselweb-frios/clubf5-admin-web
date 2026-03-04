<template>
  <div class="space-y-6">
    <div class="card">
      <div class="flex flex-col gap-4 md:flex-row md:items-end">
        <div class="flex-1 form-group">
          <label class="label">Prefijo</label>
          <input
            v-model="prefix"
            class="input"
            placeholder="musica/generos/"
            type="text"
          >
        </div>
        <div class="form-group md:w-44">
          <label class="label">Max keys</label>
          <input
            v-model.number="maxKeys"
            class="input"
            type="number"
            min="1"
          >
        </div>
        <button
          class="btn btn-secondary"
          :disabled="loading"
          @click="listarObjetos"
        >
          <i class="fas fa-list" />
          Listar
        </button>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="listarCarpetas"
        >
          Carpetas
        </button>
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="listarArchivos"
        >
          Archivos
        </button>
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="listarPaginado"
        >
          Paginado
        </button>
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="buscarAudio"
        >
          Audio
        </button>
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="buscarVideo"
        >
          Video
        </button>
        <button
          class="btn btn-ghost btn-sm"
          :disabled="loading"
          @click="buscarImagenes"
        >
          Imágenes
        </button>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="form-group">
          <label class="label">Extensiones (coma separadas)</label>
          <input
            v-model="extensionsText"
            class="input"
            placeholder="mp3,wav,pdf"
            type="text"
          >
        </div>
        <div class="flex items-end">
          <button
            class="btn btn-info w-full"
            :disabled="loading"
            @click="buscarPorExtension"
          >
            <i class="fas fa-filter" />
            Buscar por extensión
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between gap-3 mb-3">
        <h3 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
          Resultado de objetos
        </h3>
        <span class="badge badge-info">{{ objects.length }} registros</span>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ObjectKey</th>
              <th>Tamaño</th>
              <th>Fecha</th>
              <th>Tipo</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="obj in objects"
              :key="obj.objectKey"
            >
              <td
                class="max-w-[360px] truncate"
                :title="obj.objectKey"
              >
                {{ obj.objectKey }}
              </td>
              <td>{{ obsServices.FormatSize(obj.size || 0) }}</td>
              <td>{{ formatDate(obj.lastModified) }}</td>
              <td>
                <span
                  class="badge"
                  :class="obj.objectKey?.endsWith('/') ? 'badge-warning' : 'badge-success'"
                >
                  {{ obj.objectKey?.endsWith('/') ? 'Carpeta' : 'Archivo' }}
                </span>
              </td>
            </tr>
            <tr v-if="!objects.length">
              <td
                colspan="4"
                class="text-center text-text-secondary py-6"
              >
                Sin resultados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import obsServices from '@/services/obsServices'

const emit = defineEmits(['result', 'error', 'objects-updated'])

const loading = ref(false)
const prefix = ref('')
const maxKeys = ref(1000)
const extensionsText = ref('mp3,wav')
const objects = ref([])

const report = (action, payload) => emit('result', { action, payload, at: new Date().toISOString() })
const reportError = (action, error) => emit('error', { action, error })

const withAction = async (action, fn, updateObjects = true) => {
  try {
    loading.value = true
    const result = await fn()
    const normalized = Array.isArray(result) ? result : (result?.objects || [])
    if (updateObjects) {
      objects.value = normalized
      emit('objects-updated', objects.value)
    }
    report(action, result)
  } catch (error) {
    reportError(action, error)
  } finally {
    loading.value = false
  }
}

const listarObjetos = () => withAction('ListarObject', () => obsServices.ListarObject(prefix.value, { maxKeys: maxKeys.value }))
const listarCarpetas = () => withAction('ListarCarpetas', () => obsServices.ListarCarpetas(prefix.value))
const listarArchivos = () => withAction('ListarArchivos', () => obsServices.ListarArchivos(prefix.value))

const listarPaginado = () => withAction('ListarObjectPaginado', async () => {
  const result = []
  for await (const item of obsServices.ListarObjectPaginado(prefix.value, maxKeys.value)) {
    result.push(item)
  }
  return result
})

const buscarPorExtension = () => {
  const exts = extensionsText.value.split(',').map(ext => ext.trim().toLowerCase()).filter(Boolean)
  return withAction('BuscarPorExtension', () => obsServices.BuscarPorExtension(prefix.value, exts))
}

const buscarAudio = () => withAction('BuscarAudio', () => obsServices.BuscarAudio(prefix.value))
const buscarVideo = () => withAction('BuscarVideo', () => obsServices.BuscarVideo(prefix.value))
const buscarImagenes = () => withAction('BuscarImagenes', () => obsServices.BuscarImagenes(prefix.value))

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('es-AR')
}
</script>
