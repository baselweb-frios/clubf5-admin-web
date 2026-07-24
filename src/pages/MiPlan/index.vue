<template>
  <div class="page-wrapper">
    <!-- Hero Header -->
    <div class="relative overflow-hidden rounded-2xl mb-8 bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 p-6 sm:p-10">
      <div class="absolute inset-0 opacity-10">
        <div class="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white blur-3xl" />
        <div class="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary-300 blur-3xl" />
      </div>
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center gap-5">
        <div class="w-14 h-14 rounded-2xl bg-white/15 flex-center flex-shrink-0">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <div class="text-white">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">Mi Plan</h1>
          <p class="text-primary-200 text-sm sm:text-base mt-1">Consultá tu plan actual y cambiá de paquete cuando lo necesites</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pageLoading" class="flex-center py-20">
      <LoadingSpinner :loading="true" text="Cargando tu plan..." />
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="card flex flex-col items-center justify-center py-16 text-center">
      <div class="w-16 h-16 rounded-2xl bg-danger-500/15 flex-center mb-5">
        <svg class="w-8 h-8 text-danger-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p class="text-text-secondary mb-5">No pudimos cargar la informacion de tu plan. Proba de nuevo en unos instantes.</p>
      <button class="btn btn-primary" @click="cargarDatos">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Reintentar
      </button>
    </div>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- ===== Plan Actual ===== -->
      <div v-if="planActual" class="card card-hover relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 via-primary-400 to-accent-purple" />
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Left: Plan info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-4">
              <span class="badge badge-success inline-flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Plan activo
              </span>
            </div>
            <h2 class="text-xl sm:text-2xl font-bold text-text-primary mb-1">{{ planActual.paq_descri }}</h2>
            <p class="text-text-tertiary text-sm mb-5">Este es el plan que tenes contratado actualmente</p>

            <!-- Features -->
            <ul v-if="featuresList(planActual.paq_caract).length" class="space-y-2 mb-6">
              <li v-for="(f, i) in featuresList(planActual.paq_caract)" :key="i" class="flex items-start gap-2.5 text-sm text-text-secondary">
                <svg class="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ f }}</span>
              </li>
            </ul>
          </div>

          <!-- Right: Price + Specs -->
          <div class="lg:w-56 flex flex-col items-center justify-center bg-dark-secondary rounded-xl p-5 border border-dark-border">
            <p class="text-3xl sm:text-4xl font-extrabold text-primary-400 tracking-tight">
              {{ formatPrecio(planActual.paq_precio) }}
            </p>
            <p class="text-xs text-text-tertiary mb-4">por mes</p>
            <div class="w-full space-y-2">
              <div class="flex-between text-xs">
                <span class="text-text-tertiary"><svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg> Equipos</span>
                <span class="text-text-primary font-semibold">{{ planActual.paq_canequ ?? '-' }}</span>
              </div>
              <div class="flex-between text-xs">
                <span class="text-text-tertiary"><svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg> Spots max.</span>
                <span class="text-text-primary font-semibold">{{ planActual.paq_maxspo ?? '-' }}</span>
              </div>
              <div v-if="miPaquete && miPaquete.paq_maxped" class="flex-between text-xs">
                <span class="text-text-tertiary"><svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> Pedidos</span>
                <span class="text-text-primary font-semibold">{{ miPaquete.cant_pedidos ?? 0 }} / {{ miPaquete.paq_maxped }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback: no plan detected -->
      <div v-else class="card flex flex-col items-center justify-center py-16 text-center">
        <div class="w-16 h-16 rounded-2xl bg-warning-500/15 flex-center mb-5">
          <svg class="w-8 h-8 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-text-secondary">No pudimos determinar tu plan actual. Contacta a soporte si el problema persiste.</p>
      </div>

      <!-- ===== Seccion: Planes Disponibles ===== -->
      <div>
        <div class="flex items-center gap-3 mb-5">
          <div class="w-10 h-10 rounded-xl bg-primary-500/15 flex-center">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-semibold text-text-primary">Planes disponibles</h2>
            <p class="text-xs text-text-tertiary">Elegi el plan que mejor se adapte a tu negocio</p>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="paquetes.length === 0" class="card flex flex-col items-center justify-center py-16 text-center">
          <div class="w-16 h-16 rounded-2xl bg-dark-secondary flex-center mb-5">
            <svg class="w-8 h-8 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p class="text-text-secondary">No hay paquetes disponibles en este momento</p>
        </div>

        <!-- Pricing Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            v-for="paq in paquetes"
            :key="paq.paq_codigo"
            class="card group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
            :class="esPlanActual(paq) ? 'ring-2 ring-primary-500/50 shadow-glow-primary' : 'hover:ring-1 hover:ring-primary-500/30'"
          >
            <!-- Top accent bar (solo en plan actual) -->
            <div v-if="esPlanActual(paq)" class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-purple rounded-t-xl" />

            <!-- Plan name + badge -->
            <div class="flex-between mb-4">
              <h3 class="text-base font-semibold text-text-primary">{{ paq.paq_descri }}</h3>
              <span v-if="esPlanActual(paq)" class="badge badge-primary text-xs flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Actual
              </span>
            </div>

            <!-- Price -->
            <div class="mb-4">
              <p class="text-3xl font-extrabold text-primary-400 tracking-tight">
                {{ formatPrecio(paq.paq_precio) }}
                <span class="text-xs font-normal text-text-tertiary">/mes</span>
              </p>
            </div>

            <!-- Specs row -->
            <div class="flex gap-4 text-xs text-text-tertiary mb-4 pb-4 border-b border-dark-border">
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                {{ paq.paq_canequ ?? '-' }} eq.
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
                {{ paq.paq_maxspo ?? '-' }} spots
              </span>
            </div>

            <!-- Features -->
            <ul v-if="featuresList(paq.paq_caract).length" class="space-y-2 mb-6 flex-1">
              <li v-for="(f, i) in featuresList(paq.paq_caract)" :key="i" class="flex items-start gap-2 text-sm text-text-secondary">
                <svg class="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ f }}</span>
              </li>
            </ul>

            <!-- Action button -->
            <button
              class="btn w-full"
              :class="esPlanActual(paq) ? 'btn-ghost cursor-default opacity-60' : 'btn-primary'"
              :disabled="esPlanActual(paq) || cambiando"
              @click="seleccionarPlan(paq)"
            >
              <span v-if="esPlanActual(paq)">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Plan actual
              </span>
              <span v-else>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Elegir este plan
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal: Confirmar cambio de plan -->
    <Modal
      v-model="showConfirmModal"
      title="Confirmar cambio de plan"
      size="sm"
      :closable="!cambiando"
      :close-on-overlay="!cambiando"
    >
      <div class="text-center">
        <div class="w-14 h-14 rounded-2xl bg-primary-500/15 flex-center mx-auto mb-4">
          <svg class="w-7 h-7 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <p class="text-text-primary mb-1">
          Vas a cambiar a <strong class="text-primary-400">{{ planSeleccionado?.paq_descri }}</strong>
        </p>
        <p class="text-2xl font-extrabold text-primary-400">
          {{ formatPrecio(planSeleccionado?.paq_precio) }}<span class="text-xs font-normal text-text-tertiary">/mes</span>
        </p>
        <p class="text-sm text-text-tertiary mt-3">El cambio se aplica de inmediato y deberas volver a iniciar sesion.</p>
      </div>

      <template #footer>
        <button class="btn btn-secondary" :disabled="cambiando" @click="cerrarModal">
          Cancelar
        </button>
        <button class="btn btn-primary" :disabled="cambiando" @click="confirmarCambio">
          <svg v-if="cambiando" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span v-else>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          {{ cambiando ? 'Cambiando...' : 'Confirmar cambio' }}
        </button>
      </template>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClientesStore } from '@/stores/clientes'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/ui/Modal.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const router = useRouter()
