<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="visible"
        class="fixed inset-0 z-modal-backdrop flex items-center justify-center p-4 sm:p-6"
        @click.self="$emit('close')"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <!-- Modal Container -->
        <div class="relative z-modal w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-dark-primary border border-dark-border shadow-2xl flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-dark-border bg-dark-secondary/50 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <i class="fas fa-cog text-primary-400 text-lg" />
              </div>
              <div>
                <h2 class="text-lg font-semibold text-text-primary">Configuración del Cliente</h2>
                <p class="text-xs text-text-tertiary">Horarios, días y tipo de empresa</p>
              </div>
            </div>
            <button
              class="w-8 h-8 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-dark-hover transition-colors"
              @click="$emit('close')"
              aria-label="Cerrar modal"
            >
              <i class="fas fa-times" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <!-- Alert Notifications -->
            <Transition name="notify">
              <div v-if="alertMsg" :class="['flex items-center gap-3 p-4 rounded-xl border text-sm', alertClasses]">
                <i :class="alertIcon" class="text-lg flex-shrink-0" />
                <span class="flex-1">{{ alertMsg }}</span>
                <button class="flex-shrink-0 text-current opacity-60 hover:opacity-100" @click="alertMsg = ''" aria-label="Cerrar">
                  <i class="fas fa-times" />
                </button>
              </div>
            </Transition>

            <!-- Loading -->
            <div v-if="loading" class="flex flex-col items-center justify-center py-16 gap-4">
              <div class="spinner w-8 h-8" />
              <p class="text-text-tertiary text-sm">Cargando configuración...</p>
            </div>

            <template v-else>
              <!-- Progreso general -->
              <div class="p-4 rounded-xl bg-dark-secondary border border-dark-border">
                <div class="flex items-center justify-between mb-3">
                  <span class="text-sm font-medium text-text-secondary">Progreso de configuración</span>
                  <span class="text-sm font-semibold" :class="completionPercent === 100 ? 'text-success-400' : 'text-warning-400'">
                    {{ completionPercent }}%
                  </span>
                </div>
                <div class="h-2 bg-dark-tertiary rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700 ease-apple"
                    :class="completionPercent === 100 ? 'bg-success-500' : 'bg-primary-500'"
                    :style="{ width: completionPercent + '%' }"
                  />
                </div>
                <div class="flex items-center gap-2 mt-3">
                  <i
                    class="fas text-xs"
                    :class="completionPercent === 100 ? 'fa-check-circle text-success-400' : 'fa-arrow-right text-primary-400'"
                  />
                  <span class="text-xs text-text-tertiary">
                    {{ completionPercent === 100 ? '¡Configuración completada!' : missingSections.join(' · ') }}
                  </span>
                </div>
              </div>

              <!-- Sección 1: Horarios -->
              <ConfigSection
                icon="fa-clock"
                title="Horarios Disponibles"
                :configured="hasHorario"
                empty-text="No hay horarios configurados"
                @configure="openHorarioForm"
              >
                <template v-if="hasHorario">
                  <div class="grid grid-cols-2 gap-4">
                    <div class="p-3 rounded-lg bg-dark-tertiary border border-dark-border">
                      <p class="text-xs text-text-tertiary mb-1">Hora Inicio</p>
                      <p class="text-lg font-semibold text-text-primary">{{ horario.cliHor_horaDesde }}</p>
                    </div>
                    <div class="p-3 rounded-lg bg-dark-tertiary border border-dark-border">
                      <p class="text-xs text-text-tertiary mb-1">Hora Fin</p>
                      <p class="text-lg font-semibold text-text-primary">{{ horario.cliHor_horaHasta }}</p>
                    </div>
                  </div>
                </template>
              </ConfigSection>

              <!-- Sección 2: Días -->
              <ConfigSection
                icon="fa-calendar"
                title="Días Disponibles"
                :configured="hasDias"
                empty-text="No hay días configurados"
                @configure="openDiasForm"
              >
                <template v-if="hasDias">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="dia in diasSemana"
                      :key="dia.value"
                      :class="[
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        isDiaSeleccionado(dia.value)
                          ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                          : 'bg-dark-tertiary text-text-quaternary border border-dark-border'
                      ]"
                    >
                      <i v-if="isDiaSeleccionado(dia.value)" class="fas fa-check mr-1.5 text-[10px]" />
                      {{ dia.text }}
                    </span>
                  </div>
                </template>
              </ConfigSection>

              <!-- Sección 3: Tipo de Empresa -->
              <ConfigSection
                icon="fa-building"
                title="Tipo de Empresa"
                :configured="hasTipoEmpresa && tiposEmpresa.length > 0"
                empty-text="No hay tipos de empresa configurados"
                @configure="editarTipoEmpresa"
              >
                <template v-if="hasTipoEmpresa && tiposEmpresa.length > 0">
                  <div class="p-3 rounded-lg bg-dark-tertiary border border-dark-border flex items-center gap-3 group/emp cursor-pointer hover:border-primary-500/40 hover:bg-dark-hover transition-all relative">
                    <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 group-hover/emp:bg-primary-500/30 transition-all">
                      <i class="fas fa-tag text-primary-400" />
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-text-primary group-hover/emp:text-primary-400 transition-colors">{{ tiposEmpresa[0].tipEmp_nombre }}</p>
                      <p class="text-xs text-text-tertiary">{{ getGrupoNombre(tiposEmpresa[0].tipEmp_codigoTipoEmpGrupo) }}</p>
                    </div>
                    <div class="opacity-0 group-hover/emp:opacity-100 transition-opacity">
                      <i class="fas fa-pen text-xs text-primary-400" />
                    </div>
                  </div>
                </template>
              </ConfigSection>
            </template>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between px-6 py-4 border-t border-dark-border bg-dark-secondary/50 flex-shrink-0">
            <span class="text-xs text-text-tertiary">
              <i class="fas fa-shield-alt mr-1" /> Solo visible para tu cuenta
            </span>
            <button class="btn btn-primary" @click="$emit('close')">
              <i class="fas fa-check mr-1.5" />
              {{ completionPercent === 100 ? 'Listo' : 'Cerrar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Sub-modal: Horario Form -->
    <Transition name="modal">
      <div v-if="showHorarioForm" class="fixed inset-0 z-[1060] flex items-center justify-center p-4" @click.self="closeHorarioForm">
        <div class="absolute inset-0 bg-black/50" />
        <div class="relative z-10 w-full max-w-md bg-dark-primary rounded-2xl border border-dark-border shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3 border-b border-dark-border">
            <h3 class="text-base font-semibold text-text-primary flex items-center gap-2">
              <i class="fas fa-clock text-primary-400" />
              {{ hasHorario ? 'Editar Horario' : 'Configurar Horario' }}
            </h3>
            <button class="btn-icon" @click="closeHorarioForm" aria-label="Cerrar">
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-text-secondary flex items-center gap-2">
                <i class="fas fa-sun text-warning-400" /> Hora de Inicio
              </label>
              <input v-model="formHorario.horaDesde" type="time" class="input" required />
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-text-secondary flex items-center gap-2">
                <i class="fas fa-moon text-indigo-400" /> Hora de Fin
              </label>
              <input v-model="formHorario.horaHasta" type="time" class="input" required />
            </div>
          </div>
          <div class="flex justify-end gap-3 px-5 py-3 border-t border-dark-border bg-dark-secondary/30">
            <button class="btn btn-secondary btn-sm" @click="closeHorarioForm">Cancelar</button>
            <button class="btn btn-primary btn-sm" :disabled="saving" @click="guardarHorario">
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'" />
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Sub-modal: Días Form -->
    <Transition name="modal">
      <div v-if="showDiasForm" class="fixed inset-0 z-[1060] flex items-center justify-center p-4" @click.self="closeDiasForm">
        <div class="absolute inset-0 bg-black/50" />
        <div class="relative z-10 w-full max-w-md bg-dark-primary rounded-2xl border border-dark-border shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3 border-b border-dark-border">
            <h3 class="text-base font-semibold text-text-primary flex items-center gap-2">
              <i class="fas fa-calendar text-primary-400" />
              Configurar Días
            </h3>
            <button class="btn-icon" @click="closeDiasForm" aria-label="Cerrar">
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="p-5">
            <p class="text-sm text-text-tertiary mb-4 flex items-center gap-2">
              <i class="fas fa-info-circle text-info-400" />
              Selecciona los días que tu negocio está operativo
            </p>
            <div class="space-y-1.5">
              <label
                v-for="dia in diasSemana"
                :key="dia.value"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors hover:bg-dark-hover"
                :class="formDias.diasSeleccionados.includes(dia.value) ? 'bg-primary-500/10 border border-primary-500/20' : 'border border-transparent'"
              >
                <input
                  v-model="formDias.diasSeleccionados"
                  type="checkbox"
                  :value="dia.value"
                  class="checkbox"
                />
                <span class="text-sm text-text-primary">{{ dia.text }}</span>
              </label>
            </div>
          </div>
          <div class="flex justify-end gap-3 px-5 py-3 border-t border-dark-border bg-dark-secondary/30">
            <button class="btn btn-secondary btn-sm" @click="closeDiasForm">Cancelar</button>
            <button class="btn btn-primary btn-sm" :disabled="saving || formDias.diasSeleccionados.length === 0" @click="guardarDias">
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'" />
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Sub-modal: Tipo Empresa Form -->
    <Transition name="modal">
      <div v-if="showTipoEmpresaForm" class="fixed inset-0 z-[1060] flex items-center justify-center p-4" @click.self="closeTipoEmpresaForm">
        <div class="absolute inset-0 bg-black/50" />
        <div class="relative z-10 w-full max-w-md bg-dark-primary rounded-2xl border border-dark-border shadow-2xl overflow-hidden">
          <div class="flex items-center justify-between px-5 py-3 border-b border-dark-border">
            <h3 class="text-base font-semibold text-text-primary flex items-center gap-2">
              <i class="fas fa-building text-primary-400" />
              {{ isEditingTipoEmpresa ? 'Editar Tipo de Empresa' : 'Configurar Tipo de Empresa' }}
            </h3>
            <button class="btn-icon" @click="closeTipoEmpresaForm" aria-label="Cerrar">
              <i class="fas fa-times" />
            </button>
          </div>
          <div class="p-5 space-y-4">
            <p v-if="isEditingTipoEmpresa" class="text-sm text-warning-400 flex items-center gap-2">
              <i class="fas fa-exclamation-triangle" /> Se reemplazará el tipo de empresa actual
            </p>
            <div class="space-y-2">
              <label class="text-sm font-medium text-text-secondary flex items-center gap-2">
                <i class="fas fa-layer-group text-primary-400" /> Grupo de Empresa
              </label>
              <select v-model="formTipoEmpresa.grupoSeleccionado" class="select">
                <option value="">Seleccione un grupo</option>
                <option v-for="grupo in gruposEmpresaDisponibles" :key="grupo.tiemgr_codigo" :value="grupo.tiemgr_codigo">
                  {{ grupo.tiemgr_nombre }}
                </option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium text-text-secondary flex items-center gap-2">
                <i class="fas fa-list text-primary-400" /> Tipo de Empresa
              </label>
              <select v-model="formTipoEmpresa.tipoSeleccionado" class="select">
                <option value="">Seleccione un tipo</option>
                <option v-for="tipo in tiposEmpresaDisponiblesGet" :key="tipo.tipEmp_codigo" :value="tipo.tipEmp_codigo">
                  {{ tipo.tipEmp_nombre }}
                </option>
              </select>
            </div>
            <p v-if="formTipoEmpresa.grupoSeleccionado && tiposEmpresaDisponiblesGet.length === 0" class="text-sm text-text-tertiary">
              No hay tipos disponibles para este grupo
            </p>
          </div>
          <div class="flex justify-end gap-3 px-5 py-3 border-t border-dark-border bg-dark-secondary/30">
            <button class="btn btn-secondary btn-sm" @click="closeTipoEmpresaForm">Cancelar</button>
            <button
              class="btn btn-primary btn-sm"
              :disabled="saving || !formTipoEmpresa.tipoSeleccionado || !formTipoEmpresa.grupoSeleccionado"
              @click="guardarTipoEmpresa"
            >
              <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'" />
              {{ saving ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import clienteConfigService from '@/services/ClienteConfigServices'
import configValidationService from '@/services/ConfigValidationService'

const props = defineProps({
  visible: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'saved'])

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const alertMsg = ref('')
const alertType = ref('info')

const horario = ref(null)
const diasHabiles = ref([])
const tiposEmpresa = ref([])
const tiposEmpresaDisponibles = ref([])
const gruposEmpresaDisponibles = ref([])

// track if completion alert has been shown to avoid duplicates
const completionNotified = ref(false)

const showHorarioForm = ref(false)
const showDiasForm = ref(false)
const showTipoEmpresaForm = ref(false)
const isEditingTipoEmpresa = ref(false)

const formHorario = ref({ horaDesde: '08:00', horaHasta: '20:00' })
const formDias = ref({ diasSeleccionados: [] })

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

const completionPercent = computed(() => {
  let done = 0
  const total = 3
  if (hasHorario.value) done++
  if (hasDias.value) done++
  if (hasTipoEmpresa.value) done++
  return Math.round((done / total) * 100)
})

const missingSections = computed(() => {
  const missing = []
  if (!hasHorario.value) missing.push('Horarios')
  if (!hasDias.value) missing.push('Días')
  if (!hasTipoEmpresa.value) missing.push('Tipo de empresa')
  return missing
})

const tiposEmpresaDisponiblesGet = computed(() =>
  tiposEmpresaDisponibles.value.filter(t => t.tipEmp_codigoTipoEmpGrupo == formTipoEmpresa.value.grupoSeleccionado)
)

const alertClasses = computed(() => ({
  info: 'bg-info-500/10 border-info-500/30 text-info-400',
  success: 'bg-success-500/10 border-success-500/30 text-success-400',
  warning: 'bg-warning-500/10 border-warning-500/30 text-warning-400',
  danger: 'bg-danger-500/10 border-danger-500/30 text-danger-400'
}[alertType.value] || 'bg-info-500/10 border-info-500/30 text-info-400'))

const alertIcon = computed(() => ({
  info: 'fas fa-info-circle',
  success: 'fas fa-check-circle',
  warning: 'fas fa-exclamation-triangle',
  danger: 'fas fa-exclamation-circle'
}[alertType.value] || 'fas fa-info-circle'))

// Methods
const showAlert = (msg, type = 'info') => {
  alertMsg.value = msg
  alertType.value = type
  setTimeout(() => (alertMsg.value = ''), 5000)
}

const isDiaSeleccionado = (codigoDia) => diasHabiles.value.some(d => d.cliDha_codigoDia === codigoDia)

const getGrupoNombre = (codigoGrupo) => {
  const grupo = gruposEmpresaDisponibles.value.find(g => g.tiemgr_codigo === codigoGrupo)
  return grupo ? grupo.tiemgr_nombre : ''
}

// check if all three sections have been configured and notify once
const checkConfigurationComplete = () => {
  if (!completionNotified.value && hasHorario.value && hasDias.value && hasTipoEmpresa.value) {
    completionNotified.value = true
    showAlert('Configuración completada. Todos los datos han sido configurados.', 'success')
  }
}

const openHorarioForm = () => {
  if (hasHorario.value && horario.value) {
    formHorario.value = {
      horaDesde: horario.value.cliHor_horaDesde,
      horaHasta: horario.value.cliHor_horaHasta
    }
  }
  showHorarioForm.value = true
}

const openDiasForm = () => {
  formDias.value.diasSeleccionados = [...(diasHabiles.value.map(d => d.cliDha_codigoDia) || [])]
  showDiasForm.value = true
}

const closeHorarioForm = () => { showHorarioForm.value = false }
const closeDiasForm = () => { showDiasForm.value = false }

const closeTipoEmpresaForm = () => {
  showTipoEmpresaForm.value = false
  isEditingTipoEmpresa.value = false
  formTipoEmpresa.value = { tipoSeleccionado: '', grupoSeleccionado: '' }
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

const cargarConfiguracion = async () => {
  loading.value = true
  try {
    const [horarioData, diasData, tiposData, tiposDataDisponibles, gruposData] = await Promise.allSettled([
      clienteConfigService.getHorario().catch(() => null),
      clienteConfigService.getDiasHabiles().catch(() => []),
      clienteConfigService.getTiposEmpresaCliente().catch(() => []),
      clienteConfigService.getTiposEmpresaClienteAll().catch(() => []),
      clienteConfigService.getTiposEmpresaGrupo().catch(() => [])
    ])

    if (horarioData.status === 'fulfilled' && horarioData.value) {
      horario.value = horarioData.value
      if (horarioData.value.cliHor_horaDesde) {
        formHorario.value = {
          horaDesde: horarioData.value.cliHor_horaDesde,
          horaHasta: horarioData.value.cliHor_horaHasta
        }
      }
    }

    if (diasData.status === 'fulfilled') {
      diasHabiles.value = Array.isArray(diasData.value) ? diasData.value : []
      formDias.value.diasSeleccionados = diasHabiles.value.map(d => d.cliDha_codigoDia)
    }

    if (tiposData.status === 'fulfilled') tiposEmpresa.value = Array.isArray(tiposData.value) ? tiposData.value : []
    if (tiposDataDisponibles.status === 'fulfilled') tiposEmpresaDisponibles.value = Array.isArray(tiposDataDisponibles.value) ? tiposDataDisponibles.value : []
    if (gruposData.status === 'fulfilled') gruposEmpresaDisponibles.value = Array.isArray(gruposData.value) ? gruposData.value : []
  } catch (error) {
    console.error('Error al cargar configuración:', error)
    showAlert('Error al cargar la configuración', 'danger')
  } finally {
    loading.value = false
  }
}

const guardarHorario = async () => {
  saving.value = true
  try {
    const data = { cliHor_horaDesde: formHorario.value.horaDesde, cliHor_horaHasta: formHorario.value.horaHasta }
    if (hasHorario.value) {
      await clienteConfigService.updateHorario(data)
    } else {
      await clienteConfigService.setHorario(data)
    }
    showAlert('Horario guardado correctamente', 'success')
    configValidationService.clearCache()
    await cargarConfiguracion()
    closeHorarioForm()
    checkConfigurationComplete()
    emit('saved')
  } catch (error) {
    console.error('Error al guardar horario:', error)
    showAlert('Error al guardar el horario', 'danger')
  } finally {
    saving.value = false
  }
}

const guardarDias = async () => {
  saving.value = true
  try {
    const data = formDias.value.diasSeleccionados.map(dia => ({ cliDha_codigoDia: dia }))
    await clienteConfigService.setDiasHabiles(data)
    showAlert('Días guardados correctamente', 'success')
    configValidationService.clearCache()
    await cargarConfiguracion()
    closeDiasForm()
    checkConfigurationComplete()
    emit('saved')
  } catch (error) {
    console.error('Error al guardar días:', error)
    showAlert('Error al guardar los días', 'danger')
  } finally {
    saving.value = false
  }
}

const guardarTipoEmpresa = async () => {
  saving.value = true
  try {
    const data = {
      cliemp_codcli: authStore.user?.Cliente ? JSON.parse(authStore.user.Cliente).cli_codigo : 0,
      cliemp_codEmp: parseInt(formTipoEmpresa.value.tipoSeleccionado),
      cliemp_codGrpEmp: parseInt(formTipoEmpresa.value.grupoSeleccionado)
    }
    await clienteConfigService.setTipoEmpresa(data)
    showAlert(
      isEditingTipoEmpresa.value
        ? 'Tipo de empresa actualizado correctamente'
        : 'Tipo de empresa guardado correctamente',
      'success'
    )
    configValidationService.clearCache()
    await cargarConfiguracion()
    closeTipoEmpresaForm()
    checkConfigurationComplete()
    emit('saved')
  } catch (error) {
    console.error('Error al guardar tipo de empresa:', error)
    showAlert('Error al guardar el tipo de empresa', 'danger')
  } finally {
    saving.value = false
  }
}

// Watchers
watch(() => props.visible, (val) => {
  if (val) {
    cargarConfiguracion()
  }
})

// Lifecycle
onMounted(() => {
  if (props.visible) cargarConfiguracion()
})
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active { transition: all 0.3s ease-out; }
.modal-leave-active { transition: all 0.2s ease-in; }
.modal-enter-from { opacity: 0; }
.modal-enter-from > :not(:first-child) { transform: scale(0.95); opacity: 0; }
.modal-leave-to { opacity: 0; }
.modal-leave-to > :not(:first-child) { transform: scale(0.95); opacity: 0; }

/* Notification transition */
.notify-enter-active { transition: all 0.3s ease-out; }
.notify-leave-active { transition: all 0.2s ease-in; }
.notify-enter-from { opacity: 0; transform: translateY(-10px); }
.notify-leave-to { opacity: 0; transform: translateY(-10px); }
</style>