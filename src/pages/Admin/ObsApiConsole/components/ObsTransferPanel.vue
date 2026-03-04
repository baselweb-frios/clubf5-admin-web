<template>
  <div class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
          Upload y carpetas
        </h3>

        <div class="form-group">
          <label class="label">Archivo simple</label>
          <input
            type="file"
            class="input"
            @change="onSingleFileChange"
          >
        </div>
        <div class="form-group">
          <label class="label">Path destino</label>
          <input
            v-model="singleObjectKey"
            class="input"
            placeholder="musica/generos/demo/audio.mp3"
            type="text"
          >
        </div>
        <button
          class="btn btn-primary"
          :disabled="loading || !singleFile || !singleObjectKey"
          @click="subirSimple"
        >
          <i class="fas fa-cloud-upload-alt" />
          SubirFiles
        </button>

        <div class="divider" />

        <div class="form-group">
          <label class="label">Archivo con metadata</label>
          <input
            type="file"
            class="input"
            @change="onMetadataFileChange"
          >
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <div class="form-group">
            <label class="label">Path metadata</label>
            <input
              v-model="metadataObjectKey"
              class="input"
              placeholder="docs/archivo.pdf"
              type="text"
            >
          </div>
          <div class="form-group">
            <label class="label">Metadata JSON</label>
            <input
              v-model="metadataText"
              class="input"
              placeholder="{&quot;autor&quot;:&quot;admin&quot;}"
              type="text"
            >
          </div>
        </div>
        <button
          class="btn btn-info"
          :disabled="loading || !metadataFile || !metadataObjectKey"
          @click="subirConMetadata"
        >
          <i class="fas fa-tags" />
          SubirConMetadata
        </button>

        <div class="divider" />

        <div class="form-group">
          <label class="label">Múltiples archivos</label>
          <input
            type="file"
            class="input"
            multiple
            @change="onMultipleFilesChange"
          >
        </div>
        <div class="form-group">
          <label class="label">Carpeta base</label>
          <input
            v-model="multipleBasePath"
            class="input"
            placeholder="uploads/lote"
            type="text"
          >
        </div>
        <button
          class="btn btn-success"
          :disabled="loading || !multipleFiles.length"
          @click="subirMultiples"
        >
          <i class="fas fa-layer-group" />
          SubirMultiples
        </button>

        <div class="divider" />

        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            v-model="folderPath"
            class="input"
            placeholder="nueva/carpeta"
            type="text"
          >
          <button
            class="btn btn-secondary"
            :disabled="loading || !folderPath"
            @click="crearCarpeta"
          >
            <i class="fas fa-folder-plus" />
            CrearCarpeta
          </button>
        </div>
      </div>

      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-text-primary light:text-text-light-primary">
          Descargas y links
        </h3>

        <div class="form-group">
          <label class="label">Object name/key</label>
          <input
            v-model="downloadObject"
            class="input"
            placeholder="musica/generos/demo/audio.mp3"
            type="text"
          >
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <button
            class="btn btn-secondary"
            :disabled="loading || !downloadObject"
            @click="downloadRaw"
          >
            <i class="fas fa-file-download" />
            Download
          </button>
          <button
            class="btn btn-primary"
            :disabled="loading || !downloadObject"
            @click="downloadAndSave"
          >
            <i class="fas fa-download" />
            DownloadYGuardar
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <div class="form-group">
            <label class="label">Rango inicio</label>
            <input
              v-model.number="rangeStart"
              class="input"
              type="number"
              min="0"
            >
          </div>
          <div class="form-group">
            <label class="label">Rango fin</label>
            <input
              v-model.number="rangeEnd"
              class="input"
              type="number"
              min="0"
            >
          </div>
        </div>
        <button
          class="btn btn-warning"
          :disabled="loading || !downloadObject"
          @click="downloadRange"
        >
          <i class="fas fa-stream" />
          DownloadRango
        </button>

        <div class="divider" />

        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            v-model.number="expiration"
            class="input"
            type="number"
            min="1"
            placeholder="Minutos de expiración"
          >
          <button
            class="btn btn-info"
            :disabled="loading || !downloadObject"
            @click="getDownloadUrl"
          >
            <i class="fas fa-link" />
            GetDownloadUrl
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            v-model="linksKeysText"
            class="input"
            placeholder="obj1.mp3,obj2.mp3"
            type="text"
          >
          <button
            class="btn btn-ghost"
            :disabled="loading || !linksKeysText"
            @click="getLinksMultiples"
          >
            <i class="fas fa-share-alt" />
            GetLinksMultiples
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="flex items-center justify-between mb-2">
        <h4 class="font-semibold text-text-primary light:text-text-light-primary">
          Progreso de upload múltiple
        </h4>
        <span class="badge badge-primary">{{ uploadTotalProgress }}%</span>
      </div>
      <div class="h-2 rounded bg-dark-secondary overflow-hidden light:bg-light-secondary">
        <div
          class="h-full bg-primary-500 transition-all duration-200"
          :style="{ width: uploadTotalProgress + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import obsServices from '@/services/obsServices'

