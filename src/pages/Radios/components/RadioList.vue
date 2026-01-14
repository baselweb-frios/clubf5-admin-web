<template>
  <div class="card">
    <div class="space-y-4">
      <!-- Título y Botón de Acción -->
      <div class="flex-between">
        <div>
          <h3 class="text-2xl font-bold text-text-primary">
Gestión de Radios
</h3>
          <p class="text-sm text-text-secondary mt-1">
Administra las radios del sistema
</p>
        </div>
        <button
class="btn btn-primary btn-sm"
@click="$emit('create')"
>
          <i class="fas fa-plus-square" />
          Nueva Radio
        </button>
      </div>

      <!-- Barra de Búsqueda -->
      <div>
        <input
v-model="searchQuery"
type="search" 
          placeholder="Buscar por nombre, descripción o identificador..."
class="input"
>
      </div>
    </div>
    
    <div class="border-t border-dark-border mt-4 pt-4">
<loading-spinner
v-if="loading"
class="py-12"
/>

    <div
v-else-if="filteredRadios.length === 0"
class="text-center py-16"
>
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dark-secondary mb-4">
        <svg
class="h-8 w-8 text-text-tertiary"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
          <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
/>
        </svg>
      </div>
      <h3 class="text-base font-medium text-text-primary">
No hay radios registradas
</h3>
      <p class="mt-2 text-sm text-text-secondary">
Comienza creando una nueva radio para el sistema
</p>
      <div class="mt-6">
        <button
class="btn btn-primary"
@click="$emit('create')"
>
          <svg
class="w-5 h-5 mr-2"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M12 4v16m8-8H4"
/>
          </svg>
          Crear Primera Radio
        </button>
      </div>
    </div>

    <div
v-else
class="table-container mt-4"
>
      <table class="table">
        <thead>
          <tr>
            <th>Radio</th>
            <th>Identificador</th>
            <th>Estado</th>
            <th>Archivos</th>
            <th class="text-right">
Acciones
</th>
          </tr>
        </thead>
        <tbody>
          <tr
v-for="radio in filteredRadios"
:key="radio.rad_codigo"
>
            <td>
              <div class="flex items-center gap-3">
                <div class="flex-shrink-0 h-10 w-10">
                  <img
v-if="radio.rad_imagen"
class="h-10 w-10 rounded-full object-cover"
:src="radio.rad_imagen"
                    :alt="radio.rad_nombre"
@error="handleImageError"
>
                  <div
v-else
class="h-10 w-10 rounded-full bg-dark-secondary flex-center"
>
                    <svg
class="h-6 w-6 text-text-tertiary"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                      <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
/>
                    </svg>
                  </div>
                </div>
                <div>
                  <div class="text-sm font-medium text-text-primary">
{{ radio.rad_nombre }}
</div>
                  <div class="text-sm text-text-secondary">
{{ radio.rad_descri }}
</div>
                </div>
              </div>
            </td>
            <td>
              <span class="text-sm text-text-primary">{{ radio.rad_identi || '-' }}</span>
            </td>
            <td>
              <span
:class="[
                'badge',
                radio.rad_estado === 'A' ? 'badge-success' : 'badge-danger'
              ]"
>
                {{ radio.rad_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td>
              <div class="flex items-center gap-2">
                <span
v-if="fileCounts[radio.rad_nombre] === undefined"
class="text-text-tertiary"
>
                  <svg
class="animate-spin h-4 w-4"
fill="none"
viewBox="0 0 24 24"
>
                    <circle
class="opacity-25"
cx="12"
cy="12"
r="10"
stroke="currentColor"
stroke-width="4"
/>
                    <path
class="opacity-75"
fill="currentColor"
d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
/>
                  </svg>
                </span>
                <span
v-else
class="badge badge-info"
>
                  <svg
class="w-3 h-3 mr-1"
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
                  {{ fileCounts[radio.rad_nombre] }}
                </span>
              </div>
            </td>
            <td class="text-right">
              <div class="flex items-center justify-end gap-2">
                <button
class="btn btn-ghost btn-icon"
                  title="Ver música en OBS"
@click="$emit('view-music', radio)"
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
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
/>
                  </svg>
                </button>
                <button
class="btn btn-ghost btn-icon"
                  title="Configurar géneros, ritmos, tipos y estilos"
@click="$emit('manage-relations', radio)"
>
                  <i class="fas fa-cog w-5 h-5" />
                </button>
                <button
class="btn btn-ghost btn-icon"
                  title="Editar radio"
@click="$emit('edit', radio)"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
/>
                  </svg>
                </button>
                <button
class="btn btn-ghost btn-icon text-danger-400 hover:text-danger-300"
                  title="Eliminar radio"
@click="$emit('delete', radio)"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import obsServices from '@/services/obsServices'

const props = defineProps({
  radios: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['create', 'edit', 'delete', 'view-music', 'manage-relations', 'sync-obs'])

const searchQuery = ref('')
const fileCounts = ref({})

// Cargar conteo de archivos para cada radio
const loadFileCounts = async () => {
  for (const radio of props.radios) {
    if (!radio.rad_nombre) continue

    try {
      const result = await obsServices.ListarObject(radio.rad_nombre)
      // Contar solo archivos (no carpetas) de forma recursiva
      const fileCount = countFiles(result, radio.rad_nombre)
      fileCounts.value[radio.rad_nombre] = fileCount
    } catch (error) {
      console.error(`Error al cargar archivos de ${radio.rad_nombre}:`, error)
      fileCounts.value[radio.rad_nombre] = 0
    }
  }
}

// Función recursiva para contar archivos (excluyendo carpetas)
const countFiles = (objects, prefix) => {
  let count = 0
  for (const obj of objects) {
    const isFolder = obj.objectKey.endsWith('/')
    if (!isFolder) {
      count++
    }
  }
  return count
}

// Observar cambios en las radios para recargar conteos
watch(() => props.radios, (newRadios) => {
  if (newRadios && newRadios.length > 0) {
    fileCounts.value = {}
    loadFileCounts()
  }
}, { immediate: true })

const filteredRadios = computed(() => {
  if (!searchQuery.value) return props.radios

  const query = searchQuery.value.toLowerCase()
  return props.radios.filter(radio =>
    radio.rad_nombre?.toLowerCase().includes(query) ||
    radio.rad_descri?.toLowerCase().includes(query) ||
    radio.rad_identi?.toLowerCase().includes(query)
  )
})

const handleImageError = (event) => {
  event.target.style.display = 'none'
  event.target.nextElementSibling.style.display = 'flex'
}
</script>

