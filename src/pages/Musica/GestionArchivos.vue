<template>
  <div class="gestion-archivos-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-cloud" />
        </div>
        <div class="header-text">
          <h1 class="page-title">
Gestión de Archivos
</h1>
          <p
v-if="contexto.tipo === 'genero'"
class="page-subtitle"
>
            Género: {{ contexto.nombreGenero }}
          </p>
          <p
v-else-if="contexto.tipo === 'subgenero'"
class="page-subtitle"
>
            {{ contexto.nombreGenero }} / {{ contexto.nombreSubgenero }}
          </p>
          <p
v-else
class="page-subtitle"
>
Almacenamiento en la nube OBS
</p>
        </div>
        <div class="header-actions">
          <button
v-if="contexto.tipo"
class="btn-secondary"
@click="volverAtras"
>
            <i class="fas fa-arrow-left" />
            <span>Volver</span>
          </button>
          <button
class="btn-primary"
@click="abrirModalUpload"
>
            <i class="fas fa-cloud-upload-alt" />
            <span>Subir Archivo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <div
v-if="currentPath"
class="breadcrumb-container"
>
      <nav class="breadcrumb">
        <button
class="breadcrumb-item"
@click="navegarCarpeta('')"
>
          <i class="fas fa-home" /> Inicio
        </button>
        <template
v-for="(folder, index) in pathParts"
:key="index"
>
          <span class="breadcrumb-separator">/</span>
          <button
class="breadcrumb-item"
@click="navegarCarpeta(getPathUpTo(index))"
>
            {{ folder }}
          </button>
        </template>
      </nav>
    </div>

    <!-- Loading State -->
    <LoadingOverlay
v-if="isLoading"
message="Cargando archivos..."
/>

    <!-- Empty State -->
    <div
v-else-if="objetos.length === 0"
class="empty-state"
>
      <div class="empty-state-icon">
        <i class="fas fa-folder-open" />
      </div>
      <h3>No hay archivos en esta ubicación</h3>
      <p>Sube tu primer archivo para comenzar</p>
      <button
class="btn-primary"
@click="abrirModalUpload"
>
        <i class="fas fa-cloud-upload-alt" />
        Subir Archivo
      </button>
    </div>

    <!-- Archivos Grid -->
    <BaseCard
v-else
shadow="md"
:no-padding="true"
>
      <template #header>
        <div class="section-header">
          <h2 class="section-title">
Archivos y Carpetas
</h2>
          <div class="section-actions">
            <input
              v-if="objetos.length > 5"
              v-model="searchQuery"
              type="text"
              placeholder="Buscar archivos..."
              class="search-input"
              @input="filtrarArchivos"
            >
          </div>
        </div>
      </template>

      <div class="archivos-section-content">
        <div class="archivos-grid">
        <!-- Carpetas -->
        <article
          v-for="carpeta in carpetasFiltradas"
          :key="carpeta.objectKey"
          class="archivo-card carpeta-card"
          @dblclick="navegarCarpeta(carpeta.objectKey)"
        >
          <div class="card-header">
            <div class="archivo-icon folder-icon">
              <i class="fas fa-folder" />
            </div>
            <div class="archivo-info">
              <h3 class="archivo-name">
{{ getNombreObjeto(carpeta.objectKey) }}
</h3>
            </div>
          </div>

          <div class="card-actions">
            <button
              class="card-action-btn primary"
              title="Abrir carpeta"
              @click="navegarCarpeta(carpeta.objectKey)"
            >
              <i class="fas fa-folder-open" />
              Abrir
            </button>

            <button
              class="card-action-btn danger"
              title="Eliminar carpeta"
              @click="eliminarObjeto(carpeta.objectKey)"
            >
              <i class="fas fa-trash-alt" />
              Eliminar
            </button>
          </div>
        </article>

        <!-- Archivos -->
        <article
          v-for="archivo in archivosFiltrados"
          :key="archivo.objectKey"
          class="archivo-card"
        >
          <div class="card-header">
            <div
