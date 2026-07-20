<!-- Dashboard.vue — Stats reales, estado de sucursales, cards interactivas y quick actions -->
<template>
  <div class="page-content">

    <!-- Loading State -->
    <div v-if="loading" class="min-h-[60vh] flex-center">
      <div class="flex flex-col items-center gap-4">
        <div class="spinner w-8 h-8" />
        <p class="text-text-tertiary text-sm">Cargando panel de control...</p>
      </div>
    </div>

    <template v-else>
      <!-- ===== ALERTAS ===== -->
      <!-- Configuración Incompleta -->
      <div
        v-if="userRole === 'Cliente' && !configLoading && configStatus && !configStatus.isComplete && showConfigAlert"
        class="alert alert-warning mb-6"
      >
        <div class="flex-1">
          <div class="flex items-start gap-3 mb-4">
            <i class="fas fa-exclamation-triangle" />
            <div>
              <h3 class="font-semibold text-warning-300 mb-1">Configuración Inicial Incompleta</h3>
              <p class="text-warning-400/80 text-sm">
                Complete la configuración inicial para acceder a todas las funciones
              </p>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex-between text-sm mb-2">
              <span class="text-text-secondary">Progreso</span>
              <span class="text-warning-400 font-medium">{{ configProgress }}%</span>
            </div>
            <div class="h-2 bg-dark-secondary rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-warning-500 to-warning-400 rounded-full transition-all duration-500"
                :style="{ width: configProgress + '%' }"
              />
            </div>
          </div>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="text-text-tertiary text-sm">Pendiente:</span>
            <span v-for="item in missingConfigLabels" :key="item" class="badge bg-warning-500/20 text-warning-400">
              {{ item }}
            </span>
          </div>
          <div class="flex flex-wrap gap-3">
            <button class="btn btn-primary btn-sm" @click="goToConfiguration">
              <i class="fas fa-cog" /> Completar Configuración
            </button>
            <button class="btn btn-ghost btn-sm" @click="dismissConfigAlert">
              Recordar más tarde
            </button>
          </div>
        </div>
      </div>

      <!-- Facturas Pendientes -->
      <PendingInvoicesAlert
        v-if="userRole === 'Cliente' && !invoicesLoading && pendingInvoices.length > 0"
        :invoices="pendingInvoices"
        :max-display="3"
        @dismiss="pendingInvoices = []"
      />

      <!-- ===== WELCOME HEADER ===== -->
      <div class="flex-between flex-wrap gap-4 mb-6">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
            Bienvenido<span v-if="currentUser?.Nombre">, </span>
            <span class="text-gradient">{{ currentUser?.Nombre || 'Usuario' }}</span>
          </h1>
          <p class="text-text-secondary text-sm sm:text-base">
            {{ welcomeMessage }}
          </p>
        </div>
        <div class="flex items-center gap-3">
          <!-- SignalR Status (Clients only) -->
          <SignalRStatus
            v-if="userRole === 'Cliente'"
            :connected-count="connectedCount"
          />
          <span class="badge px-3 py-1.5" :class="getRoleBadgeClass()">
            <i class="fas fa-user-tag" /> {{ userRole }}
          </span>
        </div>
      </div>

      <!-- ===== STATS CARDS ===== -->
      <div v-if="showStats" data-tour="stats-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <div v-for="stat in statsCards" :key="stat.label" class="card card-hover flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl flex-center flex-shrink-0" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-text-tertiary text-xs font-medium uppercase tracking-wide">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-text-primary">{{ stat.value }}</p>
            <p v-if="stat.subtitle" class="text-text-quaternary text-xs mt-0.5">{{ stat.subtitle }}</p>
            <div v-if="stat.badge" class="mt-1">
              <span class="badge text-xs" :class="stat.badgeClass">{{ stat.badge }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== CLIENTE: ESTADO DE SUCURSALES EN TIEMPO REAL ===== -->
      <div
        v-if="userRole === 'Cliente' && sucursalesList.length > 0"
        data-tour="branches-status"
        class="card mb-8"
      >
        <div class="flex-between mb-4">
          <h3 class="text-base font-semibold text-text-primary flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Estado de Sucursales
          </h3>
          <span class="text-sm text-text-tertiary">
            {{ connectedCount }} de {{ sucursalesCount }} conectadas
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <div
            v-for="branch in sucursalesResumen"
            :key="branch.id"
            class="flex items-center gap-3 p-3 rounded-lg border transition-colors duration-200"
            :class="branch.statusClass"
          >
            <!-- Status dot -->
            <div class="relative flex-shrink-0">
              <div class="w-3 h-3 rounded-full" :class="branch.dotClass" />
              <div v-if="branch.status === 'connected'" class="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-50" :class="branch.dotClass" />
            </div>

            <!-- Branch info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">{{ branch.name }}</p>
              <p class="text-xs truncate" :class="branch.statusTextClass">
                {{ branch.statusLabel }}
              </p>
            </div>

            <!-- Playing indicator -->
            <div v-if="branch.isPlaying" class="flex-shrink-0 flex items-center gap-1 text-xs text-success-400">
              <svg class="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span class="hidden sm:inline">{{ branch.currentItem || 'On air' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== MAIN DASHBOARD CARDS ===== -->
      <div data-tour="dashboard-cards" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <div
          v-for="card in dashboardCards"
          :key="card.id"
          class="card group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden"
          :class="card.featured ? 'sm:col-span-2 lg:col-span-1' : ''"
          @click="handleCardClick(card)"
        >
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            :style="{ background: `radial-gradient(circle at 50% 0%, ${card.color}15, transparent 70%)` }"
          />

          <div class="relative z-10">
            <!-- Card Header -->
            <div class="flex-between mb-4">
              <div class="w-11 h-11 rounded-xl flex-center" :style="{ backgroundColor: card.color + '20', color: card.color }">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
                </svg>
              </div>
              <span v-if="card.badge" class="badge text-xs" :class="card.badgeClass">
                {{ card.badge }}
              </span>
            </div>

            <!-- Card Body -->
            <h3 class="text-lg font-semibold text-text-primary mb-1">{{ card.title }}</h3>
            <p class="text-text-tertiary text-sm mb-4 line-clamp-2">{{ card.description }}</p>

            <!-- Card Stats -->
            <div v-if="card.stats" class="flex gap-4 mb-4">
              <div v-for="(stat, idx) in card.stats" :key="idx" class="text-center">
                <p class="text-xl font-bold" :style="{ color: card.color }">{{ stat.value }}</p>
                <p class="text-text-quaternary text-xs">{{ stat.label }}</p>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="flex items-center text-sm font-medium" :style="{ color: card.color }">
              <span>{{ card.action || 'Ir a modulo' }} <i class="fas fa-arrow-alt-circle-right fa-2" /></span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== QUICK ACTIONS ===== -->
      <div v-if="quickActions.length > 0" data-tour="quick-actions">
        <h3 class="text-base font-semibold text-text-primary mb-4">Acciones Rapidas</h3>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="action in quickActions"
            :key="action.id"
            class="btn btn-secondary"
            @click="go(action.path)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon" />
            </svg>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Tour Button -->
    <TourButton
      v-if="hasTour() && !isTourViewed()"
      variant="floating"
      size="md"
      :pulse="true"
    />

    <!-- Configuración Modal -->
    <ConfiguracionClienteModal
      :visible="showConfigModal"
      @close="showConfigModal = false"
      @saved="onConfigSaved"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSignalRAuth } from '@/composables/useSignalRAuth'
