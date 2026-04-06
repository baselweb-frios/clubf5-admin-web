<template>
  <div class="page-content">
    <div class="space-y-6">
    <!-- Loading Overlay - Solo durante carga inicial -->
    <LoadingOverlay
:show="isLoading"
text="Cargando biblioteca de spots..."
fullscreen
/>

    <!-- Contenido principal - Solo visible cuando NO está cargando -->
    <template v-if="!isLoading">
      <!-- Selector de Programación -->
      <div
        v-if="selectedProgramacion"
        data-tour="spot-programacion"
        class="card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-3 flex-wrap">
          <i class="fa fa-calendar-check-o text-primary-400 text-lg" />
          <span class="text-text-secondary text-sm">Programación Activa:</span>
          <strong class="text-text-primary">{{ selectedProgramacion.clipro_nombre }}</strong>
        </div>
        <div class="flex gap-2">
          <button
            v-if="isClienteRole"
            class="btn btn-secondary btn-sm"
            title="Cambiar programación"
            @click="openProgramacionSelector"
          >
            <i class="fa fa-exchange" />
            Cambiar
          </button>
          <button
            v-if="canCreateProgramacion"
            class="btn btn-primary btn-sm"
            @click="openCreateProgramacionModal"
          >
            <i class="fa fa-plus" />
            Nueva Programación
          </button>
        </div>
      </div>

      <!-- Control para mostrar/ocultar spots vencidos -->
      <div class="card">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <label class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              :checked="spotsStore.showExpiredSpots"
              class="checkbox"
              @change="handleToggleExpiredSpots"
            >
            <span class="flex items-center gap-2 text-sm text-text-primary">
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

      <!-- Modal Selector de Programación -->
      <Modal
        v-model="showProgramacionSelector"
        title="Seleccionar Programación"
        size="md"
        :close-on-overlay="true"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <i class="fa fa-list text-primary-400" />
            <h3 class="text-lg font-semibold text-text-primary">
Seleccionar Programación
</h3>
          </div>
        </template>

        <div
          v-if="availableProgramaciones.length === 0"
          class="flex flex-col items-center justify-center gap-4 py-8"
        >
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

        <div
v-else
class="programaciones-list space-y-2"
>
          <div
            v-for="prog in availableProgramaciones"
            :key="prog.clipro_codigo"
            class="programacion-item card card-hover cursor-pointer flex items-center justify-between"
            :class="{ 'ring-2 ring-primary-500': selectedProgramacion && selectedProgramacion.clipro_codigo === prog.clipro_codigo }"
            @click="selectProgramacion(prog)"
          >
            <div class="flex items-center gap-3 flex-1">
              <div class="programacion-item-icon flex-shrink-0">
                <i class="fa fa-calendar text-primary-400" />
              </div>
              <div class="programacion-item-info flex-1">
                <h4 class="font-semibold">
{{ prog.clipro_nombre }}
</h4>
                <p class="text-sm text-text-secondary">
Código: {{ prog.clipro_codigo }}
</p>
              </div>
            </div>
            <div class="programacion-item-action text-text-secondary">
              <i class="fa fa-chevron-right" />
            </div>
          </div>
        </div>

        <template
v-if="canCreateProgramacion && availableProgramaciones.length > 0"
#footer
>
          <button
            class="btn btn-secondary w-full"
            @click="openCreateProgramacionModal"
          >
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
        :close-on-overlay="true"
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
          <button
class="btn btn-secondary"
@click="closeCreateProgramacionModal"
>
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

      <div class="card p-0 overflow-hidden">
        <div
data-tour="spot-tabs"
class="flex border-b border-dark-border"
>
          <button
            class="flex-1 px-4 py-3 font-medium text-sm transition-all border-b-2"
            :class="activeTab === 'spots' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'"
            @click="activeTab = 'spots'"
          >
            <i class="fa fa-music mr-2" />
            Spots
          </button>
          <button
            class="flex-1 px-4 py-3 font-medium text-sm transition-all border-b-2"
            :class="activeTab === 'programar' ? 'border-primary-500 text-primary-400 bg-primary-500/5' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-dark-hover'"
            @click="activeTab = 'programar'"
          >
            <i class="fa fa-calendar mr-2" />
            Programar
          </button>
        </div>

        <div