class="archivo-icon"
:class="getFileIconClass(archivo.objectKey)"
>
              <i :class="getFileIcon(archivo.objectKey)" />
            </div>
            <div class="archivo-info">
              <h3 class="archivo-name">
{{ getNombreObjeto(archivo.objectKey) }}
</h3>
              <span class="archivo-size">{{ formatSize(archivo.size) }}</span>
            </div>
          </div>

          <div class="card-content">
            <div class="archivo-details">
              <div class="detail-item">
                <span class="detail-label">
                  <i class="fas fa-calendar" />
                  Modificado
                </span>
                <span class="detail-value">{{ formatDate(archivo.lastModified) }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button
              class="card-action-btn info"
              title="Obtener enlace"
              @click="generarLink(archivo.objectKey)"
            >
              <i class="fas fa-link" />
              Link
            </button>

            <button
              class="card-action-btn success"
              title="Descargar archivo"
              @click="descargarArchivo(archivo.objectKey)"
            >
              <i class="fas fa-download" />
              Descargar
            </button>

            <button
              class="card-action-btn warning"
              title="Mover archivo"
              @click="abrirModalMover(archivo)"
            >
              <i class="fas fa-arrows-alt" />
              Mover
            </button>

            <button
              class="card-action-btn danger"
              title="Eliminar archivo"
              @click="eliminarArchivo(archivo.objectKey)"
            >
              <i class="fas fa-trash-alt" />
              Eliminar
            </button>
          </div>
        </article>
        </div>
      </div>
    </BaseCard>

    <!-- Modal Upload Mejorado -->
    <Modal
      v-model="mostrarModalUpload"
      title="Subir Archivos"
      size="lg"
    >
      <!-- Zona de Drag & Drop -->
      <div
        class="upload-dropzone"
        :class="{ 'dropzone-active': isDragging, 'dropzone-has-files': archivosParaSubir.length > 0 }"
        @dragenter.prevent="onDragEnter"
        @dragleave.prevent="onDragLeave"
        @dragover.prevent
        @drop.prevent="onDrop"
      >
        <div v-if="archivosParaSubir.length === 0" class="dropzone-content">
          <i class="fas fa-cloud-upload-alt dropzone-icon" />
          <p class="dropzone-text">
            Arrastra y suelta tus archivos aquí
          </p>
          <p class="dropzone-hint">
            o haz clic para seleccionar
          </p>
          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
            class="dropzone-input"
            @change="seleccionarArchivos"
          >
        </div>

        <!-- Lista de archivos seleccionados -->
        <div v-else class="files-preview">
          <div class="files-header">
            <span class="files-count">
              <i class="fas fa-files" />
              {{ archivosParaSubir.length }} archivo(s) seleccionado(s)
            </span>
            <button
              type="button"
              class="btn-clear-files"
              @click="limpiarArchivos"
            >
              <i class="fas fa-times" />
              Limpiar todo
            </button>
          </div>

          <div class="files-list">
            <div
              v-for="(archivo, index) in archivosParaSubir"
              :key="index"
              class="file-item"
              :class="{ 'file-uploading': archivo.uploading, 'file-success': archivo.uploaded, 'file-error': archivo.error }"
            >
              <!-- Preview de imagen -->
              <div class="file-preview">
                <img
                  v-if="archivo.preview && esImagen(archivo.file.name)"
                  :src="archivo.preview"
                  :alt="archivo.file.name"
                  class="preview-image"
                >
                <div v-else class="preview-icon" :class="getFileIconClass(archivo.file.name)">
                  <i :class="getFileIcon(archivo.file.name)" />
                </div>
              </div>

              <!-- Info del archivo -->
              <div class="file-info">
                <p class="file-name" :title="archivo.file.name">
                  {{ truncateFileName(archivo.file.name, 30) }}
                </p>
                <p class="file-size">
                  {{ formatSize(archivo.file.size) }}
                  <span v-if="archivo.compressedSize" class="compressed-badge">
                    → {{ formatSize(archivo.compressedSize) }} ({{ calcularAhorro(archivo.file.size, archivo.compressedSize) }}% menos)
                  </span>
                </p>
                <!-- Barra de progreso individual -->
                <div v-if="archivo.uploading" class="file-progress">
                  <div class="progress-bar-mini">
                    <div class="progress-fill-mini" :style="{ width: archivo.progress + '%' }" />
                  </div>
                  <span class="progress-text-mini">{{ archivo.progress }}%</span>
                </div>
                <p v-if="archivo.error" class="file-error-text">
                  <i class="fas fa-exclamation-circle" /> {{ archivo.error }}
                </p>
              </div>

              <!-- Acciones -->
              <div class="file-actions">
                <button
                  v-if="!archivo.uploading && !archivo.uploaded"
                  type="button"
                  class="btn-remove-file"
                  title="Quitar archivo"
                  @click="quitarArchivo(index)"
                >
                  <i class="fas fa-times" />
                </button>
                <i v-if="archivo.uploaded" class="fas fa-check-circle file-success-icon" />
                <i v-if="archivo.uploading" class="fas fa-spinner fa-spin file-loading-icon" />
              </div>
            </div>
          </div>

          <!-- Botón para agregar más -->
          <button
            v-if="!uploadingFile"
            type="button"
            class="btn-add-more"
            @click="triggerFileInput"
          >
            <i class="fas fa-plus" />
            Agregar más archivos
          </button>
        </div>
      </div>

      <!-- Opciones de compresión -->
      <div v-if="tieneImagenes" class="compression-options">
        <label class="checkbox-label">
          <input
            v-model="comprimirImagenes"
            type="checkbox"
            class="checkbox-input"
          >
          <span class="checkbox-text">
            <i class="fas fa-compress-alt" />
            Comprimir imágenes automáticamente
          </span>
        </label>
        <div v-if="comprimirImagenes" class="compression-settings">
          <label class="form-label-small">Calidad de compresión</label>
          <input
            v-model.number="calidadCompresion"
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            class="range-input"
          >
          <span class="range-value">{{ Math.round(calidadCompresion * 100) }}%</span>
        </div>
      </div>

      <!-- Ruta de destino -->
      <div class="form-group">
        <label class="form-label">
          Carpeta de destino
        </label>
        <div class="path-display">
          <i class="fas fa-folder-open" />
          <span>{{ currentPath || '/' }}</span>
        </div>
      </div>

      <!-- Progreso total -->
      <div v-if="uploadingFile" class="upload-total-progress">
        <div class="progress-header">
          <span class="progress-label">Progreso total</span>
          <span class="progress-stats">
            {{ archivosSubidos }} de {{ archivosParaSubir.length }} archivos
          </span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progresoTotal + '%' }" />
        </div>
        <span class="progress-text">{{ progresoTotal }}%</span>
      </div>

      <template #footer>
        <button
          class="btn-secondary"
          :disabled="uploadingFile"
          @click="cerrarModalUpload"
        >
          Cancelar
        </button>
        <button
          class="btn-primary"
          :disabled="archivosParaSubir.length === 0 || uploadingFile"
          @click="subirArchivos"
        >
          <i v-if="uploadingFile" class="fas fa-spinner fa-spin" />
          <i v-else class="fas fa-cloud-upload-alt" />
          {{ uploadingFile ? `Subiendo... (${archivosSubidos}/${archivosParaSubir.length})` : `Subir ${archivosParaSubir.length} archivo(s)` }}
        </button>
      </template>
    </Modal>

    <!-- Modal Mover -->
    <Modal
      v-model="mostrarModalMover"
      title="Mover Archivo"
      size="md"
    >
      <div class="form-group">
        <label class="form-label">Origen</label>
        <input
          :value="moverForm.origen"
          type="text"
          class="form-input"
          disabled
        >
      </div>

      <div class="form-group">
        <label class="form-label">
          Nuevo destino <span class="required">*</span>
        </label>
        <input
          v-model="moverForm.destino"
          type="text"
          placeholder="nueva-carpeta/archivo.ext"
          class="form-input"
        >
      </div>

      <template #footer>
        <button
