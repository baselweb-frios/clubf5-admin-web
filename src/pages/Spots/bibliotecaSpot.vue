<template>
  <div class="page-content">
    <!-- Loading Overlay -->
    <LoadingOverlay
      :show="isLoading"
      text="Cargando datos..."
      fullscreen
    />

    <!-- Contenido principal -->
    <template v-if="!isLoading">
      <!-- Header con acciones principales -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
          <!-- Título y programación activa -->
          <div class="flex-1">
            <h1 class="text-3xl font-bold text-text-primary mb-2">
              Gestión de Spots
            </h1>
            <div
              v-if="selectedProgramacion"
              class="flex items-center gap-3 flex-wrap"
            >
              <div class="flex items-center gap-2">
                <i class="fa fa-calendar-check-o text-primary-400" />
                <span class="text-text-secondary text-sm">Programación:</span>
                <strong class="text-text-primary">{{ selectedProgramacion.clipro_nombre }}</strong>
              </div>
              <button
                v-if="isClienteRole"
                class="btn btn-ghost btn-sm"
                @click="openProgramacionSelector"
              >
                <i class="fa fa-exchange mr-1" />
                Cambiar
              </button>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="flex flex-wrap gap-3">
            <button
              class="btn btn-secondary btn-lg flex items-center gap-2 shadow-md"
              @click="showLibraryModal = true"
            >
              <i class="fa fa-music text-lg" />
              <span>Biblioteca</span>
              <span class="badge badge-info">{{ spots.length }}</span>
            </button>

            <button
              class="btn btn-primary btn-lg flex items-center gap-2 shadow-lg"
              :disabled="!selectedProgramacion"
              @click="showProgrammingModal = true"
            >
              <i class="fa fa-calendar-plus-o text-lg" />
              <span>Programar Salidas</span>
            </button>

            <button
              v-if="canCreateProgramacion"
              class="btn btn-success btn-lg"
              @click="openCreateProgramacionModal"
            >
              <i class="fa fa-plus" />
            </button>
          </div>
        </div>

        <!-- Toggle spots vencidos -->
        <div class="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              :checked="spotsStore.showExpiredSpots"
              class="checkbox"
              @change="handleToggleExpiredSpots"
            >
            <span class="flex items-center gap-2 text-sm">
              <i :class="spotsStore.showExpiredSpots ? 'fa fa-eye text-primary-400' : 'fa fa-eye-slash text-text-tertiary'" />
              {{ spotsStore.showExpiredSpots ? 'Mostrando todos los spots' : 'Solo spots vigentes' }}
            </span>
          </label>

          <div class="flex flex-wrap gap-4 text-sm">
            <span class="flex items-center gap-2 text-text-secondary">
              <i class="fa fa-check-circle text-success-400" />
              <strong class="text-text-primary">{{ spotsStore.activeSpotsCount }}</strong> vigentes
            </span>
            <span
              v-if="spotsStore.expiredSpotsCount > 0"
              class="flex items-center gap-2 text-text-secondary"
            >
              <i class="fa fa-times-circle text-danger-400" />
              <strong class="text-text-primary">{{ spotsStore.expiredSpotsCount }}</strong> vencidos
            </span>
            <span class="flex items-center gap-2 text-text-secondary">
              <i class="fa fa-layer-group text-primary-400" />
              <strong class="text-text-primary">{{ spotsStore.allSpotsCount }}</strong> total
            </span>
          </div>
        </div>
      </div>

      <!-- Calendario Principal -->
      <div class="card p-6">
        <WeeklyCalendar
          :programaciones="programaciones"
          :week-days="weekDays"
          :reproductores="reproductores"
          @cell-click="handleCalendarCellClick"
          @program-click="handleProgramClick"
          @edit="handleEditProgramacion"
          @delete="handleDeleteProgramaciones"
        />
      </div>

      <!-- Modales -->
      <!-- Modal Selector de Programación -->
      <Modal
        v-model="showProgramacionSelector"
        title="Seleccionar Programación"
        size="md"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <i class="fa fa-list text-primary-400" />
            <h3 class="text-lg font-semibold text-text-primary">
              Seleccionar Programación
            </h3>
          </div>
        </template>

        <div v-if="availableProgramaciones.length === 0" class="flex flex-col items-center justify-center gap-4 py-8">
          <i class="fa fa-inbox text-3xl text-text-secondary" />
          <p class="text-text-secondary">
            No hay programaciones disponibles
          </p>
          <button
            v-if="canCreateProgramacion"
            class="btn btn-primary"
            @click="openCreateProgramacionModal"
          >
            <i class="fa fa-plus" />
            Crear Nueva Programación
          </button>
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="prog in availableProgramaciones"
            :key="prog.clipro_codigo"
            class="card card-hover cursor-pointer flex items-center justify-between"
            :class="{ 'ring-2 ring-primary-500': selectedProgramacion && selectedProgramacion.clipro_codigo === prog.clipro_codigo }"
            @click="selectProgramacion(prog)"
          >
            <div class="flex items-center gap-3 flex-1">
              <div class="flex-shrink-0">
                <i class="fa fa-calendar text-primary-400" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold">
                  {{ prog.clipro_nombre }}
                </h4>
                <p class="text-sm text-text-secondary">
                  Código: {{ prog.clipro_codigo }}
                </p>
              </div>
            </div>
            <div class="text-text-secondary">
              <i class="fa fa-chevron-right" />
            </div>
          </div>
        </div>

        <template v-if="canCreateProgramacion && availableProgramaciones.length > 0" #footer>
          <button class="btn btn-secondary w-full" @click="openCreateProgramacionModal">
            <i class="fa fa-plus" />
            Crear Nueva Programación
          </button>
        </template>
      </Modal>

      <!-- Modal Crear Nueva Programación -->
      <Modal
        v-model="showCreateProgramacionModal"
        title="Crear Nueva Programación"
        size="md"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <i class="fa fa-plus-circle text-primary-400" />
            <h3 class="text-lg font-semibold text-text-primary">
              Crear Nueva Programación
            </h3>
          </div>
        </template>

        <div class="form-group">
          <label class="label">
            <i class="fa fa-tag" />
            Nombre de la Programación
          </label>
          <input
            v-model="newProgramacionName"
            type="text"
            class="input"
            placeholder="Ej: Programación Verano 2025"
            autofocus
            @keyup.enter="createNuevaProgramacion"
          >
          <p class="text-xs text-text-secondary mt-1">
            <i class="fa fa-info-circle" />
            Ingresa un nombre descriptivo para identificar esta programación
          </p>
        </div>

        <template #footer>
          <button class="btn btn-secondary" @click="closeCreateProgramacionModal">
            <i class="fa fa-times" />
            Cancelar
          </button>
          <button
            :disabled="!newProgramacionName || newProgramacionName.trim() === ''"
            class="btn btn-primary"
            @click="createNuevaProgramacion"
          >
            <i class="fa fa-check" />
            Crear Programación
          </button>
        </template>
      </Modal>

      <!-- Modal de Biblioteca -->
      <SpotLibraryModal
        v-model="showLibraryModal"
        :spots="spots"
        :selected-spots="selectedSpots"
        @create="handleCreate"
        @edit="handleEdit"
        @delete="handleDelete"
        @selection-change="handleSpotSelection"
      />

      <!-- Modal de Programación -->
      <ProgrammingModal
        v-model="showProgrammingModal"
        :spots="spots"
        :programaciones="programaciones"
        :reproductores="reproductores"
        :codigo-programacion="selectedProgramacion?.clipro_codigo"
        :initial-reproductor="currentFilters.reproductor"
        :initial-start-time="currentFilters.startTime"
        :initial-end-time="currentFilters.endTime"
        :initial-selected-days="currentFilters.selectedDays"
        @delete-programaciones="handleDeleteProgramaciones"
        @refresh-programaciones="handleRefreshProgramaciones"
        @filter-change="handleFilterChange"
      />

      <!-- Tour Button -->
      <TourButton
        v-if="hasTour() && !isTourViewed()"
        variant="floating"
        size="md"
        :pulse="true"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useSpotsStore } from '@/stores/spots'
