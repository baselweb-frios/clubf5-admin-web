<template>
  <div class="subgeneros-musicales-page">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-list-alt"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">Subgéneros Musicales</h1>
          <p class="page-subtitle" v-if="nombreGenero">{{ nombreGenero }}</p>
          <p class="page-subtitle" v-else>Administración de subgéneros musicales</p>
        </div>
        <div class="header-actions">
          <button class="btn-secondary" @click="volverGeneros">
            <i class="fas fa-arrow-left"></i>
            <span>Volver</span>
          </button>
          <button class="btn-primary" @click="abrirModalNuevo">
            <i class="fas fa-plus"></i>
            <span>Nuevo Subgénero</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <LoadingOverlay v-if="isLoading" message="Cargando subgéneros musicales..." />

    <!-- Empty State -->
    <div v-else-if="subgeneros.length === 0" class="empty-state">
      <div class="empty-state-icon">
        <i class="fas fa-list"></i>
      </div>
      <h3>No hay subgéneros musicales</h3>
      <p>Crea el primer subgénero musical para comenzar</p>
      <button class="btn-primary" @click="abrirModalNuevo">
        <i class="fas fa-plus"></i>
        Crear Subgénero
      </button>
    </div>

    <!-- Subgéneros Grid -->
    <BaseCard v-else shadow="md" :no-padding="true">
      <template #header>
        <div class="section-header">
          <h2 class="section-title">Lista de Subgéneros</h2>
          <div class="section-actions">
            <select
              v-if="!codigoGeneroFiltro"
              v-model="generoFiltro"
              class="form-input"
              @change="filtrarPorGenero"
            >
              <option value="">Todos los géneros</option>
              <option v-for="genero in generos" :key="genero.genmus_codigo" :value="genero.genmus_codigo">
                {{ genero.genmus_nombre }}
              </option>
            </select>
            <input
              v-if="subgeneros.length > 5"
              v-model="searchQuery"
              type="text"
              placeholder="Buscar subgénero..."
              class="search-input"
              @input="filtrarSubgeneros"
            >
          </div>
        </div>
      </template>

      <div class="subgeneros-section-content">
        <div class="subgeneros-grid">
          <article
            v-for="subgenero in paginatedSubgeneros"
            :key="subgenero.gemusu_codigo"
            class="subgenero-card"
          >
            <div class="card-header">
              <div class="subgenero-icon">
                <i class="fas fa-list-alt"></i>
              </div>
              <div class="subgenero-info">
                <h3 class="subgenero-name">{{ subgenero.gemusu_nombre }}</h3>
                <span class="subgenero-code">#{{ subgenero.gemusu_codigo }}</span>
              </div>
            </div>

            <div class="card-content">
              <div class="subgenero-details">
                <div class="detail-item">
                  <span class="detail-label">
                    <i class="fas fa-music"></i>
                    Género
                  </span>
                  <span class="detail-value">{{ getNombreGenero(subgenero.gemusu_codigoGeneroMusical) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">
                    <i class="fas fa-sort-numeric-up"></i>
                    Número
                  </span>
                  <span class="detail-value">{{ subgenero.gemusu_numeroSubGenero }}</span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button
                class="card-action-btn info"
                @click="verArchivos(subgenero)"
                title="Ver archivos del subgénero"
              >
                <i class="fas fa-folder-open"></i>
                Archivos
              </button>

              <button
                class="card-action-btn danger"
                @click="eliminarSubgenero(subgenero)"
                title="Eliminar subgénero"
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

    <!-- Modal Nuevo Subgénero -->
    <Modal
      v-model="mostrarModal"
      title="Nuevo Subgénero Musical"
      size="md"
    >
      <div class="form-group">
        <label class="form-label">
          Género Musical <span class="required">*</span>
        </label>
        <select
          v-model="subgeneroForm.gemusu_codigoGeneroMusical"
          class="form-input"
          :disabled="!!codigoGeneroFiltro"
        >
          <option value="">Seleccione un género</option>
          <option v-for="genero in generos" :key="genero.genmus_codigo" :value="genero.genmus_codigo">
            {{ genero.genmus_nombre }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label class="form-label">
          Número de Subgénero <span class="required">*</span>
        </label>
        <input
          v-model="subgeneroForm.gemusu_numeroSubGenero"
          type="number"
          placeholder="Número del subgénero"
          class="form-input"
        >
      </div>

      <div class="form-group">
        <label class="form-label">
          Nombre <span class="required">*</span>
        </label>
        <input
          v-model="subgeneroForm.gemusu_nombre"
          type="text"
          placeholder="Nombre del subgénero"
          class="form-input"
        >
      </div>

      <template #footer>
        <button class="btn-secondary" @click="cerrarModal">
          Cancelar
        </button>
        <button class="btn-primary" @click="guardarSubgenero" :disabled="!formularioValido">
          <i class="fas fa-save"></i>
          Crear
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import GeneroMusicalServices from '@/services/GeneroMusicalServices'
import GeneroMusicalSubServices from '@/services/GeneroMusicalSubServices'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import Modal from '@/components/ui/Modal.vue'

const router = useRouter()
const route = useRoute()

// State
const isLoading = ref(false)
const subgeneros = ref([])
const generos = ref([])
const searchQuery = ref('')
const generoFiltro = ref('')
const mostrarModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(12)

// Props from route
const codigoGeneroFiltro = ref(route.params.codigoGenero || null)
const nombreGenero = ref(route.query.nombreGenero || '')

const subgeneroForm = ref({
  gemusu_codigoGeneroMusical: codigoGeneroFiltro.value || '',
  gemusu_numeroSubGenero: null,
  gemusu_nombre: ''
})

// Computed
const filteredSubgeneros = computed(() => {
  let filtered = subgeneros.value

  // Filtrar por género si está seleccionado
  if (generoFiltro.value) {
    filtered = filtered.filter(sub => sub.gemusu_codigoGeneroMusical === parseInt(generoFiltro.value))
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(sub =>
      sub.gemusu_nombre.toLowerCase().includes(query) ||
      String(sub.gemusu_numeroSubGenero).includes(query)
    )
  }

  return filtered
})

const paginatedSubgeneros = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSubgeneros.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredSubgeneros.value.length / itemsPerPage.value)
})