class="btn-secondary"
@click="cerrarModalMover"
>
          Cancelar
        </button>
        <button
class="btn-primary"
@click="moverArchivo"
>
          <i class="fas fa-arrows-alt" />
          Mover
        </button>
      </template>
    </Modal>

    <!-- Modal Link -->
    <Modal
      v-model="mostrarModalLink"
      title="Enlace de Acceso"
      size="md"
    >
      <div class="form-group">
        <label class="form-label">URL del archivo</label>
        <div class="link-container">
          <input
            ref="linkInput"
            :value="linkGenerado"
            type="text"
            class="form-input"
            readonly
          >
          <button
class="btn-copy"
title="Copiar enlace"
@click="copiarLink"
>
            <i class="fas fa-copy" />
          </button>
        </div>
      </div>

      <template #footer>
        <button
class="btn-primary"
@click="cerrarModalLink"
>
          Cerrar
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import obsServices from '@/services/obsServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Modal from '@/components/ui/Modal.vue'
import moment from 'moment'

const router = useRouter()
const route = useRoute()

// State
const isLoading = ref(false)
const objetos = ref([])
const searchQuery = ref('')
const currentPath = ref('')
const mostrarModalUpload = ref(false)
const mostrarModalMover = ref(false)
const mostrarModalLink = ref(false)
const uploadingFile = ref(false)
const linkGenerado = ref('')
const fileInput = ref(null)
const linkInput = ref(null)

