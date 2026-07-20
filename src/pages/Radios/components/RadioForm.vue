<template>
  <div
    v-if="localShow"
    class="modal-backdrop"
  >
    <div
class="modal max-w-2xl max-h-[90vh] flex flex-col"
@click.stop
>
      <div class="modal-header flex-shrink-0">
        <h3 class="text-lg font-semibold text-text-primary">
{{ isEditing ? 'Editar Radio' : 'Nueva Radio' }}
</h3>
        <button
class="btn btn-ghost btn-icon"
@click="confirmClose"
>
          <i class="fas fa-times" />
        </button>
      </div>
      <form
        class="modal-body space-y-6 overflow-y-auto flex-1"
        @submit.prevent="handleSubmit"
      >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nombre -->
        <div class="form-group">
          <label class="label">Nombre</label>
          <input
            v-model="formData.rad_nombre"
            placeholder="Ingrese el nombre de la radio"
            required
            class="input"
            :class="{ 'input-error': errors.rad_nombre }"
          >
          <span
v-if="errors.rad_nombre"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_nombre }}</span>
        </div>

        <!-- Identificador -->
        <div class="form-group">
          <label class="label">Identificador</label>
          <input
            v-model="formData.rad_identi"
            placeholder="ID único de la radio"
            class="input"
            :class="{ 'input-error': errors.rad_identi }"
          >
          <p class="text-text-tertiary text-xs mt-1">
Se genera automáticamente desde el nombre, pero puedes editarlo
</p>
          <span
v-if="errors.rad_identi"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_identi }}</span>
        </div>

        <!-- Estado -->
        <div class="form-group">
          <label class="label">Estado</label>
          <select
            v-model="formData.rad_estado"
            required
            class="select"
            :class="{ 'input-error': errors.rad_estado }"
          >
            <option value="A">
Activo
</option>
            <option value="I">
Inactivo
</option>
          </select>
          <span
v-if="errors.rad_estado"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_estado }}</span>
        </div>

        <!-- Descripción -->
        <div class="md:col-span-2 form-group">
          <label class="label">Descripción</label>
          <input
            v-model="formData.rad_descri"
            placeholder="Descripción de la radio"
            required
            class="input"
            :class="{ 'input-error': errors.rad_descri }"
          >
          <span
v-if="errors.rad_descri"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_descri }}</span>
        </div>

        <!-- URL de Imagen -->
        <div class="md:col-span-2 form-group">
          <label class="label">Imagen Principal</label>
          
          <!-- Dropzone para imagen principal -->
          <div
            class="image-upload-zone"
            :class="{ 
              'dragging': dragStates.rad_imagen, 
              'has-image': formData.rad_imagen,
              'uploading': uploading.rad_imagen 
            }"
            @dragenter.prevent="dragStates.rad_imagen = true"
            @dragleave.prevent="dragStates.rad_imagen = false"
            @dragover.prevent
            @drop.prevent="(e) => handleDrop(e, 'rad_imagen')"
          >
            <!-- Preview de imagen existente -->
            <div
v-if="formData.rad_imagen && !imagePreview.rad_imagen"
class="image-preview-container"
>
              <img
                :src="formData.rad_imagen"
                alt="Preview"
                class="image-preview"
                @error="handleImageError"
              >
              <div class="image-overlay">
                <button
                  type="button"
                  class="btn btn-ghost btn-icon btn-sm"
                  title="Cambiar imagen"
                  @click="triggerFileInput('rad_imagen')"
                >
                  <i class="fas fa-camera" />
                </button>
                <button
                  type="button"
                  class="btn btn-ghost btn-icon btn-sm text-danger-400"
                  title="Eliminar imagen"
                  @click="clearImage('rad_imagen')"
                >
                  <i class="fas fa-trash" />
                </button>
              </div>
            </div>

            <!-- Preview de imagen local (antes de subir) -->
            <div