import { useConnectionMonitor } from '@/composables/useConnectionMonitor'
import { useSucursal } from '@/composables/useSucursal'
import sucursalService from '@/services/SucursalServices'
import { useSpotsStore } from '@/stores/spots'
import { useFacturasStore } from '@/stores/facturas'
import { useRadiosStore } from '@/stores/radios'
import { useClientesStore } from '@/stores/clientes'
import configValidationService from '@/services/ConfigValidationService'
import SignalRStatus from '@/components/SignalRStatus.vue'
import PendingInvoicesAlert from '@/components/PendingInvoicesAlert.vue'
import TourButton from '@/components/TourButton.vue'
import ConfiguracionClienteModal from '@/components/configuracion/ConfiguracionClienteModal.vue'
import { useDriverTour } from '@/composables/useDriverTour'

const router = useRouter()
const authStore = useAuthStore()
const facturasStore = useFacturasStore()
const spotsStore = useSpotsStore()
const radiosStore = useRadiosStore()
const clientesStore = useClientesStore()

// ===== STATE =====
const loading = ref(true)
const sucursalesCount = ref(0)
const sucursalesList = ref([])
const usersCount = ref(0)
const radiosCount = ref(0)
const programacionesCount = ref(0)

// Connection monitor
const connectionMonitor = useConnectionMonitor()
const { sucursalesConnected, connectedCount } = useSucursal({ enableRealtime: true, enableConnectionMonitor: true })

