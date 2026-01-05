<template>
  <div class="sucursales-container">
    <!-- Configuration Blocker -->
    <ConfigurationBlocker
      v-if="showConfigBlocker && configStatus"
      :configStatus="configStatus"
    />

    <!-- Page Header -->
    <header v-else class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Gestión de Sucursales</h1>
          <p class="page-subtitle">
            Administra y configura tus sucursales
          </p>
        </div>
        <div class="header-actions">
          <button
            class="btn-primary"
            @click="openCreateModal"
          >
            <i class="fas fa-plus"></i>
            <span>Nueva Sucursal</span>
          </button>
        </div>
      </div>
    </header>

    <div class="content-grid">
      <!-- Stats Cards -->
      <section class="stats-section stats-grid-4">
        <div class="stat-card">
          <div class="stat-icon">
            <i class="fas fa-building"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">
              {{ sucursales.length }}
            </span>
            <span class="stat-label">Total Sucursales</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-success">
            <i class="fas fa-circle"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">
              {{ sucursales.filter(s => s.conected === 1).length }}
            </span>
            <span class="stat-label">Activas</span>
          </div>
        </div> 
      </section>

      <!-- Sucursales List -->
      <section class="sucursales-section">
        <header class="section-header">
          <h2 class="section-title">Lista de Sucursales</h2>
          <div class="section-actions">
            <input
              type="text"
              v-model="searchTerm"
              placeholder="Buscar sucursal..."
              class="search-input"
            >
          </div>
        </header>

        <!-- Loading state -->
        <div v-if="loading" class="loading-overlay">
          <div class="loading-spinner"></div>
        </div>

        <div
          v-else-if="filteredSucursales.length === 0"
          class="empty-state"
        >
          <div class="empty-state-icon">
            <i class="fas fa-search"></i>
          </div>
          <h3>No se encontraron sucursales</h3>
          <p>{{ searchTerm ? 'No hay sucursales que coincidan con la búsqueda' : 'Aún no hay sucursales registradas' }}</p>
        </div>

        <div
          v-else
          class="sucursales-grid"
        >
          <article
            v-for="sucursal in filteredSucursales.sort((a,b)=>b.conected-a.conected)"
            :key="sucursal.id"
            class="sucursal-card"
            :class="{ 'inactive': sucursal.conected !== 1 }"
          >
            <header class="card-header">
              <div class="sucursal-icon">
                <i class="fas fa-building"></i>
              </div>
              <div class="sucursal-info">
                <h3 class="sucursal-name">
                  {{ sucursal.nombre }}
                </h3>
                <span
                  class="sucursal-status"
                  :class="{ 'active': sucursal.conected === 1 }"
                >
                  <i class="fas fa-circle"></i>
                  <span>{{ sucursal.conected === 1 ? 'Activa' : 'Inactiva' }}</span>
                </span>
              </div>
            </header>

            <div class="card-content">
              <!-- Player Status -->
              <div v-if="sucursal.currentSong" class="player-status">
                <div class="now-playing">
                  <i class="fas" :class="sucursal.isPlaying ? 'fa-play-circle playing' : 'fa-pause-circle'"></i>
                  <div class="song-info">
                    <span class="song-title">{{ sucursal.currentSong }}</span>
                    <span class="player-mode">{{ getPlayerModeLabel(sucursal.activePlayer) }}</span>
                  </div>
                </div>
                <div v-if="sucursal.playbackProgress" class="progress-bar">
                  <div class="progress-fill" :style="{ width: sucursal.playbackProgress.percentage + '%' }"></div>
                  <span class="progress-text">{{ sucursal.playbackProgress.percentage }}%</span>
                </div>
              </div>

              <dl class="sucursal-details">
                <div class="sucursal-detail">
                  <dt class="detail-label">Usuario:</dt>
                  <dd class="detail-value">{{ sucursal.usuario }}</dd>
                </div>
                <div class="sucursal-detail">
                  <dt class="detail-label">Última conexión:</dt>
                  <dd class="detail-value">{{ sucursal.ultimaConexion }}</dd>
                </div>
              </dl>
            </div>

            <!-- Player Controls -->
            <div v-if="sucursal.conected === 1" class="player-controls">
              <div class="control-buttons">
                <button
                  class="control-btn"
                  @click="playerControl.play(sucursal.userId)"
                  :disabled="playerControl.executing.value"
                  title="Reproducir"
                >
                  <i class="fas fa-play"></i>
                </button>
                <button
                  class="control-btn"
                  @click="playerControl.pause(sucursal.userId)"
                  :disabled="playerControl.executing.value"
                  title="Pausar"
                >
                  <i class="fas fa-pause"></i>
                </button>
              </div>

              <!-- Mode Toggle Switch -->
              <div class="mode-switch-container">
                <label class="mode-switch">
                  <span class="mode-label" :class="{ 'active': sucursal.playerStatus?.mode === 'neuro' }">
                    <i class="fas fa-clock"></i>
                    Neuro
                  </span>
                  <input
                    type="checkbox"
                    :checked="sucursal.playerStatus?.mode === 'radio'"
                    @change="togglePlayerMode(sucursal)"
                    :disabled="playerControl.executing.value"
                  />
                  <span class="mode-switch-slider"></span>
                  <span class="mode-label" :class="{ 'active': sucursal.playerStatus?.mode === 'radio' }">
                    <i class="fas fa-radio"></i>
                    Radio
                  </span>
                </label>
              </div>
            </div>

            <div class="card-actions">
              <button
                class="btn-secondary"
                @click="editSucursal(sucursal)"
              >
                <i class="fas fa-edit"></i>
                <span>Editar</span>
              </button>
              <button
                class="btn-danger"
                @click="deleteSucursal(sucursal)"
              >
                <i class="fas fa-trash"></i>
                <span>Eliminar</span>
              </button>
            </div>
          </article>
        </div>
      </section>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h3 class="modal-title">
            {{ editingSucursal ? 'Editar Sucursal' : 'Nueva Sucursal' }}
          </h3>
          <button
            class="modal-close"
            @click="closeModal"
          >
            <i class="fas fa-times"></i>
          </button>
        </header>

        <form @submit.prevent="saveSucursal" class="modal-form">
          <div class="form-group">
            <label class="form-label">
              Nombre de la Sucursal <span class="required">*</span>
            </label>
            <input
              type="text"
              v-model="formData.nombre"
              class="form-input"
              required
              placeholder="Ingrese el nombre"
            >
          </div>

          <div class="form-group">
            <label class="form-label">
              Usuario <span class="required">*</span>
            </label>
            <input
              type="text"
              v-model="formData.usuario"
              class="form-input"
              required
              placeholder="Ingrese el usuario"
            >
          </div>

          <div class="form-group">
            <label class="form-label">
              Contraseña <span class="required">*</span>
            </label>
            <input
              type="password"
              v-model="formData.password"
              class="form-input"
              :required="!editingSucursal"
              placeholder="Ingrese la contraseña"
            >
            <div v-if="editingSucursal" class="form-help">
              Deje vacío para mantener la contraseña actual
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">
              Confirmar Contraseña <span class="required">*</span>
            </label>
            <input
              type="password"
              v-model="formData.confirmPassword"
              class="form-input"
              :required="!editingSucursal"
              placeholder="Confirme la contraseña"
            >
            <div
              v-if="formData.password !== formData.confirmPassword && formData.confirmPassword"
              class="form-error"
            >
              Las contraseñas no coinciden
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              class="btn-secondary"
              @click="closeModal"
              :disabled="loading"
            >
              <span>Cancelar</span>
            </button>
            <button
              type="submit"
              class="btn-primary"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading">
                <i class="fas fa-spinner fa-spin"></i>
                {{ editingSucursal ? 'Actualizando' : 'Creando' }}...
              </span>
              <span v-else>
                <i :class="editingSucursal ? 'fas fa-save' : 'fas fa-plus'"></i>
                {{ editingSucursal ? 'Actualizar' : 'Crear' }} Sucursal
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { useSucursal } from '@/composables/useSucursal'
import { usePlayerControl } from '@/composables/usePlayerControl'
import configValidationService from '@/services/ConfigValidationService'
import ConfigurationBlocker from '@/components/ui/ConfigurationBlocker.vue'