v-else-if="imagePreview.rad_imagen"
class="image-preview-container pending"
>
              <img
                :src="imagePreview.rad_imagen.preview"
                alt="Preview"
                class="image-preview"
              >
              <div class="image-info">
                <span class="image-name">{{ truncateFileName(imagePreview.rad_imagen.file.name, 20) }}</span>
                <span class="image-size">
                  {{ formatSize(imagePreview.rad_imagen.file.size) }}
                  <span
v-if="imagePreview.rad_imagen.compressedSize"
class="compressed"
>
                    → {{ formatSize(imagePreview.rad_imagen.compressedSize) }}
                  </span>
                </span>
              </div>
              <!-- Barra de progreso -->
              <div
v-if="uploading.rad_imagen"
class="upload-progress-bar"
>
                <div
class="progress-fill"
:style="{ width: uploadProgress.rad_imagen + '%' }"
/>
              </div>
              <div
v-if="!uploading.rad_imagen"
class="image-overlay"
>
                <button
                  type="button"
                  class="btn btn-success btn-sm"
                  @click="confirmUpload('rad_imagen')"
                >
                  <i class="fas fa-check" /> Subir
                </button>
                <button
                  type="button"
                  class="btn btn-danger btn-sm"
                  @click="cancelPreview('rad_imagen')"
                >
                  <i class="fas fa-times" /> Cancelar
                </button>
              </div>
            </div>

            <!-- Dropzone vacío -->
            <div
v-else
class="dropzone-empty"
>
              <i class="fas fa-cloud-upload-alt dropzone-icon" />
              <p class="dropzone-text">
Arrastra una imagen aquí
</p>
              <p class="dropzone-hint">
o haz clic para seleccionar
</p>
              <input
                ref="fileInputRadImagen"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="(e) => handleFileSelect(e, 'rad_imagen')"
              >
            </div>
          </div>

          <!-- Input URL manual -->
          <div class="url-input-container">
            <input
              v-model="formData.rad_imagen"
              placeholder="O pega una URL de imagen aquí..."
              class="input input-sm"
              :class="{ 'input-error': errors.rad_imagen }"
              :disabled="uploading.rad_imagen"
            >
          </div>
          <span
v-if="errors.rad_imagen"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_imagen }}</span>
        </div>

        <!-- Enlace -->
        <div class="md:col-span-2 form-group">
          <label class="label">Enlace Web</label>
          <input
            v-model="formData.rad_enlace"
            placeholder="https://ejemplo.com"
            class="input"
            :class="{ 'input-error': errors.rad_enlace }"
          >
          <span
v-if="errors.rad_enlace"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_enlace }}</span>
        </div>

        <!-- Imagen Alternativa 1 -->
        <div class="form-group">
          <label class="label">Imagen Alternativa 1</label>
          
          <!-- Dropzone para imagen alternativa 1 -->
          <div
            class="image-upload-zone small"
            :class="{ 
              'dragging': dragStates.rad_imgal1, 
              'has-image': formData.rad_imgal1,
              'uploading': uploading.rad_imgal1 
            }"
            @dragenter.prevent="dragStates.rad_imgal1 = true"
            @dragleave.prevent="dragStates.rad_imgal1 = false"
            @dragover.prevent
            @drop.prevent="(e) => handleDrop(e, 'rad_imgal1')"
          >
            <!-- Preview de imagen existente -->
            <div
v-if="formData.rad_imgal1 && !imagePreview.rad_imgal1"
class="image-preview-container"
>
              <img
                :src="formData.rad_imgal1"
                alt="Preview Alt 1"
                class="image-preview"
                @error="handleImageError"
              >
              <div class="image-overlay">
                <button
type="button"
class="btn btn-ghost btn-icon btn-sm"
@click="triggerFileInput('rad_imgal1')"
>
                  <i class="fas fa-camera" />
                </button>
                <button
type="button"
class="btn btn-ghost btn-icon btn-sm text-danger-400"
@click="clearImage('rad_imgal1')"
>
                  <i class="fas fa-trash" />
                </button>
              </div>
            </div>

            <!-- Preview de imagen local -->
            <div