// Configuration
const configLoading = ref(false)
const configStatus = ref(null)
const showConfigAlert = ref(true)
const showConfigModal = ref(false)

// Invoices
const pendingInvoices = ref([])
const invoicesLoading = ref(false)

const signalR = useSignalRAuth()

// Driver.js tour
const { startTour, hasTour, isTourViewed } = useDriverTour({
  autoStart: true,
  onComplete: () => console.log('[Dashboard] Tour completado')
})

// ===== COMPUTED =====
const currentUser = computed(() => authStore.user)
const userRole = computed(() => authStore.userRole || 'Cliente')

const spotsCount = computed(() => spotsStore.spotsCount)
const allSpotsCount = computed(() => spotsStore.allSpotsCount)
const activeSpotsCount = computed(() => spotsStore.activeSpotsCount)
const expiredSpotsCount = computed(() => spotsStore.expiredSpotsCount)

const configProgress = computed(() => {
  if (!configStatus.value) return 0
  return configValidationService.getCompletionPercentage(configStatus.value)
})

const missingConfigLabels = computed(() => {
  if (!configStatus.value || !configStatus.value.missing) return []
  return configValidationService.getMissingLabels(configStatus.value.missing)
})

const showStats = computed(() => ['Cliente', 'Administrador'].includes(userRole.value))

// Welcome message dinámico
const welcomeMessage = computed(() => {
  if (userRole.value === 'Cliente') {
    const parts = [`${sucursalesCount.value} sucursales`]
    if (allSpotsCount.value > 0) parts.push(`${allSpotsCount.value} spots`)
    return `${parts.join(' · ')} · Gestiona todo desde un solo lugar`
  }
  const messages = {
    'Administrador': 'Panel de administración completo del sistema',
    'Reproductor': 'Accede a tu biblioteca de spots',
    'Usuario': 'Gestiona tus spots comerciales'
  }
  return messages[userRole.value] || 'Bienvenido al sistema'
})

const getRoleBadgeClass = () => {
  const classes = {
    'Administrador': 'bg-danger-500/20 text-danger-400',
    'Cliente': 'bg-primary-500/20 text-primary-400',
    'Reproductor': 'bg-success-500/20 text-success-400',
    'Usuario': 'bg-info-500/20 text-info-400'
  }
  return classes[userRole.value] || 'bg-primary-500/20 text-primary-400'
}

// ===== STATS CARDS (Datos reales) =====
const statsCards = computed(() => {
  if (userRole.value === 'Cliente') {
    return [
      {
        label: 'Sucursales',
        value: sucursalesCount.value,
        subtitle: `${connectedCount.value} conectadas`,
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        color: '#3b82f6'
      },
      {
        label: 'Spots',
        value: allSpotsCount.value,
        subtitle: `${activeSpotsCount.value} activos · ${expiredSpotsCount.value} vencidos`,
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        color: '#8b5cf6'
      },
      {
        label: 'Programación',
        value: programacionesCount.value || '—',
        subtitle: programacionesCount.value > 0 ? 'Horarios configurados' : 'Sin programar',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        color: '#10b981',
        badge: programacionesCount.value === 0 ? 'Configurar' : null,
        badgeClass: programacionesCount.value === 0 ? 'badge-warning' : null
      },
      {
        label: 'Facturación',
        value: facturasStore.facturasCount || '—',
        subtitle: facturasStore.facturasPendientes.value?.length > 0
          ? `${facturasStore.facturasPendientes.value.length} pendientes`
          : 'Al día',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        color: '#f59e0b',
        badge: facturasStore.facturasPendientes.value?.length > 0 ? `${facturasStore.facturasPendientes.value.length} pendientes` : null,
        badgeClass: 'badge-warning'
      }
    ]
  }

  if (userRole.value === 'Administrador') {
    return [
      {
        label: 'Clientes',
        value: usersCount.value || clientesStore.clientesCount,
        subtitle: 'Total registrados',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        color: '#3b82f6'
      },
      {
        label: 'Radios',
        value: radiosCount.value || radiosStore.radiosCount,
        subtitle: 'Configuradas',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        color: '#8b5cf6'
      },
      {
        label: 'Facturas',
        value: facturasStore.facturasCount || '—',
        subtitle: 'Total emitidas',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        color: '#10b981'
      }
    ]
  }

  return []
})