import { useProgramacionSpotsStore } from '@/stores/programacionSpots'
import { useSucursalesStore } from '@/stores/sucursales'
import UserService from '@/services/UserServices'
import clienteProgramacionService from '@/services/ClienteProgramacionServices'
import spotService from '@/services/SpotServices'
import DiaHabilService from '@/services/DiaHabilService'

// Components
import { WeeklyCalendar, SpotLibraryModal, ProgrammingModal } from '@/components/spots'
import { LoadingOverlay } from '@/components'
import Modal from '@/components/ui/Modal.vue'
import { useDriverTour } from '@/composables/useDriverTour'
import { useSignalRAuth } from '@/composables/useSignalRAuth'

// Router
const router = useRouter()

// SignalR
const signalR = useSignalRAuth()

// Driver.js tour
const { startTour, hasTour, isTourViewed } = useDriverTour({ autoStart: true })

// Get global properties
const { proxy } = getCurrentInstance()

// Stores
const spotsStore = useSpotsStore()
const programacionSpotsStore = useProgramacionSpotsStore()
const sucursalesStore = useSucursalesStore()

// Reactive state
const selectedSpots = ref([])
const selectedProgramaciones = ref([])
const clienteData = ref(null)
const availableProgramaciones = ref([])
const selectedProgramacion = ref(null)
const showProgramacionSelector = ref(false)
const showCreateProgramacionModal = ref(false)
const showLibraryModal = ref(false)
const showProgrammingModal = ref(false)
const newProgramacionName = ref('')

