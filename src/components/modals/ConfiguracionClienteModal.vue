<template>
  <modal v-model="localShow" title="Configuración del Cliente" size="xl" @close="handleClose">
    <!-- Alert Notifications -->
    <div v-if="alertMsg" class="notification-banner" :class="alertType">
      <div class="notification-content">
        <i :class="getAlertIcon(alertType)" class="notification-icon"></i>
        <span class="notification-text">{{ alertMsg }}</span>
      </div>
      <button class="notification-close" @click="alertMsg = ''">
        <i class="fas fa-times"></i>
      </button>
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
          <i class="fas fa-clock"></i>
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
          <i class="fas fa-calendar"></i>
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
          <div class="tipos-grid">
            <div
              v-for="tipo in tiposEmpresa"
              :key="tipo.tipEmp_codigo"
              class="tipo-chip"
            >
              <i class="fas fa-tag"></i>
              {{ tipo.tipEmp_nombre }}
            </div>
          </div>
          <button @click="showTipoEmpresaForm = true" class="btn btn-outline btn-sm mt-3">
            <i class="fas fa-plus"></i>
            Agregar Más
          </button>
        </div>

        <div v-else class="card-empty">
          <i class="fas fa-building"></i>
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
        <div class="modal-content-inner">
          <div class="modal-header-inner">
            <h3 class="modal-title-inner">
              <i class="fas fa-clock"></i>
              Configurar Horarios
            </h3>
            <button @click="closeHorarioForm" class="modal-close-inner">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body-inner">
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
          <div class="modal-footer-inner">
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
        <div class="modal-content-inner">
          <div class="modal-header-inner">
            <h3 class="modal-title-inner">
              <i class="fas fa-calendar"></i>
              Configurar Días Disponibles
            </h3>
            <button @click="closeDiasForm" class="modal-close-inner">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body-inner">
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
          <div class="modal-footer-inner">
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
        <div class="modal-content-inner">
          <div class="modal-header-inner">
            <h3 class="modal-title-inner">
              <i class="fas fa-building"></i>
              Configurar Tipo de Empresa
            </h3>
            <button @click="closeTipoEmpresaForm" class="modal-close-inner">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body-inner">
            <p class="modal-hint">
              <i class="fas fa-info-circle"></i>
              Seleccione los tipos de empresa que mejor describan su negocio
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
          <div class="modal-footer-inner">
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

    <template #footer>
      <base-button variant="secondary" @click="handleClose">
        Cerrar
      </base-button>
    </template>
  </modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/ui/Modal.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import clienteConfigService from '@/services/ClienteConfigServices'
import configValidationService from '@/services/ConfigValidationService'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:show', 'updated'])

const authStore = useAuthStore()

// State
const localShow = ref(props.show)
const loading = ref(false)
const saving = ref(false)
const alertMsg = ref('')
const alertType = ref('notification-info')

const horario = ref(null)
const diasHabiles = ref([])
const tiposEmpresa = ref([])
const tiposEmpresaDisponibles = ref([])
const gruposEmpresaDisponibles = ref([])

const showHorarioForm = ref(false)
const showDiasForm = ref(false)
const showTipoEmpresaForm = ref(false)

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

// Watchers
watch(() => props.show, (newVal) => {
  localShow.value = newVal
  if (newVal) {
    cargarConfiguracion()
  }
})

watch(localShow, (newVal) => {
  emit('update:show', newVal)
})

// Computed
const hasHorario = computed(() => horario.value !== null && horario.value.cliHor_horaDesde)
const hasDias = computed(() => diasHabiles.value && diasHabiles.value.length > 0)
const hasTipoEmpresa = computed(() => tiposEmpresa.value && tiposEmpresa.value.length > 0)
const tiposEmpresaDisponiblesGet = computed(() =>
  tiposEmpresaDisponibles.value.filter(data => data.tipEmp_codigoTipoEmpGrupo == formTipoEmpresa.value.grupoSeleccionado)
)

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
    configValidationService.clearCache()
    await cargarConfiguracion()
    closeHorarioForm()
    emit('updated', 'horario')
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
    configValidationService.clearCache()
    await cargarConfiguracion()
    closeDiasForm()
    emit('updated', 'dias')
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
    const tipoEmpresaData = {
      cliemp_codcli: authStore.user?.Cliente ? JSON.parse(authStore.user.Cliente).cli_codigo : 0,
      cliemp_codEmp: parseInt(formTipoEmpresa.value.tipoSeleccionado),
      cliemp_codGrpEmp: parseInt(formTipoEmpresa.value.grupoSeleccionado)
    }

    await clienteConfigService.setTipoEmpresa(tipoEmpresaData)

    showAlert('Tipo de empresa guardado correctamente', 'notification-success')
    configValidationService.clearCache()
    await cargarConfiguracion()
    closeTipoEmpresaForm()
    emit('updated', 'tipo-empresa')

    // Reset form
    formTipoEmpresa.value = {
      tipoSeleccionado: '',
      grupoSeleccionado: ''
    }
  } catch (error) {
    console.error('Error al guardar tipo de empresa:', error)
    showAlert('Error al guardar el tipo de empresa', 'notification-danger')
  } finally {
    saving.value = false
  }
}

