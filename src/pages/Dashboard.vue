<template>
  <div class="page-content">
    <!-- SignalR Connection Status -->
    <SignalRStatus v-if="userRole === 'Cliente' && !loading" :connected-count="connectedCount" />

    <!-- Loading State -->
    <div v-if="loading" class="min-h-[60vh] flex-center">
      <div class="spinner w-8 h-8" />
    </div>

    <template v-else>
      <!-- Configuration Progress Alert -->
      <div
        v-if="userRole === 'Cliente' && !configLoading && configStatus && !configStatus.isComplete && showConfigAlert"
        class="alert alert-warning mb-6">
        <div class="flex-1">
          <div class="flex items-start gap-3 mb-4">
            <i class="fas fa-exclamation-triangle" />
            <div>
              <h3 class="font-semibold text-warning-300 mb-1">
                Configuracion Inicial Incompleta
              </h3>
              <p class="text-warning-400/80 text-sm">
                Complete la configuracion inicial para acceder a todas las funciones
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mb-4">
            <div class="flex-between text-sm mb-2">
              <span class="text-text-secondary">Progreso</span>
              <span class="text-warning-400 font-medium">{{ configProgress }}%</span>
            </div>
            <div class="h-2 bg-dark-secondary rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-warning-500 to-warning-400 rounded-full transition-all duration-500"
                :style="{ width: configProgress + '%' }" />
            </div>
          </div>

          <!-- Missing Items -->
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="text-text-tertiary text-sm">Pendiente:</span>
            <span v-for="item in missingConfigLabels" :key="item" class="badge bg-warning-500/20 text-warning-400">
              {{ item }}
            </span>
          </div>

          <!-- Actions -->
          <div class="flex flex-wrap gap-3">
            <button class="btn btn-primary btn-sm" @click="goToConfiguration">
              <i class="fas fa-cog" />

              Completar Configuracion
            </button>
            <button class="btn btn-ghost btn-sm" @click="dismissConfigAlert">
              Recordar mas tarde
            </button>
          </div>
        </div>
      </div>

      <!-- Pending Invoices Alert -->
      <PendingInvoicesAlert v-if="userRole === 'Cliente' && !invoicesLoading && pendingInvoices.length > 0"
        :invoices="pendingInvoices" :max-display="3" @dismiss="pendingInvoices = []" />

      <!-- Welcome Header -->
      <div class="flex-between flex-wrap gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-text-primary mb-1">
            Bienvenido, <span class="text-gradient">{{ currentUser?.Nombre || 'Usuario' }}</span>
          </h1>
          <p class="text-text-secondary text-sm sm:text-base">
            {{ getWelcomeMessage() }}
          </p>
        </div>
        <span class="badge px-3 py-1.5" :class="getRoleBadgeClass()">
          <i class="fas fa-user-tag" />
          {{ userRole }}
        </span>
      </div>

      <!-- Stats Cards Row -->
      <div v-if="showStats" data-tour="stats-cards"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div v-for="stat in statsCards" :key="stat.label" class="card card-hover flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl flex-center flex-shrink-0"
            :style="{ backgroundColor: stat.color + '20', color: stat.color }">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon" />
            </svg>
          </div>
          <div>
            <p class="text-text-tertiary text-sm">
              {{ stat.label }}
            </p>
            <p class="text-2xl font-bold text-text-primary">
              {{ stat.value }}
            </p>
            <p v-if="stat.subtitle" class="text-text-quaternary text-xs">
              {{ stat.subtitle }}
            </p>
          </div>
        </div>
      </div>

      <!-- Main Interactive Cards Grid -->
      <div data-tour="dashboard-cards"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div v-for="card in dashboardCards" :key="card.id"
          class="card group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg relative overflow-hidden"
          :class="card.featured ? 'sm:col-span-2 lg:col-span-1' : ''" @click="handleCardClick(card)">
          <!-- Glow Effect -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            :style="{ background: `radial-gradient(circle at 50% 0%, ${card.color}15, transparent 70%)` }" />

          <div class="relative z-10">
            <!-- Card Header -->
            <div class="flex-between mb-4">
              <div class="w-12 h-12 rounded-xl flex-center"
                :style="{ backgroundColor: card.color + '20', color: card.color }">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon" />
                </svg>
              </div>
              <span v-if="card.badge" class="badge badge-primary text-xs">
                {{ card.badge }}
              </span>
            </div>

            <!-- Card Body -->
            <h3 class="text-lg font-semibold text-text-primary mb-1">
              {{ card.title }}
            </h3>
            <p class="text-text-tertiary text-sm mb-4 line-clamp-2">
              {{ card.description }}
            </p>

            <!-- Card Stats -->
            <div v-if="card.stats" class="flex gap-4 mb-4">
              <div v-for="(stat, idx) in card.stats" :key="idx" class="text-center">
                <p class="text-xl font-bold" :style="{ color: card.color }">
                  {{ stat.value }}
                </p>
                <p class="text-text-quaternary text-xs">
                  {{ stat.label }}
                </p>
              </div>
            </div>

            <!-- Card Footer -->
            <div class="flex items-center text-sm font-medium" :style="{ color: card.color }">
              <span>{{ card.action || 'Ir a modulo' }} <i class="fas fa-arrow-alt-circle-right fa-2" /></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div v-if="quickActions.length > 0" data-tour="quick-actions">
        <h3 class="text-lg font-semibold text-text-primary mb-4">
          Acciones Rapidas
        </h3>
        <div class="flex flex-wrap gap-3">
          <button v-for="action in quickActions" :key="action.id" class="btn btn-secondary" @click="go(action.path)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon" />
            </svg>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Botón flotante para iniciar tour -->
    <TourButton v-if="hasTour() && !isTourViewed()" variant="floating" size="md" :pulse="true" />
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
import spotService from '@/services/SpotServices'
import configValidationService from '@/services/ConfigValidationService'
import { useFacturasStore } from '@/stores/facturas'
import SignalRStatus from '@/components/SignalRStatus.vue'
import PendingInvoicesAlert from '@/components/PendingInvoicesAlert.vue'
import TourButton from '@/components/TourButton.vue'
import { useDriverTour } from '@/composables/useDriverTour'

