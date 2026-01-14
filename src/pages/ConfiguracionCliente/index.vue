<template>
  <div class="page-wrapper">
    <!-- Alert Notifications -->
    <div
v-if="alertMsg"
class="fixed top-4 left-1/2 -translate-x-1/2 z-50"
>
      <div
:class="['alert p-4 rounded-lg border', 
        alertType === 'notification-success' ? 'alert-success' : 
        alertType === 'notification-danger' ? 'alert-danger' :
        alertType === 'notification-warning' ? 'alert-warning' : 'alert-info']"
>
        <i :class="getAlertIcon(alertType)" />
        <span>{{ alertMsg }}</span>
        <button
class="ml-auto"
aria-label="Cerrar notificación"
@click="alertMsg = ''"
>
          <i class="fas fa-times" />
        </button>
      </div>
    </div>

    <!-- Header -->
    <div class="page-header bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 sm:p-8 rounded-xl mb-6 sm:mb-8">
      <div class="flex items-start gap-4">
        <div class="text-3xl sm:text-4xl">
          <i class="fas fa-cog" />
        </div>
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold">
Configuración del Cliente
</h1>
          <p class="text-primary-100 mt-2">
Configure horarios, días disponibles y tipo de empresa
</p>
        </div>
      </div>
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
class="page-content"
>
      <!-- Sección: Horarios Disponibles -->
      <div class="card mb-6">
        <div class="border-b border-dark-border pb-4 mb-4 flex-between">
          <div class="flex items-center gap-3">
            <i class="fas fa-clock text-primary-400 text-lg" />
            <h2 class="text-xl font-semibold text-text-primary">
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
class="space-y-4"
>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p class="text-sm text-text-secondary mb-1">
Hora Inicio:
</p>
              <p class="text-lg font-semibold text-text-primary">
{{ horario.cliHor_horaDesde }}
</p>
            </div>
            <div>
              <p class="text-sm text-text-secondary mb-1">
Hora Fin:
</p>
              <p class="text-lg font-semibold text-text-primary">
{{ horario.cliHor_horaHasta }}
</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
class="btn btn-secondary btn-sm"
@click="showHorarioForm = true"
>
              <i class="fas fa-edit" />
              Editar
            </button>
          </div>
        </div>

        <div
v-else
class="flex flex-col items-center justify-center py-8 text-center"
>
          <i class="fas fa-clock text-3xl text-text-tertiary mb-3" />
          <p class="text-text-secondary mb-4">
No hay horarios configurados
</p>
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
      <div class="card mb-6">
        <div class="border-b border-dark-border pb-4 mb-4 flex-between">
          <div class="flex items-center gap-3">
            <i class="fas fa-calendar text-primary-400 text-lg" />
            <h2 class="text-xl font-semibold text-text-primary">
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
class="space-y-4"
>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            <div
              v-for="dia in diasSemana"
              :key="dia.value"
              :class="['px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center transition-all', 
                isDiaSeleccionado(dia.value) 
                  ? 'bg-success-600 text-white' 
                  : 'bg-dark-secondary text-text-secondary border border-dark-border']"
            >
              <i
v-if="isDiaSeleccionado(dia.value)"
class="fas fa-check-circle mr-1"
/>
              {{ dia.text }}
            </div>
          </div>
          <button
class="btn btn-secondary btn-sm"
@click="showDiasForm = true"
>
            <i class="fas fa-edit" />
            Editar
          </button>
        </div>

        <div
v-else
class="flex flex-col items-center justify-center py-8 text-center"
>
          <i class="fas fa-calendar text-3xl text-text-tertiary mb-3" />
          <p class="text-text-secondary mb-4">
No hay días configurados
</p>
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
      <div class="card mb-6">
        <div class="border-b border-dark-border pb-4 mb-4 flex-between">
          <div class="flex items-center gap-3">
            <i class="fas fa-building text-primary-400 text-lg" />
            <h2 class="text-xl font-semibold text-text-primary">
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
class="space-y-4"
>
          <div class="bg-dark-secondary rounded-lg p-4 border border-dark-border">
            <div class="flex items-center gap-3">
              <div class="badge badge-primary text-base p-3 rounded-lg">
                <i class="fas fa-tag text-lg" />
              </div>
              <div>
                <p class="text-sm text-text-secondary">