v-else-if="imagePreview.rad_imgal1"
class="image-preview-container pending"
>
              <img
:src="imagePreview.rad_imgal1.preview"
alt="Preview"
class="image-preview"
>
              <div
v-if="uploading.rad_imgal1"
class="upload-progress-bar"
>
                <div
class="progress-fill"
:style="{ width: uploadProgress.rad_imgal1 + '%' }"
/>
              </div>
              <div
v-if="!uploading.rad_imgal1"
class="image-overlay"
>
                <button
type="button"
class="btn btn-success btn-sm"
@click="confirmUpload('rad_imgal1')"
>
                  <i class="fas fa-check" />
                </button>
                <button
type="button"
class="btn btn-danger btn-sm"
@click="cancelPreview('rad_imgal1')"
>
                  <i class="fas fa-times" />
                </button>
              </div>
            </div>

            <!-- Dropzone vacío -->
            <div
v-else
class="dropzone-empty"
>
              <i class="fas fa-image dropzone-icon" />
              <p class="dropzone-hint">
Arrastra o selecciona
</p>
              <input
                ref="fileInputRadImgal1"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="(e) => handleFileSelect(e, 'rad_imgal1')"
              >
            </div>
          </div>
          <span
v-if="errors.rad_imgal1"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_imgal1 }}</span>
        </div>

        <!-- Imagen Alternativa 2 -->
        <div class="form-group">
          <label class="label">Imagen Alternativa 2</label>
          
          <!-- Dropzone para imagen alternativa 2 -->
          <div
            class="image-upload-zone small"
            :class="{ 
              'dragging': dragStates.rad_imgal2, 
              'has-image': formData.rad_imgal2,
              'uploading': uploading.rad_imgal2 
            }"
            @dragenter.prevent="dragStates.rad_imgal2 = true"
            @dragleave.prevent="dragStates.rad_imgal2 = false"
            @dragover.prevent
            @drop.prevent="(e) => handleDrop(e, 'rad_imgal2')"
          >
            <!-- Preview de imagen existente -->
            <div
v-if="formData.rad_imgal2 && !imagePreview.rad_imgal2"
class="image-preview-container"
>
              <img
                :src="formData.rad_imgal2"
                alt="Preview Alt 2"
                class="image-preview"
                @error="handleImageError"
              >
              <div class="image-overlay">
                <button
type="button"
class="btn btn-ghost btn-icon btn-sm"
@click="triggerFileInput('rad_imgal2')"
>
                  <i class="fas fa-camera" />
                </button>
                <button
type="button"
class="btn btn-ghost btn-icon btn-sm text-danger-400"
@click="clearImage('rad_imgal2')"
>
                  <i class="fas fa-trash" />
                </button>
              </div>
            </div>

            <!-- Preview de imagen local -->
            <div
v-else-if="imagePreview.rad_imgal2"
class="image-preview-container pending"
>
              <img
:src="imagePreview.rad_imgal2.preview"
alt="Preview"
class="image-preview"
>
              <div
v-if="uploading.rad_imgal2"
class="upload-progress-bar"
>
                <div
class="progress-fill"
:style="{ width: uploadProgress.rad_imgal2 + '%' }"
/>
              </div>
              <div
v-if="!uploading.rad_imgal2"
class="image-overlay"
>
                <button
type="button"
class="btn btn-success btn-sm"
@click="confirmUpload('rad_imgal2')"
>
                  <i class="fas fa-check" />
                </button>
                <button
type="button"
class="btn btn-danger btn-sm"
@click="cancelPreview('rad_imgal2')"
>
                  <i class="fas fa-times" />
                </button>
              </div>
            </div>

            <!-- Dropzone vacío -->
            <div
v-else
class="dropzone-empty"
>
              <i class="fas fa-image dropzone-icon" />
              <p class="dropzone-hint">
Arrastra o selecciona
</p>
              <input
                ref="fileInputRadImgal2"
                type="file"
                accept="image/*"
                class="hidden-input"
                @change="(e) => handleFileSelect(e, 'rad_imgal2')"
              >
            </div>
          </div>
          <span