v-if="activeTab === 'spots'"
data-tour="spot-table"
class="p-4 sm:p-6"
>
          <SpotTable
            :spots="spots"
            :selected-spots="selectedSpots"
            @create="handleCreate"
            @edit="handleEdit"
            @delete="handleDelete"
            @selection-change="handleSpotSelection"
          />
        </div>

        <div
v-if="activeTab === 'programar'"
class="p-4 sm:p-6"
>
          <ProgrammingInterface
            :spots="spots"
            :programaciones="programaciones"
            :reproductores="reproductores"
            :codigo-programacion="selectedProgramacion?.clipro_codigo"
            :initial-reproductor="currentFilters.reproductor"
            :initial-start-time="currentFilters.startTime"
            :initial-end-time="currentFilters.endTime"
            :initial-selected-days="currentFilters.selectedDays"
            @program-spots="handleProgramSpots"
            @program-multiple-minutes="handleMultipleMinutesProgramming"
            @calendar-program-spots="handleCalendarProgramSpots"
            @save-programaciones-batch="handleSaveProgramacionesBatch"
            @delete-programaciones="handleDeleteProgramaciones"
            @refresh-programaciones="handleRefreshProgramaciones"
            @filter-change="handleFilterChange"
          />
        </div>
      </div>
    </template>

    <!-- Tour Button -->
    <TourButton
v-if="hasTour() && !isTourViewed()"
variant="floating"
size="md"
:pulse="true"
/>
  </div>
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
import SpotTable from './SpotTable.vue'
import ProgrammingInterface from './ProgrammingInterface.vue'
import { LoadingOverlay } from '@/components'
import Modal from '@/components/ui/Modal.vue'
import { useDriverTour } from '@/composables/useDriverTour'

// Router
const router = useRouter()

// Driver.js tour
const { startTour, hasTour, isTourViewed } = useDriverTour({ autoStart: true })

// Get global properties
const { proxy } = getCurrentInstance()

// Stores
const spotsStore = useSpotsStore()
const programacionSpotsStore = useProgramacionSpotsStore()
const sucursalesStore = useSucursalesStore()

// Reactive state
const activeTab = ref('spots')
const selectedSpots = ref([])
const selectedProgramaciones = ref([])
const clienteData = ref(null)
const availableProgramaciones = ref([])
const selectedProgramacion = ref(null)
const showProgramacionSelector = ref(false)
const showCreateProgramacionModal = ref(false)
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
  { text: 'Domingo', value: 0 },
  { text: 'Lunes', value: 1 },
  { text: 'Martes', value: 2 },
  { text: 'Miércoles', value: 3 },
  { text: 'Jueves', value: 4 },
  { text: 'Viernes', value: 5 },
  { text: 'Sábado', value: 6 }
]

const categoryLabels = ref({
  inst: 'Institucional',
  prom: 'Promocional',
  noti: 'Noticias'
})

// Computed properties
const spots = computed(() => {
  const spotsData = spotsStore.spotsDisponibles || []
  console.log('💾 Computed spots:', spotsData.length, 'spots disponibles')
  return spotsData
})

const programaciones = computed(() => {
  const progData = programacionSpotsStore.programacionesByPrograma || []
  console.log('💾 Computed programaciones:', progData.length, 'programaciones')
  console.log('💾 Computed programaciones - datos:', progData)
  return progData
})

const reproductores = computed(() => sucursalesStore.sucursales || [])
const isLoading = computed(() => spotsStore.loading || programacionSpotsStore.loading || sucursalesStore.loading)

// Filtrar días de la semana según días hábiles del cliente
const weekDays = computed(() => {
  return allWeekDays.filter(day => diasHabiles.value.includes(day.value))
})

// Estadísticas de spots
const spotsVigentes = computed(() => {
  return spots.value.filter(spot => {
    if (spot.spo_tipo === 'inst') return true
    if (!spot.spo_fecfin) return true
    const fechaFin = proxy.$moment(spot.spo_fecfin, ['YYYY-MM-DD', 'DD/MM/YYYY'])
    return fechaFin.isSameOrAfter(proxy.$moment().startOf('day'))
  })
})

const canEdit = computed(() => selectedSpots.value.length === 1)
const canDelete = computed(() => selectedSpots.value.length > 0)

const isClienteRole = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'Cliente'
})

const currentUser = computed(() => {
  return JSON.parse(localStorage.getItem('user') || '{}')
})