const router = useRouter()
const authStore = useAuthStore()
const facturasStore = useFacturasStore()

const loading = ref(true)
const sucursalesCount = ref(0)
const spotsCount = ref(0)
const activeReproductions = ref(0)
const sucursalesList = ref([])
const usersCount = ref(0)
const radiosCount = ref(0)

const connectionMonitor = useConnectionMonitor()
const {
  sucursalesConnected,
  connectedCount
} = useSucursal({
  enableRealtime: true,
  enableConnectionMonitor: true
})

const configLoading = ref(false)
const configStatus = ref(null)
const showConfigAlert = ref(true)

const pendingInvoices = ref([])
const invoicesLoading = ref(false)

const signalR = useSignalRAuth()
const { getCachedEvent } = signalR

// Driver.js tour
const { startTour, hasTour, isTourViewed } = useDriverTour({
  autoStart: true, // Iniciar automáticamente en primera visita
  onComplete: () => console.log('[Dashboard] Tour completado')
})

const currentUser = computed(() => authStore.user)
const userRole = computed(() => {
  return authStore.userRole || 'Cliente'
})

const configProgress = computed(() => {
  if (!configStatus.value) return 0
  return configValidationService.getCompletionPercentage(configStatus.value)
})

const missingConfigLabels = computed(() => {
  if (!configStatus.value || !configStatus.value.missing) return []
  return configValidationService.getMissingLabels(configStatus.value.missing)
})

