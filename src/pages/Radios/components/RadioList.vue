<template>
  <base-card>
    <template #header>
      <div class="space-y-4">
        <!-- Título y Botón de Acción -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-2xl font-bold text-white">Gestión de Radios</h3>
            <p class="text-sm text-gray-400 mt-1">Administra las radios del sistema</p>
          </div>
          <base-button variant="primary" @click="$emit('create')">
            <i class="fa fa-plus-square"></i>
            Nueva Radio
          </base-button>
        </div>

        <!-- Barra de Búsqueda -->
        <div>
          <base-input v-model="searchQuery" type="search"
            placeholder="Buscar por nombre, descripción o identificador..." class="w-full rounded-md" />
        </div>
      </div>
    </template>

    <loading-spinner v-if="loading" class="py-12" />

    <div v-else-if="filteredRadios.length === 0" class="text-center py-16">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z">
          </path>
        </svg>
      </div>
      <h3 class="text-base font-medium text-white">No hay radios registradas</h3>
      <p class="mt-2 text-sm text-gray-400">Comienza creando una nueva radio para el sistema</p>
      <div class="mt-6">
        <base-button variant="primary" @click="$emit('create')">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Crear Primera Radio
        </base-button>
      </div>
    </div>

    <div v-else class="overflow-x-auto" style="max-width: 100vw; overflow-x: scroll;">
      <table class="min-w-full divide-y divide-gray-700">
        <thead class="bg-gray-800">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Radio
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Identificador
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Archivos
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-gray-900 divide-y divide-gray-700">
          <tr v-for="radio in filteredRadios" :key="radio.rad_codigo" class="hover:bg-gray-800 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10">
                  <img v-if="radio.rad_imagen" class="h-10 w-10 rounded-full object-cover" :src="radio.rad_imagen"
                    :alt="radio.rad_nombre" @error="handleImageError" />
                  <div v-else class="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z">
                      </path>
                    </svg>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-white">{{ radio.rad_nombre }}</div>
                  <div class="text-sm text-gray-400">{{ radio.rad_descri }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-300">{{ radio.rad_identi || '-' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                radio.rad_estado === 'A' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
              ]">
                {{ radio.rad_estado === 'A' ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center gap-2">
                <span v-if="fileCounts[radio.rad_nombre] === undefined" class="text-gray-500">
                  <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </span>
                <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900 text-blue-200">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                  </svg>
                  {{ fileCounts[radio.rad_nombre] }}
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-1.5">
                <button @click="$emit('view-music', radio)"
                  class="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 transition-all duration-200"
                  title="Ver música en OBS">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3">
                    </path>
                  </svg>
                </button>
                <button @click="$emit('manage-relations', radio)"
                  class="p-2 rounded-lg text-green-400 hover:text-green-300 hover:bg-green-900/20 transition-all duration-200"
                  title="Configurar géneros, ritmos, tipos y estilos">
                  <i class="fas fa-cog w-5 h-5"></i>
                </button>
                <button @click="$emit('edit', radio)"
                  class="p-2 rounded-lg text-indigo-400 hover:text-indigo-300 hover:bg-indigo-900/20 transition-all duration-200"
                  title="Editar radio">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>
                <button @click="$emit('delete', radio)"
                  class="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
                  title="Eliminar radio">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                    </path>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </base-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
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

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
