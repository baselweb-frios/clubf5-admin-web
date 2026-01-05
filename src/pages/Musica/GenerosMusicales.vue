<template>
  <div class="generos-musicales-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-music"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">Géneros Musicales</h1>
          <p class="page-subtitle">Administración de géneros musicales del sistema</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" @click="abrirModalNuevo">
            <i class="fas fa-plus"></i>
            <span>Nuevo Género</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingOverlay v-if="isLoading" message="Cargando géneros musicales..." />

    <!-- Empty State -->
    <div v-else-if="generos.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <i class="fas fa-music"></i>
      </div>
      <h3>No hay géneros musicales</h3>
      <p>Crea el primer género musical para comenzar</p>
      <button class="btn-primary" @click="abrirModalNuevo">
        <i class="fas fa-plus"></i>
        Crear Género
      </button>
    </div>

    <!-- Géneros Grid -->
    <BaseCard v-else shadow="md" :no-padding="true">
      <template #header>
        <div class="section-header">
          <h2 class="section-title">Lista de Géneros</h2>
          <div class="section-actions">
            <input
              v-if="generos.length > 5"
              v-model="searchQuery"
              type="text"
              placeholder="Buscar género..."
              class="search-input"
              @input="filtrarGeneros"
            >
          </div>
        </div>
      </template>

      <div class="generos-section-content">
        <div class="generos-grid">
          <article
            v-for="genero in paginatedGeneros"
            :key="genero.genmus_codigo"
            class="genero-card"
          >
            <div class="card-header">
              <div class="genero-icon">
                <i class="fas fa-music"></i>
              </div>
              <div class="genero-info">
                <h3 class="genero-name">{{ genero.genmus_nombre }}</h3>
                <span class="genero-code">#{{ genero.genmus_codigo }}</span>
              </div>
              <div class="genero-badge" :class="getEstadoClass(genero.genmus_estado)">
                {{ getEstadoTexto(genero.genmus_estado) }}
              </div>
            </div>

            <div class="card-content">
              <div class="genero-details">
                <div class="detail-item">
                  <span class="detail-label">
                    <i class="fas fa-sort"></i>
                    Orden
                  </span>
                  <span class="detail-value">{{ genero.genmus_orden }}</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button
                class="card-action-btn primary"
                @click="verSubGeneros(genero)"
                title="Ver subgéneros"
              >
                <i class="fas fa-list"></i>
                Subgéneros
              </button>

              <button
                class="card-action-btn info"
                @click="verArchivos(genero)"
                title="Ver archivos del género"
              >
                <i class="fas fa-folder-open"></i>
                Archivos
              </button>

              <button
                class="card-action-btn danger"
                @click="eliminarGenero(genero)"
                title="Eliminar género"
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
            @click="cambiarPagina(currentPage - 1)"
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
            @click="cambiarPagina(currentPage + 1)"
            :disabled="currentPage === totalPages"
          >
            Siguiente
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </BaseCard>

    <!-- Modal Nuevo/Editar Género -->
    <Modal
      v-model="mostrarModal"
      :title="`${modoEdicion ? 'Editar' : 'Nuevo'} Género Musical`"
      size="md"
    >
      <div class="form-group">
        <label class="form-label">
          Código <span class="required">*</span>
        </label>
        <input
          v-model="generoForm.genmus_codigo"
          type="number"
          placeholder="Código del género"
          class="form-input"
          :disabled="modoEdicion"
        >
      </div>

      <div class="form-group">
        <label class="form-label">
          Nombre <span class="required">*</span>
        </label>
        <input
          v-model="generoForm.genmus_nombre"
          type="text"
          placeholder="Nombre del género"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label class="form-label">
          Orden <span class="required">*</span>
        </label>
        <input
          v-model="generoForm.genmus_orden"
          type="number"
          placeholder="Orden de visualización"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label class="form-label">
          Estado <span class="required">*</span>
        </label>
        <select v-model="generoForm.genmus_estado" class="form-input">
          <option value="A">Activo</option>
          <option value="I">Inactivo</option>
        </select>
      </div>

      <template #footer>
        <button class="btn-secondary" @click="cerrarModal">
          Cancelar
        </button>
        <button class="btn-primary" @click="guardarGenero" :disabled="!formularioValido">
          <i class="fas fa-save"></i>
          {{ modoEdicion ? 'Actualizar' : 'Crear' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GeneroMusicalServices from '@/services/GeneroMusicalServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Modal from '@/components/ui/Modal.vue'

const router = useRouter()

// State
const isLoading = ref(false)
const generos = ref([])
const searchQuery = ref('')
const mostrarModal = ref(false)
const modoEdicion = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(12)

const generoForm = ref({
  genmus_codigo: null,
  genmus_nombre: '',
  genmus_orden: 0,
  genmus_estado: 'A'
})

// Computed
const filteredGeneros = computed(() => {
  if (!searchQuery.value) return generos.value

  const query = searchQuery.value.toLowerCase()
  return generos.value.filter(genero =>
    genero.genmus_nombre.toLowerCase().includes(query) ||
    String(genero.genmus_codigo).includes(query)
  )
})

const paginatedGeneros = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredGeneros.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredGeneros.value.length / itemsPerPage.value)
})

