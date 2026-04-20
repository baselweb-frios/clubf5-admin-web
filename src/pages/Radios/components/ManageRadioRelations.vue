<template>
  <div
v-if="localShow"
class="modal-backdrop"
@click.self="handleClose"
>
    <div class="modal max-w-2xl">
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-text-primary">
Configurar {{ radio?.rad_nombre }}
</h3>
        <button
class="btn btn-ghost btn-icon"
@click="handleClose"
>
          <i class="fas fa-times" />
        </button>
      </div>
      <div class="modal-body space-y-6">
        <!-- Tabs para las tres secciones -->
        <div class="border-b border-dark-border">
          <nav
class="flex space-x-8 gap-4"
aria-label="Tabs"
>
            <button
              v-for="tab in tabs"
              :key="tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-400'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:border-dark-border',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors'
              ]"
              @click="activeTab = tab.id"
            >
              <i
:class="tab.icon"
class="mr-2"
/>
              {{ tab.name }}
            </button>
          </nav>
        </div>

      <!-- SECCIÓN 1: GÉNEROS MUSICALES -->
      <div
v-show="activeTab === 'generos'"
class="space-y-4"
>
        <div>
          <div class="flex-between mb-2">
            <label class="block text-sm font-medium text-text-secondary">
              Géneros Musicales
            </label>
            <button
              class="btn btn-primary btn-sm"
              type="button"
              @click="showNewGeneroModal = true"
            >
              <i class="fas fa-plus mr-1" />
              Nuevo Género
            </button>
          </div>
          <select
            v-model="selectedGenero"
            placeholder="Seleccione un género para ver subgéneros..."
            :disabled="loading"
            class="select"
            @change="loadSubGeneros"
          >
            <option value="">
Seleccione un género para ver subgéneros...
</option>
            <option
v-for="genero in generos"
:key="genero.genmus_codigo"
:value="genero.genmus_codigo"
>
              {{ genero.genmus_nombre }}
            </option>
          </select>
        </div>

        <!-- Botón para crear nuevo subgénero (visible cuando hay género seleccionado) -->
        <div
v-if="selectedGenero"
class="flex-between"
>
          <span class="text-sm text-text-secondary">
            {{ subgeneros.length > 0 ? `${subgeneros.length} subgéneros disponibles` : 'No hay subgéneros para este género' }}
          </span>
          <button
            class="btn btn-primary btn-sm"
            type="button"
            @click="showNewSubgeneroModal = true"
          >
            <i class="fas fa-plus mr-1" />
            Nuevo Subgénero
          </button>
        </div>

        <!-- Subgéneros disponibles -->
        <div
v-if="selectedGenero && subgeneros.length > 0"
class="border border-dark-border rounded-lg p-4"
>
          <h4 class="text-sm font-medium text-text-secondary mb-3">
Subgéneros Disponibles
</h4>
          <div class="max-h-60 overflow-y-auto space-y-2">
            <div
              v-for="subgenero in subgeneros"
              :key="subgenero.gemusu_codigo"
              class="flex items-center p-3 bg-dark-secondary rounded-lg hover:bg-dark-hover transition-colors cursor-pointer"
              @click="toggleSubgenero(subgenero)"
            >
              <input
                type="checkbox"
                :checked="isSubgeneroSelected(subgenero.gemusu_codigo)"
                class="checkbox"
                @click.stop="toggleSubgenero(subgenero)"
              >
              <div class="ml-3 flex-1">
                <div class="text-sm font-medium text-text-primary">
{{ subgenero.gemusu_nombre }}
</div>
                <div class="text-xs text-text-secondary">
{{ subgenero.genmus_nombre }}
</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subgéneros seleccionados -->
        <div
