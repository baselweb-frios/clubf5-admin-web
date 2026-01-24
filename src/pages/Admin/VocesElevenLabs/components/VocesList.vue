<template>
  <base-card class="voces-list">
    <div class="card-header">
      <h2 class="card-title">
        <i class="fas fa-list mr-2"></i>
        Lista de Voces
      </h2>
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar voz..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-container">
      <div class="filter-group">
        <label class="filter-label">Género</label>
        <select v-model="filtroGenero" class="filter-select">
          <option value="">Todos</option>
          <option v-for="genero in generosUnicos" :key="genero" :value="genero">
            {{ genero }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Idioma</label>
        <select v-model="filtroIdioma" class="filter-select">
          <option value="">Todos</option>
          <option v-for="idioma in idiomasUnicos" :key="idioma" :value="idioma">
            {{ idioma }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Categoría</label>
        <select v-model="filtroCategoria" class="filter-select">
          <option value="">Todas</option>
          <option v-for="categoria in categoriasUnicas" :key="categoria" :value="categoria">
            {{ categoria }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Variaciones</label>
        <select v-model="filtroVariaciones" class="filter-select">
          <option value="">Todas</option>
          <option value="0">Sin variaciones</option>
          <option value="1-5">1 - 5</option>
          <option value="6+">6 o más</option>
        </select>
      </div>

      <button
        v-if="hayFiltrosActivos"
        class="btn-clear-filters"
        @click="limpiarFiltros"
      >
        <i class="fas fa-times mr-1"></i>
        Limpiar
      </button>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoria</th>
            <th>Idioma</th>
            <th>Genero</th>
            <th class="text-center">Variaciones</th>
            <th>Estado</th>
            <th>Preview</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="8" class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-2xl text-primary-400"></i>
              <p class="mt-2 text-gray-400">Cargando voces...</p>
            </td>
          </tr>
          <tr v-else-if="filteredVoces.length === 0">
            <td colspan="8" class="text-center py-8">
              <i class="fas fa-microphone-slash text-2xl text-gray-500"></i>
              <p class="mt-2 text-gray-400">
                {{ searchQuery ? 'No se encontraron voces' : 'No hay voces sincronizadas' }}
              </p>
            </td>
          </tr>
          <tr v-else v-for="voz in paginatedVoces" :key="voz.vel_codigo">
            <td>
              <div class="voz-name">
                <i class="fas fa-microphone text-primary-400 mr-2"></i>
                <span class="font-medium">{{ voz.vel_nombre }}</span>
              </div>
            </td>
            <td>
              <span class="badge badge-info">{{ voz.vel_categoria || 'N/A' }}</span>
            </td>
            <td>{{ voz.vel_idioma || 'N/A' }}</td>
            <td>
              <span v-if="voz.vel_genero" class="badge" :class="getGeneroBadgeClass(voz.vel_genero)">
                {{ voz.vel_genero }}
              </span>
              <span v-else class="text-gray-500">N/A</span>
            </td>
            <td class="text-center">
              <span class="badge badge-purple">
                {{ props.variacionesCount[voz.vel_codigo] || 0 }}
              </span>
            </td>
            <td>
              <span
                class="badge cursor-pointer"
                :class="voz.vel_estado === 'A' ? 'badge-success' : 'badge-danger'"
                @click="$emit('toggle-estado', voz)"
              >
                {{ voz.vel_estado === 'A' ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td>
              <button
                v-if="voz.vel_preview_url"
                class="btn-preview"
                @click="playPreview(voz)"
                :disabled="playingVoiceId === voz.vel_codigo"
              >
                <i :class="playingVoiceId === voz.vel_codigo ? 'fas fa-stop' : 'fas fa-play'"></i>
              </button>
              <span v-else class="text-gray-500">-</span>
            </td>
            <td>
              <div class="actions">
                <button
                  class="btn-action btn-view"
                  title="Ver detalle y variaciones"
                  @click="$emit('ver-detalle', voz)"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  class="btn-action btn-delete"
                  title="Eliminar voz"
                  @click="$emit('eliminar', voz)"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        class="page-btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">
        Pagina {{ currentPage }} de {{ totalPages }}
      </span>
      <button
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- Audio element for preview -->
    <audio ref="audioPlayer" @ended="playingVoiceId = null"></audio>
  </base-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'

const props = defineProps({
  voces: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  variacionesCount: {
    type: Object,
    default: () => ({})
  }
})

defineEmits(['toggle-estado', 'ver-detalle', 'eliminar'])

// State
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = 10
const playingVoiceId = ref(null)
const audioPlayer = ref(null)

// Filtros
const filtroGenero = ref('')
const filtroIdioma = ref('')
const filtroCategoria = ref('')
const filtroVariaciones = ref('')

// Opciones únicas para filtros (computed)
const generosUnicos = computed(() => {
  const generos = new Set()
  props.voces.forEach(voz => {
    if (voz.vel_genero) generos.add(voz.vel_genero)
  })
  return Array.from(generos).sort()
})

const idiomasUnicos = computed(() => {
  const idiomas = new Set()
  props.voces.forEach(voz => {
    if (voz.vel_idioma) idiomas.add(voz.vel_idioma)
  })
  return Array.from(idiomas).sort()
})

const categoriasUnicas = computed(() => {
  const categorias = new Set()
  props.voces.forEach(voz => {
    if (voz.vel_categoria) categorias.add(voz.vel_categoria)
  })
  return Array.from(categorias).sort()
})

// Computed para verificar si hay filtros activos
const hayFiltrosActivos = computed(() => {
  return filtroGenero.value || filtroIdioma.value || filtroCategoria.value || filtroVariaciones.value
})

// Computed
const filteredVoces = computed(() => {
  let resultado = props.voces

  // Filtro de búsqueda por texto
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    resultado = resultado.filter(voz =>
      voz.vel_nombre?.toLowerCase().includes(query) ||
      voz.vel_categoria?.toLowerCase().includes(query) ||
      voz.vel_idioma?.toLowerCase().includes(query) ||
      voz.vel_genero?.toLowerCase().includes(query)
    )
  }

  // Filtro por género
  if (filtroGenero.value) {
    resultado = resultado.filter(voz => voz.vel_genero === filtroGenero.value)
  }

  // Filtro por idioma
  if (filtroIdioma.value) {
    resultado = resultado.filter(voz => voz.vel_idioma === filtroIdioma.value)
  }

  // Filtro por categoría
  if (filtroCategoria.value) {
    resultado = resultado.filter(voz => voz.vel_categoria === filtroCategoria.value)
  }

  // Filtro por variaciones
  if (filtroVariaciones.value) {
    resultado = resultado.filter(voz => {
      const count = props.variacionesCount[voz.vel_codigo] || 0
      switch (filtroVariaciones.value) {
        case '0':
          return count === 0
        case '1-5':
          return count >= 1 && count <= 5
        case '6+':
          return count >= 6
        default:
          return true
      }
    })
  }

  return resultado
})

const totalPages = computed(() =>
  Math.ceil(filteredVoces.value.length / pageSize)
)

const paginatedVoces = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredVoces.value.slice(start, end)
})

// Methods
const getGeneroBadgeClass = (genero) => {
  const g = genero?.toLowerCase()
  if (g === 'male' || g === 'masculino') return 'badge-primary'
  if (g === 'female' || g === 'femenino') return 'badge-pink'
  return 'badge-secondary'
}

const playPreview = async (voz) => {
  if (playingVoiceId.value === voz.vel_codigo) {
    // Stop playing
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
    playingVoiceId.value = null
    return
  }

  try {
    playingVoiceId.value = voz.vel_codigo
    audioPlayer.value.src = voz.vel_preview_url
    await audioPlayer.value.play()
  } catch (error) {
    console.error('Error playing preview:', error)
    playingVoiceId.value = null
  }
}

const limpiarFiltros = () => {
  filtroGenero.value = ''
  filtroIdioma.value = ''
  filtroCategoria.value = ''
  filtroVariaciones.value = ''
}

// Watch - resetear página cuando cambien los filtros
watch([searchQuery, filtroGenero, filtroIdioma, filtroCategoria, filtroVariaciones], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.voces-list {
  @apply overflow-hidden;
}

.card-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border-b border-gray-700;
}

.card-title {
  @apply text-lg font-semibold text-white;
}

.search-box {
  @apply relative;
}

.search-box i {
  @apply absolute left-3 top-1/2 -translate-y-1/2 text-gray-400;
}

.search-input {
  @apply pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 w-64;
}

.filters-container {
  @apply flex flex-wrap items-end gap-4 p-4 bg-gray-800/50 border-b border-gray-700;
}

.filter-group {
  @apply flex flex-col gap-1;
}

.filter-label {
  @apply text-xs font-medium text-gray-400 uppercase;
}

.filter-select {
  @apply px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500 min-w-[140px];
}

.btn-clear-filters {
  @apply px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors;
}

.table-container {
  @apply overflow-x-auto;
}

.data-table {
  @apply w-full;
}

.data-table th {
  @apply px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider bg-gray-800;
}

.data-table td {
  @apply px-4 py-3 text-sm text-gray-300 border-b border-gray-700;
}

.data-table tbody tr:hover {
  @apply bg-gray-800/50;
}

.voz-name {
  @apply flex items-center;
}

.badge {
  @apply px-2 py-1 text-xs font-medium rounded-full;
}

.badge-info {
  @apply bg-blue-500/20 text-blue-400;
}

.badge-success {
  @apply bg-green-500/20 text-green-400;
}

.badge-danger {
  @apply bg-red-500/20 text-red-400;
}

.badge-primary {
  @apply bg-primary-500/20 text-primary-400;
}

.badge-pink {
  @apply bg-pink-500/20 text-pink-400;
}

.badge-secondary {
  @apply bg-gray-500/20 text-gray-400;
}

.badge-purple {
  @apply bg-purple-500/20 text-purple-400;
}

.btn-preview {
  @apply w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 hover:bg-primary-500/40 transition-colors disabled:opacity-50;
}

.actions {
  @apply flex items-center justify-center gap-2;
}

.btn-action {
  @apply w-8 h-8 rounded-lg flex items-center justify-center transition-colors;
}

.btn-view {
  @apply bg-blue-500/20 text-blue-400 hover:bg-blue-500/40;
}

.btn-delete {
  @apply bg-red-500/20 text-red-400 hover:bg-red-500/40;
}

.pagination {
  @apply flex items-center justify-center gap-4 p-4 border-t border-gray-700;
}

.page-btn {
  @apply w-8 h-8 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed;
}

.page-info {
  @apply text-sm text-gray-400;
}
</style>