// Estado mejorado para upload múltiple
const archivosParaSubir = ref([])
const isDragging = ref(false)
const comprimirImagenes = ref(true)
const calidadCompresion = ref(0.8)
const archivosSubidos = ref(0)
const progresoTotal = ref(0)

// Contexto de género/subgénero
const contexto = ref({
  tipo: route.query.tipo || null,
  codigoGenero: route.query.codigoGenero || null,
  nombreGenero: route.query.nombreGenero || null,
  codigoSubgenero: route.query.codigoSubgenero || null,
  nombreSubgenero: route.query.nombreSubgenero || null,
  carpeta: route.query.carpeta || ''
})

const moverForm = ref({
  origen: '',
  destino: ''
})

// Computed
const pathParts = computed(() => {
  if (!currentPath.value) return []
  return currentPath.value.split('/').filter(p => p)
})

const carpetas = computed(() => {
  return objetos.value.filter(obj => obj.objectKey.endsWith('/'))
})

const archivos = computed(() => {
  return objetos.value.filter(obj => !obj.objectKey.endsWith('/'))
})

const carpetasFiltradas = computed(() => {
  if (!searchQuery.value) return carpetas.value
  const query = searchQuery.value.toLowerCase()
  return carpetas.value.filter(carpeta =>
    getNombreObjeto(carpeta.objectKey).toLowerCase().includes(query)
  )
})

const archivosFiltrados = computed(() => {
  if (!searchQuery.value) return archivos.value
  const query = searchQuery.value.toLowerCase()
  return archivos.value.filter(archivo =>
    getNombreObjeto(archivo.objectKey).toLowerCase().includes(query)
  )
})

// Computed para detectar si hay imágenes en la selección
const tieneImagenes = computed(() => {
  return archivosParaSubir.value.some(a => esImagen(a.file.name))
})

// Methods
const cargarObjetos = async () => {
  isLoading.value = true
  try {
    const response = await obsServices.ListarObject(currentPath.value)
    objetos.value = response
  } catch (error) {
    console.error('Error cargando objetos:', error)
    alert('Error al cargar los archivos')
  } finally {
    isLoading.value = false
  }
}

const navegarCarpeta = (path) => {
  currentPath.value = path
  cargarObjetos()
}

const getPathUpTo = (index) => {
  return pathParts.value.slice(0, index + 1).join('/') + '/'
}

const getNombreObjeto = (objectKey) => {
  const parts = objectKey.split('/').filter(p => p)
  return parts[parts.length - 1] || objectKey
}