v-if="selectedSubgeneros.length > 0"
class="border border-dark-border rounded-lg p-4"
>
          <h4 class="text-sm font-medium text-text-secondary mb-3">
            Subgéneros Seleccionados ({{ selectedSubgeneros.length }})
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="codigo in selectedSubgeneros"
              :key="codigo"
              class="badge badge-primary"
            >
              <span class="flex flex-col leading-tight">
                <span>{{ getSubgeneroName(codigo) }}</span>
                <span class="text-xs">{{ getSubgeneroGenero(codigo) }}</span>
              </span>
              <button
                class="ml-2 text-primary-300 hover:text-primary-200"
                @click="removeSubgenero(codigo)"
              >
                <svg
class="w-4 h-4"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M6 18L18 6M6 6l12 12"
/>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: RITMOS -->
      <div
v-show="activeTab === 'ritmos'"
class="space-y-4"
>
        <div>
          <label class="block text-sm font-medium text-text-secondary mb-2">
            Ritmos Disponibles
          </label>
          <div class="border border-dark-border rounded-lg p-4">
            <div class="max-h-96 overflow-y-auto space-y-2">
              <div
                v-for="ritmo in ritmos"
                :key="ritmo.ritmos_codigo"
                class="flex items-center p-3 bg-dark-secondary rounded-lg hover:bg-dark-hover transition-colors cursor-pointer"
                @click="toggleRitmo(ritmo)"
              >
                <input
                  type="checkbox"
                  :checked="isRitmoSelected(ritmo.ritmos_codigo)"
                  class="checkbox"
                  @click.stop="toggleRitmo(ritmo)"
                >
                <div class="ml-3 flex-1">
                  <div class="text-sm font-medium text-text-primary">
{{ ritmo.ritmos_nombre }}
</div>
                  <div class="text-xs text-text-secondary">
Orden: {{ ritmo.ritmos_orden }}
</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ritmos seleccionados -->
        <div
v-if="selectedRitmos.length > 0"
class="border border-dark-border rounded-lg p-4"
>
          <h4 class="text-sm font-medium text-text-secondary mb-3">
            Ritmos Seleccionados ({{ selectedRitmos.length }})
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="codigo in selectedRitmos"
              :key="codigo"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-900 text-purple-200"
            >
              {{ getRitmoName(codigo) }}
              <button
                class="ml-2 text-purple-300 hover:text-purple-100"
                @click="removeRitmo(codigo)"
              >
                <svg
class="w-4 h-4"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M6 18L18 6M6 6l12 12"
/>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: TIPOS DE EMPRESA Y ESTILOS -->
      <div
v-show="activeTab === 'tipos-estilos'"
class="space-y-4"
>
        <!-- Tipos de Empresa -->
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Tipos de Empresa
          </label>
          <div class="border border-gray-700 rounded-lg p-4">
            <div class="max-h-60 overflow-y-auto space-y-2">
              <div
                v-for="tipo in tiposEmpresa"
                :key="tipo.tipEmp_codigo"
                class="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                @click="toggleTipoEmpresa(tipo)"
              >
                <input
                  type="checkbox"
                  :checked="isTipoEmpresaSelected(tipo.tipEmp_codigo)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  @click.stop="toggleTipoEmpresa(tipo)"
                >
                <div class="ml-3 flex-1">
                  <div class="text-sm font-medium text-white">
{{ tipo.tipEmp_nombre }}
</div>
                  <div class="text-xs text-gray-400">
Grupo: {{ tipo.tipEmp_codigoTipoEmpGrupo }}
</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tipos de Empresa seleccionados -->
        <div
v-if="selectedTiposEmpresa.length > 0"
class="border border-gray-700 rounded-lg p-4"
>
          <h4 class="text-sm font-medium text-gray-300 mb-3">
            Tipos de Empresa Seleccionados ({{ selectedTiposEmpresa.length }})
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="codigo in selectedTiposEmpresa"
              :key="codigo"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900 text-green-200"
            >
              {{ getTipoEmpresaName(codigo) }}
              <button
                class="ml-2 text-green-300 hover:text-green-100"
                @click="removeTipoEmpresa(codigo)"
              >
                <svg