// ===== SUCURSALES RESUMEN (para estado en tiempo real) =====
const sucursalesResumen = computed(() => {
  if (sucursalesList.value.length === 0) return []

  return sucursalesList.value.map(s => {
    const isConnected = connectionMonitor?.isConnectedByUsername(s.username) ||
                        connectionMonitor?.isConnected(s.clisuc_codigo)
    const info = connectionMonitor?.getBranchInfo(s.username) || connectionMonitor?.getBranchInfo(s.clisuc_codigo)
    const status = isConnected ? 'connected' : 'disconnected'
    const isPlaying = info?.status?.isPlaying || info?.isPlaying

    return {
      id: s.clisuc_codigo || s.idSucursal || s.username,
      name: s.clisuc_nombre || s.nombreSucursal || s.username || 'Sin nombre',
      status,
      isPlaying: !!isPlaying,
      currentItem: info?.status?.currentItem?.title || info?.currentSong || null,
      statusLabel: isConnected
        ? (isPlaying ? 'Reproduciendo' : 'En línea')
        : 'Desconectada',
      dotClass: isConnected ? 'bg-success-400' : 'bg-gray-500',
      statusClass: isConnected
        ? 'border-success-500/30 bg-success-500/5 hover:bg-success-500/10'
        : 'border-gray-700 bg-dark-secondary hover:bg-dark-hover',
      statusTextClass: isConnected ? 'text-success-400' : 'text-text-quaternary'
    }
  })
})

// ===== DASHBOARD CARDS =====
const dashboardCards = computed(() => {
  const cards = []

  if (userRole.value === 'Cliente') {
    cards.push(
      {
        id: 'sucursales',
        title: 'Sucursales',
        description: `${connectedCount.value} de ${sucursalesCount.value} sucursales conectadas. Gestioná ubicaciones, equipos y estado.`,
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        path: '/sucursales',
        color: '#3b82f6',
        featured: true,
        action: 'Gestionar sucursales',
        badge: `${sucursalesCount.value} total`,
        badgeClass: 'badge-primary',
        stats: [
          { value: sucursalesCount.value, label: 'Total' },
          { value: connectedCount.value, label: 'Conectadas' }
        ]
      },
      {
        id: 'musica',
        title: 'Mi Música',
        description: programacionesCount.value > 0
          ? `${programacionesCount.value} horarios programados para el día. Edita tu grilla musical en segundos.`
          : 'Programa tu grilla musical semanal. Defini generos, horarios y dias.',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        path: '/programaMusica',
        color: '#10b981',
        featured: true,
        action: 'Programar música',
        badge: programacionesCount.value > 0 ? `${programacionesCount.value} activas` : 'Nueva',
        badgeClass: programacionesCount.value > 0 ? 'badge-success' : 'badge-warning'
      },
      {
        id: 'spots',
        title: 'Mis Spots',
        description: `${activeSpotsCount.value} spots activos en biblioteca. ${expiredSpotsCount.value > 0 ? expiredSpotsCount.value + ' vencidos.' : 'Todo al día.'}`,
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        path: '/bibliotecaSpot',
        color: '#8b5cf6',
        stats: [{ value: allSpotsCount.value, label: 'Spots' }],
        action: 'Ver biblioteca',
        badge: expiredSpotsCount.value > 0 ? `${expiredSpotsCount.value} vencidos` : null,
        badgeClass: 'badge-warning'
      },
      {
        id: 'config',
        title: 'Configuración',
        description: configStatus.value?.isComplete
          ? 'Tu cuenta está configurada correctamente.'
          : `${configProgress.value}% completado. Faltan ${missingConfigLabels.value.length} pasos.`,
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        path: '/configuracion-cliente',
        color: '#64748b',
        action: 'Configurar',
        badge: configStatus.value?.isComplete ? 'Completo' : `${configProgress.value}%`,
        badgeClass: configStatus.value?.isComplete ? 'badge-success' : 'badge-warning'
      }
    )
  } else if (userRole.value === 'Administrador') {
    cards.push(
      {
        id: 'usuarios',
        title: 'Gestión de Usuarios',
        description: `Administrá ${usersCount.value || clientesStore.clientesCount || 0} clientes registrados, permisos y accesos al sistema.`,
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        path: '/usuarios',
        color: '#3b82f6',
        featured: true,
        action: 'Gestionar usuarios',
        badge: `${usersCount.value || clientesStore.clientesCount || 0} registrados`,
        badgeClass: 'badge-primary'
      },
      {
        id: 'radios',
        title: 'Radios',
        description: `${radiosCount.value || radiosStore.radiosCount || 0} radios configuradas. Gestioná emisoras, programación y locutores.`,
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        path: '/radios',
        color: '#8b5cf6',
        featured: true,
        action: 'Ver radios',
        badge: `${radiosCount.value || radiosStore.radiosCount || 0} configuradas`,
        badgeClass: 'badge-primary'
      },
      {
        id: 'facturas',
        title: 'Facturación',
        description: facturasStore.facturasCount > 0
          ? `${facturasStore.facturasCount} recibos emitidos. ${facturasStore.facturasPendientes.value?.length || 0} pendientes de pago.`
          : 'Gestión de recibos y comprobantes de pago del sistema.',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        path: '/facturasAdmin',
        color: '#10b981',
        action: 'Ver facturas',
        badge: facturasStore.facturasPendientes.value?.length > 0 ? `${facturasStore.facturasPendientes.value.length} pendientes` : null,
        badgeClass: 'badge-warning'
      }
    )
  } else if (userRole.value === 'Reproductor') {
    cards.push({
      id: 'spots',
      title: 'Mis Spots',
      description: 'Accede a tu biblioteca completa de spots comerciales',
      icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
      path: '/bibliotecaSpot',
      color: '#8b5cf6',
      featured: true,
      stats: [{ value: spotsStore.spotsCount, label: 'Spots disponibles' }],
      action: 'Ir a biblioteca'
    })
  }

  return cards
})

