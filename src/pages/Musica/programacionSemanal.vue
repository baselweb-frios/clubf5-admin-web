<template>
  <div class="page-wrapper">
    <!-- Header Section -->
    <div class="page-header">
      <div class="flex-between">
        <button
 class="btn btn-secondary"
 @click="volverAtras"
 >
           <svg
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
             <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M15 19l-7-7 7-7"
 />
           </svg>
           Volver
         </button>
         <div class="header-text">
           <h1 class="page-title">
 {{ nombreProgramacion }}
 </h1>
           <p class="text-responsive-base text-text-secondary">
 Programación semanal de música
 </p>
         </div>
         <div class="header-actions flex gap-3">
           <button
 class="btn btn-primary"
 @click="irAEditarProgramacion"
 >
 <i class="fas fa-edit mr-2" />
             Editar Programación
           </button>
           <button
 class="btn btn-success"
 :disabled="isLoading"
 @click="guardarProgramacion"
 >
           <i class="fas fa-save mr-2" />
             Guardar cambios
           </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="page-content">
      <!-- Loading State -->
      <LoadingOverlay
 v-if="isLoading"
 message="Cargando programación..."
 />

      <div
 v-else
>
<!-- Tabla Responsiva de Programaciones -->
        <div class="card">
          <div class="flex-between mb-4">
            <div class="flex flex-col gap-2">
              <h2 class="text-xl font-semibold">