class="w-4 h-4"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M6 18L18 6M6 6l12 12"
/>
                </svg>
              </button>
            </span>
          </div>
        </div>

        <!-- Estilos -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Estilos
          </label>
          <div class="border border-gray-700 rounded-lg p-4">
            <div class="max-h-60 overflow-y-auto space-y-2">
              <div
                v-for="estilo in estilos"
                :key="estilo.estilo_codigo"
                class="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors cursor-pointer"
                @click="toggleEstilo(estilo)"
              >
                <input
                  type="checkbox"
                  :checked="isEstiloSelected(estilo.estilo_codigo)"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                  @click.stop="toggleEstilo(estilo)"
                >
                <div class="ml-3 flex-1">
                  <div class="text-sm font-medium text-white">
{{ estilo.estilo_nombre }}
</div>
                  <div class="text-xs text-gray-400">
Orden: {{ estilo.estilo_orden }}
</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estilos seleccionados -->
        <div
v-if="selectedEstilos.length > 0"
class="border border-gray-700 rounded-lg p-4"
>
          <h4 class="text-sm font-medium text-gray-300 mb-3">
            Estilos Seleccionados ({{ selectedEstilos.length }})
          </h4>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="codigo in selectedEstilos"
              :key="codigo"
              class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-900 text-yellow-200"
            >
              {{ getEstiloName(codigo) }}
              <button
                class="ml-2 text-yellow-300 hover:text-yellow-100"
                @click="removeEstilo(codigo)"
              >
                <svg
class="w-4 h-4"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
                  <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M6 18L18 6M6 6l12 12"
/>
                </svg>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Loading state -->
      <loading-spinner
v-if="loading"
class="py-8"
/>
    </div>

    <div class="modal-footer">
      <button
class="btn btn-secondary"
@click="handleClose"
>
Cancelar
</button>
      <button
:disabled="submitting"
class="btn btn-primary"
@click="handleSave"
>
        <i
v-if="submitting"
class="fas fa-spinner fa-spin mr-2"
/>
        Guardar Configuración
      </button>
    </div>
  </div>
  </div>

  <!-- Modal para crear nuevo género -->
  <div
v-if="showNewGeneroModal"
class="modal-backdrop"
@click.self="closeNewGeneroModal"
>
    <div class="modal">
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-text-primary">
Crear Nuevo Género Musical
</h3>
        <button
class="btn btn-ghost btn-icon"
@click="closeNewGeneroModal"
>
          <i class="fas fa-times" />
        </button>
      </div>
      <div class="modal-body space-y-4">
        <div class="form-group">
          <label class="label">Nombre del Género</label>
        <input
          v-model="newGenero.genmus_nombre"
          type="text"
          class="input"
          placeholder="Ej: Rock, Pop, Jazz..."
          @keyup.enter="createGenero"
        >
      </div>
      </div>

      <div class="modal-footer">
        <button
class="btn btn-secondary"
@click="closeNewGeneroModal"
>
Cancelar
</button>
        <button
          :disabled="creatingGenero || !newGenero.genmus_nombre.trim()"
          class="btn btn-primary"
          @click="createGenero"
        >
          <i
v-if="creatingGenero"
class="fas fa-spinner fa-spin mr-2"
/>
          Crear Género
        </button>
      </div>
    </div>
  </div>

  <!-- Modal para crear nuevo subgénero -->
  <div
v-if="showNewSubgeneroModal"
class="modal-backdrop"
@click.self="closeNewSubgeneroModal"
>
    <div class="modal">
      <div class="modal-header">
        <h3 class="text-lg font-semibold text-text-primary">
Crear Nuevo Subgénero Musical
</h3>
        <button
class="btn btn-ghost btn-icon"
@click="closeNewSubgeneroModal"
>
          <i class="fas fa-times" />
        </button>
      </div>
      <div class="modal-body space-y-4">
        <div class="form-group">
          <label class="label">Género al que pertenece</label>
          <select
            v-model="newSubgenero.gemusu_genmus"
            :disabled="generos.length === 0"
            class="select"
          >
            <option value="">