// ===== QUICK ACTIONS =====
const quickActions = computed(() => {
  const actions = []

  if (userRole.value === 'Cliente') {
    actions.push(
      {
        id: 'programar-musica',
        label: 'Programar Música',
        path: '/programaMusica',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
      },
      {
        id: 'cargar-spot',
        label: 'Cargar Spot',
        path: '/altaSpot',
        icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
      },
      {
        id: 'programar-spots',
        label: 'Programar Spots',
        path: '/bibliotecaSpot',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        id: 'nueva-sucursal',
        label: 'Nueva Sucursal',
        path: '/sucursales',
        icon: 'M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
      },
      {
        id: 'ver-facturas',
        label: 'Mis Recibos',
        path: '/facturas',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      }
    )
  } else if (userRole.value === 'Administrador') {
    actions.push(
      {
        id: 'ver-usuarios',
        label: 'Gestión de Usuarios',
        path: '/usuarios',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
      },
      {
        id: 'ver-radios',
        label: 'Gestión de Radios',
        path: '/radios',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3'
      },
      {
        id: 'ver-facturas',
        label: 'Gestión de Recibos',
        path: '/facturasAdmin',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      },
      {
        id: 'event-log',
        label: 'Logs del Sistema',
        path: '/event-log',
        icon: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4'
      }
    )
  }

  return actions
})

// ===== ROUTING / HELPERS =====
const go = (path) => router.push({ path })
const goToConfiguration = () => { showConfigModal.value = true }
const dismissConfigAlert = () => {
  showConfigAlert.value = false
  localStorage.setItem('configAlertDismissed', Date.now().toString())
}
const handleCardClick = (card) => {
  if (card.id === 'config') {
    showConfigModal.value = true
  } else if (card.path) {
    router.push(card.path)
  }
}
const onConfigSaved = async () => {
  await checkConfigurationStatus()
}

// ===== WATCHERS =====
watch(connectedCount, (newCount, oldCount) => {
  console.log(`[Dashboard] Conexiones actualizadas: ${newCount} sucursales conectadas (antes: ${oldCount || 0})`)
})

// ===== DATA LOADING =====
const checkConfigurationStatus = async () => {
  if (userRole.value !== 'Cliente') return
  const dismissedTime = localStorage.getItem('configAlertDismissed')
  if (dismissedTime) {
    const hoursSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60)
    if (hoursSinceDismissal < 24) showConfigAlert.value = false
  }
  try {
    configLoading.value = true
    configStatus.value = await configValidationService.checkConfigurationStatus()
  } catch (error) {
    console.error('[Dashboard] Error verificando configuracion:', error)
  } finally {
    configLoading.value = false
  }
}