const { proxy } = getCurrentInstance()

// Configuration validation
const configStatus = ref(null)
const showConfigBlocker = ref(false)

// Player control con callbacks
const playerControl = usePlayerControl({
  onCommandSuccess: (command, result) => {
    console.log(`[Sucursales] Comando ${command} ejecutado`, result)
    proxy.$toast(`Comando ${command} ejecutado correctamente`, 'success')
  },
  onCommandError: (command, error) => {
    console.error(`[Sucursales] Error en comando ${command}`, error)
    proxy.$toast(`Error al ejecutar ${command}: ${error.message}`, 'error')
  }
})

const {
  sucursales,
  loading,
  loadSucursales,
  createSucursal,
  updateSucursal,
  deleteSucursales
} = useSucursal({ enableRealtime: true })

const showCreateModal = ref(false)
const editingSucursal = ref(null)
const searchTerm = ref('')
const formData = ref({
  nombre: '',
  usuario: '',
  password: '',
  confirmPassword: ''
})

const filteredSucursales = computed(() => {
  if (!searchTerm.value) return sucursales.value

  const search = searchTerm.value.toLowerCase()
  return sucursales.value.filter(sucursal =>
    (sucursal.clisuc_nombre || sucursal.nombre || '').toLowerCase().includes(search) ||
    (sucursal.cli_usuari || sucursal.usuario || '').toLowerCase().includes(search)
  )
})



