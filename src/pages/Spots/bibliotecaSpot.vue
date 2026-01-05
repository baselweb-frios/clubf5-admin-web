<template>
  <div class="biblioteca-spot">
    <!-- Loading Overlay - Solo durante carga inicial -->
    <LoadingOverlay :show="isLoading" text="Cargando biblioteca de spots..." />

    <!-- Contenido principal - Solo visible cuando NO está cargando -->
    <template v-if="!isLoading">
      <!-- Selector de Programación -->
      <div v-if="selectedProgramacion" class="programacion-header">
      <div class="programacion-info">
        <i class="fa fa-calendar-check-o"></i>
        <span class="programacion-label">Programación Activa:</span>
        <strong class="programacion-name">{{ selectedProgramacion.clipro_nombre }}</strong>
        <span class="programacion-code">({{ selectedProgramacion.clipro_codigo }})</span>
      </div>
      <div class="programacion-actions">
        <button
          v-if="isClienteRole"
          @click="openProgramacionSelector"
          class="btn btn-outline btn-sm"
          title="Cambiar programación"
        >
          <i class="fa fa-exchange"></i>
          Cambiar
        </button>
        <button
          v-if="canCreateProgramacion"
          @click="openCreateProgramacionModal"
          class="btn btn-primary btn-sm"
        >
          <i class="fa fa-plus"></i>
          Nueva Programación
        </button>
      </div>
    </div>

      <!-- Control para mostrar/ocultar spots vencidos -->
      <div class="expired-spots-toggle">
      <div class="toggle-container">
        <label class="toggle-label">
          <input
            type="checkbox"
            :checked="spotsStore.showExpiredSpots"
            @change="handleToggleExpiredSpots"
            class="toggle-input"
          >
          <span class="toggle-switch"></span>
          <span class="toggle-text">
            <i :class="spotsStore.showExpiredSpots ? 'fa fa-eye' : 'fa fa-eye-slash'"></i>
            {{ spotsStore.showExpiredSpots ? 'Mostrando todos los spots' : 'Solo spots vigentes' }}
          </span>
        </label>
        <div class="toggle-stats">
          <span class="stat-item">
            <i class="fa fa-check-circle" style="color: #10b981;"></i>
            <strong>{{ spotsStore.activeSpotsCount }}</strong> vigentes
          </span>
          <span class="stat-item" v-if="spotsStore.expiredSpotsCount > 0">
            <i class="fa fa-times-circle" style="color: #ef4444;"></i>
            <strong>{{ spotsStore.expiredSpotsCount }}</strong> vencidos
          </span>
          <span class="stat-item">
            <i class="fa fa-layer-group" style="color: #6366f1;"></i>
            <strong>{{ spotsStore.allSpotsCount }}</strong> total
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
          <div class="modal-title-group">
            <i class="fa fa-list"></i>
            <h3>Seleccionar Programación</h3>
          </div>
        </template>

        <div v-if="availableProgramaciones.length === 0" class="empty-state">
          <i class="fa fa-inbox"></i>
          <p>No hay programaciones disponibles</p>
          <button
            v-if="canCreateProgramacion"
            @click="openCreateProgramacionModal"
            class="btn btn-primary"
          >
            <i class="fa fa-plus"></i>
            Crear Nueva Programación
          </button>
        </div>

        <div v-else class="programaciones-list">
          <div
            v-for="prog in availableProgramaciones"
            :key="prog.clipro_codigo"
            @click="selectProgramacion(prog)"
            class="programacion-item"
            :class="{ 'selected': selectedProgramacion && selectedProgramacion.clipro_codigo === prog.clipro_codigo }"
          >
            <div class="programacion-item-icon">
              <i class="fa fa-calendar"></i>
            </div>
            <div class="programacion-item-info">
              <h4>{{ prog.clipro_nombre }}</h4>
              <p class="programacion-item-code">Código: {{ prog.clipro_codigo }}</p>
            </div>
            <div class="programacion-item-action">
              <i class="fa fa-chevron-right"></i>
            </div>
          </div>
        </div>

        <template v-if="canCreateProgramacion && availableProgramaciones.length > 0" #footer>
          <button
            @click="openCreateProgramacionModal"
            class="btn btn-outline btn-block"
          >
            <i class="fa fa-plus"></i>
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
          <div class="modal-title-group">
            <i class="fa fa-plus-circle"></i>
            <h3>Crear Nueva Programación</h3>
          </div>
        </template>

        <div class="form-group">
          <label class="form-label">
            <i class="fa fa-tag"></i>
            Nombre de la Programación
          </label>
          <input
            v-model="newProgramacionName"
            type="text"
            class="form-input"
            placeholder="Ej: Programación Verano 2025"
            @keyup.enter="createNuevaProgramacion"
            autofocus
          >
          <p class="form-hint">
            <i class="fa fa-info-circle"></i>
            Ingresa un nombre descriptivo para identificar esta programación
          </p>
        </div>

        <template #footer>
          <button @click="closeCreateProgramacionModal" class="btn btn-outline">
            <i class="fa fa-times"></i>
            Cancelar
          </button>
          <button
            @click="createNuevaProgramacion"
            :disabled="!newProgramacionName || newProgramacionName.trim() === ''"
            class="btn btn-primary"
          >
            <i class="fa fa-check"></i>
            Crear Programación
          </button>
        </template>
      </Modal>

      <div class="tabs-container">
        <div class="tab-buttons">
          <button
            @click="activeTab = 'spots'"
            class="tab-button"
            :class="{ 'active': activeTab === 'spots' }"
          >
            <i class="icon library"></i>
            Spots
          </button>
          <button
            @click="activeTab = 'programar'"
            class="tab-button"
            :class="{ 'active': activeTab === 'programar' }"
          >
            <i class="icon calendar"></i>
            Programar
          </button>
        </div>

        <div v-if="activeTab === 'spots'" class="tab-content">
          <SpotTable
            :spots="spots"
            :selected-spots="selectedSpots"
            @create="handleCreate"
            @edit="handleEdit"
            @delete="handleDelete"
            @selection-change="handleSpotSelection"
          />
        </div>

        <div v-if="activeTab === 'programar'" class="tab-content">
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