const getWelcomeMessage = () => {
  const messages = {
    'Administrador': 'Panel de administracion completo del sistema',
    'Cliente': 'Gestiona tu musica, spots y sucursales desde un solo lugar',
    'Reproductor': 'Accede a tu biblioteca de spots',
    'Usuario': 'Gestiona tus spots comerciales'
  }
  return messages[userRole.value] || 'Bienvenido al sistema'
}

const getRoleBadgeClass = () => {
  const classes = {
    'Administrador': 'bg-danger-500/20 text-danger-400',
    'Cliente': 'bg-primary-500/20 text-primary-400',
    'Reproductor': 'bg-success-500/20 text-success-400',
    'Usuario': 'bg-info-500/20 text-info-400'
  }
  return classes[userRole.value] || 'bg-primary-500/20 text-primary-400'
}

const getRoleIcon = () => {
  const icons = {
    'Administrador': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'Cliente': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    'Reproductor': 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
    'Usuario': 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return icons[userRole.value] || icons['Usuario']
}

const showStats = computed(() => {
  return ['Cliente', 'Administrador'].includes(userRole.value)
})

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
        value: spotsCount.value,
        subtitle: 'En biblioteca',
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        color: '#8b5cf6'
      },
      {
        label: 'Reproducciones',
        value: connectedCount.value,
        subtitle: 'En linea ahora',
        icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
        color: '#10b981'
      }
    ]
  } else if (userRole.value === 'Administrador') {
    return [
      {
        label: 'Clientes',
        value: usersCount.value,
        subtitle: 'Total en sistema',
        icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
        color: '#3b82f6'
      },
      {
        label: 'Radios',
        value: radiosCount.value,
        subtitle: 'Configuradas',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        color: '#8b5cf6'
      },
      {
        label: 'Sistema',
        value: '100%',
        subtitle: 'Operativo',
        icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        color: '#10b981'
      }
    ]
  }
  return []
})

const dashboardCards = computed(() => {
  const cards = []

  if (userRole.value === 'Cliente') {
    cards.push(
      {
        id: 'sucursales',
        title: 'Sucursales',
        description: 'Gestiona tus sucursales y ubicaciones',
        icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
        path: '/sucursales',
        color: '#3b82f6',
        featured: true,
        action: 'Gestionar sucursales',
        stats: [
          { value: sucursalesCount.value, label: 'Total' },
          { value: connectedCount.value, label: 'Conectadas' }
        ]
      },
      {
        id: 'musica',
        title: 'Mi Musica',
        description: 'Programa y gestiona tu catalogo musical',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        path: '/programaMusica',
        color: '#8b5cf6',
        featured: true,
        action: 'Programar musica'
      },
      {
        id: 'spots',
        title: 'Mis Spots',
        description: 'Biblioteca completa de spots comerciales',
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        path: '/bibliotecaSpot',
        color: '#f59e0b',
        stats: [
          { value: spotsCount.value, label: 'Spots' }
        ],
        action: 'Ver biblioteca'
      },
      {
        id: 'config',
        title: 'Configuracion',
        description: 'Configura tu cuenta y preferencias',
        icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        path: '/configuracion-cliente',
        color: '#64748b',
        action: 'Configurar'
      }
    )
  } else if (userRole.value === 'Administrador') {
    cards.push(
      {
        id: 'usuarios',
        title: 'Gestion de Usuarios',
        description: 'Administra usuarios y permisos del sistema',
        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
        path: '/usuarios',
        color: '#3b82f6',
        featured: true,
        action: 'Gestionar usuarios'
      },
      {
        id: 'radios',
        title: 'Radios',
        description: 'Gestiona las radios del sistema',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        path: '/radios',
        color: '#8b5cf6',
        featured: true,
        action: 'Ver radios'
      },
      {
        id: 'facturas',
        title: 'Recibos',
        description: 'Gestion de recibos del sistema',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        path: '/facturasAdmin',
        color: '#10b981',
        action: 'Ver facturas'
      }
    )
  } else if (userRole.value === 'Reproductor') {
    cards.push(
      {
        id: 'spots',
        title: 'Mis Spots',
        description: 'Accede a tu biblioteca completa de spots comerciales',
        icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
        path: '/bibliotecaSpot',
        color: '#8b5cf6',
        featured: true,
        stats: [
          { value: spotsCount.value, label: 'Spots disponibles' }
        ],
        action: 'Ir a biblioteca'
      }
    )
  }

  return cards
})