const currentFilters = ref({
  reproductor: '',
  startTime: '08:00',
  endTime: '23:00',
  selectedDays: []
})

// Días hábiles del cliente cargados desde el servidor
const diasHabiles = ref([0, 1, 2, 3, 4, 5, 6]) // Todos los días por defecto

// Todos los días de la semana (para referencia)
const allWeekDays = [
  { text: 'Domingo', value: 0, isHabil: true },
  { text: 'Lunes', value: 1, isHabil: true },
  { text: 'Martes', value: 2, isHabil: true },
  { text: 'Miércoles', value: 3, isHabil: true },
  { text: 'Jueves', value: 4, isHabil: true },
  { text: 'Viernes', value: 5, isHabil: true },
  { text: 'Sábado', value: 6, isHabil: true }
]

// Computed properties
const spots = computed(() => spotsStore.spotsDisponibles || [])
const programaciones = computed(() => {
  // Enriquecer programaciones con datos de spots
  const progs = programacionSpotsStore.programacionesByPrograma || []
  return progs.map(prog => ({
    ...prog,
    _spot: spots.value.find(s => s.spo_codigo === prog.clprsp_codigoSpot)
  }))
})
const reproductores = computed(() => sucursalesStore.sucursales || [])
const isLoading = computed(() => spotsStore.loading || programacionSpotsStore.loading || sucursalesStore.loading)

// Filtrar días de la semana según días hábiles del cliente
const weekDays = computed(() => {
  return allWeekDays.map(day => ({
    ...day,
    isHabil: diasHabiles.value.includes(day.value)
  }))
})

const isClienteRole = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'Cliente'
})

const currentUser = computed(() => {
  return JSON.parse(localStorage.getItem('user') || '{}')
})

const canCreateProgramacion = computed(() => isClienteRole.value)

// Methods - Los mismos del archivo original pero adaptados
const loadSpots = async () => {
  try {
    const spotsData = await spotsStore.loadSpotsDisponibles()
    localStorage.setItem('spots', JSON.stringify(spotsData))
    return spotsData
  } catch (error) {
    proxy.$toast('Error al cargar los spots', 'error')
    console.error('Error loading spots:', error)
  }
}