// Router
const router = useRouter()

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
<style scoped>
/* ===== PREMIUM BIBLIOTECA SPOT - APPLE STYLE ===== */
.biblioteca-spot {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1419 0%, #1a1d24 100%);
  color: #e5e7eb;
  position: relative;
  padding-bottom: var(--spacing-8);
}

.biblioteca-spot::before {
  content: '';
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* ===== LOADING OVERLAY ===== */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 20, 25, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  color: #3b82f6;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.loading-spinner::before {
  content: '';
  width: 24px;
  height: 24px;
  border: 3px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== PROGRAMACION HEADER ===== */
.programacion-header {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: var(--spacing-6) var(--spacing-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  top: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.programacion-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.programacion-info i {
  font-size: 1.5rem;
  color: #60a5fa;
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5));
}

.programacion-label {
  color: #9ca3af;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.programacion-name {
  color: #e5e7eb;
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.programacion-code {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
}

.programacion-actions {
  display: flex;
  gap: var(--spacing-3);
}

/* ===== EXPIRED SPOTS TOGGLE ===== */
.expired-spots-toggle {
  margin: var(--spacing-6) var(--spacing-8) 0;
  background: rgba(26, 26, 26, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  padding: var(--spacing-4) var(--spacing-6);
}

.toggle-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  user-select: none;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  position: relative;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toggle-switch::before {
  content: '';
  position: absolute;
  left: 2px;
  top: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-input:checked + .toggle-switch {
  background: #3b82f6;
}

.toggle-input:checked + .toggle-switch::before {
  transform: translateX(20px);
}

.toggle-text {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 500;
  color: #e5e7eb;
}

.toggle-stats {
  display: flex;
  gap: var(--spacing-4);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.8125rem;
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.03);
  padding: 4px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.stat-item strong {
  color: #e5e7eb;
  font-weight: 600;
}

/* ===== TABS ===== */
.tabs-container {
  padding: var(--spacing-6) var(--spacing-8);
}

.tab-buttons {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-6);
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: var(--radius-xl);
  width: fit-content;
}

.tab-button {
  padding: var(--spacing-3) var(--spacing-6);
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 0.9375rem;
  font-weight: 600;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.tab-button:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.05);
}

.tab-button.active {
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.tab-content {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ===== MODAL CONTENT STYLES ===== */
.modal-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-title-group i {
  font-size: 1.5rem;
  color: #60a5fa;
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5));
}

.modal-title-group h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #e5e7eb;
}

/* Programacion List */
.programaciones-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.programacion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all 0.2s ease;
}

.programacion-item:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(4px);
}

.programacion-item.selected {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.programacion-item-icon {
  width: 40px;
  height: 40px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  font-size: 1.25rem;
}

.programacion-item-info h4 {
  margin: 0 0 4px 0;
  color: #e5e7eb;
  font-size: 1rem;
}

.programacion-item-code {
  margin: 0;
  color: #9ca3af;
  font-size: 0.75rem;
}

.programacion-item-action {
  margin-left: auto;
  color: #6b7280;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--spacing-8);
  color: #9ca3af;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: var(--spacing-4);
  opacity: 0.5;
}

/* Form Elements */
.form-group {
  margin-bottom: var(--spacing-4);
}

.form-label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-size: 0.875rem;
  font-weight: 600;
  color: #e5e7eb;
}

.form-input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: #e5e7eb;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.form-hint {
  margin-top: var(--spacing-2);
  font-size: 0.75rem;
  color: #9ca3af;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Buttons */
.btn {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #e5e7eb;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.25);
}

.btn-block {
  width: 100%;
  justify-content: center;
}

/* ===== RESPONSIVE ===== */
@media (min-width: 1200px) {
  .programacion-header,
  .tabs-container,
  .expired-spots-toggle {
    padding-left: var(--spacing-6);
    padding-right: var(--spacing-6);
  }
}