const getFileIcon = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  const iconMap = {
    mp3: 'fas fa-file-audio',
    wav: 'fas fa-file-audio',
    ogg: 'fas fa-file-audio',
    mp4: 'fas fa-file-video',
    avi: 'fas fa-file-video',
    jpg: 'fas fa-file-image',
    jpeg: 'fas fa-file-image',
    png: 'fas fa-file-image',
    gif: 'fas fa-file-image',
    pdf: 'fas fa-file-pdf',
    doc: 'fas fa-file-word',
    docx: 'fas fa-file-word',
    xls: 'fas fa-file-excel',
    xlsx: 'fas fa-file-excel',
    txt: 'fas fa-file-alt',
    zip: 'fas fa-file-archive',
    rar: 'fas fa-file-archive'
  }
  return iconMap[ext] || 'fas fa-file'
}

const getFileIconClass = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  if (['mp3', 'wav', 'ogg'].includes(ext)) return 'audio-icon'
  if (['mp4', 'avi'].includes(ext)) return 'video-icon'
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image-icon'
  if (ext === 'pdf') return 'pdf-icon'
  return 'file-icon'
}

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return moment(dateString).format('DD/MM/YYYY HH:mm')
}

// =============== FUNCIONES DE UPLOAD MEJORADAS ===============

// Verificar si es imagen
const esImagen = (filename) => {
  const ext = filename.split('.').pop().toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext)
}

// Truncar nombre de archivo largo
const truncateFileName = (name, maxLength) => {
  if (name.length <= maxLength) return name
  const ext = name.split('.').pop()
  const nameWithoutExt = name.slice(0, name.lastIndexOf('.'))
  const truncatedName = nameWithoutExt.slice(0, maxLength - ext.length - 4) + '...'
  return `${truncatedName}.${ext}`
}

// Calcular porcentaje de ahorro por compresión
const calcularAhorro = (original, comprimido) => {
  return Math.round((1 - comprimido / original) * 100)
}

// Generar preview de imagen
const generarPreview = (file) => {
  return new Promise((resolve) => {
    if (!esImagen(file.name)) {
      resolve(null)
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

// Comprimir imagen
const comprimirImagen = (file, calidad = 0.8) => {
  return new Promise((resolve, reject) => {
    if (!esImagen(file.name)) {
      resolve({ file, compressedSize: null })
      return
    }

    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Mantener dimensiones originales pero comprimir calidad
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            })
            resolve({ file: compressedFile, compressedSize: blob.size })
          } else {
            // Si la compresión no reduce el tamaño, usar original
            resolve({ file, compressedSize: null })
          }
        },
        file.type,
        calidad
      )
    }

    img.onerror = () => reject(new Error('Error cargando imagen'))

    const reader = new FileReader()
    reader.onload = (e) => { img.src = e.target.result }
    reader.onerror = () => reject(new Error('Error leyendo archivo'))
    reader.readAsDataURL(file)
  })
}

// Drag & Drop handlers
const onDragEnter = () => {
  isDragging.value = true
}

const onDragLeave = (e) => {
  // Solo desactivar si se sale del área de drop
  if (!e.currentTarget.contains(e.relatedTarget)) {
    isDragging.value = false
  }
}

const onDrop = async (event) => {
  isDragging.value = false
  const files = Array.from(event.dataTransfer.files)
  await procesarArchivos(files)
}

// Procesar archivos seleccionados
const procesarArchivos = async (files) => {
  for (const file of files) {
    // Validar tipo de archivo
    if (!validarTipoArchivo(file)) {
      console.warn(`Tipo de archivo no permitido: ${file.name}`)
      continue
    }

    // Generar preview si es imagen
    const preview = await generarPreview(file)

    archivosParaSubir.value.push({
      file,
      preview,
      progress: 0,
      uploading: false,
      uploaded: false,
      error: null,
      compressedSize: null
    })
  }
}

// Validar tipo de archivo
const validarTipoArchivo = (file) => {
  const extensionesPermitidas = [
    // Audio
    'mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a',
    // Video
    'mp4', 'avi', 'mkv', 'mov', 'wmv', 'webm',
    // Imágenes
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp',
    // Documentos
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt',
    // Archivos comprimidos
    'zip', 'rar', '7z'
  ]
  const ext = file.name.split('.').pop().toLowerCase()
  return extensionesPermitidas.includes(ext)
}