const loadReproductores = async () => {
  try {
    await sucursalesStore.loadSucursales()
  } catch (error) {
    proxy.$toast('Error al cargar los reproductores', 'error')
    console.error('Error loading reproductores:', error)
  }
}

const loadDiasHabiles = async () => {
  try {
    const dias = await DiaHabilService.get()
    if (dias && dias.length > 0) {
      const diasHabilesArray = []
      dias.forEach(element => {
        diasHabilesArray.push(element.cliDha_codigoDia)
      })
      diasHabiles.value = diasHabilesArray
    }
  } catch (error) {
    console.error('Error cargando días hábiles del cliente:', error)
  }
}

const loadClienteProgramaciones = async () => {
  try {
    const userData = currentUser.value
    if (!userData || !userData.Cliente) {
      proxy.$toast('Error: No se pudieron obtener los datos del cliente', 'error')
      return
    }

    clienteData.value = JSON.parse(userData.Cliente)
    await clienteProgramacionService.listarProgSpot()

    const progSpotsData = localStorage.getItem('listProgSpot')
    if (!progSpotsData) {
      if (isClienteRole.value) {
        proxy.$toast('No tienes programaciones creadas. Crea una nueva para comenzar.', 'info')
        showProgramacionSelector.value = true
      }
      return
    }

    const progSpots = JSON.parse(progSpotsData)
    if (!Array.isArray(progSpots) || progSpots.length === 0) {
      if (isClienteRole.value) {
        showProgramacionSelector.value = true
      }
      return
    }

    availableProgramaciones.value = progSpots

    // Auto-seleccionar programación
    let programacionToSelect = null
    if (!isClienteRole.value) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const sucursal = sucursalesStore.sucursales.find(s => s.username === user.unique_name)
      programacionToSelect = availableProgramaciones.value.find(p => p.clipro_codigo === sucursal?.sucpgr_codigoProgramacionSpot) || []
    } else {
      programacionToSelect = progSpots[0]
    }

    if (programacionToSelect) {
      selectProgramacion(programacionToSelect)
    } else if (progSpots.length > 1) {
      showProgramacionSelector.value = true
    }
  } catch (error) {
    console.error('Error cargando programaciones del cliente:', error)
    proxy.$toast('Error al cargar las programaciones', 'error')
  }
}

const loadProgramaciones = async () => {
  try {
    if (!selectedProgramacion.value) {
      return
    }

    const codigoProgramacion = selectedProgramacion.value.clipro_codigo
    await programacionSpotsStore.loadProgramacionesByPrograma(codigoProgramacion, '00:00')
  } catch (error) {
    proxy.$toast('Error al cargar las programaciones', 'error')
    console.error('Error loading programaciones:', error)
  }
}

const selectProgramacion = async (programacion) => {
  selectedProgramacion.value = programacion
  localStorage.setItem('selectedProgramacion', JSON.stringify(programacion))
  showProgramacionSelector.value = false
  await loadProgramaciones()
  proxy.$toast(`Programación "${programacion.clipro_nombre}" seleccionada`, 'success')
}

const openProgramacionSelector = () => {
  showProgramacionSelector.value = true
}

const openCreateProgramacionModal = () => {
  newProgramacionName.value = ''
  showCreateProgramacionModal.value = true
}

const closeCreateProgramacionModal = () => {
  showCreateProgramacionModal.value = false
  newProgramacionName.value = ''
}

const createNuevaProgramacion = async () => {
  if (!newProgramacionName.value || newProgramacionName.value.trim() === '') {
    proxy.$toast('Debes ingresar un nombre para la programación', 'warning')
    return
  }

  if (!clienteData.value) {
    proxy.$toast('Error: No se encontraron datos del cliente', 'error')
    return
  }

  try {
    await spotService.altaProgramacion(0, newProgramacionName.value)
    proxy.$toast(`Programación "${newProgramacionName.value}" creada exitosamente`, 'success')
    await loadClienteProgramaciones()
    closeCreateProgramacionModal()
  } catch (error) {
    console.error('Error creando programación:', error)
    proxy.$toast('Error al crear la programación: ' + (error.message || error), 'error')
  }
}