const canCreateProgramacion = computed(() => isClienteRole.value)

// Methods
const loadSpots = async () => {
  try {
    const spotsData = await spotsStore.loadSpotsDisponibles()
    localStorage.setItem('spots', JSON.stringify(spotsData))

    // Log informativo sobre spots filtrados
    const institucionales = spotsData.filter(s => s.spo_tipo === 'inst').length
    const promocionales = spotsData.filter(s => s.spo_tipo !== 'inst').length
    console.log(`✅ Spots cargados - Total: ${spotsData.length} (${institucionales} institucionales, ${promocionales} promocionales vigentes)`)

    return spotsData
  } catch (error) {
    proxy.$toast('Error al cargar los spots', 'error')
    console.error('Error loading spots:', error)
  }
}

const loadReproductores = async () => {
  try {
    console.log('📡 Cargando sucursales (reproductores)...')
    await sucursalesStore.loadSucursales()
    console.log('✅ Sucursales cargadas')
  } catch (error) {
    proxy.$toast('Error al cargar los reproductores', 'error')
    console.error('❌ Error loading reproductores:', error)
  }
}

// Cargar días hábiles del cliente desde el servidor
const loadDiasHabiles = async () => {
  try {
    console.log('📅 Cargando días hábiles del cliente...')
    const dias = await DiaHabilService.get()

    if (dias && dias.length > 0) {
      const diasHabilesArray = []
      dias.forEach(element => {
        diasHabilesArray.push(element.cliDha_codigoDia)
      })
      diasHabiles.value = diasHabilesArray
      console.log('✅ Días hábiles configurados:', diasHabiles.value)
    } else {
      console.warn('⚠️ No se encontraron días hábiles, usando todos los días por defecto')
    }
  } catch (error) {
    console.error('❌ Error cargando días hábiles del cliente:', error)
    console.warn('⚠️ Usando todos los días por defecto')
  }
}

const loadClienteProgramaciones = async () => {
  try {
    console.log('🚀 Iniciando carga de programaciones del cliente...')

    // Obtener datos del cliente desde localStorage
    const userData = currentUser.value
    if (!userData || !userData.Cliente) {
      console.error('❌ No se encontraron datos del cliente')
      proxy.$toast('Error: No se pudieron obtener los datos del cliente', 'error')
      return
    }

    clienteData.value = JSON.parse(userData.Cliente)
    console.log('👤 Datos del cliente:', clienteData.value)

    // Cargar programaciones del cliente desde el servidor
    console.log('📡 Llamando a clienteProgramacionService.listarProgSpot()...')
    const programacionesFromServer = await clienteProgramacionService.listarProgSpot()
    console.log('📦 Programaciones recibidas del servidor:', programacionesFromServer)
    

    const progSpotsData = localStorage.getItem('listProgSpot')
    console.log('💾 Datos en localStorage.listProgSpot:', progSpotsData)

    if (!progSpotsData) {
      console.warn('⚠️ No se encontraron programaciones en localStorage')
      // Si no hay programaciones y es cliente, mostrar opción de crear
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
    console.log(`Se encontraron ${progSpots.length} programación(es)`)
   
    // Intentar recuperar la última programación seleccionada
    const savedProgramacion = null//(progSpots==null)?localStorage.getItem('selectedProgramacion'):progSpots[0]
    let programacionToSelect = null

      try {
        const parsed = JSON.parse(savedProgramacion)
        // Verificar que la programación guardada aún existe en las disponibles
        programacionToSelect = isClienteRole.value?progSpots[0]:progSpots.find(p => p.clipro_codigo === parsed.clipro_codigo)
        if (programacionToSelect) {
          console.log('📌 Recuperando última programación seleccionada:', programacionToSelect.clipro_nombre)
        }
      } catch (e) {
        console.warn('Error parseando programación guardada:', e)
      }
    

    // Si no hay programación guardada y solo hay una, seleccionarla automáticamente
    if (!programacionToSelect) {
      if(!isClienteRole.value) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const sucursal = sucursalesStore.sucursales.find(s => s.username === user.unique_name)
      programacionToSelect =  availableProgramaciones.value.find(p => p.clipro_codigo === sucursal?.sucpgr_codigoProgramacionSpot) || []
    }
      
      console.log('✅ Auto-seleccionando única programación disponible:', programacionToSelect.clipro_nombre)
    }

    if (programacionToSelect) {
      selectProgramacion(programacionToSelect)
    } else if (progSpots.length > 1) {
      // Si hay múltiples y no hay guardada, mostrar selector
      showProgramacionSelector.value = true
    }
  } catch (error) {
    console.error('Error cargando programaciones del cliente:', error)
    proxy.$toast('Error al cargar las programaciones', 'error')
  }
}