// Seleccionar archivos desde input
const seleccionarArchivos = async (event) => {
  const files = Array.from(event.target.files)
  await procesarArchivos(files)
  // Limpiar input para permitir seleccionar el mismo archivo de nuevo
  if (fileInput.value) fileInput.value.value = ''
}

// Trigger para abrir selector de archivos
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// Quitar archivo de la lista
const quitarArchivo = (index) => {
  // Liberar URL de preview si existe
  const archivo = archivosParaSubir.value[index]
  if (archivo.preview && archivo.preview.startsWith('blob:')) {
    URL.revokeObjectURL(archivo.preview)
  }
  archivosParaSubir.value.splice(index, 1)
}

// Limpiar todos los archivos
const limpiarArchivos = () => {
  // Liberar URLs de preview
  archivosParaSubir.value.forEach(archivo => {
    if (archivo.preview && archivo.preview.startsWith('blob:')) {
      URL.revokeObjectURL(archivo.preview)
    }
  })
  archivosParaSubir.value = []
}

// Abrir modal de upload
const abrirModalUpload = () => {
  archivosParaSubir.value = []
  archivosSubidos.value = 0
  progresoTotal.value = 0
  mostrarModalUpload.value = true
}

// Cerrar modal de upload
const cerrarModalUpload = () => {
  if (uploadingFile.value) return // No cerrar durante subida
  mostrarModalUpload.value = false
  limpiarArchivos()
  if (fileInput.value) fileInput.value.value = ''
}

// Subir todos los archivos
const subirArchivos = async () => {
  if (archivosParaSubir.value.length === 0) return

  uploadingFile.value = true
  archivosSubidos.value = 0
  progresoTotal.value = 0

  try {
    for (let i = 0; i < archivosParaSubir.value.length; i++) {
      const archivoData = archivosParaSubir.value[i]
      archivoData.uploading = true
      archivoData.error = null

      try {
        let fileToUpload = archivoData.file

        // Comprimir imagen si está habilitado
        if (comprimirImagenes.value && esImagen(archivoData.file.name)) {
          try {
            const { file: compressedFile, compressedSize } = await comprimirImagen(
              archivoData.file,
              calidadCompresion.value
            )
            if (compressedSize) {
              fileToUpload = compressedFile
              archivoData.compressedSize = compressedSize
            }
          } catch (compressError) {
            console.warn('Error comprimiendo imagen, usando original:', compressError)
          }
        }

        // Preparar FormData
        const formData = new FormData()
        formData.append('file', fileToUpload)
        const filePath = currentPath.value + archivoData.file.name
        formData.append('filePath', filePath)

        // Subir con progreso real
        await obsServices.SubirFiles(formData, {
          onProgress: (progress) => {
            archivoData.progress = progress
            // Calcular progreso total
            const progresoArchivos = archivosParaSubir.value.reduce((sum, a) => sum + a.progress, 0)
            progresoTotal.value = Math.round(progresoArchivos / archivosParaSubir.value.length)
          }
        })

        archivoData.uploaded = true
        archivosSubidos.value++
      } catch (error) {
        console.error(`Error subiendo ${archivoData.file.name}:`, error)
        archivoData.error = error.response?.data?.message || 'Error al subir'
      } finally {
        archivoData.uploading = false
      }
    }

    // Recargar lista de objetos
    await cargarObjetos()

    // Mostrar resumen
    const exitosos = archivosParaSubir.value.filter(a => a.uploaded).length
    const fallidos = archivosParaSubir.value.filter(a => a.error).length

    if (fallidos === 0) {
      setTimeout(() => {
        cerrarModalUpload()
        alert(`${exitosos} archivo(s) subido(s) exitosamente`)
      }, 500)
    } else {
      alert(`Subida completada: ${exitosos} exitosos, ${fallidos} con errores`)
    }
  } catch (error) {
    console.error('Error en subida múltiple:', error)
    alert('Error durante la subida de archivos')
  } finally {
    uploadingFile.value = false
  }
}

// Move methods
const abrirModalMover = (archivo) => {
  moverForm.value = {
    origen: archivo.objectKey,
    destino: archivo.objectKey
  }
  mostrarModalMover.value = true
}

