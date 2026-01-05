<template>
  <div id="ProgramaMusicaContainer" class="programa-musica-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
          </svg>
        </div>
        <div class="header-text">
          <h1 class="page-title">Mi Música</h1>
          <p class="page-subtitle">Gestión de programaciones musicales</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="redirectAlta">
            <i class="fas fa-plus"></i>
            <span>Nueva Programación</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <LoadingOverlay v-if="isLoading" message="Cargando programaciones..." />

    <!-- Empty State -->
    <div v-else-if="filteredProgramaciones.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <i class="fas fa-music"></i>
      </div>
      <h3>No hay programaciones</h3>
      <p>Crea tu primera programación musical para comenzar</p>
      <button class="btn-primary" @click="redirectAlta">
        <i class="fas fa-plus"></i>
        Crear Programación
      </button>
    </div>

    <!-- Programaciones Section -->
    <section v-else class="programaciones-section">
      <header class="section-header">
        <h2 class="section-title">Mis Programaciones</h2>
        <div class="section-actions">
          <input
            v-if="programaciones.length > 5"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar programación..."
            class="search-input"
            @input="filterProgramaciones"
          >
        </div>
      </header>

      <!-- Programaciones Grid -->
      <div class="programaciones-grid">
        <!-- Programación Cards -->
        <article
          v-for="programacion in paginatedProgramaciones"
          :key="programacion.clipro_codigo"
          class="programacion-card"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="programacion-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
              </svg>
            </div>
            <div class="programacion-info">
              <h3 class="programacion-name">{{ programacion.clipro_nombre }}</h3>
              <span class="programacion-code">#{{ programacion.clipro_codigo }}</span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content">
            <div class="programacion-details">
              <div class="programacion-detail">
                <span class="detail-label">
                  <i class="fas fa-calendar"></i>
                  Fecha Alta
                </span>
                <span class="detail-value">{{ formatDate(programacion.clipro_fechaAlta) }}</span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions">
            <button
              class="card-action-btn primary"
              @click="calendarRedirect(programacion)"
              title="Programar calendario"
            >
              <i class="fas fa-calendar-alt"></i>
              Programar
            </button>

            <button
              class="card-action-btn danger"
              @click="btnEliminar(programacion)"
              title="Eliminar programación"
            >
              <i class="fas fa-trash-alt"></i>
              Eliminar
            </button>
          </div>
        </article>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination-container">
        <button
          class="pagination-button"
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
        >
          <i class="fas fa-chevron-left"></i>
          Anterior
        </button>

        <span class="pagination-info">
          Página {{ currentPage }} de {{ totalPages }}
        </span>

        <button
          class="pagination-button"
          @click="changePage(currentPage + 1)"
          :disabled="currentPage === totalPages"
        >
          Siguiente
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </section>

    <!-- Edit Modal -->
    <Modal v-model="showEditModal" title="Editar Programación" size="md">
      <div class="form-group">
        <label class="form-label">
          Nombre de la Programación <span class="required">*</span>
        </label>
        <input
          v-model="selectedProgramacion.clipro_nombre"
          type="text"
          placeholder="Nombre de la programación"
          class="form-input"
        >
      </div>

      <template #footer>
        <div class="modal-actions-right">
          <button class="btn-secondary" @click="closeModal">
            Cancelar
          </button>
          <button class="btn-primary" @click="guardarProgramacion">
            <i class="fas fa-save"></i>
            Guardar Cambios
          </button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import RadioServices from '@/services/RadioServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import Modal from '@/components/ui/Modal.vue'
import moment from 'moment'

const router = useRouter()

// State
const isLoading = ref(false)
const programaciones = ref([])
const searchQuery = ref('')
const activeFilter = ref('all')
const showEditModal = ref(false)
const selectedProgramacion = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(8)

// Filter options
const filterOptions = [
  { key: 'all', label: 'Todas' },
  { key: 'recent', label: 'Recientes' },
  { key: 'active', label: 'Activas' }
]

// Card themes for variety
const cardThemes = [
  'aurora',
  'nebula',
  'cosmic',
  'stellar',
  'galaxy',
  'quantum',
  'plasma',
  'photon'
]

// Computed
const filteredProgramaciones = computed(() => {
  let filtered = programaciones.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(programacion =>
      programacion.clipro_nombre.toLowerCase().includes(query)
    )
  }

  // Apply active filter
  if (activeFilter.value === 'recent') {
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.clipro_fechaAlta || Date.now())
      const dateB = new Date(b.clipro_fechaAlta || Date.now())
      return dateB - dateA
    })
  }

  return filtered
})

const paginatedProgramaciones = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredProgramaciones.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProgramaciones.value.length / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2
  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else if (total > 1) {
    rangeWithDots.push(total)
  }

  return rangeWithDots.filter(item => item !== '...' || rangeWithDots.indexOf(item) === rangeWithDots.lastIndexOf(item))
})

// Methods
const getProgramacionesByCli = async () => {
  isLoading.value = true
  try {
    const res = await RadioServices.getProgramacionesByCliente()
    programaciones.value = res
  } catch (error) {
    console.error('Error loading programaciones:', error)
  } finally {
    isLoading.value = false
  }
}

const redirectAlta = () => {
  router.push({
    name: 'Nueva programación de música',
    params: {
      codigoProgramacion: '0',
      nombreProgramacion: 'nueva'
    }
  })
}

const btnEliminar = (programacion) => {
  if (confirm(`¿Estás seguro de que deseas eliminar la programación "${programacion.clipro_nombre}"?`)) {
    RadioServices.bajaProgramacion(parseInt(programacion.clipro_codigo))
      .then(() => {
        getProgramacionesByCli()
      })
      .catch(error => {
        console.error('Error deleting programacion:', error)
      })
  }
}

const calendarRedirect = (programacion) => {
  router.push({
    name: 'Programaciones de música',
    params: {
      codigoProgramacion: String(programacion.clipro_codigo),
      nombreProgramacion: encodeURIComponent(programacion.clipro_nombre)
    }
  })
}

const filterProgramaciones = () => {
  currentPage.value = 1
}

const setActiveFilter = (filterKey) => {
  activeFilter.value = filterKey
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const selectProgramacion = (programacion) => {
  selectedProgramacion.value = { ...programacion }
  showEditModal.value = true
}

const closeModal = () => {
  showEditModal.value = false
  selectedProgramacion.value = null
}

const guardarProgramacion = async () => {
  if (selectedProgramacion.value) {
    try {
      await RadioServices.altaProgramacion(
        selectedProgramacion.value.clipro_codigo,
        selectedProgramacion.value.clipro_nombre
      )
      await getProgramacionesByCli()
      closeModal()
    } catch (error) {
      console.error('Error updating programacion:', error)
    }
  }
}

const getCardTheme = (index) => {
  return cardThemes[index % cardThemes.length]
}

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  return moment(dateString).format('DD/MM/YYYY')
}

// Lifecycle
onMounted(() => {
  getProgramacionesByCli()
})
</script>

<style scoped src="./musica.css"></style>