const isFormValid = computed(() => {
  return formData.value.nombre.trim() !== '' &&
         formData.value.usuario.trim() !== '' &&
         (editingSucursal.value || formData.value.password.trim() !== '') &&
         (editingSucursal.value || formData.value.password === formData.value.confirmPassword)
})

const formatLastConnection = (dateString) => {
  if (!dateString) return 'Nunca'

  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

  if (diffInHours < 1) return 'Hace menos de 1 hora'
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`

  return date.toLocaleDateString()
}

const getPlayerModeLabel = (mode) => {
  const modes = {
    music: 'Música',
    spots: 'Spots',
    neuro: 'Neuro/Mixto'
  }
  return modes[mode] || mode
}



// Toggle entre modo Neuro y Radio
const togglePlayerMode = async (sucursal) => {
  const currentMode = sucursal.playerStatus?.mode || 'neuro'
  const newMode = currentMode === 'neuro' ? 'radio' : 'neuro'

  try {
    await playerControl.setMode(newMode, sucursal.userId)
    proxy.$toast(`Modo cambiado a ${newMode === 'neuro' ? 'Neuro' : 'Radio'}`, 'success')
  } catch (error) {
    console.error('[Sucursales] Error al cambiar modo:', error)
    proxy.$toast(`Error al cambiar modo: ${error.message}`, 'error')
  }
}

const openCreateModal = () => {
  editingSucursal.value = null
  formData.value = {
    nombre: '',
    usuario: '',
    password: '',
    confirmPassword: ''
  }
  showCreateModal.value = true
}

const closeModal = () => {
  showCreateModal.value = false
  editingSucursal.value = null
  formData.value = {
    nombre: '',
    usuario: '',
    password: '',
    confirmPassword: ''
  }
}

const editSucursal = (sucursal) => {
  editingSucursal.value = sucursal
  formData.value = {
    nombre: sucursal.clisuc_nombre || sucursal.nombre,
    usuario: sucursal.cli_usuari || sucursal.usuario,
    password: '',
    confirmPassword: ''
  }
  showCreateModal.value = true
}

const deleteSucursal = async (sucursal) => {
  if (!confirm(`¿Estás seguro de eliminar la sucursal "${sucursal.nombre}"?`)) {
    return
  }

  try {
    await deleteSucursales([{
      clisuc_codigo: sucursal.clisuc_codigo || sucursal.id,
      username: sucursal.cli_usuari || sucursal.usuario
    }])

    proxy.$toast('Sucursal eliminada correctamente', 'success')
  } catch (error) {
    console.error('Error eliminando sucursal:', error)
    proxy.$toast('Error al eliminar la sucursal', 'error')
  }
}

const saveSucursal = async () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    proxy.$toast('Las contraseñas no coinciden', 'error')
    return
  }

  try {
    if (editingSucursal.value) {
      // Actualizar existente
      await updateSucursal({
        idSucursal: editingSucursal.value.clisuc_idSucursal,
        nombreSucu: formData.value.nombre,
        usernameSucu: formData.value.usuario,
        passSucu: formData.value.password,
        progRadio: editingSucursal.value.progRadio || 1,
        progSpot: editingSucursal.value.progSpot || 1,
        programSpot: editingSucursal.value.programSpot || 1,
        iscliente: editingSucursal.value.iscliente || 0
      })

      proxy.$toast('Sucursal actualizada correctamente', 'success')
    } else {
      // Crear nueva
      await createSucursal({
        nombreSucursal: formData.value.nombre,
        nombreUsuarioSucursal: formData.value.usuario,
        contrasenia: formData.value.password
      })

      proxy.$toast('Sucursal creada correctamente', 'success')
    }

    closeModal()
  } catch (error) {
    console.error('Error guardando sucursal:', error)
    proxy.$toast('Error al guardar la sucursal', 'error')
  }
}

onMounted(async () => {
  try {
    // Check configuration status first
    configStatus.value = await configValidationService.checkConfigurationStatus()

    if (!configStatus.value.isComplete) {
      console.warn('⚠️ Configuración incompleta. Falta:', configStatus.value.missing)
      showConfigBlocker.value = true
      return
    }

    const data = await loadSucursales()

    // Transformar datos de la API
    if (data) {
      sucursales.value = data.map(sucursal => {
        // Determinar última conexión
        let ultimaConexion
        if (sucursal.conected === 1) {
          // Si está conectado, mostrar "Conectado ahora"
          ultimaConexion = 'Conectado ahora'
        } else if (sucursal.lastConnection) {
          // Si tiene fecha de última conexión, usarla
          ultimaConexion = formatLastConnection(sucursal.lastConnection)
        } else if (sucursal.clisuc_fechaAlta) {
          // Sino, usar fecha de alta
          ultimaConexion = formatLastConnection(sucursal.clisuc_fechaAlta)
        } else {
          ultimaConexion = 'Nunca'
        }

        return {
          id: sucursal.clisuc_codigo,
          nombre: sucursal.clisuc_nombre,
          usuario: sucursal.cli_usuari,
          activa: sucursal.conected === 1,
          ultimaConexion,
          ...sucursal
        }
      })
    }
  } catch (error) {
    console.error('Error cargando sucursales:', error)
    proxy.$toast('Error al cargar las sucursales', 'error')
  }
})
</script>

<style scoped src="./sucursales.css"></style>
<style scoped>
/* Stats Grid - 4 columnas */
.stats-grid-4 {
  grid-template-columns: repeat(4, 1fr) !important;
}

@media (max-width: 1200px) {
  .stats-grid-4 {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

@media (max-width: 640px) {
  .stats-grid-4 {
    grid-template-columns: 1fr !important;
  }
}

/* Player Status Styles */
.player-status {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #bae6fd;
}

.now-playing {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.now-playing i {
  font-size: 32px;
  color: #0284c7;
  flex-shrink: 0;
}

.now-playing i.playing {
  color: #22c55e;
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

.song-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title {
  font-weight: 600;
  color: #0c4a6e;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-mode {
  font-size: 12px;
  color: #0369a1;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.progress-bar {
  position: relative;
  height: 8px;
  background: #e0f2fe;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-text {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  font-weight: 600;
  color: #0c4a6e;
}

/* Stat Card Icon Variants */
.stat-icon-info {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-card:nth-child(3) .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}

.stat-card:nth-child(3)::before {
  background: linear-gradient(90deg, #3b82f6, #2563eb);
}

.stat-card:nth-child(4) .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.stat-card:nth-child(4)::before {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

/* ===== PLAYER CONTROLS - DARK MODE ===== */
.player-controls {
  padding: 1rem;
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-xl);
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.control-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
}

.control-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-base);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  box-shadow:
    0 4px 12px rgba(59, 130, 246, 0.3),
    0 0 20px rgba(59, 130, 246, 0.2);
}

.control-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  transform: translateY(-2px) scale(1.05);
  box-shadow:
    0 6px 16px rgba(59, 130, 246, 0.4),
    0 0 30px rgba(59, 130, 246, 0.3);
}

.control-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}

/* ===== MODE TOGGLE SWITCH ===== */
.mode-switch-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem;
}

.mode-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.mode-label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  transition: all var(--transition-base);
}

.mode-label.active {
  color: var(--color-primary-400);
}

.mode-label i {
  font-size: 1rem;
}

.mode-switch input[type="checkbox"] {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.mode-switch-slider {
  position: relative;
  width: 3.5rem;
  height: 1.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2rem;
  transition: all var(--transition-base);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.mode-switch-slider::before {
  content: '';
  position: absolute;
  width: 1.375rem;
  height: 1.375rem;
  left: 0.188rem;
  top: 0.125rem;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-radius: 50%;
  transition: all var(--transition-spring);
  box-shadow:
    0 2px 8px rgba(59, 130, 246, 0.4),
    0 0 12px rgba(59, 130, 246, 0.3);
}

.mode-switch input:checked + .mode-switch-slider {
  background: rgba(59, 130, 246, 0.15);
  border-color: rgba(59, 130, 246, 0.3);
}

.mode-switch input:checked + .mode-switch-slider::before {
  transform: translateX(1.75rem);
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  box-shadow:
    0 2px 10px rgba(96, 165, 250, 0.5),
    0 0 20px rgba(96, 165, 250, 0.4);
}

.mode-switch:hover .mode-switch-slider {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(59, 130, 246, 0.3);
}

.mode-switch input:disabled + .mode-switch-slider {
  opacity: 0.5;
  cursor: not-allowed;
}

.volume-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
  transition: all 0.2s ease;
}

.volume-slider::-moz-range-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.6);
}

.volume-value {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  min-width: 40px;
  text-align: right;
}

/* Advanced Player Control Modal */
.modal-player-control {
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
}

.player-control-body {
  padding: 24px;
}

.control-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.control-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.control-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-section-title i {
  color: #3b82f6;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.control-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1e293b;
}

.control-card:hover:not(:disabled) {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
}

.control-card:active:not(:disabled) {
  transform: translateY(0);
}

.control-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-card i {
  font-size: 24px;
}

.control-card span {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.volume-control-advanced {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  border: 2px solid #e2e8f0;
}

.volume-btn {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.volume-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.volume-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mute-btn {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.mute-btn:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.volume-slider-advanced {
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: #cbd5e1;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.volume-slider-advanced::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.volume-slider-advanced::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

.mode-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.mode-btn {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1e293b;
  text-align: left;
}

.mode-btn i {
  font-size: 32px;
  color: #64748b;
}

.mode-btn.active {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  border-color: #3b82f6;
  color: white;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
}

.mode-btn.active i {
  color: white;
}

.mode-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
}

.mode-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mode-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.mode-desc {
  font-size: 13px;
  opacity: 0.8;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.status-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
</style>