Programación Semanal
</h2>
              <span class="badge badge-info">
                <svg
 class="w-4 h-4 mr-1"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                  <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
 />
                </svg>
                {{ horarioCliente.horaDesde }} - {{ horarioCliente.horaHasta }}
              </span>
            </div>
            <div class="flex gap-4">
              <div class="flex flex-col gap-2">
                <label class="label">Filtrar por día:</label>
                <select
 v-model="selectedDayFilter"
 class="select"
 >
                  <option :value="null">
 Todos los días
 </option>
                  <option
 v-for="day in daysOfWeek"
 :key="day.value"
 :value="day.value"
 >
                    {{ day.label }}
                  </option>
                </select>
              </div>
              <button
 class="btn btn-secondary"
 @click="viewMode = viewMode === 'table' ? 'cards' : 'table'"
 >
                <svg
 v-if="viewMode === 'table'"
 class="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                  <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
 />
                </svg>
                <svg
 v-else
 class="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                  <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
 />
                </svg>
                {{ viewMode === 'table' ? 'Vista Tarjetas' : 'Vista Tabla' }}
              </button>
            </div>
          </div>

          <!-- Vista Tabla (Desktop) -->
          <div
 v-if="viewMode === 'table'"
 class="table-container"
 >
            <div class="overflow-x-auto">
              <table class="table">
                <thead>
                  <tr>
                    <th class="sticky left-0 z-10">
 Día
 </th>
                    <th>Programaciones</th>
                    <th>
 Acciones
 </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
 v-for="day in filteredDays"
 :key="day.value"
 >
                    <td class="sticky left-0 z-10">
                      <div class="flex flex-col">
                        <span class="font-medium">{{ day.label }}</span>
                        <span class="badge badge-primary text-xs">{{ programacionesPorDia(day.value).length }}</span>
                      </div>
                    </td>
                    <td>
                      <!-- Formulario inline -->
                      <div
 v-if="showNewProgForDay === day.value"
 class="flex gap-2 my-2 p-2 bg-dark-secondary rounded"
 >
                        <select
 v-model="newProgForm.codRadio"
 class="select flex-1"
 >
                          <option
 :value="null"
 disabled
 >
 Radio...
 </option>
                          <option
 v-for="r in radios"
 :key="'nr-'+r.codRadio"
 :value="r.codRadio"
 >
                            {{ r.nombre }}
                          </option>
                        </select>
                        <input
 v-model="newProgForm.horaInicio"
 type="time"
 class="input"
 :min="horarioCliente.horaDesde"
 :max="horarioCliente.horaHasta"
 @focus="$event.target.showPicker?.()"
 @click="$event.target.showPicker?.()"
 >
                        <span class="text-text-secondary">-</span>
                        <input
 v-model="newProgForm.horaFin"
 type="time"
 class="input"
 :min="horarioCliente.horaDesde"
 :max="horarioCliente.horaHasta"
 @focus="$event.target.showPicker?.()"
 @click="$event.target.showPicker?.()"
 >
                        <button
 class="btn btn-success btn-sm"
 :disabled="isLoading"
 title="Guardar"
 @click="guardarNuevaProgramacion"
 >
                          <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M5 13l4 4L19 7"
 /></svg>
                        </button>
                        <button
 class="btn btn-secondary btn-sm"
 title="Cancelar"
 @click="cancelarNuevoProg"
 >
                          <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M6 18L18 6M6 6l12 12"
 /></svg>
                        </button>
                      </div>

                      <!-- Lista de programaciones -->
                      <div
 v-if="programacionesPorDia(day.value).length > 0"
 class="space-y-2"
 >
                        <div
                          v-for="prog in programacionesPorDia(day.value)"
                          :key="prog.cod"
                          class="flex items-center gap-3 p-2 rounded hover:bg-dark-hover"
                        >
                          <div class="text-primary-500">
                            <svg
 class="w-5 h-5"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
 /></svg>
                          </div>
                          <div class="flex-1">
                            <span class="font-medium">{{ prog.radioNombre }}</span>
                            <span class="text-text-secondary ml-2">{{ prog.horaInicio }} - {{ prog.horaFin }}</span>
                          </div>
                          <div class="flex gap-1">
                            <button
 class="btn-icon"
 title="Editar"
 @click="editarProgramacion(prog)"
 >
                              <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
 /></svg>
                            </button>
                            <button
 class="btn-icon"
 title="Eliminar"
 @click="eliminarProgramacion(prog)"
 >
                              <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
 /></svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
 v-else
 class="text-text-secondary py-4"
 >
                        Sin programaciones
                      </div>
                    </td>
                    <td>
                      <button
 class="btn btn-primary btn-sm"
 title="Agregar programación"
 @click="abrirNuevoProg(day.value)"
 >
                        <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                          <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 6v6m0 0v6m0-6h6m-6 0H6"
 />
                        </svg>
                        Agregar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Vista Tarjetas (Mobile) -->
          <div
 v-else
 class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
 >
            <div
              v-for="day in filteredDays"
              :key="day.value"
              class="card"
            >
              <div class="flex-between mb-4">
                <div class="flex flex-col gap-1">
                  <span class="font-medium">{{ day.label }}</span>
                  <span class="badge badge-primary text-xs">{{ programacionesPorDia(day.value).length }}</span>
                </div>
                <button
 class="btn btn-primary btn-sm"
 @click="abrirNuevoProg(day.value)"
 >
                  <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 6v6m0 0v6m0-6h6m-6 0H6"
 /></svg>
                </button>
              </div>

              <!-- Formulario inline para tarjetas -->
              <div
 v-if="showNewProgForDay === day.value"
 class="space-y-4 mb-4 p-4 bg-dark-secondary rounded"
 >
                <select
 v-model="newProgForm.codRadio"
 class="select"
 >
                  <option
 :value="null"
 disabled
 >
 Seleccionar radio...
 </option>
                  <option
 v-for="r in radios"
 :key="'nr-'+r.codRadio"
 :value="r.codRadio"
 >
 {{ r.nombre }}
 </option>
                </select>
                <div class="flex gap-2">
                  <input
 v-model="newProgForm.horaInicio"
 type="time"
 class="input flex-1"
 :min="horarioCliente.horaDesde"
 :max="horarioCliente.horaHasta"
 @focus="$event.target.showPicker?.()"
 @click="$event.target.showPicker?.()"
 >
                  <span class="text-text-secondary">-</span>
                  <input
 v-model="newProgForm.horaFin"
 type="time"
 class="input flex-1"
 :min="horarioCliente.horaDesde"
 :max="horarioCliente.horaHasta"
 @focus="$event.target.showPicker?.()"
 @click="$event.target.showPicker?.()"
 >
                </div>
                <div class="flex gap-2">
                  <button
 class="btn btn-success flex-1"
 :disabled="isLoading"
 @click="guardarNuevaProgramacion"
 >
 Guardar
 </button>
                  <button
 class="btn btn-secondary flex-1"
 @click="cancelarNuevoProg"
 >
 Cancelar
 </button>
                </div>
              </div>

              <!-- Programaciones del día -->
              <div class="space-y-2">
                <div
 v-if="programacionesPorDia(day.value).length > 0"
 class="space-y-2"
 >
                  <div
 v-for="prog in programacionesPorDia(day.value)"
 :key="prog.cod"
 class="flex items-center gap-3 p-3 rounded hover:bg-dark-hover"
 >
                    <div class="text-primary-500">
                      <svg
 class="w-5 h-5"
 viewBox="0 0 24 24"
 fill="none"
 stroke="currentColor"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
 /></svg>
                    </div>
                    <div class="flex-1">
                      <span class="font-medium">{{ prog.radioNombre }}</span>
                      <span class="text-text-secondary block">{{ prog.horaInicio }} - {{ prog.horaFin }}</span>
                    </div>
                    <div class="flex gap-1">
                      <button
 class="btn-icon"
 @click="editarProgramacion(prog)"
 >
                        <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
 /></svg>
                      </button>
                      <button
 class="btn-icon"
 @click="eliminarProgramacion(prog)"
 >
                        <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
 /></svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div
 v-else
 class="text-center py-8 text-text-secondary"
 >
                  <svg
 class="w-12 h-12 mx-auto mb-4 opacity-50"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 ><path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
 /></svg>
                  <p>No hay programaciones</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmación Eliminar -->
    <Modal v-model="showDeleteModal" title="Confirmar eliminación">
      <template #default>
        <div class="p-6">
          <p>¿Está seguro que desea eliminar la programación de <strong>{{ selectedProgramacion?.radioNombre }}</strong>?</p>
          <p class="text-text-secondary mt-2">
 Horario: {{ selectedProgramacion?.horaInicio }} - {{ selectedProgramacion?.horaFin }}
 </p>
        </div>
        <div class="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button
 class="btn btn-secondary"
 @click="cancelDelete"
 >
 Cancelar
 </button>
          <button
 class="btn btn-danger"
 @click="confirmDelete"
 >
 Eliminar
 </button>
        </div>
      </template>
    </Modal>

    <!-- Modal de Edición de Horario -->
    <Modal  v-model="showEditModal" size="lg" :colosable="true" title="Editar Programación">
      <template #default> 
        <div>
        
          <div class="space-y-4">
            <div class="mb-4">
              <h4 class="text-lg font-medium">
{{ editForm.radioNombre }}
</h4>
              <p class="text-text-secondary">
 {{ getDiaNombre(editForm.numeroDia) }}
 </p>
            </div>

            <div class="form-group">
              <label
