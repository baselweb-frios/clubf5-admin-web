<template>
  <div class="page-wrapper">
    <!-- Header Section -->
    <div class="page-content">
      <div class="flex-between mb-8 pb-6 border-b border-dark-border">
        <div>
          <h1 class="text-3xl font-bold text-text-primary mb-2">
Géneros Musicales
</h1>
          <p class="text-text-secondary">
Administración de géneros musicales del sistema
</p>
        </div>
        <button
class="btn btn-primary"
@click="abrirModalNuevo"
>
          <i class="fas fa-plus" />
          Nuevo Género
        </button>
      </div>

      <!-- Loading State -->
      <div
v-if="isLoading"
class="flex-center py-12"
>
        <div class="spinner" />
        <span class="ml-3 text-text-secondary">Cargando géneros musicales...</span>
      </div>

      <!-- Empty State -->
      <div
v-else-if="generos.length === 0"
class="flex-center flex-col gap-4 py-16"
>
        <div class="text-6xl text-text-tertiary">
          <i class="fas fa-music" />
        </div>
        <h3 class="text-xl font-bold text-text-primary">
No hay géneros musicales
</h3>
        <p class="text-text-secondary">
Crea el primer género musical para comenzar
</p>
        <button
class="btn btn-primary"
@click="abrirModalNuevo"
>
          <i class="fas fa-plus" />
          Crear Género
        </button>
      </div>

      <!-- Géneros Grid -->
      <div v-else>
        <!-- Section Header with Search -->
        <div class="flex-between mb-6 pb-4 border-b border-dark-border">
          <h2 class="text-2xl font-bold text-text-primary">
Lista de Géneros
</h2>
          <input
            v-if="generos.length > 5"
            v-model="searchQuery"
            type="text"
            placeholder="Buscar género..."
            class="input max-w-xs"
            @input="filtrarGeneros"
          >
        </div>

        <!-- Géneros Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          <article
            v-for="genero in paginatedGeneros"
            :key="genero.genmus_codigo"
            class="card card-hover flex flex-col"
          >
            <!-- Card Header -->
            <div class="flex-between gap-3 mb-4 pb-4 border-b border-dark-border">
              <div class="flex-start gap-3 min-w-0">
                <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex-center flex-shrink-0">
                  <i class="fas fa-music text-primary-400" />
                </div>
                <div class="min-w-0">
                  <h3 class="font-semibold text-text-primary truncate">
{{ genero.genmus_nombre }}
</h3>
                  <span class="text-xs text-text-tertiary">#{{ genero.genmus_codigo }}</span>
                </div>
              </div>
              <div :class="['badge', getEstadoClass(genero.genmus_estado)]">
                {{ getEstadoTexto(genero.genmus_estado) }}
              </div>
            </div>

            <!-- Card Content -->
            <div class="flex-1 mb-4">
              <div class="flex items-start gap-2 text-sm">
                <i class="fas fa-sort text-text-tertiary flex-shrink-0 mt-0.5" />
                <div>
                  <p class="text-text-secondary">
Orden
</p>
                  <p class="text-text-primary font-medium">
{{ genero.genmus_orden }}
</p>
                </div>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="flex gap-2 pt-4 border-t border-dark-border">
              <button
                class="flex-1 btn btn-sm btn-primary"
                title="Ver subgéneros"
                @click="verSubGeneros(genero)"
              >
                <i class="fas fa-list" />
                Subgéneros
              </button>
              <button
                class="flex-1 btn btn-sm btn-ghost text-info-400"
                title="Ver archivos del género"
                @click="verArchivos(genero)"
              >
                <i class="fas fa-folder-open" />
                Archivos
              </button>
              <button
                class="flex-1 btn btn-sm btn-danger"
                title="Eliminar género"
                @click="eliminarGenero(genero)"
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
            @click="cambiarPagina(currentPage - 1)"
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
            @click="cambiarPagina(currentPage + 1)"
          >
            Siguiente
            <i class="fas fa-chevron-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo/Editar Género -->
    <div
v-if="mostrarModal"
class="modal-backdrop"
@click.self="cerrarModal"
>
      <div class="modal max-w-md">
        <div class="modal-header">
          <h2 class="text-lg font-bold text-text-primary">
            {{ modoEdicion ? 'Editar' : 'Nuevo' }} Género Musical
          </h2>
          <button
class="btn btn-ghost btn-icon"
aria-label="Cerrar"
@click="cerrarModal"
>
            <i class="fas fa-times" />
          </button>
        </div>

        <div class="modal-body space-y-4">
          <div class="form-group">
            <label class="label">
              Código
              <span class="text-danger-400 ml-1">*</span>
            </label>
            <input
              v-model="generoForm.genmus_codigo"
              type="number"
              placeholder="Código del género"
              class="input"
              :disabled="modoEdicion"
            >
          </div>

          <div class="form-group">
            <label class="label">
              Nombre
              <span class="text-danger-400 ml-1">*</span>
            </label>
            <input
              v-model="generoForm.genmus_nombre"
              type="text"
              placeholder="Nombre del género"
              class="input"
            >
          </div>

          <div class="form-group">
            <label class="label">
              Orden
              <span class="text-danger-400 ml-1">*</span>
            </label>
            <input
              v-model="generoForm.genmus_orden"
              type="number"
              placeholder="Orden de visualización"
              class="input"
            >
          </div>

          <div class="form-group">
            <label class="label">
              Estado
              <span class="text-danger-400 ml-1">*</span>
            </label>
            <select
v-model="generoForm.genmus_estado"
class="select"
>
              <option value="A">
Activo
</option>
              <option value="I">
Inactivo
</option>
            </select>
          </div>
        </div>

        <div class="modal-footer">
          <button
class="btn btn-secondary"
@click="cerrarModal"
>
Cancelar
</button>
          <button
class="btn btn-primary"
:disabled="!formularioValido"
@click="guardarGenero"
>
            <i class="fas fa-save" />
            {{ modoEdicion ? 'Actualizar' : 'Crear' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GeneroMusicalServices from '@/services/GeneroMusicalServices'

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
  return estado === 'A' ? 'badge-success' : 'badge-warning'
}

const getEstadoTexto = (estado) => {
  return estado === 'A' ? 'Activo' : 'Inactivo'
}

// Lifecycle
onMounted(() => {
  cargarGeneros()
})
</script>
