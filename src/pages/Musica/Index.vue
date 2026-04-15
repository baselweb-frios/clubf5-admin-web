<template>
  <div class="page-wrapper">
    <!-- Header Section -->
    <div class="page-content">
      <div class="flex-between mb-8 pb-6 border-b border-dark-border">
        <div>
          <h1 class="text-3xl font-bold text-text-primary mb-2">
Mi Música
</h1>
          <p class="text-text-secondary">
Gestión de programaciones musicales
</p>
        </div>
        <button
class="btn btn-primary"
@click="redirectAlta"
>
          <i class="fas fa-plus" />
          Nueva Programación
        </button>
      </div>

      <!-- Loading State -->
      <div
v-if="isLoading"
class="flex-center py-12"
>
        <div class="spinner" />
        <span class="ml-3 text-text-secondary">Cargando programaciones...</span>
      </div>

      <!-- Empty State -->
      <div
v-else-if="filteredProgramaciones.length === 0"
class="flex-center flex-col gap-4 py-16"
>
        <div class="text-6xl text-text-tertiary">
          <i class="fas fa-music" />
        </div>
        <h3 class="text-xl font-bold text-text-primary">
No hay programaciones
</h3>
        <p class="text-text-secondary">
Crea tu primera programación musical para comenzar
</p>
        <button
class="btn btn-primary"
@click="redirectAlta"
>
          <i class="fas fa-plus" />
          Crear Programación
        </button>
      </div>

      <!-- Programaciones Section -->
      <div v-else>
        <!-- Section Header with Search -->
        <div class="flex-between mb-6 pb-4 border-b border-dark-border">
          <h2 class="text-2xl font-bold text-text-primary">
Mis Programaciones
</h2>
          <input
            v-if="programaciones.length > 5"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar programación..."
            class="input max-w-xs"
            @input="filterProgramaciones"
          >
        </div>

        <!-- Programaciones Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <!-- Programación Cards -->
          <article
            v-for="programacion in paginatedProgramaciones"
            :key="programacion.clipro_codigo"
            class="card card-hover flex flex-col"
          >
            <!-- Card Header -->
            <div class="flex-start gap-3 mb-4 pb-4 border-b border-dark-border">
              <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex-center flex-shrink-0">
                <i class="fas fa-music text-primary-400" />
              </div>
              <div class="min-w-0">
                <h3 class="font-semibold text-text-primary truncate">
                  {{ programacion.clipro_nombre }}
                </h3>
                <span class="text-xs text-text-tertiary">#{{ programacion.clipro_codigo }}</span>
              </div>
            </div>

            <!-- Card Content -->
            <div class="flex-1 mb-4">
              <div class="flex items-start gap-2 text-sm">
                <i class="fas fa-calendar text-text-tertiary flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-text-secondary">
Fecha Alta
</p>
                  <p class="text-text-primary font-medium">
{{ formatDate(programacion.clipro_fechaAlta) }}
</p>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex gap-2 pt-4 border-t border-dark-border">
              <button
                class="flex-1 btn btn-sm btn-primary"
                title="Programar calendario"
                @click="calendarRedirect(programacion)"
              >
                <i class="fas fa-calendar-alt" />
                Programar
              </button>
              <button
                class="flex-1 btn btn-sm btn-danger"
                title="Eliminar programación"
                @click="btnEliminar(programacion)"
              >
                <i class="fas fa-trash-alt" />
                Eliminar
              </button>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div
v-if="totalPages > 1"
class="flex-center gap-4 mt-8 py-6 border-t border-dark-border"
>
          <button
            class="btn btn-secondary btn-sm"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left" />
            Anterior
          </button>

          <span class="text-sm text-text-secondary px-3">
            Página {{ currentPage }} de {{ totalPages }}
          </span>

          <button
            class="btn btn-secondary btn-sm"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            Siguiente
            <i class="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <div
v-if="showEditModal"
class="modal-backdrop"
@click.self="closeModal"
>
      <div class="modal max-w-md">
        <div class="modal-header">
          <h2 class="text-lg font-bold text-text-primary">
Editar Programación
</h2>
          <button
class="btn btn-ghost btn-icon"
aria-label="Cerrar"
@click="closeModal"
>
            <i class="fas fa-times" />
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="label">
              Nombre de la Programación
              <span class="text-danger-400 ml-1">*</span>
            </label>
            <input
              v-model="selectedProgramacion.clipro_nombre"
              type="text"
              placeholder="Nombre de la programación"
              class="input"
            >
          </div>
        </div>

        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="closeModal"
>
Cancelar
</button>
          <button
class="btn btn-primary"
@click="guardarProgramacion"
>
            <i class="fas fa-save" />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import RadioServices from '@/services/RadioServices'
import moment from 'moment'

const router = useRouter()

// State
const isLoading = ref(false)
const programaciones = ref([])
const searchQuery = ref('')
const showEditModal = ref(false)
const selectedProgramacion = ref(null)
const currentPage = ref(1)
const itemsPerPage = ref(8)

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

// Methods
const getProgramacionesByCli = async () => {
  isLoading.value = true
  try {
    const res = await RadioServices.getProgramacionesByCliente()
    programaciones.value = res
    if(programaciones.value.length === 1) {
      calendarRedirect(programaciones.value[0])
    }
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

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
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

const formatDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'
  return moment(dateString).format('DD/MM/YYYY')
}

// Lifecycle
onBeforeMount(() => {
  getProgramacionesByCli()
})
</script>