const loadProgramaciones = async () => {
  try {
    console.log('🔵 Componente: Iniciando loadProgramaciones()')
    console.log('🔵 Componente: selectedProgramacion.value =', selectedProgramacion.value)

    if (!selectedProgramacion.value) {
      console.warn('⚠️ Componente: No hay programación seleccionada')
      return
    }

    const codigoProgramacion = selectedProgramacion.value.clipro_codigo
    console.log('🔵 Componente: codigoProgramacion =', codigoProgramacion)

    if (!codigoProgramacion) {
      console.warn('⚠️ Componente: Código de programación no encontrado')
      return
    }

    console.log('🔵 Componente: Cargando programaciones para código:', codigoProgramacion)
    await programacionSpotsStore.loadProgramacionesByPrograma(codigoProgramacion, '00:00')

    const programacionesData = programacionSpotsStore.programacionesByPrograma
    console.log('🔵 Componente: programacionesData después de cargar =', programacionesData)

    if (Array.isArray(programacionesData)) {
      console.log(`✅ Componente: Se cargaron ${programacionesData.length} programaciones`)

      if (programacionesData.length === 0) {
        console.warn('⚠️ Componente: El array de programaciones está vacío')
        proxy.$toast('No hay programaciones cargadas para esta programación', 'info')
      }
    } else {
      console.error('❌ Componente: Los datos de programaciones no tienen el formato esperado:', programacionesData)
    }
  } catch (error) {
    proxy.$toast('Error al cargar las programaciones', 'error')
    console.error('❌ Componente: Error loading programaciones:', error)
  }
}

const selectProgramacion = async (programacion) => {
  selectedProgramacion.value = programacion

  // Guardar la programación seleccionada en localStorage
  localStorage.setItem('selectedProgramacion', JSON.stringify(programacion))
  console.log('✅ Programación seleccionada guardada en localStorage:', programacion)

  showProgramacionSelector.value = false
  await loadProgramaciones()
  proxy.$toast(`Programación "${programacion.clipro_nombre}" seleccionada`, 'success')
}

const openProgramacionSelector = () => {
  showProgramacionSelector.value = true
}

const closeProgramacionSelector = () => {
  showProgramacionSelector.value = false
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
    console.log('Creando nueva programación:', newProgramacionName.value)

    // Generar código único para la programación (puedes usar timestamp o UUID)
    const codigoProgramacion = 0

    const result = await spotService.altaProgramacion(codigoProgramacion, newProgramacionName.value)

    proxy.$toast(`Programación "${newProgramacionName.value}" creada exitosamente`, 'success')

    // Recargar programaciones
    await loadClienteProgramaciones()

    closeCreateProgramacionModal()
  } catch (error) {
    console.error('Error creando programación:', error)
    proxy.$toast('Error al crear la programación: ' + (error.message || error), 'error')
  }
}