const cerrarModalMover = () => {
  mostrarModalMover.value = false
  moverForm.value = { origen: '', destino: '' }
}

const moverArchivo = async () => {
  if (!moverForm.value.destino) {
    alert('Por favor ingresa el destino')
    return
  }

  isLoading.value = true
  try {
    await obsServices.Mover({
      origen: moverForm.value.origen,
      destino: moverForm.value.destino
    })
    cerrarModalMover()
    await cargarObjetos()
    alert('Archivo movido exitosamente')
  } catch (error) {
    console.error('Error moviendo archivo:', error)
    alert('Error al mover el archivo')
  } finally {
    isLoading.value = false
  }
}

// Delete methods
const eliminarArchivo = async (objectName) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar "${getNombreObjeto(objectName)}"?`)) {
    return
  }

  isLoading.value = true
  try {
    await obsServices.EliminarArchivo(objectName)
    await cargarObjetos()
    alert('Archivo eliminado exitosamente')
  } catch (error) {
    console.error('Error eliminando archivo:', error)
    alert('Error al eliminar el archivo')
  } finally {
    isLoading.value = false
  }
}

const eliminarObjeto = async (objectKey) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar la carpeta "${getNombreObjeto(objectKey)}" y todo su contenido?`)) {
    return
  }

  isLoading.value = true
  try {
    await obsServices.EliminarObjeto(objectKey)
    await cargarObjetos()
    alert('Carpeta eliminada exitosamente')
  } catch (error) {
    console.error('Error eliminando carpeta:', error)
    alert('Error al eliminar la carpeta')
  } finally {
    isLoading.value = false
  }
}

// Download method
const descargarArchivo = async (objectName) => {
  try {
    const blob = await obsServices.Download(objectName)
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getNombreObjeto(objectName)
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error descargando archivo:', error)
    alert('Error al descargar el archivo')
  }
}

// Link methods
const generarLink = async (objectKey) => {
  try {
    const response = await obsServices.GetLink(objectKey)
    linkGenerado.value = response
    mostrarModalLink.value = true
  } catch (error) {
    console.error('Error generando link:', error)
    alert('Error al generar el enlace')
  }
}

const cerrarModalLink = () => {
  mostrarModalLink.value = false
  linkGenerado.value = ''
}

const copiarLink = () => {
  if (linkInput.value) {
    linkInput.value.select()
    document.execCommand('copy')
    alert('Enlace copiado al portapapeles')
  }
}

const filtrarArchivos = () => {
  // La búsqueda se maneja automáticamente a través de computed properties
}

const volverAtras = () => {
  if (contexto.value.tipo === 'genero') {
    router.push({ name: 'GenerosMusicales' })
  } else if (contexto.value.tipo === 'subgenero') {
    router.push({
      name: 'Subgeneros Musicales',
      params: { codigoGenero: contexto.value.codigoGenero },
      query: { nombreGenero: contexto.value.nombreGenero }
    })
  }
}

// Lifecycle
onMounted(() => {
  // Si hay contexto de carpeta, navegar a ella
  if (contexto.value.carpeta) {
    currentPath.value = contexto.value.carpeta + '/'
  }
  cargarObjetos()
})
</script>

<style scoped>
/* =============== ESTILOS PARA UPLOAD MEJORADO =============== */