const quickActions = computed(() => {
  const actions = []

  if (userRole.value === 'Cliente') {
    actions.push(
      {
        id: 'programacion-spots',
        label: 'Programacion de Spots',
        path: '/bibliotecaSpot',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        id: 'cargar-spot',
        label: 'Cargar Spot',
        path: '/bibliotecaSpot',
        icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
      }
    )
  }

  return actions
})

const go = (path) => {
  router.push({ path })
}

const goToConfiguration = () => {
  router.push('/configuracion-cliente')
}

const dismissConfigAlert = () => {
  showConfigAlert.value = false
  localStorage.setItem('configAlertDismissed', Date.now().toString())
}

const handleCardClick = (card) => {
  if (card.path) {
    router.push(card.path)
  }
}

watch(connectedCount, (newCount, oldCount) => {
  console.log(`[Dashboard] Conexiones actualizadas: ${newCount} sucursales conectadas (antes: ${oldCount || 0})`)

  if (connectionMonitor) {
    const connected = connectionMonitor.getAllConnected()
    console.log('[Dashboard] Sucursales conectadas:', connected)
  }
})

const checkConfigurationStatus = async () => {
  if (userRole.value !== 'Cliente') return

  const dismissedTime = localStorage.getItem('configAlertDismissed')
  if (dismissedTime) {
    const hoursSinceDismissal = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60)
    if (hoursSinceDismissal < 24) {
      showConfigAlert.value = false
    }
  }

  try {
    configLoading.value = true
    configStatus.value = await configValidationService.checkConfigurationStatus()
    console.log('[Dashboard] Estado de configuracion:', configStatus.value)
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
    console.log('[Dashboard] Facturas pendientes:', pendingInvoices.value.length)
  } catch (error) {
    console.error('[Dashboard] Error cargando facturas pendientes:', error)
    pendingInvoices.value = []
  } finally {
    invoicesLoading.value = false
  }
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    console.log('[Dashboard] Cargando datos...')

    if (userRole.value === 'Cliente') {
      const [sucursales, spots] = await Promise.all([
        sucursalService.getcliSucursalByCliente().catch(error => {
          console.error('[Dashboard] Error obteniendo sucursales:', error)
          return []
        }),
        spotService.getSpotsBycodCliente().catch(error => {
          console.error('[Dashboard] Error obteniendo spots:', error)
          return []
        })
      ])

      sucursalesList.value = sucursales
      sucursalesCount.value = sucursales.length
      spotsCount.value = spots.length

      console.log(`[Dashboard] Datos cargados: ${sucursalesCount.value} sucursales, ${spotsCount.value} spots`)
      console.log(`[Dashboard] Sucursales conectadas: ${connectedCount.value}`)
    } else if (userRole.value === 'Administrador') {
      usersCount.value = 0
      radiosCount.value = 0
    } else if (userRole.value === 'Reproductor' || userRole.value === 'Usuario') {
      const spots = await spotService.getSpotsBycodCliente().catch(error => {
        console.error('[Dashboard] Error obteniendo spots:', error)
        return []
      })
      spotsCount.value = spots.length
    }

    console.log('[Dashboard] Datos cargados correctamente')
  } catch (error) {
    console.error('[Dashboard] Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  checkConfigurationStatus()
  loadDashboardData()
  loadPendingInvoices()

  console.log('[Dashboard] Dashboard inicializado con connection monitor')
  console.log('[Dashboard] El sistema de monitoreo de conexiones esta activo')
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
</style>
