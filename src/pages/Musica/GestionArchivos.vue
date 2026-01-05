<template>
  <div class="gestion-archivos-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-cloud"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">Gestión de Archivos</h1>
          <p class="page-subtitle" v-if="contexto.tipo === 'genero'">
            Género: {{ contexto.nombreGenero }}
          </p>
          <p class="page-subtitle" v-else-if="contexto.tipo === 'subgenero'">
            {{ contexto.nombreGenero }} / {{ contexto.nombreSubgenero }}
          </p>
          <p class="page-subtitle" v-else>Almacenamiento en la nube OBS</p>
        </div>
        <div class="header-actions">
          <button v-if="contexto.tipo" class="btn-secondary" @click="volverAtras">
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </button>
          <button class="btn-primary" @click="abrirModalUpload">
            <i class="fas fa-cloud-upload-alt"></i>
            <span>Subir Archivo</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <div class="breadcrumb-container" v-if="currentPath">
      <nav class="breadcrumb">
        <button @click="navegarCarpeta('')" class="breadcrumb-item">
          <i class="fas fa-home"></i> Inicio
        </button>
        <template v-for="(folder, index) in pathParts" :key="index">
          <span class="breadcrumb-separator">/</span>
          <button @click="navegarCarpeta(getPathUpTo(index))" class="breadcrumb-item">
            {{ folder }}
          </button>
        </template>
      </nav>
    </div>

    <!-- Loading State -->
    <LoadingOverlay v-if="isLoading" message="Cargando archivos..." />

    <!-- Empty State -->
    <div v-else-if="objetos.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <i class="fas fa-folder-open"></i>
      </div>
      <h3>No hay archivos en esta ubicación</h3>
      <p>Sube tu primer archivo para comenzar</p>
      <button class="btn-primary" @click="abrirModalUpload">
        <i class="fas fa-cloud-upload-alt"></i>
        Subir Archivo
      </button>
    </div>

    <!-- Archivos Grid -->
    <BaseCard v-else shadow="md" :no-padding="true">
      <template #header>
        <div class="section-header">
          <h2 class="section-title">Archivos y Carpetas</h2>
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
              <i class="fas fa-folder"></i>
            </div>
            <div class="archivo-info">
              <h3 class="archivo-name">{{ getNombreObjeto(carpeta.objectKey) }}</h3>
            </div>
          </div>

          <div class="card-actions">
            <button
              class="card-action-btn primary"
              @click="navegarCarpeta(carpeta.objectKey)"
              title="Abrir carpeta"
            >
              <i class="fas fa-folder-open"></i>
              Abrir
            </button>

            <button
              class="card-action-btn danger"
              @click="eliminarObjeto(carpeta.objectKey)"
              title="Eliminar carpeta"
            >
              <i class="fas fa-trash-alt"></i>
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
            <div class="archivo-icon" :class="getFileIconClass(archivo.objectKey)">
              <i :class="getFileIcon(archivo.objectKey)"></i>
            </div>
            <div class="archivo-info">
              <h3 class="archivo-name">{{ getNombreObjeto(archivo.objectKey) }}</h3>
              <span class="archivo-size">{{ formatSize(archivo.size) }}</span>
            </div>
          </div>

          <div class="card-content">
            <div class="archivo-details">
              <div class="detail-item">
                <span class="detail-label">
                  <i class="fas fa-calendar"></i>
                  Modificado
                </span>
                <span class="detail-value">{{ formatDate(archivo.lastModified) }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button
              class="card-action-btn info"
              @click="generarLink(archivo.objectKey)"
              title="Obtener enlace"
            >
              <i class="fas fa-link"></i>
              Link
            </button>

            <button
              class="card-action-btn success"
              @click="descargarArchivo(archivo.objectKey)"
              title="Descargar archivo"
            >
              <i class="fas fa-download"></i>
              Descargar
            </button>

            <button
              class="card-action-btn warning"
              @click="abrirModalMover(archivo)"
              title="Mover archivo"
            >
              <i class="fas fa-arrows-alt"></i>
              Mover
            </button>

            <button
              class="card-action-btn danger"
              @click="eliminarArchivo(archivo.objectKey)"
              title="Eliminar archivo"
            >
              <i class="fas fa-trash-alt"></i>
              Eliminar
            </button>
          </div>
        </article>
        </div>
      </div>
    </BaseCard>

    <!-- Modal Upload -->
    <Modal
      v-model="mostrarModalUpload"
      title="Subir Archivo"
      size="md"
    >
      <div class="form-group">
        <label class="form-label">
          Archivo <span class="required">*</span>
        </label>
        <input
          type="file"
          @change="seleccionarArchivo"
          class="form-input"
          ref="fileInput"
        >
        <p v-if="archivoSeleccionado" class="file-info">
          <i class="fas fa-file"></i>
          {{ archivoSeleccionado.name }} ({{ formatSize(archivoSeleccionado.size) }})
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">
          Ruta de destino <span class="required">*</span>
        </label>
        <input
          v-model="rutaDestino"
          type="text"
          placeholder="carpeta/subcarpeta/archivo.ext"
          class="form-input"
        >
        <small class="form-hint">
          La ruta actual es: {{ currentPath || '/' }}
        </small>
      </div>

      <div v-if="uploadProgress > 0" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
        </div>
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>

      <template #footer>
        <button class="btn-secondary" @click="cerrarModalUpload" :disabled="uploadingFile">
          Cancelar
        </button>
        <button class="btn-primary" @click="subirArchivo" :disabled="!archivoSeleccionado || uploadingFile">
          <i class="fas fa-cloud-upload-alt"></i>
          {{ uploadingFile ? 'Subiendo...' : 'Subir' }}
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
        <button class="btn-secondary" @click="cerrarModalMover">
          Cancelar
        </button>
        <button class="btn-primary" @click="moverArchivo">
          <i class="fas fa-arrows-alt"></i>
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
            :value="linkGenerado"
            type="text"
            class="form-input"
            readonly
            ref="linkInput"
          >
          <button class="btn-copy" @click="copiarLink" title="Copiar enlace">
            <i class="fas fa-copy"></i>
          </button>
        </div>
      </div>

      <template #footer>
        <button class="btn-primary" @click="cerrarModalLink">
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
const archivoSeleccionado = ref(null)
const rutaDestino = ref('')
const uploadProgress = ref(0)
const uploadingFile = ref(false)
const linkGenerado = ref('')
const fileInput = ref(null)
const linkInput = ref(null)

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

// Upload methods
const abrirModalUpload = () => {
  rutaDestino.value = currentPath.value
  mostrarModalUpload.value = true
}

const cerrarModalUpload = () => {
  mostrarModalUpload.value = false
  archivoSeleccionado.value = null
  rutaDestino.value = ''
  uploadProgress.value = 0
  if (fileInput.value) fileInput.value.value = ''
}

const seleccionarArchivo = (event) => {
  const file = event.target.files[0]
  if (file) {
    archivoSeleccionado.value = file
    if (!rutaDestino.value) {
      rutaDestino.value = currentPath.value + file.name
    }
  }
}

const subirArchivo = async () => {
  if (!archivoSeleccionado.value) {
    alert('Por favor selecciona un archivo')
    return
  }

  if (!rutaDestino.value) {
    alert('Por favor ingresa la ruta de destino')
    return
  }

  uploadingFile.value = true
  uploadProgress.value = 0

  try {
    const formData = new FormData()
    formData.append('file', archivoSeleccionado.value)
    formData.append('filePath', rutaDestino.value)

    // Simulate progress (real progress would need backend support)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 200)

    await obsServices.SubirFiles(formData)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    setTimeout(() => {
      cerrarModalUpload()
      cargarObjetos()
      alert('Archivo subido exitosamente')
    }, 500)
  } catch (error) {
    console.error('Error subiendo archivo:', error)
    alert('Error al subir el archivo')
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

<style scoped src="./musica.css"></style>
