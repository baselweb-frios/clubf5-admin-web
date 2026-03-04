<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
          Metadata y existencia
        </h3>

        <div class="form-group">
          <label class="label">ObjectKey</label>
          <input
            v-model="objectKey"
            class="input"
            placeholder="musica/generos/rock/audio.mp3"
            type="text"
          >
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-secondary"
            :disabled="loading || !objectKey"
            @click="getObjectInfo"
          >
            <i class="fas fa-info-circle" />
            GetObjectInfo
          </button>
          <button
            class="btn btn-info"
            :disabled="loading || !objectKey"
            @click="existeObjeto"
          >
            <i class="fas fa-check-circle" />
            ExisteObjeto
          </button>
        </div>

        <div class="divider" />

        <h4 class="font-semibold text-text-primary light:text-text-light-primary">
          Funciones de utilidad
        </h4>

        <div class="form-group">
          <label class="label">Filename</label>
          <input
            v-model="filename"
            class="input"
            placeholder="archivo.mp3"
            type="text"
          >
        </div>

        <div class="grid gap-2 sm:grid-cols-2">
          <button
            class="btn btn-ghost btn-sm"
            :disabled="loading || !filename"
            @click="getContentType"
          >
            GetContentType
          </button>
          <button
            class="btn btn-ghost btn-sm"
            :disabled="loading || !filename"
            @click="getFileIcon"
          >
            GetFileIcon
          </button>
          <button
            class="btn btn-ghost btn-sm"
            :disabled="loading || !objectKey"
            @click="getNombreArchivo"
          >
            GetNombreArchivo
          </button>
          <button
            class="btn btn-ghost btn-sm"
            :disabled="loading || !objectKey"
            @click="getCarpetaPadre"
          >
            GetCarpetaPadre
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="form-group">
            <label class="label">Bytes para FormatSize</label>
            <input
              v-model.number="bytesValue"
              class="input"
              type="number"
              min="0"
            >
          </div>
          <div class="form-group">
            <label class="label">Tamaño archivo (bytes)</label>
            <input
              v-model.number="fileSizeBytes"
              class="input"
              type="number"
              min="0"
            >
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-ghost"
            :disabled="loading"
            @click="formatSize"
          >
            FormatSize
          </button>
          <button
            class="btn btn-ghost"
            :disabled="loading"
            @click="validarTamano"
          >
            ValidarTamanoArchivo
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            v-model="allowedTypesText"
            class="input"
            placeholder="audio,video,image"
            type="text"
          >
          <button
            class="btn btn-ghost"
            :disabled="loading || !filename"
            @click="validarTipoArchivo"
          >
            ValidarTipoArchivo
          </button>
        </div>
      </div>

      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
          API música y sincronización
        </h3>

        <div class="form-group">
          <label class="label">Lista radios (JSON)</label>
          <textarea
            v-model="listaRadiosJson"
            class="input min-h-[90px]"
          />
        </div>
        <div class="form-group">
          <label class="label">Marker</label>
          <input
            v-model="marker"
            class="input"
            placeholder=""
            type="text"
          >
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-primary"
            :disabled="loading"
            @click="getMusicApi"
          >
            <i class="fas fa-music" />
            GetMusicApi
          </button>
          <button
            class="btn btn-success"
            :disabled="loading"
            @click="sincronizarRadios"
          >
            <i class="fas fa-sync-alt" />
            SincronizarRadios
          </button>
        </div>

        <div class="divider" />

        <div class="grid gap-3 md:grid-cols-2">
          <div class="form-group">
            <label class="label">Código género</label>
            <input
              v-model="codigoGenero"
              class="input"
              placeholder="ROCK"
              type="text"
            >
          </div>
          <div class="form-group">
            <label class="label">Código subgénero</label>
            <input
              v-model="codigoSubgenero"
              class="input"
              placeholder="ALT"
              type="text"
            >
          </div>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-info"
            :disabled="loading || !codigoGenero"
            @click="buscarGenero"
          >
            <i class="fas fa-search" />
            BuscarMusicaPorGenero
          </button>
          <button
            class="btn btn-info"
            :disabled="loading || !codigoGenero || !codigoSubgenero"
            @click="buscarSubgenero"
          >
            <i class="fas fa-search-plus" />
            BuscarMusicaPorSubgenero
          </button>
        </div>

        <div class="divider" />

        <div class="text-sm text-text-secondary light:text-text-light-secondary">
          <p>Configuración OBS:</p>
          <pre class="mt-2 p-3 rounded bg-dark-secondary light:bg-light-secondary overflow-auto">{{ prettyConfig }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import obsServices from '@/services/obsServices'

const emit = defineEmits(['result', 'error'])

const loading = ref(false)
const objectKey = ref('')
const filename = ref('archivo.mp3')
const bytesValue = ref(1048576)
const fileSizeBytes = ref(5242880)
const allowedTypesText = ref('audio,video,image,document')

const listaRadiosJson = ref('[{"radioId":1,"nombre":"Demo"}]')
const marker = ref('')
const codigoGenero = ref('')
const codigoSubgenero = ref('')

const run = async (action, fn) => {
  try {
    loading.value = true
    const payload = await fn()
    emit('result', { action, payload, at: new Date().toISOString() })
  } catch (error) {
    emit('error', { action, error })
  } finally {
    loading.value = false
  }
}

const getObjectInfo = () => run('GetObjectInfo', () => obsServices.GetObjectInfo(objectKey.value))
const existeObjeto = () => run('ExisteObjeto', () => obsServices.ExisteObjeto(objectKey.value))
const getContentType = () => run('GetContentType', () => obsServices.GetContentType(filename.value))
const getFileIcon = () => run('GetFileIcon', () => obsServices.GetFileIcon(filename.value))
const getNombreArchivo = () => run('GetNombreArchivo', () => obsServices.GetNombreArchivo(objectKey.value))
const getCarpetaPadre = () => run('GetCarpetaPadre', () => obsServices.GetCarpetaPadre(objectKey.value))
const formatSize = () => run('FormatSize', () => obsServices.FormatSize(bytesValue.value, 2))
const validarTipoArchivo = () => run('ValidarTipoArchivo', () => {
  const allowedTypes = allowedTypesText.value.split(',').map(v => v.trim()).filter(Boolean)
  return obsServices.ValidarTipoArchivo(filename.value, allowedTypes)
})
const validarTamano = () => run('ValidarTamanoArchivo', () => obsServices.ValidarTamanoArchivo(fileSizeBytes.value, 100))

const getMusicApi = () => run('GetMusicApi', () => {
  const listaRadioDescarga = parseJson(listaRadiosJson.value, [])
  return obsServices.GetMusicApi(listaRadioDescarga, marker.value)
})
const sincronizarRadios = () => run('SincronizarRadios', () => obsServices.SincronizarRadios())
const buscarGenero = () => run('BuscarMusicaPorGenero', () => obsServices.BuscarMusicaPorGenero(codigoGenero.value))
const buscarSubgenero = () => run('BuscarMusicaPorSubgenero', () => obsServices.BuscarMusicaPorSubgenero(codigoGenero.value, codigoSubgenero.value))

const parseJson = (value, fallback) => {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

const prettyConfig = computed(() => JSON.stringify(obsServices.CONFIG, null, 2))
</script>