v-if="errors.rad_imgal2"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_imgal2 }}</span>
        </div>
      </div>
      </form>

      <div class="modal-footer flex-shrink-0">
        <button
          class="btn btn-secondary"
          @click="confirmClose"
        >
          Cancelar
        </button>
        <button
:disabled="submitting"
class="btn btn-primary"
@click="handleSubmit"
>
          <i
v-if="submitting"
class="fas fa-spinner fa-spin mr-2"
/>
          {{ isEditing ? 'Actualizar' : 'Crear' }} Radio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
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

const emit = defineEmits(['update:show', 'submit'])

const localShow = ref(props.show)
const submitting = ref(false)
const errors = ref({})

// Estados mejorados para upload de imágenes
const uploading = ref({
  rad_imagen: false,
  rad_imgal1: false,
  rad_imgal2: false
})

const uploadProgress = ref({
  rad_imagen: 0,
  rad_imgal1: 0,
  rad_imgal2: 0
})

const dragStates = ref({
  rad_imagen: false,
  rad_imgal1: false,
  rad_imgal2: false
})

const imagePreview = ref({
  rad_imagen: null,
  rad_imgal1: null,
  rad_imgal2: null
})

// Referencias a los inputs de archivo
const fileInputRadImagen = ref(null)
const fileInputRadImgal1 = ref(null)
const fileInputRadImgal2 = ref(null)

const defaultFormData = {
  rad_nombre: '',
  rad_descri: '',
  rad_estado: 'A',
  rad_imagen: '',
  rad_clgeon: '',
  rad_clgeof: '',
  rad_enlace: '',
  rad_imgal1: '',
  rad_imgal2: '',
  rad_identi: ''
}

const formData = ref({ ...defaultFormData })

const isEditing = computed(() => !!props.radio)

watch(() => props.show, (newVal) => {
  localShow.value = newVal
  if (newVal) {
    if (props.radio) {
      formData.value = { ...props.radio }
    } else {
      formData.value = { ...defaultFormData }
    }
    errors.value = {}
    // Limpiar previews al abrir
    imagePreview.value = { rad_imagen: null, rad_imgal1: null, rad_imgal2: null }
  }
})

watch(localShow, (newVal) => {
  emit('update:show', newVal)
})

// Watch para autocompletar el identificador
watch(() => formData.value.rad_nombre, (newNombre) => {
  if (!isEditing.value && newNombre) {
    const identificador = newNombre
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w_-]/g, '')
    formData.value.rad_identi = identificador
  }
})

// =============== FUNCIONES DE UTILIDAD ===============

const formatSize = (bytes) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const truncateFileName = (name, maxLength) => {
  if (name.length <= maxLength) return name
  const ext = name.split('.').pop()
  const nameWithoutExt = name.slice(0, name.lastIndexOf('.'))
  const truncatedName = nameWithoutExt.slice(0, maxLength - ext.length - 4) + '...'
  return `${truncatedName}.${ext}`
}

// =============== FUNCIONES DE COMPRESIÓN ===============

const comprimirImagen = (file, calidad = 0.8, maxWidth = 1200) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      // Calcular dimensiones manteniendo aspect ratio
      let width = img.width
      let height = img.height
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve({ file: compressedFile, compressedSize: blob.size })
          } else {
            resolve({ file, compressedSize: null })
          }
        },
        'image/jpeg',
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

const generarPreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => resolve(null)
    reader.readAsDataURL(file)
  })
}

// =============== MANEJO DE ARCHIVOS ===============

const triggerFileInput = (field) => {
  const inputMap = {
    rad_imagen: fileInputRadImagen,
    rad_imgal1: fileInputRadImgal1,
    rad_imgal2: fileInputRadImgal2
  }
  inputMap[field]?.value?.click()
}

const handleDrop = async (event, field) => {
  dragStates.value[field] = false
  const file = event.dataTransfer.files[0]
  if (file) {
    await processFile(file, field)
  }
}