/* Zona de Drag & Drop */
.upload-dropzone {
  border: 2px dashed var(--color-border, #374151);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--color-bg-secondary, #1f2937);
  cursor: pointer;
  position: relative;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.upload-dropzone:hover {
  border-color: var(--color-primary, #3b82f6);
  background: var(--color-bg-tertiary, #111827);
}

.dropzone-active {
  border-color: var(--color-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

.dropzone-has-files {
  padding: 1rem;
  min-height: auto;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.dropzone-icon {
  font-size: 3rem;
  color: var(--color-text-tertiary, #6b7280);
  margin-bottom: 0.5rem;
}

.dropzone-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary, #f3f4f6);
}

.dropzone-hint {
  font-size: 0.875rem;
  color: var(--color-text-tertiary, #6b7280);
}

.dropzone-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Lista de archivos */
.files-preview {
  width: 100%;
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border, #374151);
}

.files-count {
  font-weight: 600;
  color: var(--color-text-primary, #f3f4f6);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-clear-files {
  background: transparent;
  border: none;
  color: var(--color-danger, #ef4444);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.btn-clear-files:hover {
  background: rgba(239, 68, 68, 0.1);
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 300px;
  overflow-y: auto;
}

/* Item de archivo */
.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--color-bg-tertiary, #111827);
  border-radius: 8px;
  border: 1px solid var(--color-border, #374151);
  transition: all 0.2s ease;
}

.file-item.file-uploading {
  border-color: var(--color-primary, #3b82f6);
}

.file-item.file-success {
  border-color: var(--color-success, #10b981);
  background: rgba(16, 185, 129, 0.1);
}

.file-item.file-error {
  border-color: var(--color-danger, #ef4444);
  background: rgba(239, 68, 68, 0.1);
}

/* Preview de archivo */
.file-preview {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-secondary, #1f2937);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.preview-icon.audio-icon { color: #8b5cf6; }
.preview-icon.video-icon { color: #f59e0b; }
.preview-icon.image-icon { color: #10b981; }
.preview-icon.pdf-icon { color: #ef4444; }
.preview-icon.file-icon { color: #6b7280; }

/* Info de archivo */
.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: var(--color-text-primary, #f3f4f6);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.file-size {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6b7280);
  margin: 0.25rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.compressed-badge {
  color: var(--color-success, #10b981);
  font-weight: 500;
}

.file-error-text {
  font-size: 0.75rem;
  color: var(--color-danger, #ef4444);
  margin: 0.25rem 0 0;
}

/* Progreso individual */
.file-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.progress-bar-mini {
  flex: 1;
  height: 4px;
  background: var(--color-bg-secondary, #1f2937);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  background: var(--color-primary, #3b82f6);
  transition: width 0.2s ease;
}

.progress-text-mini {
  font-size: 0.7rem;
  color: var(--color-text-tertiary, #6b7280);
  min-width: 35px;
  text-align: right;
}

/* Acciones de archivo */
.file-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-remove-file {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-danger, #ef4444);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-remove-file:hover {
  background: var(--color-danger, #ef4444);
  color: white;
}

.file-success-icon {
  color: var(--color-success, #10b981);
  font-size: 1.25rem;
}

.file-loading-icon {
  color: var(--color-primary, #3b82f6);
  font-size: 1.25rem;
}

/* Botón agregar más */
.btn-add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  margin-top: 0.75rem;
  border: 1px dashed var(--color-border, #374151);
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-secondary, #9ca3af);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-add-more:hover {
  border-color: var(--color-primary, #3b82f6);
  color: var(--color-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

/* Opciones de compresión */
.compression-options {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-bg-secondary, #1f2937);
  border-radius: 8px;
  border: 1px solid var(--color-border, #374151);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary, #3b82f6);
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-primary, #f3f4f6);
  font-weight: 500;
}

.compression-settings {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border, #374151);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-label-small {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6b7280);
}

.range-input {
  flex: 1;
  accent-color: var(--color-primary, #3b82f6);
}

.range-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
  min-width: 40px;
  text-align: right;
}

/* Path display */
.path-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--color-bg-tertiary, #111827);
  border-radius: 6px;
  color: var(--color-text-secondary, #9ca3af);
  font-family: monospace;
  font-size: 0.875rem;
}

.path-display i {
  color: var(--color-primary, #3b82f6);
}

/* Progreso total */
.upload-total-progress {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--color-bg-secondary, #1f2937);
  border-radius: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.progress-label {
  font-weight: 600;
  color: var(--color-text-primary, #f3f4f6);
}

.progress-stats {
  font-size: 0.875rem;
  color: var(--color-text-tertiary, #6b7280);
}

.progress-bar {
  height: 8px;
  background: var(--color-bg-tertiary, #111827);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary, #3b82f6), #8b5cf6);
  transition: width 0.3s ease;
}

.progress-text {
  display: block;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-primary, #3b82f6);
}
</style>