const getCurrentUser = () => {
  try {
    return UserService.current()
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
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

const handleProgramSpots = async (programData) => {
  try {
    console.log('Datos recibidos para programar spots:', programData)

    // Validar datos recibidos
    if (programData.length === 0) {
      proxy.$toast('No se han generado programas de spots.', 'info')
      return
    }

    const programas = generateProgramas(programData)
    console.log('Programas generados:', programas)

    if (programas.length === 0) {
      proxy.$toast('No se generaron programas. Verifique la configuración.', 'info')
      return
    }

    console.log(`Programando ${programas.length} programas...`)
    const result = await programacionSpotsStore.saveProgramacionesSpot(programas)
    console.log('Resultado del guardado:', result)

    proxy.$toast(`Spots programados correctamente: ${programas.length} programas creados`, 'success')

    await loadProgramaciones()
 
  } catch (error) {
    console.error('Error detallado al programar spots:', error)
    proxy.$toast('Error al programar los spots: ' + (error.message || error), 'error')
  }
}

const handleMultipleMinutesProgramming = async (programData) => {
  try {
    console.log('Datos recibidos para programar múltiples minutos:', programData)

    if (!programData || programData.length === 0) {
      proxy.$toast('No hay programaciones para guardar', 'info')
      return
    }

    const programas = generateProgramas(programData)
    console.log('Programas de múltiples minutos generados:', programas)

    if (programas.length === 0) {
      proxy.$toast('No se generaron programas. Verifique la configuración.', 'info')
      return
    }

    console.log(`Guardando ${programas.length} programaciones de múltiples minutos...`)
    const result = await programacionSpotsStore.saveProgramacionesSpot(programas)
    console.log('Resultado del guardado:', result)

    proxy.$toast(`${programas.length} programación(es) guardada(s) correctamente`, 'success')

    await loadProgramaciones()
  } catch (error) {
    console.error('Error al programar múltiples minutos:', error)
    proxy.$toast('Error al programar múltiples minutos: ' + (error.message || error), 'error')
  }
}

const handleSaveProgramacionesBatch = async (programaciones, resolve, reject) => {
  try {
    console.log(`💾 Guardando lote de ${programaciones.length} programaciones...`)

    if (!programaciones || programaciones.length === 0) {
      reject(new Error('No hay programaciones para guardar'))
      return
    }

    const programas = generateProgramas(programaciones)
    console.log('Programas generados para lote:', programas)

    if (programas.length === 0) {
      reject(new Error('No se generaron programas válidos'))
      return
    }

    const result = await programacionSpotsStore.saveProgramacionesSpot(programas)
    console.log('✅ Lote guardado exitosamente:', result)

    resolve(result)
  } catch (error) {
    console.error('❌ Error guardando lote:', error)
    reject(error)
  }
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

const handleCalendarProgramSpots = async (calendarData) => {
  try {
    console.log('Datos recibidos para guardar programación de calendario:', calendarData)

    if (!calendarData.programas || !Array.isArray(calendarData.programas) || calendarData.programas.length === 0) {
      proxy.$toast('No hay programas para guardar. Agregue spots al calendario primero.', 'info')
      return
    }

    console.log(`Guardando ${calendarData.programas.length} programas de calendario...`)
    const result = await programacionSpotsStore.saveProgramacionesSpot(calendarData.programas)
    console.log('Resultado del guardado:', result)

    proxy.$toast(`Programación de calendario guardada correctamente (${calendarData.programas.length} programas)`, 'success')

    await loadProgramaciones()
  } catch (error) {
    console.error('Error detallado al guardar la programación del calendario:', error)
    proxy.$toast('Error al guardar la programación del calendario: ' + (error.message || error), 'error')
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

const generateProgramas = (programData) => {
  const programas = []
  const codigoProgramacion = JSON.parse(localStorage.getItem('listProgSpot') || '[]')[0]?.clipro_codigo

  console.log('Generando programas con datos:', {
    programData,
    codigoProgramacion,
    selectedSpots: selectedSpots.value
  })

  return programData
}

const handleFilterChange = (filterData) => {
  console.log('Filtros cambiados:', filterData)
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

// Lifecycle hooks
onMounted(async () => {
  try {
    console.log('🎬 Componente bibliotecaSpot montado - Iniciando carga de datos...')

    let horaActual = proxy.$moment().format('HH:mm')
    let diaActual = Number(proxy.$moment().day()) // 0 (Domingo) a 6 (Sábado)

    // Inicializar filtros para PROGRAMACIÓN (no para visualización)
    // Los filtros de visualización deben estar vacíos para mostrar todas las programaciones
    currentFilters.value = {
      reproductor: '',
      startTime: '',  // Para programación de nuevos spots
      endTime: '',  // Vacío para no filtrar la visualización
      selectedDays: []  // Vacío para mostrar todos los días en la visualización
    }

    // Initialize user data first
    getCurrentUser()

    // Load días hábiles first
    await loadDiasHabiles()

    // Load spots and reproductores
    await Promise.all([
      loadSpots(),
      loadReproductores()
    ])

    // Load programaciones del cliente (will auto-select if only one)
    await loadClienteProgramaciones()

    console.log('✅ Componente bibliotecaSpot inicializado correctamente')
  } catch (error) {
    proxy.$toast('Error al inicializar el componente', 'error')
    console.error('❌ Error initializing component:', error)
  }
})
</script>