const handleFileSelect = async (event, field) => {
  const file = event.target.files?.[0]
  if (file) {
    await processFile(file, field)
    event.target.value = ''
  }
}

const processFile = async (file, field) => {
  // Validar que sea imagen
  if (!file.type.startsWith('image/')) {
    errors.value[field] = 'El archivo debe ser una imagen'
    return
  }

  // Validar tamaño máximo (10MB antes de compresión)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    errors.value[field] = 'La imagen no debe superar 10MB'
    return
  }

  errors.value[field] = ''

  try {
    // Generar preview
    const preview = await generarPreview(file)
    
    // Comprimir imagen
    const { file: compressedFile, compressedSize } = await comprimirImagen(file, 0.85, 1200)

    imagePreview.value[field] = {
      file: compressedFile,
      originalFile: file,
      preview,
      compressedSize
    }
  } catch (error) {
    console.error('Error procesando imagen:', error)
    errors.value[field] = 'Error al procesar la imagen'
  }
}

const cancelPreview = (field) => {
  imagePreview.value[field] = null
}

const clearImage = (field) => {
  formData.value[field] = ''
  imagePreview.value[field] = null
}

// =============== UPLOAD A OBS ===============

const confirmUpload = async (field) => {
  const previewData = imagePreview.value[field]
  if (!previewData) return

  uploading.value[field] = true
  uploadProgress.value[field] = 0
  errors.value[field] = ''

  try {
    const file = previewData.file
    const timestamp = Date.now()
    const extension = 'jpg' // Siempre jpg después de compresión
    const radioIdenti = formData.value.rad_identi || formData.value.rad_nombre || 'radio'
    const sanitizedRadioIdenti = radioIdenti.replace(/[^\w_-]/g, '_')
    let objectKey = `${import.meta.env.VITE_PATH_MUSIC}/${sanitizedRadioIdenti}/${field}_${timestamp}.${extension}`

    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('filePath', objectKey)

    // Subir con progreso
    objectKey = await obsServices.SubirFiles(formDataUpload, {
      onProgress: (progress) => {
        uploadProgress.value[field] = progress
      }
    })

    // Obtener URL
    const url = await obsServices.GetLink(objectKey, 525600)
    formData.value[field] = url
    imagePreview.value[field] = null

  } catch (error) {
    console.error('Error subiendo imagen:', error)
    errors.value[field] = 'Error al subir la imagen'
  } finally {
    uploading.value[field] = false
    uploadProgress.value[field] = 0
  }
}

// =============== VALIDACIÓN Y SUBMIT ===============

const validate = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.rad_nombre || formData.value.rad_nombre.trim() === '') {
    errors.value.rad_nombre = 'El nombre es requerido'
    isValid = false
  }

  if (!formData.value.rad_descri || formData.value.rad_descri.trim() === '') {
    errors.value.rad_descri = 'La descripción es requerida'
    isValid = false
  }

  if (!formData.value.rad_estado) {
    errors.value.rad_estado = 'El estado es requerido'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validate()) return

  submitting.value = true
  try {
    await emit('submit', { ...formData.value })
    handleClose()
  } catch (error) {
    console.error('Error al guardar radio:', error)
  } finally {
    submitting.value = false
  }
}

// Verificar si hay cambios sin guardar
const hasUnsavedChanges = () => {
  // Verificar si hay previews pendientes de subir
  if (imagePreview.value.rad_imagen || imagePreview.value.rad_imgal1 || imagePreview.value.rad_imgal2) {
    return true
  }
  
  // Si estamos editando, comparar con los datos originales
  if (isEditing.value && props.radio) {
    return formData.value.rad_nombre !== props.radio.rad_nombre ||
           formData.value.rad_descri !== props.radio.rad_descri ||
           formData.value.rad_estado !== props.radio.rad_estado ||
           formData.value.rad_imagen !== props.radio.rad_imagen ||
           formData.value.rad_imgal1 !== props.radio.rad_imgal1 ||
           formData.value.rad_imgal2 !== props.radio.rad_imgal2 ||
           formData.value.rad_enlace !== props.radio.rad_enlace ||
           formData.value.rad_identi !== props.radio.rad_identi
  }
  
  // Si estamos creando, verificar si hay algo escrito
  return formData.value.rad_nombre.trim() !== '' ||
         formData.value.rad_descri.trim() !== '' ||
         formData.value.rad_imagen !== '' ||
         formData.value.rad_imgal1 !== '' ||
         formData.value.rad_imgal2 !== ''
}