Seleccione el género padre...
</option>
            <option
v-for="genero in generos"
:key="genero.genmus_codigo"
:value="genero.genmus_codigo"
>
              {{ genero.genmus_nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="label">Nombre del Subgénero</label>
          <input
            v-model="newSubgenero.gemusu_nombre"
            type="text"
            class="input"
            placeholder="Ej: Rock Alternativo, Pop Latino..."
            @keyup.enter="createSubgenero"
          >
        </div>
      </div>

      <div class="modal-footer">
        <button
class="btn btn-secondary"
@click="closeNewSubgeneroModal"
>
Cancelar
</button>
        <button
          :disabled="creatingSubgenero || !newSubgenero.gemusu_nombre.trim() || !newSubgenero.gemusu_genmus"
          class="btn btn-primary"
          @click="createSubgenero"
        >
          <i
v-if="creatingSubgenero"
class="fas fa-spinner fa-spin mr-2"
/>
          Crear Subgénero
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import generoMusicalService from '@/services/GeneroMusicalServices'
import generoMusicalSubService from '@/services/GeneroMusicalSubServices'
import RadioService from '@/services/RadioServices'
import RitmoService from '@/services/RitmoServices'
import EstiloService from '@/services/EstiloServices'
import TipoEmpresaService from '@/services/TipoEmpresaServices'

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

const emit = defineEmits(['update:show', 'updated'])

const localShow = ref(props.show)
const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('generos')

const tabs = [
  { id: 'generos', name: 'Géneros Musicales', icon: 'fas fa-music' },
  { id: 'ritmos', name: 'Ritmos', icon: 'fas fa-drum' },
  { id: 'tipos-estilos', name: 'Tipos de Empresa y Estilos', icon: 'fas fa-briefcase' }
]

// ========== GÉNEROS MUSICALES ==========
const generos = ref([])
const subgeneros = ref([])
const allSubgeneros = ref([])
const selectedGenero = ref('')
const selectedSubgeneros = ref([])

// Estado para crear nuevo género
const showNewGeneroModal = ref(false)
const creatingGenero = ref(false)
const newGenero = ref({
  genmus_nombre: ''
})

// Estado para crear nuevo subgénero
const showNewSubgeneroModal = ref(false)
const creatingSubgenero = ref(false)
const newSubgenero = ref({
  gemusu_nombre: '',
  gemusu_genmus: ''
})

// ========== RITMOS ==========
const ritmos = ref([])
const selectedRitmos = ref([])

// ========== TIPOS DE EMPRESA Y ESTILOS ==========
const tiposEmpresa = ref([])
const estilos = ref([])
const selectedTiposEmpresa = ref([])
const selectedEstilos = ref([])

watch(() => props.show, (newVal) => {
  localShow.value = newVal
  if (newVal) {
    console.log('=== Modal ManageRadioRelations abierto ===')
    console.log('Radio:', props.radio)
    loadAllData()
  }
})

watch(localShow, (newVal) => {
  emit('update:show', newVal)
})

// Pre-seleccionar el género actual cuando se abre el modal de nuevo subgénero
watch(showNewSubgeneroModal, (newVal) => {
  if (newVal && selectedGenero.value) {
    newSubgenero.value.gemusu_genmus = selectedGenero.value
  }
})

const loadAllData = async () => {
  loading.value = true
  try {
    // Cargar todas las opciones disponibles
    await Promise.all([
      loadGeneros(),
      loadAllSubgeneros(),
      loadRitmos(),
      loadTiposEmpresa(),
      loadEstilos()
    ])

    // Cargar las relaciones existentes de la radio
    if (props.radio?.rad_codigo) {
      await Promise.all([
        loadRadioSubgeneros(),
        loadRadioRitmos(),
        loadRadioTiposEmpresa(),
        loadRadioEstilos()
      ])
    }
  } finally {
    loading.value = false
  }
}

// ========== MÉTODOS DE CARGA - GÉNEROS ==========

const loadGeneros = async () => {
  try {
    const data = await generoMusicalService.getGeneros()
    generos.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al cargar géneros:', error)
    generos.value = []
  }
}

const loadAllSubgeneros = async () => {
  try {
    const data = await generoMusicalSubService.getAllSubGeneros()
    allSubgeneros.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al cargar subgéneros:', error)
    allSubgeneros.value = []
  }
}

const loadRadioSubgeneros = async () => {
  try {
    const data = await RadioService.getSubGenerosByRadio(props.radio.rad_codigo)
    selectedSubgeneros.value = Array.isArray(data) ? data.map(sg => sg.gemusu_codigo) : []
  } catch (error) {
    console.error('Error al cargar subgéneros de la radio:', error)
    selectedSubgeneros.value = []
  }
}

const loadSubGeneros = async () => {
  if (!selectedGenero.value) {
    subgeneros.value = []
    return
  }

  try {
    loading.value = true
    const data = await generoMusicalSubService.getSubGenerosByGenero(selectedGenero.value)
    subgeneros.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al cargar subgéneros:', error)
    subgeneros.value = []
  } finally {
    loading.value = false
  }
}

// ========== MÉTODOS DE CARGA - RITMOS ==========

const loadRitmos = async () => {
  try {
    const data = await RitmoService.getAll()
    ritmos.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al cargar ritmos:', error)
    ritmos.value = []
  }
}

const loadRadioRitmos = async () => {
  try {
    const data = await RadioService.getRitmosByRadio(props.radio.rad_codigo)
    selectedRitmos.value = Array.isArray(data) ? data.map(r => r.ritmos_codigo) : []
  } catch (error) {
    console.error('Error al cargar ritmos de la radio:', error)
    selectedRitmos.value = []
  }
}

// ========== MÉTODOS DE CARGA - TIPOS EMPRESA Y ESTILOS ==========

const loadTiposEmpresa = async () => {
  try {
    const data = await TipoEmpresaService.getAll()
    tiposEmpresa.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al cargar tipos de empresa:', error)
    tiposEmpresa.value = []
  }
}

const loadEstilos = async () => {
  try {
    const data = await EstiloService.getAll()
    estilos.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Error al cargar estilos:', error)
    estilos.value = []
  }
}

const loadRadioTiposEmpresa = async () => {
  try {
    const data = await RadioService.getTiposEmpresaByRadio(props.radio.rad_codigo)
    selectedTiposEmpresa.value = Array.isArray(data) ? data.map(t => t.tipEmp_codigo) : []
  } catch (error) {
    console.error('Error al cargar tipos de empresa de la radio:', error)
    selectedTiposEmpresa.value = []
  }
}

const loadRadioEstilos = async () => {
  try {
    const data = await RadioService.getEstilosByRadio(props.radio.rad_codigo)
    selectedEstilos.value = Array.isArray(data) ? data.map(e => e.estilo_codigo) : []
  } catch (error) {
    console.error('Error al cargar estilos de la radio:', error)
    selectedEstilos.value = []
  }
}

// ========== MÉTODOS DE SELECCIÓN - GÉNEROS ==========

const isSubgeneroSelected = (codigo) => {
  return selectedSubgeneros.value.includes(codigo)
}

const toggleSubgenero = (subgenero) => {
  const index = selectedSubgeneros.value.indexOf(subgenero.gemusu_codigo)
  if (index > -1) {
    selectedSubgeneros.value.splice(index, 1)
  } else {
    selectedSubgeneros.value.push(subgenero.gemusu_codigo)
  }
}

const removeSubgenero = (codigo) => {
  const index = selectedSubgeneros.value.indexOf(codigo)
  if (index > -1) {
    selectedSubgeneros.value.splice(index, 1)
  }
}

const getSubgeneroName = (codigo) => {
  const subgenero = allSubgeneros.value.find(s => s.gemusu_codigo === codigo)
  return subgenero ? subgenero.gemusu_nombre : codigo
}

const getSubgeneroGenero = (codigo) => {
  const subgenero = allSubgeneros.value.find(s => s.gemusu_codigo === codigo)
  return subgenero ? subgenero.genmus_nombre : ''
}

// ========== MÉTODOS PARA CREAR NUEVO GÉNERO ==========

const createGenero = async () => {
  if (!newGenero.value.genmus_nombre.trim()) {
    console.warn('El nombre del género es requerido')
    return
  }

  creatingGenero.value = true
  try {
    const payload = {
      genmus_nombre: newGenero.value.genmus_nombre.trim()
    }

    await generoMusicalService.crearGenero(payload)

    // Recargar la lista de géneros
    await loadGeneros()

    // Limpiar y cerrar modal
    closeNewGeneroModal()

    if (window.$toast) {
      window.$toast(`Género "${newGenero.value.genmus_nombre}" creado exitosamente`, 'success')
    }
  } catch (error) {
    console.error('Error al crear género:', error)
    if (window.$toast) {
      window.$toast('Error al crear el género', 'error')
    }
  } finally {
    creatingGenero.value = false
  }
}

const closeNewGeneroModal = () => {
  showNewGeneroModal.value = false
  newGenero.value = {
    genmus_nombre: ''
  }
}

// ========== MÉTODOS PARA CREAR NUEVO SUBGÉNERO ==========

const createSubgenero = async () => {
  if (!newSubgenero.value.gemusu_nombre.trim() || !newSubgenero.value.gemusu_genmus) {
    console.warn('El nombre del subgénero y el género padre son requeridos')
    return
  }

  creatingSubgenero.value = true
  try {
    const payload = {
      gemusu_nombre: newSubgenero.value.gemusu_nombre.trim(),
      gemusu_codigoGeneroMusical: newSubgenero.value.gemusu_genmus
    }

    await generoMusicalSubService.crearSubGenero(payload)

    // Recargar la lista de subgéneros
    await loadAllSubgeneros()

    // Si estaba seleccionado el género padre, recargar los subgéneros de ese género
    if (selectedGenero.value === newSubgenero.value.gemusu_genmus) {
      await loadSubGeneros()
    }

    // Limpiar y cerrar modal
    closeNewSubgeneroModal()

    if (window.$toast) {
      window.$toast(`Subgénero "${newSubgenero.value.gemusu_nombre}" creado exitosamente`, 'success')
    }
  } catch (error) {
    console.error('Error al crear subgénero:', error)
    if (window.$toast) {
      window.$toast('Error al crear el subgénero', 'error')
    }
  } finally {
    creatingSubgenero.value = false
  }
}

const closeNewSubgeneroModal = () => {
  showNewSubgeneroModal.value = false
  newSubgenero.value = {
    gemusu_nombre: '',
    gemusu_genmus: selectedGenero.value || ''
  }
}

// ========== MÉTODOS DE SELECCIÓN - RITMOS ==========

const isRitmoSelected = (codigo) => {
  return selectedRitmos.value.includes(codigo)
}

const toggleRitmo = (ritmo) => {
  const index = selectedRitmos.value.indexOf(ritmo.ritmos_codigo)
  if (index > -1) {
    selectedRitmos.value.splice(index, 1)
  } else {
    selectedRitmos.value.push(ritmo.ritmos_codigo)
  }
}

const removeRitmo = (codigo) => {
  const index = selectedRitmos.value.indexOf(codigo)
  if (index > -1) {
    selectedRitmos.value.splice(index, 1)
  }
}

const getRitmoName = (codigo) => {
  const ritmo = ritmos.value.find(r => r.ritmos_codigo === codigo)
  return ritmo ? ritmo.ritmos_nombre : codigo
}

// ========== MÉTODOS DE SELECCIÓN - TIPOS EMPRESA ==========

const isTipoEmpresaSelected = (codigo) => {
  return selectedTiposEmpresa.value.includes(codigo)
}

const toggleTipoEmpresa = (tipo) => {
  const index = selectedTiposEmpresa.value.indexOf(tipo.tipEmp_codigo)
  if (index > -1) {
    selectedTiposEmpresa.value.splice(index, 1)
  } else {
    selectedTiposEmpresa.value.push(tipo.tipEmp_codigo)
  }
}

const removeTipoEmpresa = (codigo) => {
  const index = selectedTiposEmpresa.value.indexOf(codigo)
  if (index > -1) {
    selectedTiposEmpresa.value.splice(index, 1)
  }
}

const getTipoEmpresaName = (codigo) => {
  const tipo = tiposEmpresa.value.find(t => t.tipEmp_codigo === codigo)
  return tipo ? tipo.tipEmp_nombre : codigo
}

// ========== MÉTODOS DE SELECCIÓN - ESTILOS ==========

const isEstiloSelected = (codigo) => {
  return selectedEstilos.value.includes(codigo)
}

const toggleEstilo = (estilo) => {
  const index = selectedEstilos.value.indexOf(estilo.estilo_codigo)
  if (index > -1) {
    selectedEstilos.value.splice(index, 1)
  } else {
    selectedEstilos.value.push(estilo.estilo_codigo)
  }
}

const removeEstilo = (codigo) => {
  const index = selectedEstilos.value.indexOf(codigo)
  if (index > -1) {
    selectedEstilos.value.splice(index, 1)
  }
}

const getEstiloName = (codigo) => {
  const estilo = estilos.value.find(e => e.estilo_codigo === codigo)
  return estilo ? estilo.estilo_nombre : codigo
}

// ========== GUARDAR CAMBIOS ==========

const handleSave = async () => {
  if (!props.radio?.rad_codigo) {
    console.error('No hay radio seleccionada')
    return
  }

  submitting.value = true
  try {
    const promises = []

    // Guardar géneros musicales
    if (selectedSubgeneros.value.length > 0) {
      const codigosGMS = selectedSubgeneros.value.join(',')
      promises.push(
        RadioService.relacionarGenerosMusicales(props.radio.rad_codigo, codigosGMS)
          .then(() => console.log('✅ Géneros musicales guardados'))
          .catch(err => console.error('❌ Error guardando géneros:', err))
      )
    }

    // Guardar ritmos
    if (selectedRitmos.value.length > 0) {
      const codigosRitmo = selectedRitmos.value.join(',')
      promises.push(
        RadioService.relacionarRitmos(props.radio.rad_codigo, codigosRitmo)
          .then(() => console.log('✅ Ritmos guardados'))
          .catch(err => console.error('❌ Error guardando ritmos:', err))
      )
    }

    // Guardar tipos de empresa y estilos
    if (selectedTiposEmpresa.value.length > 0 || selectedEstilos.value.length > 0) {
      const codigosTipoEmpresa = selectedTiposEmpresa.value.join(',')
      const codigosEstilo = selectedEstilos.value.join(',')
      promises.push(
        RadioService.relacionarTipoEmpresaEstilo(props.radio.rad_codigo, codigosTipoEmpresa, codigosEstilo)
          .then(() => console.log('✅ Tipos de empresa y estilos guardados'))
          .catch(err => console.error('❌ Error guardando tipos de empresa y estilos:', err))
      )
    }

    await Promise.all(promises)

    // Emitir evento de actualización
    emit('updated')

    // Mostrar notificación de éxito
    if (window.$toast) {
      window.$toast('Configuración de la radio guardada correctamente', 'success')
    }

    handleClose()
  } catch (error) {
    console.error('Error al guardar configuración:', error)
    if (window.$toast) {
      window.$toast('Error al guardar la configuración', 'error')
    }
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  localShow.value = false
  selectedGenero.value = ''
  subgeneros.value = []
  selectedSubgeneros.value = []
  selectedRitmos.value = []
  selectedTiposEmpresa.value = []
  selectedEstilos.value = []
  activeTab.value = 'generos'
  // Cerrar modales de creación si están abiertos
  showNewGeneroModal.value = false
  showNewSubgeneroModal.value = false
}
</script>
