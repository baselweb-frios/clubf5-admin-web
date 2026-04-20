<template>
  <div class="page-wrapper">
    <!-- Header Section -->
    <div class="page-content">
      <div class="flex-between mb-8 pb-6 border-b border-dark-border">
        <div>
          <h1 class="text-3xl font-bold text-text-primary mb-2">
            {{ isEditing ? 'Editar Programación' : 'Nueva Programación' }}
          </h1>
          <p class="text-text-secondary">
Crea una nueva programación musical para tu sistema
</p>
        </div>
      </div>

      <!-- Form Container -->
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Main Form Card -->
        <div class="md:col-span-2">
          <div class="card">
            <div class="flex-start gap-3 mb-6 pb-6 border-b border-dark-border">
              <i class="fas fa-music text-2xl text-primary-400" />
              <div>
                <h2 class="text-xl font-bold text-text-primary">
                  {{ isEditing ? 'Editar Programación Musical' : 'Crear Nueva Programación' }}
                </h2>
                <p class="text-sm text-text-secondary">
Configure los detalles básicos de su programación
</p>
              </div>
            </div>

            <form
class="space-y-6"
@submit.prevent="guardarProgramacion"
>
              <div class="form-group">
                <label
for="nombreProgramacion"
class="label"
>
                  Nombre de la Programación
                  <span class="text-danger-400 ml-1">*</span>
                </label>
                <input
                  id="nombreProgramacion"
                  v-model="nombreProgramacion"
                  type="text"
                  class="input"
                  placeholder="Ingrese el nombre de la programación musical"
                  required
                  autocomplete="off"
                >
                <small class="text-text-tertiary text-xs">Este nombre identificará su programación en el sistema</small>
              </div>

              <div class="flex-end gap-3 pt-6 border-t border-dark-border">
                <button
type="button"
class="btn btn-secondary"
@click="cancelar"
>
                  <i class="fas fa-times" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading || !nombreProgramacion.trim()"
                >
                  <i
v-if="isLoading"
class="fas fa-spinner fa-spin"
/>
                  <i
v-else
class="fas fa-check"
/>
                  {{ isEditing ? 'Actualizar' : 'Crear Programación' }}
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Info Sidebar -->
        <div class="md:col-span-1">
          <div class="card">
            <h3 class="text-lg font-bold text-text-primary mb-4 flex-start gap-2">
              <i class="fas fa-lightbulb text-warning-400" />
              Consejos
            </h3>
            <div class="space-y-4">
              <div class="p-3 bg-dark-secondary rounded-lg">
                <p class="font-semibold text-text-primary text-sm">
🎯 Nombre descriptivo
</p>
                <p class="text-xs text-text-tertiary mt-1">
Use nombres que identifiquen claramente el tipo de programación
</p>
              </div>
              <div class="p-3 bg-dark-secondary rounded-lg">
                <p class="font-semibold text-text-primary text-sm">
⚡ Programe eficientemente
</p>
                <p class="text-xs text-text-tertiary mt-1">
Después de crear la programación podrá asignar radios y horarios
</p>
              </div>
              <div class="p-3 bg-dark-secondary rounded-lg">
                <p class="font-semibold text-text-primary text-sm">
🎵 Organice por géneros
</p>
                <p class="text-xs text-text-tertiary mt-1">
Considere crear programaciones específicas por tipo de música
</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <LoadingOverlay
      v-if="isLoading"
      message="Guardando programación..."
    />

    <!-- Success Modal -->
    <div
v-if="showSuccess"
class="modal-backdrop"
@click.self="showSuccess = false"
>
      <div class="modal max-w-sm">
        <div class="modal-body text-center py-8">
          <div class="flex-center mb-4">
            <div class="w-16 h-16 rounded-full bg-success-500/20 flex-center">
              <i class="fas fa-check text-3xl text-success-400" />
            </div>
          </div>
          <h3 class="text-xl font-bold text-text-primary mb-2">
            ¡Programación {{ isEditing ? 'actualizada' : 'creada' }} exitosamente!
          </h3>
          <p class="text-text-secondary">
Redirigiendo al listado de programaciones...
</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import RadioServices from '@/services/RadioServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'

const router = useRouter()
const route = useRoute()

// State
const nombreProgramacion = ref('')
const codigoProgramacion = ref(route.params.codigoProgramacion || '0')
const isLoading = ref(false)
const showSuccess = ref(false)

// Computed
const isEditing = computed(() => {
  return codigoProgramacion.value && parseInt(codigoProgramacion.value) > 0
})

// Methods
const guardarProgramacion = async () => {
  if (!nombreProgramacion.value.trim()) {
    alert('El nombre de la programación es obligatorio')
    return
  }

  try {
    isLoading.value = true

    await RadioServices.altaProgramacion(
      parseInt(codigoProgramacion.value),
      nombreProgramacion.value
    )

    showSuccess.value = true

    setTimeout(() => {
      router.push({ name: 'ProgramaMusica' })
    }, 2000)

  } catch (error) {
    console.error('Error al guardar programación:', error)

    let mensaje = 'Error al guardar la programación'
    if (error.response?.data?.errorMessage) {
      mensaje = error.response.data.errorMessage
    } else if (error.message) {
      mensaje = error.message
    }

    alert(mensaje)

  } finally {
    isLoading.value = false
  }
}

const cancelar = () => {
  router.push({ name: 'ProgramaMusica' })
}

const verificarParametros = () => {
  const nombreParam = route.params.nombreProgramacion

  if (isEditing.value && nombreParam && nombreParam !== 'nueva') {
    nombreProgramacion.value = decodeURIComponent(nombreParam)
  }
}

// Lifecycle
onMounted(() => {
  verificarParametros()
})
</script>

