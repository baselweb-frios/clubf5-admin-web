<template>
  <div
v-if="localShow"
class="modal-backdrop"
@click.self="handleClose"
>
    <div class="modal">
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-text-primary">
{{ isEditing ? 'Editar Radio' : 'Nueva Radio' }}
</h3>
        <button
class="btn btn-ghost btn-icon"
@click="handleClose"
>
          <i class="fas fa-times" />
        </button>
      </div>
      <form
class="modal-body space-y-6"
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
          <div class="flex gap-2">
            <input
              v-model="formData.rad_imagen"
              placeholder="https://ejemplo.com/imagen.jpg"
              class="input flex-1"
              :class="{ 'input-error': errors.rad_imagen }"
            >
            <label class="btn btn-secondary cursor-pointer">
              <i
v-if="uploading.rad_imagen"
class="fas fa-spinner fa-spin"
/>
              <i
v-else
class="fas fa-upload"
/>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="uploading.rad_imagen"
                @change="(e) => uploadImage(e, 'rad_imagen')"
              >
            </label>
          </div>
          <p class="text-text-tertiary text-xs mt-1">
Puedes pegar una URL o subir una imagen
</p>
          <div
v-if="formData.rad_imagen"
class="mt-2"
>
            <img
              :src="formData.rad_imagen"
              alt="Preview"
              class="h-20 w-20 rounded object-cover"
              @error="handleImageError"
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
          <div class="flex gap-2">
            <input
              v-model="formData.rad_imgal1"
              placeholder="URL de imagen alternativa"
              class="input flex-1"
              :class="{ 'input-error': errors.rad_imgal1 }"
            >
            <label class="btn btn-secondary cursor-pointer">
              <i
v-if="uploading.rad_imgal1"
class="fas fa-spinner fa-spin"
/>
              <i
v-else
class="fas fa-upload"
/>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="uploading.rad_imgal1"
                @change="(e) => uploadImage(e, 'rad_imgal1')"
              >
            </label>
          </div>
          <div
v-if="formData.rad_imgal1"
class="mt-2"
>
            <img
              :src="formData.rad_imgal1"
              alt="Preview Alt 1"
              class="h-16 w-16 rounded object-cover"
              @error="handleImageError"
            >
          </div>
          <span
v-if="errors.rad_imgal1"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_imgal1 }}</span>
        </div>

        <!-- Imagen Alternativa 2 -->
        <div class="form-group">
          <label class="label">Imagen Alternativa 2</label>
          <div class="flex gap-2">
            <input
              v-model="formData.rad_imgal2"
              placeholder="URL de imagen alternativa"
              class="input flex-1"
              :class="{ 'input-error': errors.rad_imgal2 }"
            >
            <label class="btn btn-secondary cursor-pointer">
              <i
v-if="uploading.rad_imgal2"
class="fas fa-spinner fa-spin"
/>
              <i
v-else
class="fas fa-upload"
/>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                :disabled="uploading.rad_imgal2"
                @change="(e) => uploadImage(e, 'rad_imgal2')"
              >
            </label>
          </div>
          <div
v-if="formData.rad_imgal2"
class="mt-2"
>
            <img
              :src="formData.rad_imgal2"
              alt="Preview Alt 2"
              class="h-16 w-16 rounded object-cover"
              @error="handleImageError"
            >
          </div>
          <span
v-if="errors.rad_imgal2"
class="text-danger-400 text-xs mt-1"
>{{ errors.rad_imgal2 }}</span>
        </div>
      </div>
      </form>

      <div class="modal-footer">
        <button
class="btn btn-secondary"
@click="handleClose"
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
const uploading = ref({
  rad_imagen: false,
  rad_imgal1: false,
  rad_imgal2: false
})

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
    console.log('=== RadioForm watch props.show ===')
    console.log('Modal abierto, props.radio:', props.radio)
    console.log('Propiedades de props.radio:', props.radio ? Object.keys(props.radio) : 'props.radio es null')

    if (props.radio) {
      formData.value = { ...props.radio }
      console.log('formData después de asignar:', formData.value)
      console.log('rad_nombre:', formData.value.rad_nombre)
      console.log('rad_codigo:', formData.value.rad_codigo)
    } else {
      formData.value = { ...defaultFormData }
      console.log('Usando defaultFormData (modo crear)')
    }
    errors.value = {}
  }
})

watch(localShow, (newVal) => {
  emit('update:show', newVal)
})

// Watch para autocompletar el identificador basándose en el nombre
// Solo en modo creación (no edición)
watch(() => formData.value.rad_nombre, (newNombre) => {
  // Solo autocompleta si estamos creando (no editando)
  if (!isEditing.value && newNombre) {
    // Convertir el nombre a identificador: reemplazar espacios por guiones bajos
    // y convertir a minúsculas (opcional, según preferencia)
    const identificador = newNombre
      .trim()
      .replace(/\s+/g, '_')  // Reemplazar espacios (uno o más) por _
      .replace(/[^\w_-]/g, '') // Eliminar caracteres especiales excepto _ y -

    formData.value.rad_identi = identificador
  }
})

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

const handleClose = () => {
  localShow.value = false
  formData.value = { ...defaultFormData }
  errors.value = {}
  // Reset uploading states
  uploading.value = {
    rad_imagen: false,
    rad_imgal1: false,
    rad_imgal2: false
  }
}

// Función para subir imagen a OBS y obtener URL
const uploadImage = async (event, field) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    errors.value[field] = 'El archivo debe ser una imagen'
    return
  }

  // Validar tamaño máximo (5MB)
  const maxSize = 5 * 1024 * 1024
  if (file.size > maxSize) {
    errors.value[field] = 'La imagen no debe superar 5MB'
    return
  }

  uploading.value[field] = true
  errors.value[field] = ''

  try {
    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const radioIdenti = formData.value.rad_identi || formData.value.rad_nombre || 'radio'
    const sanitizedRadioIdenti = radioIdenti
    const objectKey = `${import.meta.env.VITE_PATH_MUSIC}/${sanitizedRadioIdenti}/${field}_${timestamp}.${extension}`

    // Crear FormData para subir
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)
    formDataUpload.append('filePath', objectKey)

    // Subir archivo a OBS
    await obsServices.SubirFiles(formDataUpload)

    // Obtener URL del archivo subido
    const url = await obsServices.GetLink(objectKey, 525600) // 1 año de expiración
    
    // Setear la URL en el campo correspondiente
    formData.value[field] = url

    // Limpiar el input file
    event.target.value = ''

  } catch (error) {
    console.error('Error al subir imagen:', error)
    errors.value[field] = 'Error al subir la imagen'
  } finally {
    uploading.value[field] = false
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>