const clientesStore = useClientesStore()
const authStore = useAuthStore()
const toast = useToast()

const pageLoading = ref(true)
const loadError = ref(false)
const cambiando = ref(false)

const showConfirmModal = ref(false)
const planSeleccionado = ref(null)

const planActual = computed(() => clientesStore.planActual)
const miPaquete = computed(() => clientesStore.miPaquete)
const paquetes = computed(() => clientesStore.paquetes)

const esPlanActual = (paq) => planActual.value?.paq_codigo === paq.paq_codigo

const formatPrecio = (precio) => {
  if (precio === null || precio === undefined) return '-'
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(precio)
}

const featuresList = (caract) => {
  if (!caract) return []
  return caract.split('\n').map((f) => f.trim()).filter(Boolean)
}

const cargarDatos = async () => {
  pageLoading.value = true
  loadError.value = false

  try {
    await clientesStore.loadClienteByUsername()
    await clientesStore.loadPaquetes()
  } catch (err) {
    loadError.value = true
    console.error('Error cargando datos de Mi Plan:', err)
    toast(clientesStore.error || 'No se pudo cargar la informacion de tu plan', 'error')
    return
  } finally {
    pageLoading.value = false
  }

  try {
    await clientesStore.loadMiPaquete()
  } catch (err) {
    console.warn('No se pudo cargar el detalle de uso del paquete:', err)
  }
}

const seleccionarPlan = (paquete) => {
  if (esPlanActual(paquete)) return
  planSeleccionado.value = paquete
  showConfirmModal.value = true
}

const cerrarModal = () => {
  if (cambiando.value) return
  showConfirmModal.value = false
  planSeleccionado.value = null
}

const confirmarCambio = async () => {
  if (!planSeleccionado.value || cambiando.value) return

  cambiando.value = true
  const nombrePlan = planSeleccionado.value.paq_descri
  try {
    await clientesStore.cambiarPlan(planSeleccionado.value.paq_codigo)
    showConfirmModal.value = false
    planSeleccionado.value = null

    toast(`Tu plan fue cambiado a "${nombrePlan}".`, 'success', 5000)

    setTimeout(() => {
      authStore.logout()
      router.push({ name: 'Login' })
    }, 1500)
  } catch (err) {
    console.error('Error cambiando de plan:', err)
    toast(clientesStore.error || 'No se pudo cambiar el plan. Intenta de nuevo.', 'error')
  } finally {
    cambiando.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>
