<template>
  <div class="config-cliente-container">
    <!-- Alert Notifications -->
    <div v-if="alertMsg" class="notification-container">
      <div :class="['notification', alertType]">
        <div class="notification-content">
          <i :class="getAlertIcon(alertType)" class="notification-icon"></i>
          <span class="notification-text">{{ alertMsg }}</span>
        </div>
        <button class="notification-close" @click="alertMsg = ''" aria-label="Cerrar notificación">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="config-header">
      <div class="header-content">
        <div class="header-icon">
          <i class="fas fa-cog"></i>
        </div>
        <div class="header-text">
          <h1 class="header-title">Configuración del Cliente</h1>
          <p class="header-subtitle">Configure horarios, días disponibles y tipo de empresa</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <loading-spinner v-if="loading" :loading="true" text="Cargando configuración..." />

    <!-- Content -->
    <div v-else class="config-content">
      <!-- Sección: Horarios Disponibles -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-section">
            <i class="fas fa-clock"></i>
            <h2 class="card-title">Horarios Disponibles</h2>
          </div>
          <button
            v-if="!hasHorario"
            @click="showHorarioForm = true"
            class="btn btn-primary btn-sm"
          >
            <i class="fas fa-plus"></i>
            Configurar Horario
          </button>
        </div>

        <div v-if="hasHorario" class="card-body">
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Hora Inicio:</span>
              <span class="info-value">{{ horario.cliHor_horaDesde }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Hora Fin:</span>
              <span class="info-value">{{ horario.cliHor_horaHasta }}</span>
            </div>
            <button @click="showHorarioForm = true" class="btn btn-outline btn-sm">
              <i class="fas fa-edit"></i>
              Editar
            </button>
          </div>
        </div>

        <div v-else class="card-empty">
          <i class="fas fa-clock-o"></i>
          <p>No hay horarios configurados</p>
          <button @click="showHorarioForm = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Configurar Ahora
          </button>
        </div>
      </div>

      <!-- Sección: Días Disponibles -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-section">
            <i class="fas fa-calendar"></i>
            <h2 class="card-title">Días Disponibles</h2>
          </div>
          <button
            v-if="!hasDias"
            @click="showDiasForm = true"
            class="btn btn-primary btn-sm"
          >
            <i class="fas fa-plus"></i>
            Configurar Días
          </button>
        </div>

        <div v-if="hasDias" class="card-body">
          <div class="dias-grid">
            <div
              v-for="dia in diasSemana"
              :key="dia.value"
              :class="['dia-chip', { 'active': isDiaSeleccionado(dia.value) }]"
            >
              <i class="fas fa-check-circle" v-if="isDiaSeleccionado(dia.value)"></i>
              {{ dia.text }}
            </div>
          </div>
          <button @click="showDiasForm = true" class="btn btn-outline btn-sm mt-3">
            <i class="fas fa-edit"></i>
            Editar
          </button>
        </div>

        <div v-else class="card-empty">
          <i class="fas fa-calendar-o"></i>
          <p>No hay días configurados</p>
          <button @click="showDiasForm = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Configurar Ahora
          </button>
        </div>
      </div>

      <!-- Sección: Tipo de Empresa -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-section">
            <i class="fas fa-building"></i>
            <h2 class="card-title">Tipo de Empresa</h2>
          </div>
          <button
            v-if="!hasTipoEmpresa"
            @click="showTipoEmpresaForm = true"
            class="btn btn-primary btn-sm"
          >
            <i class="fas fa-plus"></i>
            Configurar Tipo
          </button>
        </div>

        <div v-if="hasTipoEmpresa && tiposEmpresa.length > 0" class="card-body">
          <div class="tipo-empresa-display">
            <div class="tipo-empresa-info">
              <div class="tipo-empresa-badge">
                <i class="fas fa-tag"></i>
                <div class="tipo-empresa-details">
                  <span class="tipo-empresa-nombre">{{ tiposEmpresa[0].tipEmp_nombre }}</span>
                  <span class="tipo-empresa-grupo">{{ getGrupoNombre(tiposEmpresa[0].tipEmp_codigoTipoEmpGrupo) }}</span>
                </div>
              </div>
            </div>
            <button @click="editarTipoEmpresa" class="btn btn-outline btn-sm">
              <i class="fas fa-edit"></i>
              Editar
            </button>
          </div>
        </div>

        <div v-else class="card-empty">
          <i class="fas fa-building-o"></i>
          <p>No hay tipos de empresa configurados</p>
          <button @click="showTipoEmpresaForm = true" class="btn btn-primary">
            <i class="fas fa-plus"></i>
            Configurar Ahora
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Configurar Horario -->
    <transition name="modal-fade">
      <div v-if="showHorarioForm" class="modal-overlay" @click.self="closeHorarioForm">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fas fa-clock"></i>
              Configurar Horarios
            </h3>
            <button @click="closeHorarioForm" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-sun"></i>
                Hora de Inicio
              </label>
              <input
                v-model="formHorario.horaDesde"
                type="time"
                class="form-input"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-moon"></i>
                Hora de Fin
              </label>
              <input
                v-model="formHorario.horaHasta"
                type="time"
                class="form-input"
                required
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeHorarioForm" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button @click="guardarHorario" class="btn btn-primary" :disabled="saving">
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Configurar Días -->
    <transition name="modal-fade">
      <div v-if="showDiasForm" class="modal-overlay" @click.self="closeDiasForm">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fas fa-calendar"></i>
              Configurar Días Disponibles
            </h3>
            <button @click="closeDiasForm" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p class="modal-hint">
              <i class="fas fa-info-circle"></i>
              Seleccione los días en los que su negocio está operativo
            </p>
            <div class="dias-selector">
              <label
                v-for="dia in diasSemana"
                :key="dia.value"
                class="dia-checkbox"
              >
                <input
                  type="checkbox"
                  :value="dia.value"
                  v-model="formDias.diasSeleccionados"
                />
                <span class="dia-label">{{ dia.text }}</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeDiasForm" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button @click="guardarDias" class="btn btn-primary" :disabled="saving || formDias.diasSeleccionados.length === 0">
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Configurar Tipo de Empresa -->
    <transition name="modal-fade">
      <div v-if="showTipoEmpresaForm" class="modal-overlay" @click.self="closeTipoEmpresaForm">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">
              <i class="fas fa-building"></i>
              {{ isEditingTipoEmpresa ? 'Editar Tipo de Empresa' : 'Configurar Tipo de Empresa' }}
            </h3>
            <button @click="closeTipoEmpresaForm" class="modal-close">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body">
            <p v-if="isEditingTipoEmpresa" class="modal-hint modal-hint-warning">
              <i class="fas fa-exclamation-triangle"></i>
              Al guardar, se reemplazará el tipo de empresa actual
            </p>
            <p v-else class="modal-hint">
              <i class="fas fa-info-circle"></i>
              Seleccione el tipo de empresa que mejor describa su negocio
            </p>
              <div class="form-group">
              <label class="form-label">
                <i class="fas fa-layer-group"></i>
                Grupo de Empresa
              </label>
              <select v-model="formTipoEmpresa.grupoSeleccionado" class="form-select">
                <option value="">Seleccione un grupo</option>
                <option
                  v-for="grupo in gruposEmpresaDisponibles"
                  :key="grupo.tiemgr_codigo"
                  :value="grupo.tiemgr_codigo"
                >
                  {{ grupo.tiemgr_nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-list"></i>
                Tipo de Empresa
              </label>
              <select v-model="formTipoEmpresa.tipoSeleccionado" class="form-select">
                <option value="">Seleccione un tipo</option>
                <option
                  v-for="tipo in tiposEmpresaDisponiblesGet"
                  :key="tipo.tipEmp_codigo"
                  :value="tipo.tipEmp_codigo"
                >
                  {{ tipo.tipEmp_nombre }}
                </option>
              </select>
            </div>
          
          </div>
          <div class="modal-footer">
            <button @click="closeTipoEmpresaForm" class="btn btn-secondary">
              <i class="fas fa-times"></i>
              Cancelar
            </button>
            <button
              @click="guardarTipoEmpresa"
              class="btn btn-primary"
              :disabled="saving || !formTipoEmpresa.tipoSeleccionado || !formTipoEmpresa.grupoSeleccionado"
            >
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import clienteConfigService from '@/services/ClienteConfigServices'
import configValidationService from '@/services/ConfigValidationService'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const alertMsg = ref('')
const alertType = ref('notification-info')

const horario = ref(null)
const diasHabiles = ref([])
const tiposEmpresa = ref([]) // Tipos asignados al cliente
const tiposEmpresaDisponibles = ref([]) // Todos los tipos disponibles para seleccionar
const gruposEmpresaDisponibles = ref([]) // Grupos de empresa disponibles

const showHorarioForm = ref(false)
const showDiasForm = ref(false)
const showTipoEmpresaForm = ref(false)
const isEditingTipoEmpresa = ref(false)

const formHorario = ref({
  horaDesde: '08:00',
  horaHasta: '20:00'
})

const formDias = ref({
  diasSeleccionados: []
})

const formTipoEmpresa = ref({
  tipoSeleccionado: '',
  grupoSeleccionado: ''
})

const diasSemana = ref([
  { text: 'Lunes', value: 1 },
  { text: 'Martes', value: 2 },
  { text: 'Miércoles', value: 3 },
  { text: 'Jueves', value: 4 },
  { text: 'Viernes', value: 5 },
  { text: 'Sábado', value: 6 },
  { text: 'Domingo', value: 0 }
])

// Computed
const hasHorario = computed(() => horario.value !== null && horario.value.cliHor_horaDesde)
const hasDias = computed(() => diasHabiles.value && diasHabiles.value.length > 0)
const hasTipoEmpresa = computed(() => tiposEmpresa.value && tiposEmpresa.value.length > 0)
const tiposEmpresaDisponiblesGet = computed(() => tiposEmpresaDisponibles.value.filter(data=>data.tipEmp_codigoTipoEmpGrupo==formTipoEmpresa.value.grupoSeleccionado)) // Todos los tipos disponibles para seleccionar

// Methods
const showAlert = (msg, type = 'notification-info') => {
  alertMsg.value = msg
  alertType.value = type
  setTimeout(() => (alertMsg.value = ''), 5000)
}

const getAlertIcon = (type) => {
  const icons = {
    'notification-success': 'fas fa-check-circle',
    'notification-info': 'fas fa-info-circle',
    'notification-warning': 'fas fa-exclamation-triangle',
    'notification-danger': 'fas fa-exclamation-circle'
  }
  return icons[type] || 'fas fa-info-circle'
}

const isDiaSeleccionado = (codigoDia) => {
  return diasHabiles.value.some(d => d.cliDha_codigoDia === codigoDia)
}

const cargarConfiguracion = async () => {
  loading.value = true
  try {
    // Cargar horario
    try {
      const horarioData = await clienteConfigService.getHorario()
      horario.value = horarioData
      if (horarioData && horarioData.cliHor_horaDesde) {
        formHorario.value = {
          horaDesde: horarioData.cliHor_horaDesde,
          horaHasta: horarioData.cliHor_horaHasta
        }
      }
    } catch (error) {
      console.log('No hay horario configurado', error)
    }

    // Cargar días hábiles
    try {
      const diasData = await clienteConfigService.getDiasHabiles()
      diasHabiles.value = Array.isArray(diasData) ? diasData : []
      formDias.value.diasSeleccionados = diasHabiles.value.map(d => d.cliDha_codigoDia)
    } catch (error) {
      console.log('No hay días configurados', error)
    }

    try {
      const tiposData = await clienteConfigService.getTiposEmpresaCliente()
      const tiposDataDisponibles = await clienteConfigService.getTiposEmpresaClienteAll()
      tiposEmpresa.value = Array.isArray(tiposData) ? tiposData : []
      // Por ahora usamos los mismos datos para el selector
      // TODO: Crear endpoint para obtener catálogo completo de tipos de empresa
      tiposEmpresaDisponibles.value = Array.isArray(tiposDataDisponibles) ? tiposDataDisponibles : []
    } catch (error) {
      console.log('No hay tipos de empresa configurados', error)
      tiposEmpresa.value = []
      tiposEmpresaDisponibles.value = []
    }

    // Cargar grupos de empresa disponibles
    try {
      const gruposData = await clienteConfigService.getTiposEmpresaGrupo()
      gruposEmpresaDisponibles.value = Array.isArray(gruposData) ? gruposData : []
    } catch (error) {
      console.error('Error al cargar grupos de empresa', error)
    }

  } catch (error) {
    console.error('Error al cargar configuración:', error)
    showAlert('Error al cargar la configuración', 'notification-danger')
  } finally {
    loading.value = false
  }
}

const closeHorarioForm = () => {
  showHorarioForm.value = false
}

const closeDiasForm = () => {
  showDiasForm.value = false
}

const closeTipoEmpresaForm = () => {
  showTipoEmpresaForm.value = false
  isEditingTipoEmpresa.value = false
  formTipoEmpresa.value = {
    tipoSeleccionado: '',
    grupoSeleccionado: ''
  }
}

const getGrupoNombre = (codigoGrupo) => {
  const grupo = gruposEmpresaDisponibles.value.find(g => g.tiemgr_codigo === codigoGrupo)
  return grupo ? grupo.tiemgr_nombre : ''
}

const editarTipoEmpresa = () => {
  if (tiposEmpresa.value.length > 0) {
    const tipoActual = tiposEmpresa.value[0]
    formTipoEmpresa.value = {
      tipoSeleccionado: tipoActual.tipEmp_codigo,
      grupoSeleccionado: tipoActual.tipEmp_codigoTipoEmpGrupo
    }
    isEditingTipoEmpresa.value = true
  }
  showTipoEmpresaForm.value = true
}

const guardarHorario = async () => {
  saving.value = true
  try {
    const horarioData = {
      cliHor_horaDesde: formHorario.value.horaDesde,
      cliHor_horaHasta: formHorario.value.horaHasta
    }

    if (hasHorario.value) {
      await clienteConfigService.updateHorario(horarioData)
    } else {
      await clienteConfigService.setHorario(horarioData)
    }

    showAlert('Horario guardado correctamente', 'notification-success')

    // Clear configuration cache
    configValidationService.clearCache()

    await cargarConfiguracion()
    closeHorarioForm()
  } catch (error) {
    console.error('Error al guardar horario:', error)
    showAlert('Error al guardar el horario', 'notification-danger')
  } finally {
    saving.value = false
  }
}

const guardarDias = async () => {
  saving.value = true
  try {
    const diasData = formDias.value.diasSeleccionados.map(dia => ({
      cliDha_codigoDia: dia
    }))

    await clienteConfigService.setDiasHabiles(diasData)

    showAlert('Días guardados correctamente', 'notification-success')

    // Clear configuration cache
    configValidationService.clearCache()

    await cargarConfiguracion()
    closeDiasForm()
  } catch (error) {
    console.error('Error al guardar días:', error)
    showAlert('Error al guardar los días', 'notification-danger')
  } finally {
    saving.value = false
  }
}

const guardarTipoEmpresa = async () => {
  saving.value = true
  try {
    // Guardamos el nuevo tipo de empresa
    const tipoEmpresaData = {
      cliemp_codcli: authStore.user?.Cliente ? JSON.parse(authStore.user.Cliente).cli_codigo : 0,
      cliemp_codEmp: parseInt(formTipoEmpresa.value.tipoSeleccionado),
      cliemp_codGrpEmp: parseInt(formTipoEmpresa.value.grupoSeleccionado)
    }

    await clienteConfigService.setTipoEmpresa(tipoEmpresaData)

    showAlert(
      isEditingTipoEmpresa.value
        ? 'Tipo de empresa actualizado correctamente'
        : 'Tipo de empresa guardado correctamente',
      'notification-success'
    )

    // Clear configuration cache
    configValidationService.clearCache()

    await cargarConfiguracion()
    closeTipoEmpresaForm()
  } catch (error) {
    console.error('Error al guardar tipo de empresa:', error)
    showAlert('Error al guardar el tipo de empresa', 'notification-danger')
  } finally {
    saving.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Verificar permisos
  if (authStore.userRole !== 'Cliente' && authStore.userRole !== 'Administrador') {
    showAlert('No tienes permisos para acceder a esta sección', 'notification-danger')
    router.push('/dashboard')
    return
  }

  await cargarConfiguracion()
})
</script>

<style scoped>
/* Variables CSS */
:root {
  --color-bg-primary: #0f1419;
  --color-bg-secondary: #16181d;
  --color-surface: #1c1f26;
  --color-border: rgba(255, 255, 255, 0.08);
  --color-text-primary: #e5e7eb;
  --color-text-secondary: #9ca3af;
  --color-primary: #3b82f6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
}

.config-cliente-container {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
  color: var(--color-text-primary);
  padding: 2rem;
}

/* Notifications */
.notification-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 9999;
  max-width: 400px;
}

.notification {
  background: var(--color-surface);
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  border: 1px solid var(--color-border);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.notification-success {
  border-color: rgba(34, 197, 94, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), var(--color-surface));
}

.notification-info {
  border-color: rgba(59, 130, 246, 0.3);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), var(--color-surface));
}