const handleClose = () => {
  localShow.value = false
  // Limpiar alertas al cerrar
  alertMsg.value = ''
}
</script>

<style scoped>
/* Notifications Banner (dentro del modal) */
.notification-banner {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.notification-success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.notification-info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.notification-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.notification-danger {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification-icon {
  font-size: 1.25rem;
}

.notification-success .notification-icon { color: #22c55e; }
.notification-info .notification-icon { color: #3b82f6; }
.notification-warning .notification-icon { color: #f59e0b; }
.notification-danger .notification-icon { color: #ef4444; }

.notification-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-primary, #e5e7eb);
}

.notification-close {
  background: none;
  border: none;
  color: var(--color-text-secondary, #9ca3af);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.notification-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-primary, #e5e7eb);
}

/* Config Content */
.config-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Config Card */
.config-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  transition: all 0.3s;
}

.config-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  transform: translateY(-2px);
}

.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
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
  font-size: 1.125rem;
  color: #3b82f6;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary, #e5e7eb);
}

.card-body {
  padding: 1.25rem;
}

.card-empty {
  padding: 2rem 1.25rem;
  text-align: center;
  color: var(--color-text-secondary, #9ca3af);
}

.card-empty i {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
  opacity: 0.5;
}

.card-empty p {
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

/* Info Row */
.info-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
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
  color: var(--color-text-secondary, #9ca3af);
  font-weight: 600;
}

.info-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: #3b82f6;
}

/* Días Grid */
.dias-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.dia-chip {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  font-size: 0.8125rem;
  color: var(--color-text-secondary, #9ca3af);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.dia-chip.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.dia-chip i {
  font-size: 0.875rem;
}

/* Tipos Grid */
.tipos-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tipo-chip {
  padding: 0.5rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  color: #22c55e;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

/* Buttons */
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: var(--color-text-primary, #e5e7eb);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08);
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-primary, #e5e7eb);
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mt-3 {
  margin-top: 1rem;
}

/* Inner Modals (para sub-modales dentro del modal principal) */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 1rem;
}

.modal-content-inner {
  background: #1c1f26;
  border-radius: 0.75rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-header-inner {
  padding: 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.02);
}

.modal-title-inner {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary, #e5e7eb);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-close-inner {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--color-text-secondary, #9ca3af);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.modal-close-inner:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.modal-body-inner {
  padding: 1.25rem;
  overflow-y: auto;
  flex: 1;
}

.modal-hint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 0.5rem;
  color: #3b82f6;
  font-size: 0.8125rem;
  margin-bottom: 1.25rem;
}

.modal-footer-inner {
  padding: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.2);
}

/* Form */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-primary, #e5e7eb);
  margin-bottom: 0.5rem;
}

.form-label i {
  color: #3b82f6;
  font-size: 0.8125rem;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.625rem 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  color: var(--color-text-primary, #e5e7eb);
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

/* Días Selector */
.dias-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 0.625rem;
}

.dia-checkbox {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.dia-checkbox:hover {
  background: rgba(255, 255, 255, 0.06);
}

.dia-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.dia-label {
  font-size: 0.8125rem;
  color: var(--color-text-primary, #e5e7eb);
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
  .config-content {
    grid-template-columns: 1fr;
  }

  .modal-footer-inner {
    flex-direction: column-reverse;
  }

  .modal-footer-inner .btn {
    width: 100%;
    justify-content: center;
  }

  .dias-selector {
    grid-template-columns: 1fr;
  }
}
</style>