// Confirmar antes de cerrar si hay cambios
const confirmClose = () => {
  if (hasUnsavedChanges()) {
    if (confirm('¿Estás seguro de que quieres cerrar? Los cambios no guardados se perderán.')) {
      handleClose()
    }
  } else {
    handleClose()
  }
}

const handleClose = () => {
  localShow.value = false
  formData.value = { ...defaultFormData }
  errors.value = {}
  uploading.value = { rad_imagen: false, rad_imgal1: false, rad_imgal2: false }
  uploadProgress.value = { rad_imagen: 0, rad_imgal1: 0, rad_imgal2: 0 }
  imagePreview.value = { rad_imagen: null, rad_imgal1: null, rad_imgal2: null }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>

<style scoped>
/* =============== ESTILOS PARA UPLOAD DE IMÁGENES =============== */

.image-upload-zone {
  border: 2px dashed var(--color-border, #374151);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  transition: all 0.3s ease;
  background: var(--color-bg-secondary, #1f2937);
  cursor: pointer;
  position: relative;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-upload-zone.small {
  min-height: 120px;
  padding: 0.75rem;
}

.image-upload-zone:hover {
  border-color: var(--color-primary, #3b82f6);
}

.image-upload-zone.dragging {
  border-color: var(--color-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.02);
}

.image-upload-zone.has-image {
  border-style: solid;
  border-color: var(--color-success, #10b981);
}

.image-upload-zone.uploading {
  pointer-events: none;
  opacity: 0.8;
}

/* Preview de imagen */
.image-preview-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.image-preview-container.pending {
  border: 2px dashed var(--color-warning, #f59e0b);
  border-radius: 8px;
  padding: 0.5rem;
}

.image-preview {
  max-width: 100%;
  max-height: 100px;
  object-fit: contain;
  border-radius: 8px;
}

.image-info {
  margin-top: 0.5rem;
  text-align: center;
}

.image-name {
  font-size: 0.75rem;
  color: var(--color-text-primary, #f3f4f6);
  display: block;
}

.image-size {
  font-size: 0.7rem;
  color: var(--color-text-tertiary, #6b7280);
}

.image-size .compressed {
  color: var(--color-success, #10b981);
  font-weight: 500;
}

/* Overlay con acciones */
.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  border-radius: 0 0 8px 8px;
}

.image-preview-container:hover .image-overlay,
.image-preview-container.pending .image-overlay {
  opacity: 1;
}

/* Barra de progreso */
.upload-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-bg-tertiary, #111827);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
}

.upload-progress-bar .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary, #3b82f6), #8b5cf6);
  transition: width 0.2s ease;
}

/* Dropzone vacío */
.dropzone-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: 100%;
  cursor: pointer;
}

.dropzone-icon {
  font-size: 2rem;
  color: var(--color-text-tertiary, #6b7280);
}

.image-upload-zone.small .dropzone-icon {
  font-size: 1.5rem;
}

.dropzone-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary, #f3f4f6);
  margin: 0;
}

.dropzone-hint {
  font-size: 0.75rem;
  color: var(--color-text-tertiary, #6b7280);
  margin: 0;
}

.hidden-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Input URL */
.url-input-container {
  margin-top: 0.5rem;
}

.url-input-container .input {
  font-size: 0.75rem;
}

/* Botones pequeños */
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn-success {
  background: var(--color-success, #10b981);
  color: white;
}

.btn-success:hover {
  background: #059669;
}

.btn-danger {
  background: var(--color-danger, #ef4444);
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}
</style>
