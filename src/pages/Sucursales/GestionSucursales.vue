<template>
  <div class="gestion-sucursales">
    <!-- Configuration Blocker -->
    <ConfigurationBlocker
      v-if="showConfigBlocker && configStatus"
      :configStatus="configStatus"
    />

    <!-- Header -->
    <div v-else class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fa fa-building"></i>
        </div>
        <div class="header-text">
          <h1 class="page-title">Gestión de Sucursales</h1>
          <p class="page-subtitle">Administra y configura tus sucursales de manera eficiente</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn-primary" @click="openCreateModal">
          <i class="fa fa-plus"></i>
          Nueva Sucursal
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="fa fa-building"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ sucursales.length }}</span>
          <span class="stat-label">Total Sucursales</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <i class="fa fa-circle"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ sucursalesConectadas }}</span>
          <span class="stat-label">Conectadas</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-info">
          <i class="fa fa-music"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ programacionesRadio.length }}</span>
          <span class="stat-label">Prog. Música</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <i class="fa fa-bullhorn"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ programacionesSpot.length }}</span>
          <span class="stat-label">Prog. Spots</span>
        </div>
      </div>
      <div class="stat-card stat-card-audit" @click="showAuditModal = true">
        <div class="stat-icon stat-icon-audit">
          <i class="fa fa-chart-bar"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalAuditRecords }}</span>
          <span class="stat-label">Registros Auditoría</span>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="section-header">
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Buscar sucursal por nombre o usuario..."
        class="search-input"
      >
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Cargando sucursales...</p>
    </div>

    <!-- Sucursales Table -->
    <div v-else class="sucursales-table-container">
      <DataTable
        :columns="tableColumns"
        :rows="filteredSucursales"
        :config="tableConfig"
        :loading="isLoading"
        no-data-message="No se encontraron sucursales"
      >
        <!-- Estado Column -->
        <template #estado="{ row }">
          <span
            class="status-indicator"
            :class="{ 'status-online': row.conected === 1, 'status-offline': row.conected !== 1 }"
            :title="row.conected === 1 ? 'Conectada' : 'Desconectada'"
          >
            <i class="fa fa-circle"></i>
          </span>
        </template>

        <!-- Nombre Column -->
        <template #nombre="{ row }">
          <div class="cell-content">
            <i class="fa fa-building cell-icon"></i>
            <span class="cell-text">{{ row.clisuc_nombre }}</span>
          </div>
        </template>

        <!-- Usuario Column -->
        <template #usuario="{ row }">
          <span class="badge badge-secondary">{{ row.username }}</span>
        </template>

        <!-- Reproductor Column -->
        <template #reproductor="{ row }">
          <!-- Player Status (solo si está conectada) -->
          <div v-if="row.conected === 1" class="player-cell">
            <div v-if="row.currentSong" class="player-status-compact">
              <div class="now-playing-compact">
                <i class="fa" :class="row.isPlaying ? 'fa-play-circle playing-icon' : 'fa-pause-circle'"></i>
                <div class="song-info-compact">
                  <span class="song-title-compact">{{ row.currentSong }}</span>
                  <span class="player-mode-compact">{{ getPlayerModeLabel(row.activePlayer) }}</span>
                </div>
              </div>
              <div v-if="row.playbackProgress" class="progress-bar-compact">
                <div class="progress-fill" :style="{ width: row.playbackProgress.percentage + '%' }"></div>
              </div>
            </div>

            <!-- Player Controls -->
            <div class="player-controls-compact">
              <div class="control-buttons-compact">
                <button
                  class="control-btn-compact"
                  @click="playerControl.play(row.userId)"
                  :disabled="playerControl.executing.value"
                  title="Reproducir"
                >
                  <i class="fa fa-play"></i>
                </button>
                <button
                  class="control-btn-compact"
                  @click="playerControl.pause(row.userId)"
                  :disabled="playerControl.executing.value"
                  title="Pausar"
                >
                  <i class="fa fa-pause"></i>
                </button>
              </div>

              <!-- Mode Toggle Switch -->
              <div class="mode-switch-compact">
                <label class="switch-label">
                  <input
                    type="checkbox"
                    :checked="row.playerStatus?.mode === 'radio'"
                    @change="togglePlayerMode(row)"
                    :disabled="playerControl.executing.value"
                  />
                  <span class="switch-slider"></span>
                  <span class="switch-text">
                    {{ row.playerStatus?.mode === 'radio' ? 'Radio' : 'Neuro' }}
                  </span>
                </label>
              </div>
            </div>
          </div>
          <div v-else class="player-cell-offline">
            <span class="text-muted">Desconectada</span>
          </div>
        </template>

        <!-- Programación Música Column -->
        <template #progMusica="{ row }">
          <span class="badge badge-info">
            {{ getProgramacionRadioNombre(row.sucpgr_codigoProgramacionRadio) }}
          </span>
        </template>

        <!-- Programación Spots Column -->
        <template #progSpots="{ row }">
          <span v-if="row.sucpgr_codigoProgramacionSpot" class="badge badge-warning">
            {{ getProgramacionSpotNombre(row.sucpgr_codigoProgramacionSpot) }}
          </span>
          <span v-else class="badge badge-outline">Sin programación</span>
        </template>

        <!-- Spots Propios Column -->
        <template #spotsPropios="{ row }">
          <span :class="['badge', row.clisuc_permisoSpotPropio ? 'badge-success' : 'badge-outline']">
            {{ row.clisuc_permisoSpotPropio ? 'Permitido' : 'No permitido' }}
          </span>
        </template>

        <!-- Auditoría Column -->
        <template #auditoria="{ row }">
          <div v-if="row.conected === 1" class="audit-cell">
            <button
              class="btn-audit"
              @click="openAuditForSucursal(row)"
              :disabled="loadingAudit"
              title="Ver estadísticas de auditoría"
            >
              <i class="fa fa-chart-line"></i>
              <span>Ver Stats</span>
            </button>
          </div>
          <div v-else class="audit-cell-offline">
            <span class="text-muted">N/A</span>
          </div>
        </template>

        <!-- Acciones Column -->
        <template #acciones="{ row }">
          <div class="action-buttons">
            <button class="btn-action btn-edit" @click="openEditModal(row)" title="Editar">
              <i class="fa fa-edit"></i>
            </button>
            <button class="btn-action btn-delete" @click="confirmDelete(row)" title="Eliminar">
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Modal Crear/Editar Sucursal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i :class="['fa', isEditMode ? 'fa-edit' : 'fa-plus']"></i>
            {{ isEditMode ? 'Editar Sucursal' : 'Nueva Sucursal' }}
          </h3>
          <button class="modal-close" @click="closeModal">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="saveSucursal">
            <!-- Nombre de Sucursal -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fa fa-building"></i>
                Nombre de la Sucursal
              </label>
              <input
                v-model="formData.nombreSucursal"
                type="text"
                class="form-input"
                placeholder="Ej: Sucursal Centro"
                required
              >
            </div>

            <!-- Usuario -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fa fa-user"></i>
                Usuario (Login)
              </label>
              <div class="input-group">
                <input
                  v-model="formData.usuario"
                  type="text"
                  class="form-input"
                  placeholder="usuario"
                  :disabled="isEditMode"
                  required
                >
              </div>
              <small class="form-help">
                El usuario no puede modificarse
              </small>
            </div>

            <!-- Contraseña -->
            <div class="form-group">
              <label class="form-label" :class="{ 'required': !isEditMode }">
                <i class="fa fa-lock"></i>
                Contraseña
              </label>
              <input
                v-model="formData.contrasenia"
                type="password"
                class="form-input"
                placeholder="••••••••"
                :required="!isEditMode"
              >
              <small class="form-help" v-if="isEditMode">
                Dejar en blanco para mantener la contraseña actual
              </small>
            </div>

            <!-- Programación de Música -->
            <div class="form-group">
              <label class="form-label required">
                <i class="fa fa-music"></i>
                Programación de Música
              </label>
              <select v-model="formData.progRadioSelected" class="form-select" required>
                <option value="">Seleccionar programación</option>
                <option
                  v-for="prog in programacionesRadio"
                  :key="prog.clipro_codigo"
                  :value="prog.clipro_codigo"
                >
                  {{ prog.clipro_nombre }}
                </option>
              </select>
              <small class="form-help">
                {{ programacionesRadio.length === 1 ? 'Se seleccionó automáticamente la única programación disponible' : 'Selecciona la programación de música para esta sucursal' }}
              </small>
            </div>

            <!-- Permiso Spots Propios -->
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  v-model="formData.permisoSpotPropio"
                  type="checkbox"
                  class="form-checkbox"
                  @change="onPermisoSpotChange"
                >
                <span class="checkbox-text">
                  <i class="fa fa-bullhorn"></i>
                  Permitir a la sucursal crear sus propios spots
                </span>
              </label>
            </div>

            <!-- Programación de Spots (solo si tiene permiso) -->
            <div v-if="formData.permisoSpotPropio" class="form-group">
              <label class="form-label required">
                <i class="fa fa-calendar-alt"></i>
                Programación de Spots
              </label>
              <select v-model="formData.progSpotSelected" class="form-select" required>
                <option value="">Seleccionar programación de spots</option>
                <option
                  v-for="prog in programacionesSpot"
                  :key="prog.clipro_codigo"
                  :value="prog.clipro_codigo"
                >
                  {{ prog.clipro_nombre }}
                </option>
              </select>
              <small class="form-help">
                {{ programacionesSpot.length === 1 ? 'Se seleccionó automáticamente la única programación disponible' : 'Selecciona la programación de spots para esta sucursal' }}
              </small>
            </div>

            <!-- Preview -->
            <div class="form-preview">
              <h4>Vista Previa</h4>
              <div class="preview-grid">
                <div class="preview-item">
                  <span class="preview-label">Usuario completo:</span>
                  <span class="preview-value">{{ formData.usuario || '_____' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Nombre:</span>
                  <span class="preview-value">{{ formData.nombreSucursal || '(sin nombre)' }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Música:</span>
                  <span class="preview-value">{{ getProgramacionRadioNombre(formData.progRadioSelected) }}</span>
                </div>
                <div class="preview-item">
                  <span class="preview-label">Spots propios:</span>
                  <span class="preview-value">{{ formData.permisoSpotPropio ? 'Sí' : 'No' }}</span>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="closeModal">
            <i class="fa fa-times"></i>
            Cancelar
          </button>
          <button class="btn-primary" @click="saveSucursal" :disabled="isSaving">
            <i :class="['fa', isSaving ? 'fa-spinner fa-spin' : 'fa-save']"></i>
            {{ isSaving ? 'Guardando...' : (isEditMode ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminación -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content modal-confirm" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fa fa-exclamation-triangle"></i>
            Confirmar Eliminación
          </h3>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de que deseas eliminar la sucursal <strong>{{ sucursalToDelete?.clisuc_nombre }}</strong>?</p>
          <p class="text-warning">Esta acción no se puede deshacer.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteModal = false">
            <i class="fa fa-times"></i>
            Cancelar
          </button>
          <button class="btn-danger" @click="deleteSucursal">
            <i class="fa fa-trash"></i>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Auditoría -->
    <div v-if="showAuditModal" class="modal-overlay" @click="closeAuditModal">
      <div class="modal-content modal-audit" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fa fa-chart-bar"></i>
            Auditoría de Spots - {{ selectedSucursalForAudit?.clisuc_nombre || 'Todas las Sucursales' }}
          </h3>
          <button class="modal-close" @click="closeAuditModal">
            <i class="fa fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Loading State -->
          <div v-if="loadingAudit" class="loading-overlay">
            <div class="spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>

          <!-- Audit Stats -->
          <div v-else-if="auditStats" class="audit-container">
            <!-- Resumen General -->
            <div class="audit-section">
              <h4 class="audit-section-title">
                <i class="fa fa-info-circle"></i>
                Resumen General
              </h4>
              <div class="audit-stats-grid">
                <div class="audit-stat-card">
                  <span class="audit-stat-label">Total Reproducciones</span>
                  <span class="audit-stat-value">{{ auditStats.totalReproductions || 0 }}</span>
                </div>
                <div class="audit-stat-card">
                  <span class="audit-stat-label">Spots Únicos</span>
                  <span class="audit-stat-value">{{ auditStats.uniqueSpots || 0 }}</span>
                </div>
                <div class="audit-stat-card">
                  <span class="audit-stat-label">Audio</span>
                  <span class="audit-stat-value">{{ auditStats.byType?.audio || 0 }}</span>
                </div>
                <div class="audit-stat-card">
                  <span class="audit-stat-label">Video</span>
                  <span class="audit-stat-value">{{ auditStats.byType?.video || 0 }}</span>
                </div>
              </div>
            </div>

            <!-- Top Spots -->
            <div class="audit-section">
              <h4 class="audit-section-title">
                <i class="fa fa-trophy"></i>
                Top 10 Spots Más Reproducidos
              </h4>
              <div class="top-spots-list">
                <div
                  v-for="(spot, index) in (auditStats.bySpot || []).slice(0, 10)"
                  :key="spot.spotId"
                  class="top-spot-item"
                >
                  <div class="spot-rank">{{ index + 1}}</div>
                  <div class="spot-info">
                    <span class="spot-title">{{ spot.spotTitle }}</span>
                    <span class="spot-type">{{ spot.spotType }}</span>
                  </div>
                  <div class="spot-count">{{ spot.count }} reproducciones</div>
                </div>
              </div>
            </div>

            <!-- Distribución por Hora -->
            <div class="audit-section">
              <h4 class="audit-section-title">
                <i class="fa fa-clock"></i>
                Distribución por Hora
              </h4>
              <div class="hour-distribution">
                <div
                  v-for="hourData in (auditStats.byHour || [])"
                  :key="hourData.hour"
                  class="hour-bar"
                  v-show="hourData.count > 0"
                >
                  <span class="hour-label">{{ hourData.hourLabel }}</span>
                  <div class="hour-bar-container">
                    <div
                      class="hour-bar-fill"
                      :style="{ width: getPercentage(hourData.count, getMaxHourCount()) + '%' }"
                    ></div>
                  </div>
                  <span class="hour-count">{{ hourData.count }}</span>
                </div>
              </div>
            </div>

            <!-- Distribución por Día de la Semana -->
            <div class="audit-section">
              <h4 class="audit-section-title">
                <i class="fa fa-calendar-week"></i>
                Distribución por Día de la Semana
              </h4>
              <div class="day-distribution">
                <div
                  v-for="dayData in (auditStats.byDayOfWeek || [])"
                  :key="dayData.day"
                  class="day-card"
                >
                  <span class="day-name">{{ dayData.dayName }}</span>
                  <span class="day-count">{{ dayData.count }}</span>
                </div>
              </div>
            </div>

            <!-- Modos de Reproducción -->
            <div class="audit-section">
              <h4 class="audit-section-title">
                <i class="fa fa-sliders-h"></i>
                Modos de Reproducción
              </h4>
              <div class="mode-stats">
                <div class="mode-card">
                  <div class="mode-icon mode-neuro">
                    <i class="fa fa-clock"></i>
                  </div>
                  <div class="mode-info">
                    <span class="mode-name">Neuro (Hora Exacta)</span>
                    <span class="mode-count">{{ auditStats.byMode?.neuro || 0 }} reproducciones</span>
                    <span class="mode-percentage">{{ getModePercentage('neuro') }}%</span>
                  </div>
                </div>
                <div class="mode-card">
                  <div class="mode-icon mode-radio">
                    <i class="fa fa-radio"></i>
                  </div>
                  <div class="mode-info">
                    <span class="mode-name">Radio (Fin de Canción)</span>
                    <span class="mode-count">{{ auditStats.byMode?.radio || 0 }} reproducciones</span>
                    <span class="mode-percentage">{{ getModePercentage('radio') }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else class="empty-state">
            <i class="fa fa-chart-bar"></i>
            <p>No hay datos de auditoría disponibles</p>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn-secondary" @click="exportAudit" :disabled="loadingAudit || !auditStats">
            <i class="fa fa-download"></i>
            Exportar Datos
          </button>
          <button class="btn-secondary" @click="refreshAuditStats" :disabled="loadingAudit">
            <i class="fa fa-sync"></i>
            Actualizar
          </button>
          <button class="btn-primary" @click="closeAuditModal">
            <i class="fa fa-times"></i>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import SucursalServices from '@/services/SucursalServices'
import ClienteProgramacionServices from '@/services/ClienteProgramacionServices'
import UserServices from '@/services/UserServices'
import { usePlayerControl } from '@/composables/usePlayerControl'
import { useSucursal } from '@/composables/useSucursal'
import DataTable from '@/components/ui/DataTable.vue'
import configValidationService from '@/services/ConfigValidationService'
import ConfigurationBlocker from '@/components/ui/ConfigurationBlocker.vue'

const router = useRouter()
const { proxy } = getCurrentInstance()

// Configuration validation
const configStatus = ref(null)
const showConfigBlocker = ref(false)

// Player control con callbacks
const playerControl = usePlayerControl({
  onCommandSuccess: (command, result) => {
    console.log(`[GestionSucursales] Comando ${command} ejecutado`, result)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Comando ${command} ejecutado correctamente`, 'success')
    }
  },
  onCommandError: (command, error) => {
    console.error(`[GestionSucursales] Error en comando ${command}`, error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al ejecutar ${command}: ${error.message}`, 'error')
    }
  }
})

// State
const isLoading = ref(false)
const isSaving = ref(false)
const sucursales = ref([])
const programacionesRadio = ref([])
const programacionesSpot = ref([])
const searchTerm = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditMode = ref(false)
const sucursalToDelete = ref(null)

const codigoCliente = ref(0)
const usuarioCliente = ref('')

// Audit State
const showAuditModal = ref(false)
const loadingAudit = ref(false)
const auditStats = ref(null)
const selectedSucursalForAudit = ref(null)
const totalAuditRecords = ref(0)

// Form Data
const formData = ref({
  clisuc_codigo: 0,
  nombreSucursal: '',
  usuario: '',
  contrasenia: '',
  progRadioSelected: '',
  progSpotSelected: '',
  permisoSpotPropio: false
})

// DataTable Configuration
const tableColumns = ref([
  { field: 'estado', label: 'Estado', sortable: false },
  { field: 'nombre', label: 'Nombre', sortable: true },
  { field: 'usuario', label: 'Usuario', sortable: true },
  { field: 'reproductor', label: 'Reproductor', sortable: false },
  { field: 'progMusica', label: 'Programación Música', sortable: false },
  { field: 'progSpots', label: 'Programación Spots', sortable: false },
  { field: 'spotsPropios', label: 'Spots Propios', sortable: false },
  { field: 'auditoria', label: 'Auditoría', sortable: false },
  { field: 'acciones', label: 'Acciones', sortable: false }
])

const tableConfig = ref({
  per_page: 10,
  global_search: {
    visibility: false, // Desactivar porque ya tenemos el search-input personalizado
    placeholder: 'Buscar...'
  },
  highlight_row_hover: true
})

// Computed
const sucursalesConectadas = computed(() => {
  return sucursales.value.filter(s => s.conected === 1).length
})

const filteredSucursales = computed(() => {
  if (!searchTerm.value) return sucursales.value

  const search = searchTerm.value.toLowerCase()
  return sucursales.value.filter(s =>
    s.clisuc_nombre.toLowerCase().includes(search) ||
    s.username.toLowerCase().includes(search)
  )
})

// Methods
const loadClienteData = () => {
  const currentUser = UserServices.current()
  if (currentUser && currentUser.Cliente) {
    const cliente = JSON.parse(currentUser.Cliente)
    codigoCliente.value = cliente.cli_codigo
    usuarioCliente.value = cliente.cli_usuari
    console.log('📋 Datos del cliente cargados:', { codigoCliente: codigoCliente.value })
  }
}

// useSucursal con real-time habilitado
const {
  sucursales: sucursalesRT,
  loadSucursales: loadSucursalesRT
} = useSucursal({ enableRealtime: true })

const loadSucursales = async () => {
  try {
    isLoading.value = true
    const data = await loadSucursalesRT()
    // Sincronizar con la referencia local
    if (data) {
      sucursales.value = sucursalesRT.value
    }
    console.log('✅ Sucursales cargadas:', data?.length || 0)
  } catch (error) {
    console.error('❌ Error cargando sucursales:', error)
    alert('Error al cargar las sucursales')
  } finally {
    isLoading.value = false
  }
}

// Sincronizar cambios en tiempo real
const syncRealtimeUpdates = () => {
  // Observar cambios en sucursalesRT y actualizar sucursales
  if (sucursalesRT.value) {
    sucursales.value = sucursalesRT.value
  }
}

const loadProgramaciones = async () => {
  try {
    // Cargar programaciones de radio
    await ClienteProgramacionServices.listarProgRadios()
    const progRadios = JSON.parse(localStorage.getItem('listProgRadio') || '[]')
    programacionesRadio.value = progRadios
    console.log('✅ Programaciones de radio cargadas:', progRadios.length)

    // Cargar programaciones de spot
    await ClienteProgramacionServices.listarProgSpot()
    const progSpots = JSON.parse(localStorage.getItem('listProgSpot') || '[]')
    programacionesSpot.value = progSpots
    console.log('✅ Programaciones de spot cargadas:', progSpots.length)
  } catch (error) {
    console.error('❌ Error cargando programaciones:', error)
  }
}

const getProgramacionRadioNombre = (codigo) => {
  if (!codigo) return '(sin asignar)'
  const prog = programacionesRadio.value.find(p => p.clipro_codigo == codigo)
  return prog ? prog.clipro_nombre : '(desconocida)'
}

const getProgramacionSpotNombre = (codigo) => {
  if (!codigo) return '(sin asignar)'
  const prog = programacionesSpot.value.find(p => p.clipro_codigo == codigo)
  return prog ? prog.clipro_nombre : '(desconocida)'
}

const openCreateModal = () => {
  isEditMode.value = false
  formData.value = {
    clisuc_codigo: 0,
    nombreSucursal: '',
    usuario: '',
    contrasenia: '',
    progRadioSelected: programacionesRadio.value.length === 1 ? programacionesRadio.value[0].clipro_codigo : '',
    progSpotSelected: '',
    permisoSpotPropio: false
  }
  showModal.value = true
}

const openEditModal = (sucursal) => {
  isEditMode.value = true
  formData.value = {
    clisuc_codigo: sucursal.clisuc_codigo,
    nombreSucursal: sucursal.clisuc_nombre,
    usuario: sucursal.username,
    contrasenia: '',
    progRadioSelected: sucursal.sucpgr_codigoProgramacionRadio || '',
    progSpotSelected: sucursal.sucpgr_codigoProgramacionSpot || '',
    permisoSpotPropio: sucursal.clisuc_permisoSpotPropio === 1
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    clisuc_codigo: 0,
    nombreSucursal: '',
    usuario: '',
    contrasenia: '',
    progRadioSelected: '',
    progSpotSelected: '',
    permisoSpotPropio: false
  }
}

const onPermisoSpotChange = () => {
  if (formData.value.permisoSpotPropio) {
    // Si solo hay una programación de spot, seleccionarla automáticamente
    if (programacionesSpot.value.length === 1) {
      formData.value.progSpotSelected = programacionesSpot.value[0].clipro_codigo
    }
  } else {
    formData.value.progSpotSelected = ''
  }
}

const saveSucursal = async () => {
  try {
    isSaving.value = true

    const sucursalData = {
      codigoCliente: codigoCliente.value,
      nombreSucursal: formData.value.nombreSucursal,
      usuario: formData.value.usuario,
      usuarioCliente: usuarioCliente.value,
      progRadioSelected: parseInt(formData.value.progRadioSelected),
      permisoSpotPropio: formData.value.permisoSpotPropio ? 1 : 0,
      progSpotSelected: formData.value.permisoSpotPropio ? parseInt(formData.value.progSpotSelected || 0) : 0
    }

    // Agregar contraseña solo si se proporcionó
    if (formData.value.contrasenia) {
      sucursalData.contrasenia = formData.value.contrasenia
    }

    if (isEditMode.value) {
      sucursalData.idSucursal = formData.value.clisuc_codigo
      await SucursalServices.put({
        idSucursal: formData.value.clisuc_codigo,
        nombreSucu: formData.value.nombreSucursal,
        usernameSucu: formData.value.usuario,
        passSucu: formData.value.contrasenia || '',
        progRadio: parseInt(formData.value.progRadioSelected),
        progSpot: formData.value.permisoSpotPropio ? parseInt(formData.value.progSpotSelected || 0) : 0,
        programSpot: formData.value.permisoSpotPropio ? 1 : 0,
        iscliente: 0
      })
      alert('✅ Sucursal actualizada exitosamente')
    } else {
      await SucursalServices.altaSucursal(sucursalData)
      alert('✅ Sucursal creada exitosamente')
    }

    closeModal()
    await loadSucursales()
  } catch (error) {
    console.error('❌ Error guardando sucursal:', error)
    alert('Error al guardar la sucursal: ' + (error.response?.data?.errorMessage || error.message))
  } finally {
    isSaving.value = false
  }
}

const confirmDelete = (sucursal) => {
  sucursalToDelete.value = sucursal
  showDeleteModal.value = true
}

const deleteSucursal = async () => {
  try {
    await SucursalServices.bajaSucursal([sucursalToDelete.value])
    alert('✅ Sucursal eliminada exitosamente')
    showDeleteModal.value = false
    sucursalToDelete.value = null
    await loadSucursales()
  } catch (error) {
    console.error('❌ Error eliminando sucursal:', error)
    alert('Error al eliminar la sucursal')
  }
}

// Player Control Functions
const getPlayerModeLabel = (mode) => {
  const modes = {
    music: 'Música',
    spots: 'Spots',
    neuro: 'Neuro/Mixto',
    radio: 'Radio'
  }
  return modes[mode] || mode
}

const togglePlayerMode = async (sucursal) => {
  const currentMode = sucursal.playerStatus?.mode || 'neuro'
  const newMode = currentMode === 'neuro' ? 'radio' : 'neuro'

  try {
    await playerControl.setMode(newMode, sucursal.userId)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Modo cambiado a ${newMode === 'neuro' ? 'Neuro' : 'Radio'}`, 'success')
    }
  } catch (error) {
    console.error('[GestionSucursales] Error al cambiar modo:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error al cambiar modo: ${error.message}`, 'error')
    }
  }
}

// Audit Functions
const openAuditForSucursal = async (sucursal) => {
  selectedSucursalForAudit.value = sucursal
  showAuditModal.value = true
  await loadAuditStats(sucursal.userId)
}

const closeAuditModal = () => {
  showAuditModal.value = false
  selectedSucursalForAudit.value = null
  auditStats.value = null
}

const loadAuditStats = async (userId) => {
  try {
    loadingAudit.value = true

    console.log('[Audit] Solicitando estadísticas para userId:', userId)

    // Usar el playerControl executeCommand que ya funciona
    const result = await playerControl.executeCommand('RemoteGetAuditStats', userId, {
      filters: {}
    })

    console.log('[Audit] Respuesta recibida:', result)

    // El resultado puede venir directamente o dentro de un wrapper
    if (result) {
      if (result.success && result.data) {
        auditStats.value = result.data
        totalAuditRecords.value = result.data.totalReproductions || 0
      } else if (result.totalReproductions !== undefined) {
        // La respuesta es directamente el objeto de stats
        auditStats.value = result
        totalAuditRecords.value = result.totalReproductions || 0
      } else {
        console.warn('[Audit] Formato de respuesta inesperado:', result)
        // Intentar usar la respuesta de todas formas
        auditStats.value = result
      }

      console.log('[Audit] Estadísticas procesadas:', auditStats.value)
    } else {
      console.warn('[Audit] No se recibió respuesta')
      if (proxy && proxy.$toast) {
        proxy.$toast('No se recibieron datos de auditoría', 'warning')
      }
    }
  } catch (error) {
    console.error('[Audit] Error cargando estadísticas:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast(`Error cargando auditoría: ${error.message}`, 'error')
    }
  } finally {
    loadingAudit.value = false
  }
}

const refreshAuditStats = async () => {
  if (selectedSucursalForAudit.value) {
    await loadAuditStats(selectedSucursalForAudit.value.userId)
  }
}

const exportAudit = async () => {
  if (!auditStats.value) return

  try {
    const dataStr = JSON.stringify(auditStats.value, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-${selectedSucursalForAudit.value?.clisuc_nombre || 'all'}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)

    if (proxy && proxy.$toast) {
      proxy.$toast('Datos exportados correctamente', 'success')
    }
  } catch (error) {
    console.error('[Audit] Error exportando:', error)
    if (proxy && proxy.$toast) {
      proxy.$toast('Error al exportar datos', 'error')
    }
  }
}

// Audit Helper Functions
const getPercentage = (value, max) => {
  if (!max || max === 0) return 0
  return Math.round((value / max) * 100)
}

const getMaxHourCount = () => {
  if (!auditStats.value?.byHour) return 1
  return Math.max(...auditStats.value.byHour.map(h => h.count))
}

const getModePercentage = (mode) => {
  if (!auditStats.value?.byMode || !auditStats.value?.totalReproductions) return 0
  const count = auditStats.value.byMode[mode] || 0
  return ((count / auditStats.value.totalReproductions) * 100).toFixed(1)
}

// Lifecycle
onMounted(async () => {
  // Check configuration status first
  configStatus.value = await configValidationService.checkConfigurationStatus()

  if (!configStatus.value.isComplete) {
    console.warn('⚠️ Configuración incompleta. Falta:', configStatus.value.missing)
    showConfigBlocker.value = true
    return
  }

  loadClienteData()
  await Promise.all([
    loadSucursales(),
    loadProgramaciones()
  ])

  // Sincronizar actualizaciones en tiempo real cada segundo
  setInterval(() => {
    if (sucursalesRT.value && sucursalesRT.value.length > 0) {
      sucursales.value = [...sucursalesRT.value]
    }
  }, 1000)
})
</script>

<style scoped>
/* Variables */
:root {
  --color-primary: #667eea;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  --color-bg-dark: #0f1419;
  --color-bg-card: #16181d;
  --color-border: rgba(255, 255, 255, 0.06);
  --color-text-primary: #e5e7eb;
  --color-text-secondary: rgba(255, 255, 255, 0.7);
}

.gestion-sucursales {
  min-height: 100vh;
  background: var(--color-bg-dark);
  color: var(--color-text-primary);
  padding: 2rem;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--color-bg-card);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0.25rem 0 0 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15);
}

.stat-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon-success {
  background: linear-gradient(135deg, var(--color-success) 0%, #059669 100%);
}

.stat-icon-info {
  background: linear-gradient(135deg, var(--color-info) 0%, #2563eb 100%);
}

.stat-icon-warning {
  background: linear-gradient(135deg, var(--color-warning) 0%, #d97706 100%);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

/* Section Header */
.section-header {
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem 1rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Table */
.sucursales-table-container {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.sucursales-table {
  width: 100%;
  border-collapse: collapse;
}

.sucursales-table thead {
  background: rgba(255, 255, 255, 0.03);
}

.sucursales-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
}

.sucursales-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.sucursales-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.cell-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cell-icon {
  color: var(--color-primary);
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

.badge-info {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.badge-success {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-outline {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.btn-edit:hover {
  background: rgba(59, 130, 246, 0.3);
}

.btn-delete {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* Buttons */
.btn-primary, .btn-secondary, .btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: linear-gradient(135deg, var(--color-danger) 0%, #dc2626 100%);
  color: white;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: linear-gradient(135deg, rgba(26, 26, 64, 0.98) 0%, rgba(15, 15, 35, 0.98) 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(255, 255, 255, 1);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label.required::after {
  content: '*';
  color: var(--color-danger);
  margin-left: 0.25rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
}

.form-input:focus, .form-select:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-group {
  display: flex;
  align-items: center;
}

.input-prefix {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--color-border);
  border-right: none;
  border-radius: 8px 0 0 8px;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.input-group .form-input {
  border-radius: 0 8px 8px 0;
}

.form-help {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-label:hover {
  background: rgba(255, 255, 255, 0.08);
}

.form-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.checkbox-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

/* Preview */
.form-preview {
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
}

.form-preview h4 {
  margin: 0 0 1rem 0;
  color: white;
  font-size: 1.1rem;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.preview-value {
  font-weight: 600;
  color: white;
}

/* Loading */
.loading-overlay {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--color-text-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.text-warning {
  color: var(--color-warning);
  margin-top: 0.5rem;
}

/* Status Indicator */
.status-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
}

.status-indicator i {
  font-size: 0.75rem;
}

.status-online i {
  color: var(--color-success);
  animation: pulse-online 2s infinite;
}

.status-offline i {
  color: #64748b;
}

@keyframes pulse-online {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.row-offline {
  opacity: 0.6;
}

/* Player Cell */
.player-cell {
  min-width: 280px;
}

.player-cell-offline {
  padding: 0.5rem;
  text-align: center;
}

.text-muted {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

/* Player Status Compact */
.player-status-compact {
  background: rgba(59, 130, 246, 0.08);
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.now-playing-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
}

.now-playing-compact i {
  font-size: 1.25rem;
  color: #60a5fa;
  flex-shrink: 0;
}

.now-playing-compact i.playing-icon {
  color: var(--color-success);
  animation: pulse-icon 2s infinite;
}

@keyframes pulse-icon {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

.song-info-compact {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.song-title-compact {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-mode-compact {
  font-size: 0.7rem;
  color: #60a5fa;
  text-transform: uppercase;
  font-weight: 500;
}

.progress-bar-compact {
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
  border-radius: 2px;
  transition: width 0.3s ease;
}

/* Player Controls Compact */
.player-controls-compact {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.control-buttons-compact {
  display: flex;
  gap: 0.375rem;
}

.control-btn-compact {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

.control-btn-compact:hover:not(:disabled) {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.control-btn-compact:active:not(:disabled) {
  transform: scale(0.95);
}

.control-btn-compact:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Mode Switch Compact */
.mode-switch-compact {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  position: relative;
  cursor: pointer;
  user-select: none;
  font-size: 0.75rem;
}

.switch-label input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: relative;
  width: 2.5rem;
  height: 1.25rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  transition: all 0.2s ease;
}

.switch-slider::before {
  content: '';
  position: absolute;
  width: 0.875rem;
  height: 0.875rem;
  left: 0.125rem;
  top: 0.125rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.4);
}

.switch-label input:checked + .switch-slider {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.switch-label input:checked + .switch-slider::before {
  transform: translateX(1.25rem);
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
}

.switch-label:hover .switch-slider {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
}

.switch-label input:disabled + .switch-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.switch-text {
  font-weight: 600;
  color: var(--color-text-secondary);
  min-width: 40px;
}

/* Audit Stats Card */
.stat-card-audit {
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card-audit:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.stat-icon-audit {
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
}

/* Audit Cell */
.audit-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.audit-cell-offline {
  text-align: center;
  padding: 0.5rem;
}

.btn-audit {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-audit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
}

.btn-audit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Audit Modal */
.modal-audit {
  max-width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
}

.audit-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.audit-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid var(--color-border);
}

.audit-section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
}

.audit-section-title i {
  color: #8b5cf6;
}

/* Audit Stats Grid */
.audit-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.audit-stat-card {
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.audit-stat-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  text-align: center;
}

.audit-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #a78bfa;
}

/* Top Spots List */
.top-spots-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.top-spot-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
}

.top-spot-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
}

.spot-rank {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #8b5cf6, #6366f1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.spot-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spot-title {
  font-weight: 600;
  color: var(--color-text-primary);
}

.spot-type {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.spot-count {
  font-weight: 600;
  color: #a78bfa;
  white-space: nowrap;
}

/* Hour Distribution */
.hour-distribution {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.hour-bar {
  display: grid;
  grid-template-columns: 60px 1fr 60px;
  gap: 0.75rem;
  align-items: center;
}

.hour-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.hour-bar-container {
  height: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.hour-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #8b5cf6, #6366f1);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.hour-count {
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: right;
}

/* Day Distribution */
.day-distribution {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
}

.day-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.day-card:hover {
  background: rgba(139, 92, 246, 0.1);
  border-color: rgba(139, 92, 246, 0.3);
}

.day-name {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.day-count {
  font-size: 1.5rem;
  font-weight: 700;
  color: #a78bfa;
}

/* Mode Stats */
.mode-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.mode-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.mode-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(139, 92, 246, 0.3);
}

.mode-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.mode-neuro {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.mode-radio {
  background: linear-gradient(135deg, #10b981, #059669);
}

.mode-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mode-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.mode-count {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.mode-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: #a78bfa;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .audit-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .gestion-sucursales {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.85rem;
  }

  .header-actions {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .stat-label {
    font-size: 0.75rem;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .sucursales-table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .player-cell {
    min-width: 240px;
  }

  .player-controls-compact {
    flex-direction: column;
    gap: 0.375rem;
  }

  .mode-switch-compact {
    justify-content: center;
    width: 100%;
  }

  /* Modals */
  .modal-content {
    max-width: 95vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .modal-audit {
    max-width: 95vw;
  }

  .modal-body {
    max-height: 60vh;
    overflow-y: auto;
  }

  .audit-stats-grid {
    grid-template-columns: 1fr;
  }

  .day-distribution {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }

  .mode-stats {
    grid-template-columns: 1fr;
  }

  /* Form improvements */
  .form-group {
    margin-bottom: 1rem;
  }

  .modal-footer {
    flex-direction: column-reverse;
    gap: 0.5rem;
  }

  .modal-footer button {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: row;
  }

  .search-input {
    max-width: 100%;
  }

  .header-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .gestion-sucursales {
    padding: 0.75rem;
  }

  .page-header {
    padding: 0.875rem;
    margin-bottom: 1rem;
  }

  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.8rem;
  }

  .stats-grid {
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .stat-card {
    padding: 0.875rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    font-size: 0.875rem;
    padding: 0.625rem 1rem;
  }

  /* Form adjustments */
  .form-input,
  .form-select {
    font-size: 1rem; /* Prevent zoom on iOS */
  }

  .modal-header h3 {
    font-size: 1.125rem;
  }

  .form-preview h4 {
    font-size: 0.9375rem;
  }

  .preview-label {
    font-size: 0.75rem;
  }

  .preview-value {
    font-size: 0.8125rem;
  }

  /* Audit modal adjustments */
  .audit-section-title {
    font-size: 0.9375rem;
  }

  .top-spots-list {
    font-size: 0.8125rem;
  }

  .hour-bar {
    grid-template-columns: 50px 1fr 50px;
    gap: 0.5rem;
  }

  .hour-label {
    font-size: 0.75rem;
  }

  .hour-count {
    font-size: 0.8125rem;
  }

  /* Mobile-specific adjustments for custom cells */
  .mobile-card-value .badge {
    display: inline-block;
    white-space: nowrap;
  }

  .mobile-card-value .status-indicator {
    font-size: 0.875rem;
  }

  .mobile-card-value .player-cell {
    width: 100%;
  }

  .mobile-card-value .player-status-compact {
    font-size: 0.8125rem;
  }

  .mobile-card-value .control-btn-compact {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .mobile-card-value .audit-cell button {
    font-size: 0.8125rem;
    padding: 0.5rem 0.75rem;
  }

  .mobile-card-actions .btn-action {
    flex: 1;
    height: 36px;
  }
}
</style>