.notification-warning {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), var(--color-surface));
}

.notification-danger {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), var(--color-surface));
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification-icon {
  font-size: 1.25rem;
  color: var(--color-text-secondary);
}

.notification-success .notification-icon { color: var(--color-success); }
.notification-info .notification-icon { color: var(--color-primary); }
.notification-warning .notification-icon { color: var(--color-warning); }
.notification-danger .notification-icon { color: var(--color-danger); }

.notification-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary);
}

.notification-close {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary);
}

/* Header */
.config-header {
  background: var(--color-surface);
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--color-border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.header-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-primary), #2563eb);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.header-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.header-subtitle {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--color-text-secondary);
}

/* Config Content */
.config-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Config Card */
.config-card {
  background: var(--color-surface);
  border-radius: 1rem;
  border: 1px solid var(--color-border);
  overflow: hidden;
  transition: all 0.3s;
}

.config-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title-section i {
  font-size: 1.25rem;
  color: var(--color-primary);
}

.card-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.card-body {
  padding: 1.5rem;
}

.card-empty {
  padding: 3rem 1.5rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.card-empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.card-empty p {
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

/* Info Row */
.info-row {
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.info-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* Días Grid */
.dias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.dia-chip {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.dia-chip.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--color-primary);
}

.dia-chip i {
  font-size: 1rem;
}

/* Tipo de Empresa Display */
.tipo-empresa-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.tipo-empresa-info {
  flex: 1;
  min-width: 200px;
}

.tipo-empresa-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 0.75rem;
  transition: all 0.3s;
}

.tipo-empresa-badge:hover {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08));
  border-color: rgba(34, 197, 94, 0.3);
}

.tipo-empresa-badge i {
  font-size: 1.5rem;
  color: var(--color-success);
}

.tipo-empresa-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tipo-empresa-nombre {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.tipo-empresa-grupo {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Buttons */
.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary), #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mt-3 {
  margin-top: 1rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: var(--color-surface);
  border-radius: 1rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent);
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-close {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-hint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: var(--color-primary);
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.modal-hint-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--color-warning);
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.2);
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 0.5rem;
}

.form-label i {
  color: var(--color-primary);
  font-size: 0.875rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: var(--color-primary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Días Selector */
.dias-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.75rem;
}

.dia-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dia-checkbox:hover {
  background: rgba(255, 255, 255, 0.06);
}

.dia-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-primary);
}

.dia-label {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  font-weight: 500;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .config-cliente-container {
    padding: 1rem;
  }

  .config-content {
    grid-template-columns: 1fr;
  }

  .notification-container {
    left: 1rem;
    right: 1rem;
    max-width: none;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }

  .modal-footer .btn {
    width: 100%;
    justify-content: center;
  }

  .dias-selector {
    grid-template-columns: 1fr;
  }
}
</style>