const formularioValido = computed(() => {
  return subgeneroForm.value.gemusu_codigoGeneroMusical &&
    subgeneroForm.value.gemusu_numeroSubGenero !== null &&
    subgeneroForm.value.gemusu_nombre.trim() !== ''
})

// Methods
const cargarGeneros = async () => {
  try {
    const response = await GeneroMusicalServices.getGeneros()
    generos.value = response
  } catch (error) {
    console.error('Error cargando géneros:', error)
  }
}

const cargarSubgeneros = async () => {
  isLoading.value = true
  try {
    let response
    if (codigoGeneroFiltro.value) {
      response = await GeneroMusicalSubServices.getSubGenerosByGenero(codigoGeneroFiltro.value)
    } else {
      response = await GeneroMusicalSubServices.getSubGeneros()
    }
    subgeneros.value = response
  } catch (error) {
    console.error('Error cargando subgéneros:', error)
    alert('Error al cargar los subgéneros musicales')
  } finally {
    isLoading.value = false
  }
}

const abrirModalNuevo = () => {
  subgeneroForm.value = {
    gemusu_codigoGeneroMusical: codigoGeneroFiltro.value || '',
    gemusu_numeroSubGenero: null,
    gemusu_nombre: ''
  }
  mostrarModal.value = true
}

const cerrarModal = () => {
  mostrarModal.value = false
  subgeneroForm.value = {
    gemusu_codigoGeneroMusical: codigoGeneroFiltro.value || '',
    gemusu_numeroSubGenero: null,
    gemusu_nombre: ''
  }
}

const guardarSubgenero = async () => {
  if (!formularioValido.value) {
    alert('Por favor completa todos los campos requeridos')
    return
  }

  isLoading.value = true
  try {
    await GeneroMusicalSubServices.crearSubGenero(subgeneroForm.value)
    await cargarSubgeneros()
    cerrarModal()
    alert('Subgénero musical guardado exitosamente')
  } catch (error) {
    console.error('Error guardando subgénero:', error)
    alert('Error al guardar el subgénero musical')
  } finally {
    isLoading.value = false
  }
}

const eliminarSubgenero = async (subgenero) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar el subgénero "${subgenero.gemusu_nombre}"?`)) {
    return
  }

  isLoading.value = true
  try {
    await GeneroMusicalSubServices.eliminarSubGenero(subgenero.gemusu_codigo)
    await cargarSubgeneros()
    alert('Subgénero eliminado exitosamente')
  } catch (error) {
    console.error('Error eliminando subgénero:', error)
    alert('Error al eliminar el subgénero')
  } finally {
    isLoading.value = false
  }
}

const getNombreGenero = (codigoGenero) => {
  const genero = generos.value.find(g => g.genmus_codigo === codigoGenero)
  return genero ? genero.genmus_nombre : 'Desconocido'
}

const filtrarPorGenero = () => {
  currentPage.value = 1
}

const filtrarSubgeneros = () => {
  currentPage.value = 1
}

const cambiarPagina = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const volverGeneros = () => {
  router.push({ name: 'GenerosMusicales' })
}

const verArchivos = (subgenero) => {
  router.push({
    name: 'Gestion Archivos',
    query: {
      tipo: 'subgenero',
      codigoGenero: subgenero.gemusu_codigoGeneroMusical,
      nombreGenero: getNombreGenero(subgenero.gemusu_codigoGeneroMusical),
      codigoSubgenero: subgenero.gemusu_codigo,
      nombreSubgenero: subgenero.gemusu_nombre,
      carpeta: `genero_${subgenero.gemusu_codigoGeneroMusical}/subgenero_${subgenero.gemusu_numeroSubGenero}`
    }
  })
}

// Lifecycle
onMounted(async () => {
  await cargarGeneros()
  await cargarSubgeneros()
})
</script>

<style scoped src="./musica.css"></style>