Tipo de Empresa
</p>
                <p class="text-lg font-semibold text-text-primary">
{{ tiposEmpresa[0].tipEmp_nombre }}
</p>
                <p class="text-xs text-text-tertiary mt-1">
{{ getGrupoNombre(tiposEmpresa[0].tipEmp_codigoTipoEmpGrupo) }}
</p>
              </div>
            </div>
          </div>
          <div>
            <button
class="btn btn-secondary btn-sm"
@click="editarTipoEmpresa"
>
              <i class="fas fa-edit" />
              Editar
            </button>
          </div>
        </div>

        <div
v-else
class="flex flex-col items-center justify-center py-8 text-center"
>
          <i class="fas fa-building text-3xl text-text-tertiary mb-3" />
          <p class="text-text-secondary mb-4">
No hay tipos de empresa configurados
</p>
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
class="modal-backdrop"
@click.self="closeHorarioForm"
>
        <div class="modal">
          <div class="modal-header">
            <h3 class="text-lg font-semibold text-text-primary">
              <i class="fas fa-clock" />
              Configurar Horarios
            </h3>
            <button
class="btn btn-ghost btn-icon"
@click="closeHorarioForm"
>
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="label">
                <i class="fas fa-sun" />
                Hora de Inicio
              </label>
              <input
                v-model="formHorario.horaDesde"
                type="time"
                class="input"
                required
              >
            </div>
            <div class="form-group">
              <label class="label">
                <i class="fas fa-moon" />
                Hora de Fin
              </label>
              <input
                v-model="formHorario.horaHasta"
                type="time"
                class="input"
                required
              >
            </div>
          </div>
          <div class="modal-footer">
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
class="modal-backdrop"
@click.self="closeDiasForm"
>
        <div class="modal">
          <div class="modal-header">
            <h3 class="text-lg font-semibold text-text-primary">
              <i class="fas fa-calendar" />
              Configurar Días Disponibles
            </h3>
            <button
class="btn btn-ghost btn-icon"
@click="closeDiasForm"
>
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="modal-body">
            <p class="alert alert-info mb-4">
              <i class="fas fa-info-circle" />
              Seleccione los días en los que su negocio está operativo
            </p>
            <div class="space-y-3">
              <label
                v-for="dia in diasSemana"
                :key="dia.value"
                class="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-dark-hover transition-colors"
              >
                <input
                  v-model="formDias.diasSeleccionados"
                  type="checkbox"
                  :value="dia.value"
                  class="checkbox"
                >
                <span class="text-text-primary">{{ dia.text }}</span>
              </label>
            </div>
          </div>
          <div class="modal-footer">
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
class="modal-backdrop"
@click.self="closeTipoEmpresaForm"
>
        <div class="modal">
          <div class="modal-header">
            <h3 class="text-lg font-semibold text-text-primary">
              <i class="fas fa-building" />
              {{ isEditingTipoEmpresa ? 'Editar Tipo de Empresa' : 'Configurar Tipo de Empresa' }}
            </h3>
            <button
class="btn btn-ghost btn-icon"
@click="closeTipoEmpresaForm"
>
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="modal-body">
            <p
v-if="isEditingTipoEmpresa"
class="alert alert-warning mb-4"
>
              <i class="fas fa-exclamation-triangle" />
              Al guardar, se reemplazará el tipo de empresa actual
            </p>
            <p
v-else
class="alert alert-info mb-4"
>
              <i class="fas fa-info-circle" />
              Seleccione el tipo de empresa que mejor describa su negocio
            </p>
              <div class="form-group">
              <label class="label">
                <i class="fas fa-layer-group" />
                Grupo de Empresa
              </label>
              <select
v-model="formTipoEmpresa.grupoSeleccionado"
class="select"
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
              <label class="label">
                <i class="fas fa-list" />
                Tipo de Empresa
              </label>
              <select
v-model="formTipoEmpresa.tipoSeleccionado"
class="select"
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
          <div class="modal-footer">
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