const emit = defineEmits(['result', 'error'])

const loading = ref(false)
const singleFile = ref(null)
const singleObjectKey = ref('')

const metadataFile = ref(null)
const metadataObjectKey = ref('')
const metadataText = ref('{"ambiente":"admin"}')

const multipleFiles = ref([])
const multipleBasePath = ref('uploads/lote')
const uploadTotalProgress = ref(0)

const folderPath = ref('')

const downloadObject = ref('')
const rangeStart = ref(0)
const rangeEnd = ref(1024)
const expiration = ref(60)
const linksKeysText = ref('')

const report = (action, payload) => emit('result', { action, payload, at: new Date().toISOString() })
const reportError = (action, error) => emit('error', { action, error })

const run = async (action, fn) => {
  try {
    loading.value = true
    const payload = await fn()
    report(action, payload)
  } catch (error) {
    reportError(action, error)
  } finally {
    loading.value = false
  }
}

const onSingleFileChange = (event) => {
  singleFile.value = event.target.files?.[0] || null
  if (singleFile.value && !singleObjectKey.value) {
    singleObjectKey.value = singleFile.value.name
  }
}

const onMetadataFileChange = (event) => {
  metadataFile.value = event.target.files?.[0] || null
  if (metadataFile.value && !metadataObjectKey.value) {
    metadataObjectKey.value = metadataFile.value.name
  }
}

const onMultipleFilesChange = (event) => {
  multipleFiles.value = Array.from(event.target.files || [])
}

const subirSimple = () => run('SubirFiles', async () => {
  const formData = new FormData()
  formData.append('file', singleFile.value)
  formData.append('filePath', singleObjectKey.value)

  const sizeValidation = obsServices.ValidarTamanoArchivo(singleFile.value.size, 100)
  const typeValidation = obsServices.ValidarTipoArchivo(singleFile.value.name, ['audio', 'video', 'image', 'document', 'archive'])

  const response = await obsServices.SubirFiles(formData)
  return {
    validation: { sizeValidation, typeValidation },
    response
  }
})

const subirConMetadata = () => run('SubirConMetadata', async () => {
  const metadata = safeJsonParse(metadataText.value, {})
  return obsServices.SubirConMetadata(metadataFile.value, metadataObjectKey.value, metadata)
})

const subirMultiples = () => run('SubirMultiples', async () => {
  uploadTotalProgress.value = 0
  const archivos = multipleFiles.value.map(file => ({
    file,
    objectKey: `${sanitizePath(multipleBasePath.value)}/${file.name}`
  }))

  return obsServices.SubirMultiples(archivos, {
    concurrency: 3,
    onTotalProgress: (progress) => {
      uploadTotalProgress.value = progress
    }
  })
})

const crearCarpeta = () => run('CrearCarpeta', () => obsServices.CrearCarpeta(folderPath.value))

const downloadRaw = () => run('Download', async () => {
  const blob = await obsServices.Download(downloadObject.value)
  return { bytes: blob.size, type: blob.type || 'application/octet-stream' }
})

const downloadAndSave = () => run('DownloadYGuardar', () => obsServices.DownloadYGuardar(downloadObject.value))

const downloadRange = () => run('DownloadRango', async () => {
  const blob = await obsServices.DownloadRango(downloadObject.value, rangeStart.value, rangeEnd.value)
  return { bytes: blob.size, range: `bytes=${rangeStart.value}-${rangeEnd.value}` }
})

const getDownloadUrl = () => run('GetDownloadUrl', async () => {
  const url = await obsServices.GetDownloadUrl(downloadObject.value, expiration.value)
  return { url }
})

const getLinksMultiples = () => run('GetLinksMultiples', () => {
  const keys = linksKeysText.value.split(',').map(v => v.trim()).filter(Boolean)
  return obsServices.GetLinksMultiples(keys, expiration.value)
})

const sanitizePath = (path) => (path || '').replace(/^\/+|\/+$/g, '')

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}
</script>