class="label"
for="edit-hora-inicio"
>Hora de Inicio</label>
              <input
                id="edit-hora-inicio"
                v-model="editForm.horaInicio"
                type="time"
                class="ligth input"
                :min="horarioCliente.horaDesde"
                :max="editForm.horaFin"
                @focus="$event.target.showPicker?.()"
                @click="$event.target.showPicker?.()"
              >
            </div>

            <div class="form-group">
              <label
class="label"
for="edit-hora-fin"
>Hora de Fin</label>

              <input
                id="edit-hora-fin"
                v-model="editForm.horaFin"
                type="time"
                class="input"
                :min="editForm.horaInicio"
                :max="horarioCliente.horaHasta"
                @focus="$event.target.showPicker?.()"
                @click="$event.target.showPicker?.()"
              >
            </div>

            <div class="flex items-center gap-2 text-sm text-text-secondary">
              <svg
 class="w-4 h-4"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
 />
              </svg>
              <span>Duración: {{ calculateDuration(editForm.horaInicio, editForm.horaFin) }}</span>
            </div>

            <div
 v-if="editConflictMessage"
 class="alert alert-danger"
 >
              <svg
 class="w-5 h-5"
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
                <path
 stroke-linecap="round"
 stroke-linejoin="round"
 stroke-width="2"
 d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
 />
              </svg>
              {{ editConflictMessage }}
            </div>
          </div>
        
        <div class="flex justify-end gap-3 p-6 border-t border-dark-border">
          <button
 class="btn btn-secondary"
 @click="cancelEdit"
 >
 Cancelar
 </button>
          <button
            class="btn btn-primary"
            :disabled="!!editConflictMessage"
            @click="confirmEdit"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
      </template>
    </Modal>
  
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRadio } from '@/composables/useRadio'
import RadioServices from '@/services/RadioServices'
import ClienteProgramacionRadioServices from '@/services/ClienteProgramacionRadioServices'
import FiltroServices from '@/services/FiltroServices'
import generoMusicalServices from '@/services/GeneroMusicalServices'
import ClienteHorarioServices from '@/services/ClienteHorarioServices'
import DiaHabilService from '@/services/DiaHabilService'
import LoadingOverlay from '@/components/ui/LoadingOverlay.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import Modal from '@/components/ui/Modal.vue'


const router = useRouter()
const route = useRoute()

// Props from route
const codigoProgramacion = ref(route.params.codigoProgramacion)
const nombreProgramacion = ref(decodeURIComponent(route.params.nombreProgramacion || ''))

