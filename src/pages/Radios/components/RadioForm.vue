<template>
  <modal v-model="localShow" :title="isEditing ? 'Editar Radio' : 'Nueva Radio'" size="lg" @close="handleClose">
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Nombre -->
        <base-input
          v-model="formData.rad_nombre"
          label="Nombre"
          placeholder="Ingrese el nombre de la radio"
          required
          :error="errors.rad_nombre"
        />

        <!-- Identificador -->
        <base-input
          v-model="formData.rad_identi"
          label="Identificador"
          placeholder="ID único de la radio"
          hint="Se genera automáticamente desde el nombre, pero puedes editarlo"
          :error="errors.rad_identi"
        />

        <!-- Estado -->
        <base-select
          v-model="formData.rad_estado"
          label="Estado"
          required
          :error="errors.rad_estado"
          :options="estadoOptions"
          value-key="value"
          label-key="label"
        />

        <!-- Descripción -->
        <div class="md:col-span-2">
          <base-input
            v-model="formData.rad_descri"
            label="Descripción"
            placeholder="Descripción de la radio"
            required
            :error="errors.rad_descri"
          />
        </div>

        <!-- URL de Imagen -->
        <div class="md:col-span-2">
          <base-input
            v-model="formData.rad_imagen"
            label="URL de Imagen"
            placeholder="https://ejemplo.com/imagen.jpg"
            :error="errors.rad_imagen"
          />
          <div v-if="formData.rad_imagen" class="mt-2">
            <img
              :src="formData.rad_imagen"
              alt="Preview"
              class="h-20 w-20 rounded object-cover"
              @error="handleImageError"
            />
          </div>
        </div>

        <!-- Enlace -->
        <div class="md:col-span-2">
          <base-input
            v-model="formData.rad_enlace"
            label="Enlace Web"
            placeholder="https://ejemplo.com"
            :error="errors.rad_enlace"
          />
        </div>


        <!-- Imagen Alternativa 1 -->
        <base-input
          v-model="formData.rad_imgal1"
          label="Imagen Alternativa 1"
          placeholder="URL de imagen alternativa"
          :error="errors.rad_imgal1"
        />

        <!-- Imagen Alternativa 2 -->
        <base-input
          v-model="formData.rad_imgal2"
          label="Imagen Alternativa 2"
          placeholder="URL de imagen alternativa"
          :error="errors.rad_imgal2"
        />
      </div>
    </form>

    <template #footer>
      <base-button variant="secondary" @click="handleClose">
        Cancelar
      </base-button>
      <base-button variant="primary" @click="handleSubmit" :disabled="submitting">
        <loading-spinner v-if="submitting" class="mr-2" size="sm" />
        {{ isEditing ? 'Actualizar' : 'Crear' }} Radio
      </base-button>
    </template>
  </modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

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

// Opciones para el select de estado
const estadoOptions = [
  { value: 'A', label: 'Activo' },
  { value: 'I', label: 'Inactivo' }
]

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
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}
</script>