@media (min-width: 1024px) {
  .programacion-header,
  .tabs-container,
  .expired-spots-toggle {
    padding-left: var(--spacing-4);
    padding-right: var(--spacing-4);
    margin-left: var(--spacing-4);
    margin-right: var(--spacing-4);
  }

  .programacion-name {
    font-size: 1.125rem;
  }

  .tab-buttons {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .tab-buttons::-webkit-scrollbar {
    display: none;
  }
}

@media (min-width: 768px) {
  .biblioteca-spot {
    padding-bottom: var(--spacing-6);
  }

  .programacion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-4);
    padding: var(--spacing-4);
    margin: 0 var(--spacing-2);
  }

  .programacion-info {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-2);
  }

  .programacion-info i {
    font-size: 1.25rem;
  }

  .programacion-name {
    font-size: 1rem;
  }

  .programacion-label {
    font-size: 0.75rem;
  }

  .programacion-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .programacion-actions .btn {
    flex: 1;
    min-width: 140px;
    justify-content: center;
  }

  /* Expired Spots Toggle */
  .expired-spots-toggle {
    margin: var(--spacing-4) var(--spacing-2);
    padding: var(--spacing-3) var(--spacing-4);
  }

  .toggle-container {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .toggle-stats {
    flex-wrap: wrap;
    width: 100%;
    gap: var(--spacing-2);
  }

  .stat-item {
    font-size: 0.75rem;
    padding: 3px 10px;
  }

  /* Tabs */
  .tabs-container {
    padding: var(--spacing-4) var(--spacing-2);
  }

  .tab-buttons {
    width: 100%;
    overflow-x: auto;
    padding-bottom: var(--spacing-2);
    margin-bottom: var(--spacing-4);
    gap: var(--spacing-2);
  }

  .tab-button {
    white-space: nowrap;
    padding: var(--spacing-2) var(--spacing-4);
    font-size: 0.875rem;
  }

  .tab-button i {
    font-size: 0.875rem;
  }

  /* Modal Adjustments */
  .modal-title-group h3 {
    font-size: 1.125rem;
  }

  .modal-title-group i {
    font-size: 1.25rem;
  }

  .programacion-item {
    padding: var(--spacing-3);
    gap: var(--spacing-3);
  }

  .programacion-item-icon {
    width: 36px;
    height: 36px;
    font-size: 1rem;
  }

  .programacion-item-info h4 {
    font-size: 0.9375rem;
  }

  /* Form Elements */
  .form-input {
    font-size: 1rem; /* Prevent zoom on iOS */
  }

  .btn {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: 0.8125rem;
  }
}

@media (min-width: 640px) {
  .programacion-header {
    padding: var(--spacing-3);
    gap: var(--spacing-3);
  }

  .programacion-actions .btn {
    min-width: 120px;
    font-size: 0.75rem;
    padding: var(--spacing-2);
  }

  .toggle-switch {
    width: 40px;
    height: 22px;
  }

  .toggle-switch::before {
    width: 18px;
    height: 18px;
  }

  .toggle-input:checked + .toggle-switch::before {
    transform: translateX(18px);
  }

  .toggle-text {
    font-size: 0.8125rem;
  }

  .tab-buttons {
    padding: 3px;
    gap: var(--spacing-1);
  }

  .tab-button {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: 0.8125rem;
    gap: var(--spacing-1);
  }

  .programacion-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .programacion-item-action {
    align-self: flex-end;
  }

  .stat-item i {
    font-size: 0.75rem;
  }
}

@media (min-width: 480px) {
  .biblioteca-spot {
    padding-bottom: var(--spacing-4);
  }

  .programacion-header {
    padding: var(--spacing-2);
    margin: 0;
  }

  .programacion-name {
    font-size: 0.9375rem;
  }

  .programacion-code {
    font-size: 0.6875rem;
    padding: 1px 6px;
  }

  .programacion-actions .btn {
    flex: 1;
    min-width: auto;
    font-size: 0.6875rem;
  }

  .programacion-actions .btn i {
    font-size: 0.75rem;
  }

  .expired-spots-toggle {
    margin: var(--spacing-3) 0;
    padding: var(--spacing-2) var(--spacing-3);
  }

  .toggle-text {
    font-size: 0.75rem;
  }

  .toggle-stats {
    gap: var(--spacing-1);
  }

  .stat-item {
    font-size: 0.6875rem;
    padding: 2px 8px;
  }

  .tabs-container {
    padding: var(--spacing-3) 0;
  }

  .tab-buttons {
    margin: 0 var(--spacing-2);
  }

  .tab-button {
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  .tab-button i {
    display: none; /* Hide icons on very small screens */
  }

  .modal-title-group h3 {
    font-size: 1rem;
  }

  .form-group {
    margin-bottom: var(--spacing-3);
  }

  .form-label {
    font-size: 0.8125rem;
  }

  .btn {
    font-size: 0.75rem;
  }

  .btn-block {
    padding: 10px;
  }
}
</style>