// State
const isLoading = ref(false)
const radios = ref([])
const programaciones = ref([])
const searchQuery = ref('')
const showDeleteModal = ref(false)
const selectedProgramacion = ref(null)
const viewMode = ref('card') // 'table' o 'cards'
// Inicializar filtros según el tamaño de pantalla
const showFilters = ref(window.innerWidth > 1024) // Colapsado en móvil/tablet por defecto
const selectedDayFilter = ref(null) // Filtro de día (null = todos)

// Estado para distribución automática mágica
const selectedRadios = ref([])
const showMagicDistributionModal = ref(false)
const distributionMode = ref('sequential') // 'sequential' o 'random'
const fillEmptyHoursOnly = ref(false)

// Estado para edición
const showEditModal = ref(false)
const editForm = ref({
  cod: null,
  radioNombre: '',
  numeroDia: 0,
  horaInicio: '00:00',
  horaFin: '23:59',
  codRadio: null
})
const editConflictMessage = ref('')

// Horario del cliente
const horarioCliente = ref({
  horaDesde: '00:00',
  horaHasta: '23:59',
  diasHabiles: [0, 1, 2, 3, 4, 5, 6] // Todos los días por defecto
})

// Filtros
const filtroSelected = ref({
  genero: 0,
  estilo: 0,
  ritmo: 0,
  tipoEmpresa: 0
})

const filtros = ref({
  estiloEmpresa: [],
  ritmo: [],
  tipoEmpresa: []
})

const generosMusicales = ref([])

// Days of the week
const daysOfWeek = computed(() => {
  const days = [
    { label: 'Domingo', value: 0, number: 'Dom' },
    { label: 'Lunes', value: 1, number: 'Lun' },
    { label: 'Martes', value: 2, number: 'Mar' },
    { label: 'Miércoles', value: 3, number: 'Mié' },
    { label: 'Jueves', value: 4, number: 'Jue' },
    { label: 'Viernes', value: 5, number: 'Vie' },
    { label: 'Sábado', value: 6, number: 'Sáb' }
  ]

  // Filtrar solo días hábiles del cliente
  return days.filter(day => horarioCliente.value.diasHabiles.includes(day.value))
})

// Filtered days based on selected day filter
const filteredDays = computed(() => {
  if (selectedDayFilter.value === null) {
    return daysOfWeek.value
  }
  return daysOfWeek.value.filter(day => day.value === selectedDayFilter.value)
})

// Hours range based on client schedule
const hours = computed(() => {
  const startHour = parseInt(horarioCliente.value.horaDesde.split(':')[0])
  const endHour = parseInt(horarioCliente.value.horaHasta.split(':')[0])

  const hoursArray = []
  for (let i = startHour; i <= endHour; i++) {
    hoursArray.push(i)
  }
  return hoursArray
})

// Filtered radios
const filteredRadios = computed(() => {
  let filtered = radios.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(radio =>
      radio.nombre.toLowerCase().includes(query) ||
      (radio.genero && radio.genero.toLowerCase().includes(query)) ||
      (radio.subGenero && radio.subGenero.toLowerCase().includes(query))
    )
  }

  return filtered
})

// Nueva función para obtener programaciones por día
const programacionesPorDia = (numeroDia) => {
  return programaciones.value
    .filter(p => p.numeroDia === numeroDia)
    .sort((a, b) => {
      // Orden por horaInicio ascendente
      if (a.horaInicio < b.horaInicio) return -1
      if (a.horaInicio > b.horaInicio) return 1
      return 0
    })
}

// Methods
const volverAtras = () => {
  router.push({ name: 'ProgramaMusica' })
}

const irAEditarProgramacion = () => {
  router.push({
    name: 'Nueva programación de música',
    params: {
      codigoProgramacion: String(codigoProgramacion.value),
      nombreProgramacion: encodeURIComponent(nombreProgramacion.value)
    }
  })
}

const formatHour = (hour) => {
  return `${hour.toString().padStart(2, '0')}:00`
}