const handleCreate = () => {
  router.push({ name: 'Cargá tu spot' })
}

const handleEdit = (pspot) => {
  let spot = {...pspot}
  router.push({
    name: 'Cargá tu spot',
    state: { spot }
  })
}

const handleDelete = async (spotsToDelete) => {
  if (!confirm('¿Está seguro de eliminar el/los spot(s)?')) {
    return
  }

  try {
    const deletePromises = spotsToDelete.map(spot => spotsStore.deleteSpot(spot.spo_codigo))
    const results = await Promise.all(deletePromises)
    proxy.$toast(`Spot(s) eliminado(s): ${results.filter(r => r).join(', ')}`, 'success')
    await loadSpots()
    selectedSpots.value = []
  } catch (error) {
    proxy.$toast('Error al eliminar el/los spot(s)', 'error')
    console.error('Error deleting spots:', error)
  }
}

const handleSpotSelection = (selected) => {
  selectedSpots.value = selected
}

const handleDeleteProgramaciones = async (programacionesToDelete) => {
  if (!confirm('¿Está seguro de eliminar la/las programaciones?')) {
    return
  }

  try {
    const deletePromises = programacionesToDelete.map(prog =>
      programacionSpotsStore.deleteProgramacionSpot(prog.clprsp_codigo, prog.clprsp_usuario)
    )
    const results = await Promise.all(deletePromises)
    const successResults = results.filter(r => r && r !== -1)

    if (successResults.length == 0) {
      proxy.$toast('Se produjo un error al eliminar', 'error')
      return
    }

    proxy.$toast(`Programa(s) eliminado(s): ${successResults.join(', ')}`, 'success')
    await loadProgramaciones()
    selectedProgramaciones.value = []
  } catch (error) {
    proxy.$toast('Error al eliminar las programaciones', 'error')
    console.error('Error deleting programaciones:', error)
  }
}

const handleRefreshProgramaciones = async () => {
  try {
    await loadProgramaciones()
    proxy.$toast('Programaciones recargadas correctamente', 'success')
  } catch (error) {
    proxy.$toast('Error al recargar las programaciones', 'error')
    console.error('Error refreshing programaciones:', error)
  }
}

const handleFilterChange = (filterData) => {
  currentFilters.value = { ...filterData }
}

const handleToggleExpiredSpots = () => {
  spotsStore.toggleShowExpiredSpots()

  if (spotsStore.showExpiredSpots) {
    proxy.$toast(`Mostrando todos los spots (${spotsStore.allSpotsCount} total, ${spotsStore.expiredSpotsCount} vencidos)`, 'info')
  } else {
    proxy.$toast(`Mostrando solo spots vigentes (${spotsStore.activeSpotsCount} spots)`, 'success')
  }
}

const handleCalendarCellClick = ({ day, hour }) => {
  console.log('Cell clicked:', day, hour)
  // Podría abrir el modal de programación con estos valores pre-seleccionados
  showProgrammingModal.value = true
}

const handleProgramClick = (prog) => {
  console.log('Program clicked:', prog)
  // Mostrar detalles o editar
}

const handleEditProgramacion = (prog) => {
  console.log('Edit program:', prog)
  // Implementar lógica de edición
}

const getCurrentUser = () => {
  try {
    return UserService.current()
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Lifecycle hooks
onMounted(async () => {
  try {
    currentFilters.value = {
      reproductor: '',
      startTime: '',
      endTime: '',
      selectedDays: []
    }

    getCurrentUser()
    await loadDiasHabiles()
    await Promise.all([loadSpots(), loadReproductores()])
    await loadClienteProgramaciones()
  } catch (error) {
    proxy.$toast('Error al inicializar el componente', 'error')
    console.error('Error initializing component:', error)
  }
})
</script>