const loadPendingInvoices = async () => {
  if (userRole.value !== 'Cliente') return
  try {
    invoicesLoading.value = true
    const facturas = await facturasStore.loadUltimaFactura()
    if (Array.isArray(facturas)) {
      pendingInvoices.value = facturas.filter(f => f.fac_estado === 'P' || f.fac_estado === 'V')
    } else {
      pendingInvoices.value = []
    }
  } catch (error) {
    console.error('[Dashboard] Error cargando facturas pendientes:', error)
    pendingInvoices.value = []
  } finally {
    invoicesLoading.value = false
  }
}

const loadWithTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout excedido')), ms))
  ])
}

const safeLoad = async (label, fn) => {
  try {
    return await loadWithTimeout(fn(), 20000)
  } catch (err) {
    console.warn(`[Dashboard] ${label}: ${err.message}`)
    return null
  }
}

const loadDashboardData = async () => {
  loading.value = true
  console.log('[Dashboard] Cargando datos...')

  try {
    if (userRole.value === 'Cliente') {
      // Cargar sucursales
      const sucursalesResult = await safeLoad('Sucursales', () => sucursalService.getcliSucursalByCliente().catch(() => []))
      sucursalesList.value = sucursalesResult || []
      sucursalesCount.value = sucursalesList.value.length

      // Cargar spots
      await safeLoad('Spots', () => spotsStore.loadSpotsDisponibles())

      // Cargar programaciones de radio
      const progResult = await safeLoad('Programaciones', () => radiosStore.loadProgramacionesRadio())
      if (progResult) {
        programacionesCount.value = progResult?.length || 0
      } else {
        programacionesCount.value = 0
      }

      console.log(`[Dashboard] Cliente: ${sucursalesCount.value} sucursales, ${spotsCount.value} spots, ${programacionesCount.value} programaciones, ${connectedCount.value} conectadas`)
    } else if (userRole.value === 'Administrador') {
      const results = await Promise.allSettled([
        safeLoad('Clientes', () => clientesStore.loadClientes()),
        safeLoad('Radios', () => radiosStore.loadRadios()),
        safeLoad('Spots', () => spotsStore.loadSpotsDisponibles()),
        safeLoad('Facturas', () => facturasStore.loadFacturas().catch(() => []))
      ])

      if (results[0].status === 'fulfilled') usersCount.value = results[0].value?.length || clientesStore.clientesCount || 0
      if (results[1].status === 'fulfilled') radiosCount.value = results[1].value?.length || radiosStore.radiosCount || 0
      if (usersCount.value === 0) usersCount.value = clientesStore.clientesCount
      if (radiosCount.value === 0) radiosCount.value = radiosStore.radiosCount

      console.log(`[Dashboard] Admin: ${usersCount.value} clientes, ${radiosCount.value} radios, ${allSpotsCount.value} spots, ${facturasStore.facturasCount} facturas`)
    } else if (userRole.value === 'Reproductor' || userRole.value === 'Usuario') {
      await safeLoad('Spots', () => spotsStore.loadSpotsDisponibles())
    }

    console.log('[Dashboard] Datos cargados correctamente')
  } catch (error) {
    console.error('[Dashboard] Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

// ===== LIFECYCLE =====
onMounted(async () => {
  console.log('[Dashboard] Dashboard inicializado con monitor de conexiones')
  await checkConfigurationStatus()
  await loadDashboardData()
  await loadPendingInvoices()
})

onUnmounted(() => {
  console.log('[Dashboard] Dashboard desmontado')
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.page-content {
  @apply gpu-accelerated;
}

.card.card-hover {
  @apply glass-hover hover-lift;
  @apply transition-all duration-300;
}

.card.group {
  @apply glass relative overflow-hidden;
  @apply transition-all duration-300;
}

.card.group::before {
  content: '';
  @apply absolute top-0 left-0 w-full h-1;
  @apply bg-gradient-to-r from-transparent via-primary-500 to-transparent;
  @apply opacity-0 transition-opacity duration-300;
}

.card.group:hover::before {
  @apply opacity-100;
}

.btn {
  @apply gpu-accelerated;
}

.btn:hover {
  @apply shadow-glow-primary;
}
</style>