const eliminarProgramacion = (prog) => {
  selectedProgramacion.value = prog
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (!selectedProgramacion.value) return

  try {
    isLoading.value = true

    await ClienteProgramacionRadioServices.bajaProgramacionRadio(
      parseInt(selectedProgramacion.value.cod)
    )

    // Recargar programaciones
    await cargarProgramaciones()

    showDeleteModal.value = false
    selectedProgramacion.value = null

  } catch (error) {
    console.error('Error al eliminar programación:', error)
    alert('Error al eliminar la programación')
  } finally {
    isLoading.value = false
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  selectedProgramacion.value = null
}

// Funciones de edición
const editarProgramacion = (prog) => {
  editForm.value = {
    cod: prog.cod,
    radioNombre: prog.radioNombre,
    numeroDia: prog.numeroDia,
    horaInicio: prog.horaInicio,
    horaFin: prog.horaFin,
    codRadio: prog.codRadio
  }
  showEditModal.value = true
  checkEditConflicts()
}

const cancelEdit = () => {
  showEditModal.value = false
  editForm.value = {
    cod: null,
    radioNombre: '',
    numeroDia: 0,
    horaInicio: '00:00',
    horaFin: '23:59',
    codRadio: null
  }
  editConflictMessage.value = ''
}

const checkEditConflicts = () => {
  if (!editForm.value.horaInicio || !editForm.value.horaFin) {
    editConflictMessage.value = ''
    return
  }

  // Verificar que hora inicio < hora fin
  if (editForm.value.horaInicio >= editForm.value.horaFin) {
    editConflictMessage.value = 'La hora de inicio debe ser anterior a la hora de fin'
    return
  }

  // Verificar conflictos con otras programaciones del mismo día (excluyendo la actual)
  const hayConflicto = programaciones.value.some(prog => {
    // Excluir la programación actual
    if (prog.cod === editForm.value.cod) return false

    // Solo verificar programaciones del mismo día
    if (prog.numeroDia !== editForm.value.numeroDia) return false

    // Verificar superposición de horarios
    return (
      (editForm.value.horaInicio >= prog.horaInicio && editForm.value.horaInicio < prog.horaFin) ||
      (editForm.value.horaFin > prog.horaInicio && editForm.value.horaFin <= prog.horaFin) ||
      (editForm.value.horaInicio <= prog.horaInicio && editForm.value.horaFin >= prog.horaFin)
    )
  })

  if (hayConflicto) {
    editConflictMessage.value = 'El horario se superpone con otra programación existente'
  } else {
    editConflictMessage.value = ''
  }
}

const confirmEdit = async () => {
  if (editConflictMessage.value) {
    return
  }

  try {
    isLoading.value = true

    await ClienteProgramacionRadioServices.editarProgRadio(
      parseInt(editForm.value.cod),
      parseInt(codigoProgramacion.value),
      parseInt(editForm.value.codRadio),
      parseInt(editForm.value.numeroDia),
      editForm.value.horaInicio,
      editForm.value.horaFin
    )

    // Recargar programaciones
    await cargarProgramaciones()

    showEditModal.value = false
    cancelEdit()

  } catch (error) {
    console.error('Error al editar programación:', error)
    alert('Error al editar la programación: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

const calculateDuration = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return '0 horas'

  const inicio = horaInicio.split(':').map(Number)
  const fin = horaFin.split(':').map(Number)

  const minutosInicio = inicio[0] * 60 + inicio[1]
  const minutosFin = fin[0] * 60 + fin[1]

  const duracionMinutos = minutosFin - minutosInicio

  const horas = Math.floor(duracionMinutos / 60)
  const minutos = duracionMinutos % 60

  if (horas > 0 && minutos > 0) {
    return `${horas}h ${minutos}min`
  } else if (horas > 0) {
    return `${horas} hora${horas > 1 ? 's' : ''}`
  } else {
    return `${minutos} minutos`
  }
}

const guardarProgramacion = async () => {
  // Ya se guarda automáticamente al hacer drop
  alert('Programación guardada exitosamente')
  volverAtras()
}

const applyFilters = async () => {
  await cargarRadios()
}

// Load data methods
const cargarRadios = async () => {
  try {
    isLoading.value = true

    const result = await generoMusicalServices.buscar(
      0,
      0,
      filtroSelected.value.ritmo,
      filtroSelected.value.tipoEmpresa,
      filtroSelected.value.estilo
    )

    const jsonRes = []
    result.forEach(element => {
      if (element.rad_codigo != 0) {
        jsonRes.push({
          nombre: element.rad_nombre,
          codRadio: element.rad_codigo,
          img: element.rad_imagen,
          genero: element.genmus_nombre,
          subGenero: element.gemusu_nombre,
          enlaceStream: element.rad_enlace
        })
      }
    })

    radios.value = jsonRes

  } catch (error) {
    console.error('Error al cargar radios:', error)
  } finally {
    isLoading.value = false
  }
}

const cargarProgramaciones = async () => {
  try {
    isLoading.value = true

    const result = await ClienteProgramacionRadioServices.getProgramacionesByProg(
      parseInt(codigoProgramacion.value)
    )

    console.log('Programaciones cargadas desde API:', result)

    const programacionesData = []
    result.forEach(element => {
      // Normalizar formato de horas (eliminar segundos si existen)
      const horaInicio = element.clprra_horaDesde?.substring(0, 5) || element.clprra_horaDesde
      const horaFin = element.clprra_horaHasta?.substring(0, 5) || element.clprra_horaHasta

      programacionesData.push({
        cod: element.clprra_codigo,
        radioNombre: element.rad_nombre,
        numeroDia: element.clprra_numeroDia,
        diaSemana: getDiaNombre(element.clprra_numeroDia),
        horaInicio: horaInicio,
        horaFin: horaFin,
        codRadio: element.rad_codigo
      })
    })

    console.log('Programaciones procesadas:', programacionesData)
    programaciones.value = programacionesData

  } catch (error) {
    console.error('Error al cargar programaciones:', error)
  } finally {
    isLoading.value = false
  }
}

const cargarFiltros = async () => {
  try {
    // Cargar filtros de estilos
    const estilosResult = await FiltroServices.listarEstilo()
    const estilosJson = [{ nombre: 'Todos los estilos', cod: 0 }]
    estilosResult.forEach(element => {
      estilosJson.push({
        nombre: element.estilo_nombre,
        cod: element.estilo_codigo
      })
    })
    filtros.value.estiloEmpresa = estilosJson

    // Cargar filtros de ritmos
    const ritmosResult = await FiltroServices.listarRitmo()
    const ritmosJson = [{ nombre: 'Todos los ritmos', cod: 0 }]
    ritmosResult.forEach(element => {
      ritmosJson.push({
        nombre: element.ritmos_nombre,
        cod: element.ritmos_codigo
      })
    })
    filtros.value.ritmo = ritmosJson

    // Cargar tipos de empresa
    const tiposResult = await FiltroServices.listarTipoEmpresa()
    const tiposJson = [{ nombre: 'Todas las empresas', cod: 0 }]
    tiposResult.forEach(element => {
      tiposJson.push({
        nombre: element.tipEmp_nombre,
        cod: element.tipEmp_codigo
      })
    })
    filtros.value.tipoEmpresa = tiposJson

  } catch (error) {
    console.error('Error al cargar filtros:', error)
  }
}

const cargarGenerosMusicales = async () => {
  try {
    const result = await generoMusicalServices.getGeneros()
    const generosJson = []

    result.forEach(element => {
      generosJson.push({
        nombre: element.genmus_nombre,
        codigo: element.genmus_codigo
      })
    })

    generosMusicales.value = generosJson

  } catch (error) {
    console.error('Error al cargar géneros:', error)
  }
}

const getDiaNombre = (numeroDia) => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dias[numeroDia] || 'Desconocido'
}

// ===== FUNCIONES PARA DISTRIBUCIÓN MÁGICA =====

// Alternar selección de radio
const toggleRadioSelection = (radio) => {
  const index = selectedRadios.value.findIndex(r => r.codRadio === radio.codRadio)
  if (index > -1) {
    selectedRadios.value.splice(index, 1)
  } else {
    selectedRadios.value.push(radio)
  }
}

// Verificar si una radio está seleccionada
const isRadioSelected = (radio) => {
  return selectedRadios.value.some(r => r.codRadio === radio.codRadio)
}

// Obtener nombres de días
const getDaysNames = () => {
  return daysOfWeek.value.map(d => d.label).join(', ')
}

// Calcular total de slots disponibles
const calculateTotalSlots = () => {
  const totalDays = daysOfWeek.value.length
  const totalHours = hours.value.length

  if (fillEmptyHoursOnly.value) {
    // Contar solo slots vacíos
    let emptySlots = 0
    daysOfWeek.value.forEach(day => {
      hours.value.forEach(hour => {
        const horaInicio = formatHour(hour)
        const hasProgram = programaciones.value.some(prog =>
          prog.numeroDia === day.value && prog.horaInicio === horaInicio
        )
        if (!hasProgram) emptySlots++
      })
    })
    return emptySlots
  }

  return totalDays * totalHours
}

// Ejecutar distribución mágica
const executeMagicDistribution = async () => {
  if (selectedRadios.value.length === 0) {
    alert('Selecciona al menos una radio para distribuir')
    return
  }

  try {
    isLoading.value = true
    let programacionesCreadas = 0
    let radioIndex = 0

    // Preparar lista de radios según modo
    let radiosToDistribute = [...selectedRadios.value]
    if (distributionMode.value === 'random') {
      // Mezclar aleatoriamente
      radiosToDistribute = radiosToDistribute.sort(() => Math.random() - 0.5)
    }

    console.log('🎨 Iniciando distribución mágica:', {
      modo: distributionMode.value,
      radios: radiosToDistribute.length,
      soloVacios: fillEmptyHoursOnly.value,
      dias: daysOfWeek.value.length,
      horas: hours.value.length
    })

    // Iterar sobre cada día hábil
    for (const day of daysOfWeek.value) {
      // Iterar sobre cada hora
      for (const hour of hours.value) {
        const horaInicio = formatHour(hour)
        const horaFin = formatHour(hour + 1)

        // Verificar si ya existe programación en este slot
        const hayProgramacion = programaciones.value.some(prog =>
          prog.numeroDia === day.value && prog.horaInicio === horaInicio
        )

        // Si fillEmptyHoursOnly está activado y ya hay programación, saltar
        if (fillEmptyHoursOnly.value && hayProgramacion) {
          console.log(`⏭️ Saltando ${day.label} ${horaInicio} (ya programado)`)
          continue
        }

        // Eliminar programación existente si no está en modo "solo vacíos"
        if (!fillEmptyHoursOnly.value && hayProgramacion) {
          const progExistente = programaciones.value.find(prog =>
            prog.numeroDia === day.value && prog.horaInicio === horaInicio
          )
          if (progExistente) {
            try {
              await ClienteProgramacionRadioServices.bajaProgramacionRadio(parseInt(progExistente.cod))
              console.log(`🗑️ Eliminada programación existente en ${day.label} ${horaInicio}`)
            } catch (error) {
              console.error('Error eliminando programación existente:', error)
            }
          }
        }

        // Seleccionar radio según modo
        let radioToProgram
        if (distributionMode.value === 'random') {
          // Seleccionar aleatoriamente
          radioToProgram = radiosToDistribute[Math.floor(Math.random() * radiosToDistribute.length)]
        } else {
          // Modo secuencial: rotar entre las radios
          radioToProgram = radiosToDistribute[radioIndex % radiosToDistribute.length]
          radioIndex++
        }

        // Crear programación
        try {
          await ClienteProgramacionRadioServices.guardarProgRadio(
            parseInt(codigoProgramacion.value),
            parseInt(radioToProgram.codRadio),
            parseInt(day.value),
            horaInicio,
            horaFin
          )
          programacionesCreadas++
          console.log(`✅ Programado ${radioToProgram.nombre} en ${day.label} ${horaInicio}`)
        } catch (error) {
          console.error(`❌ Error programando ${day.label} ${horaInicio}:`, error)
        }
      }
    }

    // Recargar programaciones
    await cargarProgramaciones()

    showMagicDistributionModal.value = false
    selectedRadios.value = []

    alert(`✨ Distribución mágica completada!\n\n${programacionesCreadas} programaciones creadas exitosamente.`)

  } catch (error) {
    console.error('Error en distribución mágica:', error)
    alert('Error al ejecutar la distribución mágica: ' + error.message)
  } finally {
    isLoading.value = false
  }
}

// NUEVO: estado para formulario inline por día
const showNewProgForDay = ref(null)
const newProgForm = ref({
  codRadio: null,
  numeroDia: null,
  horaInicio: '00:00',
  horaFin: '23:59'
})

// Abrir formulario para un día específico
const abrirNuevoProg = (numeroDia) => {
  showNewProgForDay.value = numeroDia
  newProgForm.value = {
    codRadio: radios.value[0]?.codRadio ?? null,
    numeroDia: numeroDia,
    horaInicio: horarioCliente.value.horaDesde || '00:00',
    horaFin: (() => {
      const start = horarioCliente.value.horaDesde || '00:00'
      const h = Math.min(23, (parseInt(start.split(':')[0], 10) + 1))
      return String(h).padStart(2, '0') + ':00'
    })()
  }
}

// Cancelar creación
const cancelarNuevoProg = () => {
  showNewProgForDay.value = null
  newProgForm.value = {
    codRadio: null,
    numeroDia: null,
    horaInicio: '00:00',
    horaFin: '23:59'
  }
}

// Guardar nueva programación (validaciones mínimas + conflicto)
const guardarNuevaProgramacion = async () => {
  if (!newProgForm.value.codRadio) {
    alert('Selecciona una radio')
    return
  }
  if (!newProgForm.value.horaInicio || !newProgForm.value.horaFin) {
    alert('Completa hora inicio y fin')
    return
  }
  if (newProgForm.value.horaInicio >= newProgForm.value.horaFin) {
    alert('La hora de inicio debe ser anterior a la hora de fin')
    return
  }

  // Verificar conflictos con programaciones existentes en el mismo día
  const conflict = programaciones.value.some(prog => {
    if (prog.numeroDia !== newProgForm.value.numeroDia) return false
    return (
      (newProgForm.value.horaInicio >= prog.horaInicio && newProgForm.value.horaInicio < prog.horaFin) ||
      (newProgForm.value.horaFin > prog.horaInicio && newProgForm.value.horaFin <= prog.horaFin) ||
      (newProgForm.value.horaInicio <= prog.horaInicio && newProgForm.value.horaFin >= prog.horaFin)
    )
  })
  if (conflict) {
    if (!confirm('Existe una programación que se superpone. ¿Deseas continuar y crear igualmente?')) {
      return
    }
  }

  try {
    isLoading.value = true
    await ClienteProgramacionRadioServices.guardarProgRadio(
      parseInt(codigoProgramacion.value),
      parseInt(newProgForm.value.codRadio),
      parseInt(newProgForm.value.numeroDia),
      newProgForm.value.horaInicio,
      newProgForm.value.horaFin
    )
    await cargarProgramaciones()
    cancelarNuevoProg()
  } catch (error) {
    console.error('Error al crear programación:', error)
    alert('Error al crear la programación: ' + (error.message || error))
  } finally {
    isLoading.value = false
  }
}

/* Watchers */
watch(() => editForm.value.horaInicio, () => {
  if (showEditModal.value) {
    checkEditConflicts()
  }
})

watch(() => editForm.value.horaFin, () => {
  if (showEditModal.value) {
    checkEditConflicts()
  }
})

/* Lifecycle */
// Cargar horario del cliente
const cargarHorarioCliente = async () => {
  try {
    const horario = await ClienteHorarioServices.get()
    console.log('Horario del cliente cargado:', horario)

    if (horario) {
      horarioCliente.value = {
        horaDesde: horario.cliHor_horaDesde || '00:00',
        horaHasta: horario.cliHor_horaHasta || '23:59',
        diasHabiles: [0, 1, 2, 3, 4, 5, 6] // Todos los días por defecto
      }

      console.log('Horario configurado:', horarioCliente.value)
    }
  } catch (error) {
    console.error('Error cargando horario del cliente:', error)
    // Mantener valores por defecto si hay error
    console.warn('Usando horario por defecto (00:00 - 23:59)')
  }
}

// Cargar días hábiles del cliente
const cargarDiasHabilesCliente = async () => {
  try {
    const dias = await DiaHabilService.get()
    console.log('Días hábiles del cliente cargados:', dias)

    if (dias && dias.length > 0) {
      const diasHabiles = []
      dias.forEach(element => {
        diasHabiles.push(element.cliDha_codigoDia)
      })
      horarioCliente.value.diasHabiles = diasHabiles
      console.log('Días hábiles configurados:', horarioCliente.value.diasHabiles)
    }
  } catch (error) {
    console.error('Error cargando días hábiles del cliente:', error)
    console.warn('Usando todos los días por defecto')
  }
}

onMounted(async () => {
  console.log('Parámetros recibidos:', {
    codigoProgramacion: codigoProgramacion.value,
    nombreProgramacion: nombreProgramacion.value
  })

  if (!codigoProgramacion.value || !nombreProgramacion.value) {
    console.warn('Faltan parámetros, redirigiendo...')
    router.push({ name: 'ProgramaMusica' })
    return
  }

  console.log('Iniciando carga de datos...')

  // Cargar horario y días hábiles primero
  await cargarHorarioCliente()
  await cargarDiasHabilesCliente()

  // Luego cargar el resto de datos en paralelo
  await Promise.all([
    cargarRadios(),
    cargarProgramaciones(),
    cargarFiltros(),
    cargarGenerosMusicales()
  ])
  console.log('Carga de datos completada')

  // Listener para controlar filtros según tamaño de pantalla
  window.addEventListener('resize', handleFiltersResize)
})

// Función para controlar filtros según tamaño de pantalla
const handleFiltersResize = () => {
  if (window.innerWidth > 1024) {
    showFilters.value = true // Siempre expandido en desktop
  }
}

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', handleFiltersResize)
})
</script>