const formularioValido = computed(() => {
  return generoForm.value.genmus_codigo &&
    generoForm.value.genmus_nombre.trim() !== '' &&
    generoForm.value.genmus_orden !== null
})

// Methods
const cargarGeneros = async () => {
  isLoading.value = true
  try {
    const response = await GeneroMusicalServices.getGeneros()
    generos.value = response
  } catch (error) {
    console.error('Error cargando géneros:', error)
    alert('Error al cargar los géneros musicales')
  } finally {
    isLoading.value = false
  }
}

const abrirModalNuevo = () => {
  modoEdicion.value = false
  generoForm.value = {
    genmus_codigo: null,
    genmus_nombre: '',
    genmus_orden: generos.value.length + 1,
    genmus_estado: 'A'
  }
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  generoForm.value = {
    genmus_codigo: null,
    genmus_nombre: '',
    genmus_orden: 0,
    genmus_estado: 'A'
  }
}

const guardarGenero = async () => {
  if (!formularioValido.value) {
    alert('Por favor completa todos los campos requeridos')
    return
  }

  isLoading.value = true
  try {
    await GeneroMusicalServices.crearGenero(generoForm.value)
    await cargarGeneros()
    cerrarModal()
    alert('Género musical guardado exitosamente')
  } catch (error) {
    console.error('Error guardando género:', error)
    alert('Error al guardar el género musical')
  } finally {
    isLoading.value = false
  }
}

const eliminarGenero = async (genero) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar el género "${genero.genmus_nombre}"?`)) {
    return
  }

  isLoading.value = true
  try {
    await GeneroMusicalServices.eliminarGenero(genero.genmus_codigo)
    await cargarGeneros()
    alert('Género eliminado exitosamente')
  } catch (error) {
    console.error('Error eliminando género:', error)
    alert('Error al eliminar el género. Puede que tenga subgéneros asociados.')
  } finally {
    isLoading.value = false
  }
}

const verSubGeneros = (genero) => {
  router.push({
    name: 'Subgeneros Musicales',
    params: { codigoGenero: genero.genmus_codigo },
    query: { nombreGenero: genero.genmus_nombre }
  })
}

const verArchivos = (genero) => {
  router.push({
    name: 'Gestion Archivos',
    query: {
      tipo: 'genero',
      codigoGenero: genero.genmus_codigo,
      nombreGenero: genero.genmus_nombre,
      carpeta: `genero_${genero.genmus_codigo}`
    }
  })
}

const filtrarGeneros = () => {
  currentPage.value = 1
}

const cambiarPagina = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const getEstadoClass = (estado) => {
  return estado === 'A' ? 'badge-active' : 'badge-inactive'
}

const getEstadoTexto = (estado) => {
  return estado === 'A' ? 'Activo' : 'Inactivo'
}

// Lifecycle
onMounted(() => {
  cargarGeneros()
})
</script>

<style scoped src="./musica.css"></style>
