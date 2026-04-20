<template>
  <modal
v-model="localShow"
title="Configuración del Cliente"
size="xl"
@close="handleClose"
>
    <!-- Alert Notifications -->
    <div
v-if="alertMsg"
class="notification-banner"
:class="alertType"
>
      <div class="notification-content">
        <i
:class="getAlertIcon(alertType)"
class="notification-icon"
/>
        <span class="notification-text">{{ alertMsg }}</span>
      </div>
      <button
class="notification-close"
@click="alertMsg = ''"
>
        <i class="fas fa-times" />
      </button>
    </div>

    <!-- Loading State -->
    <loading-spinner
v-if="loading"
:loading="true"
text="Cargando configuración..."
/>

    <!-- Content -->
    <div
v-else
class="config-content"
>
      <!-- Sección: Horarios Disponibles -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-section">
            <i class="fas fa-clock" />
            <h2 class="card-title">
Horarios Disponibles
</h2>
          </div>
          <button
            v-if="!hasHorario"
            class="btn btn-primary btn-sm"
            @click="showHorarioForm = true"
          >
            <i class="fas fa-plus" />
            Configurar Horario
          </button>
        </div>

        <div
v-if="hasHorario"
class="card-body"
>
          <div class="info-row">
            <div class="info-item">
              <span class="info-label">Hora Inicio:</span>
              <span class="info-value">{{ horario.cliHor_horaDesde }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Hora Fin:</span>
              <span class="info-value">{{ horario.cliHor_horaHasta }}</span>
            </div>
            <button
class="btn btn-outline btn-sm"
@click="showHorarioForm = true"
>
              <i class="fas fa-edit" />
              Editar
            </button>
          </div>
        </div>

        <div
v-else
class="card-empty"
>
          <i class="fas fa-clock" />
          <p>No hay horarios configurados</p>
          <button
class="btn btn-primary"
@click="showHorarioForm = true"
>
            <i class="fas fa-plus" />
            Configurar Ahora
          </button>
        </div>
      </div>

      <!-- Sección: Días Disponibles -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-section">
            <i class="fas fa-calendar" />
            <h2 class="card-title">
Días Disponibles
</h2>
          </div>
          <button
            v-if="!hasDias"
            class="btn btn-primary btn-sm"
            @click="showDiasForm = true"
          >
            <i class="fas fa-plus" />
            Configurar Días
          </button>
        </div>

        <div
v-if="hasDias"
class="card-body"
>
          <div class="dias-grid">
            <div
              v-for="dia in diasSemana"
              :key="dia.value"
              :class="['dia-chip', { 'active': isDiaSeleccionado(dia.value) }]"
            >
              <i
v-if="isDiaSeleccionado(dia.value)"
class="fas fa-check-circle"
/>
              {{ dia.text }}
            </div>
          </div>
          <button
class="btn btn-outline btn-sm mt-3"
@click="showDiasForm = true"
>
            <i class="fas fa-edit" />
            Editar
          </button>
        </div>

        <div
v-else
class="card-empty"
>
          <i class="fas fa-calendar" />
          <p>No hay días configurados</p>
          <button
class="btn btn-primary"
@click="showDiasForm = true"
>
            <i class="fas fa-plus" />
            Configurar Ahora
          </button>
        </div>
      </div>

      <!-- Sección: Tipo de Empresa -->
      <div class="config-card">
        <div class="card-header">
          <div class="card-title-section">
            <i class="fas fa-building" />
            <h2 class="card-title">
Tipo de Empresa
</h2>
          </div>
          <button
            v-if="!hasTipoEmpresa"
            class="btn btn-primary btn-sm"
            @click="showTipoEmpresaForm = true"
          >
            <i class="fas fa-plus" />
            Configurar Tipo
          </button>
        </div>

        <div
v-if="hasTipoEmpresa && tiposEmpresa.length > 0"
class="card-body"
>
          <div class="tipos-grid">
            <div
              v-for="tipo in tiposEmpresa"
              :key="tipo.tipEmp_codigo"
              class="tipo-chip"
            >
              <i class="fas fa-tag" />
              {{ tipo.tipEmp_nombre }}
            </div>
          </div>
          <button
class="btn btn-outline btn-sm mt-3"
@click="showTipoEmpresaForm = true"
>
            <i class="fas fa-plus" />
            Agregar Más
          </button>
        </div>

        <div
v-else
class="card-empty"
>
          <i class="fas fa-building" />
          <p>No hay tipos de empresa configurados</p>
          <button
class="btn btn-primary"
@click="showTipoEmpresaForm = true"
>
            <i class="fas fa-plus" />
            Configurar Ahora
          </button>
        </div>
      </div>
    </div>

    <!-- Modal: Configurar Horario -->
    <transition name="modal-fade">
      <div
v-if="showHorarioForm"
class="modal-overlay"
@click.self="closeHorarioForm"
>
        <div class="modal-content-inner">
          <div class="modal-header-inner">
            <h3 class="modal-title-inner">
              <i class="fas fa-clock" />
              Configurar Horarios
            </h3>
            <button
class="modal-close-inner"
@click="closeHorarioForm"
>
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="modal-body-inner">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-sun" />
                Hora de Inicio
              </label>
              <input
                v-model="formHorario.horaDesde"
                type="time"
                class="form-input"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-moon" />
                Hora de Fin
              </label>
              <input
                v-model="formHorario.horaHasta"
                type="time"
                class="form-input"
                required
              >
            </div>
          </div>
          <div class="modal-footer-inner">
            <button
class="btn btn-secondary"
@click="closeHorarioForm"
>
              <i class="fas fa-times" />
              Cancelar
            </button>
            <button
class="btn btn-primary"
:disabled="saving"
@click="guardarHorario"
>
              <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
/>
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Configurar Días -->
    <transition name="modal-fade">
      <div
v-if="showDiasForm"
class="modal-overlay"
@click.self="closeDiasForm"
>
        <div class="modal-content-inner">
          <div class="modal-header-inner">
            <h3 class="modal-title-inner">
              <i class="fas fa-calendar" />
              Configurar Días Disponibles
            </h3>
            <button
class="modal-close-inner"
@click="closeDiasForm"
>
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="modal-body-inner">
            <p class="modal-hint">
              <i class="fas fa-info-circle" />
              Seleccione los días en los que su negocio está operativo
            </p>
            <div class="dias-selector">
              <label
                v-for="dia in diasSemana"
                :key="dia.value"
                class="dia-checkbox"
              >
                <input
                  v-model="formDias.diasSeleccionados"
                  type="checkbox"
                  :value="dia.value"
                >
                <span class="dia-label">{{ dia.text }}</span>
              </label>
            </div>
          </div>
          <div class="modal-footer-inner">
            <button
class="btn btn-secondary"
@click="closeDiasForm"
>
              <i class="fas fa-times" />
              Cancelar
            </button>
            <button
class="btn btn-primary"
:disabled="saving || formDias.diasSeleccionados.length === 0"
@click="guardarDias"
>
              <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
/>
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal: Configurar Tipo de Empresa -->
    <transition name="modal-fade">
      <div
v-if="showTipoEmpresaForm"
class="modal-overlay"
@click.self="closeTipoEmpresaForm"
>
        <div class="modal-content-inner">
          <div class="modal-header-inner">
            <h3 class="modal-title-inner">
              <i class="fas fa-building" />
              Configurar Tipo de Empresa
            </h3>
            <button
class="modal-close-inner"
@click="closeTipoEmpresaForm"
>
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="modal-body-inner">
            <p class="modal-hint">
              <i class="fas fa-info-circle" />
              Seleccione los tipos de empresa que mejor describan su negocio
            </p>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-layer-group" />
                Grupo de Empresa
              </label>
              <select
v-model="formTipoEmpresa.grupoSeleccionado"
class="form-select"
>
                <option value="">
Seleccione un grupo
</option>
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
                <i class="fas fa-list" />
                Tipo de Empresa
              </label>
              <select
v-model="formTipoEmpresa.tipoSeleccionado"
class="form-select"
>
                <option value="">
Seleccione un tipo
</option>
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
            <button
class="btn btn-secondary"
@click="closeTipoEmpresaForm"
>
              <i class="fas fa-times" />
              Cancelar
            </button>
            <button
              class="btn btn-primary"
              :disabled="saving || !formTipoEmpresa.tipoSeleccionado || !formTipoEmpresa.grupoSeleccionado"
              @click="guardarTipoEmpresa"
            >
              <i
class="fas"
:class="saving ? 'fa-spinner fa-spin' : 'fa-save'"
/>
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <template #footer>
      <base-button
variant="secondary"
@click="handleClose"
>
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
</style>
