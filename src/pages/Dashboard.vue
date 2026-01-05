<template>
  <div class="dashboard-container">
    <!-- SignalR Connection Status (only for Cliente role with sucursales) -->
    <SignalRStatus
      v-if="userRole === 'Cliente' && !loading"
      :connectedCount="connectedCount"
    />

    <!-- Loading State -->
    <loading-spinner v-if="loading" />

    <template v-else>
      <!-- Configuration Progress Alert - Only for Cliente -->
      <div v-if="userRole === 'Cliente' && !configLoading && configStatus && !configStatus.isComplete && showConfigAlert" class="config-alert">
        <div class="config-alert-content">
          <div class="config-alert-header">
            <div class="config-alert-icon">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
            <div class="config-alert-text">
              <h3 class="config-alert-title">Configuración Inicial Incompleta</h3>
              <p class="config-alert-description">
                Complete la configuración inicial para acceder a todas las funciones del sistema
              </p>
            </div>
          </div>

          <div class="config-progress-section">
            <div class="config-progress-header">
              <span class="config-progress-label">Progreso de Configuración</span>
              <span class="config-progress-percentage">{{ configProgress }}%</span>
            </div>
            <div class="config-progress-bar">
              <div class="config-progress-fill" :style="{ width: configProgress + '%' }"></div>
            </div>
            <div class="config-missing-items">
              <span class="config-missing-label">Pendiente:</span>
              <div class="config-missing-tags">
                <span v-for="item in missingConfigLabels" :key="item" class="config-missing-tag">
                  {{ item }}
                </span>
              </div>
            </div>
          </div>

          <div class="config-alert-actions">
            <button @click="goToConfiguration" class="config-btn-primary">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              Completar Configuración
            </button>
            <button @click="dismissConfigAlert" class="config-btn-secondary">
              Recordar más tarde
            </button>
          </div>
        </div>
      </div>

      <!-- Pending Invoices Alert - Only for Cliente -->
      <PendingInvoicesAlert
        v-if="userRole === 'Cliente' && !invoicesLoading && pendingInvoices.length > 0"
        :invoices="pendingInvoices"
        :maxDisplay="3"
        @dismiss="pendingInvoices = []"
      />

      <!-- Welcome Header -->
      <div class="welcome-header">
        <div class="welcome-content">
          <h1 class="welcome-title">
            Bienvenido, <span class="welcome-name">{{ currentUser?.Nombre || 'Usuario' }}</span>
          </h1>
          <p class="welcome-subtitle">
            {{ getWelcomeMessage() }}
          </p>
        </div>
        <div class="welcome-badge">
          <span class="role-badge" :class="getRoleBadgeClass()">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getRoleIcon()"></path>
            </svg>
            {{ userRole }}
          </span>
        </div>
      </div>

      <!-- Stats Cards Row -->
      <div v-if="showStats" class="stats-grid">
        <div v-for="stat in statsCards" :key="stat.label" class="stat-card" :style="{ '--accent-color': stat.color }">
          <div class="stat-icon">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon"></path>
            </svg>
          </div>
          <div class="stat-content">
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-value">{{ stat.value }}</p>
            <p v-if="stat.subtitle" class="stat-subtitle">{{ stat.subtitle }}</p>
          </div>
        </div>
      </div>

      <!-- Main Interactive Cards Grid -->
      <div class="cards-grid">
        <div
          v-for="card in dashboardCards"
          :key="card.id"
          @click="handleCardClick(card)"
          class="interactive-card"
          :class="card.featured ? 'featured-card' : ''"
          :style="{ '--card-color': card.color }"
        >
          <div class="card-glow"></div>
          <div class="card-content">
            <div class="card-header">
              <div class="card-icon">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="card.icon"></path>
                </svg>
              </div>
              <div class="card-badge" v-if="card.badge">
                <span>{{ card.badge }}</span>
              </div>
            </div>

            <div class="card-body">
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-description">{{ card.description }}</p>

              <div v-if="card.stats" class="card-stats">
                <div v-for="(stat, idx) in card.stats" :key="idx" class="card-stat-item">
                  <span class="card-stat-value">{{ stat.value }}</span>
                  <span class="card-stat-label">{{ stat.label }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <span class="card-action">
                {{ card.action || 'Ir a módulo' }}
                <svg class="w-4 h-4 ml-2 card-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Pills (Additional Links) -->
      <div v-if="quickActions.length > 0" class="quick-actions">
        <h3 class="quick-actions-title">Acciones Rápidas</h3>
        <div class="quick-actions-grid">
          <button
            v-for="action in quickActions"
            :key="action.id"
            @click="go(action.path)"
            class="quick-action-pill"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.icon"></path>
            </svg>
            <span>{{ action.label }}</span>
          </button>
        </div>
      </div>
    </template>
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
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import SignalRStatus from '@/components/SignalRStatus.vue'
import PendingInvoicesAlert from '@/components/PendingInvoicesAlert.vue'

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

// Usar el nuevo sistema de monitoreo de conexiones
const connectionMonitor = useConnectionMonitor()
const {
  sucursalesConnected,
  connectedCount
} = useSucursal({
  enableRealtime: true,
  enableConnectionMonitor: true
})

// Configuration status
const configLoading = ref(false)
const configStatus = ref(null)
const showConfigAlert = ref(true)

// Pending invoices
const pendingInvoices = ref([])
const invoicesLoading = ref(false)

// Instancia de SignalR
const signalR = useSignalRAuth()
const { getCachedEvent } = signalR

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

// Welcome messages by role
const getWelcomeMessage = () => {
  const messages = {
    'Administrador': 'Panel de administración completo del sistema',
    'Cliente': 'Gestiona tu música, spots y sucursales desde un solo lugar',
    'Reproductor': 'Accede a tu biblioteca de spots',
    'Usuario': 'Gestiona tus spots comerciales'
  }
  return messages[userRole.value] || 'Bienvenido al sistema'
}

// Role badge styling
const getRoleBadgeClass = () => {
  const classes = {
    'Administrador': 'badge-admin',
    'Cliente': 'badge-cliente',
    'Reproductor': 'badge-reproductor',
    'Usuario': 'badge-usuario'
  }
  return classes[userRole.value] || ''
}

// Role icon
const getRoleIcon = () => {
  const icons = {
    'Administrador': 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    'Cliente': 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    'Reproductor': 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
    'Usuario': 'M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
  }
  return icons[userRole.value] || icons['Usuario']
}

// Show stats for certain roles
const showStats = computed(() => {
  return ['Cliente', 'Administrador'].includes(userRole.value)
})

// Stats cards based on role
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
        subtitle: 'En línea ahora',
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

// Dashboard cards by role
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
        title: 'Mi Música',
        description: 'Programa y gestiona tu catálogo musical',
        icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
        path: '/programaMusica',
        color: '#8b5cf6',
        featured: true,
        action: 'Programar música'
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
        title: 'Configuración',
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
        title: 'Gestión de Usuarios',
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
        description: 'Gestión de recibos del sistema',
        icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        path: '/facturasAdmin',
        color: '#10b981',
        action: 'Ver facturas'
      }
    )
  } else if (userRole.value === 'Reproductor' || userRole.value === 'Usuario') {
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

// Quick actions (secondary links)
const quickActions = computed(() => {
  const actions = []

  if (userRole.value === 'Cliente') {
    actions.push(
      {
        id: 'programacion-spots',
        label: 'Programación de Spots',
        path: '/programacionSpot',
        icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      },
      {
        id: 'cargar-spot',
        label: 'Cargar Spot',
        path: '/cargarSpot',
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

// Watcher para monitorear cambios en las conexiones
watch(connectedCount, (newCount, oldCount) => {
  console.log(`[Dashboard] 📊 Conexiones actualizadas: ${newCount} sucursales conectadas (antes: ${oldCount || 0})`)

  // Log detallado de las sucursales conectadas
  if (connectionMonitor) {
    const connected = connectionMonitor.getAllConnected()
    console.log('[Dashboard] 🏢 Sucursales conectadas:', connected)
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
    console.log('[Dashboard] 📋 Estado de configuración:', configStatus.value)
  } catch (error) {
    console.error('[Dashboard] Error verificando configuración:', error)
  } finally {
    configLoading.value = false
  }
}

const loadPendingInvoices = async () => {
  if (userRole.value !== 'Cliente') return

  try {
    invoicesLoading.value = true
    // Cargar todas las facturas del cliente usando el store
    const facturas = await facturasStore.loadUltimaFactura()
    // Filtrar solo las facturas pendientes (P) o vencidas por fecha
    if (Array.isArray(facturas)) {
      pendingInvoices.value = facturas.filter(f => f.fac_estado === 'P' || f.fac_estado === 'V')
    } else {
      pendingInvoices.value = []
    }
    console.log('[Dashboard] 💰 Facturas pendientes:', pendingInvoices.value.length)
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
    console.log('[Dashboard] 🔄 Cargando datos...')

    // Load data based on role
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

      // El connection monitor maneja automáticamente el estado de conexiones
      console.log(`[Dashboard] ✅ Datos cargados: ${sucursalesCount.value} sucursales, ${spotsCount.value} spots`)
      console.log(`[Dashboard] 🔌 Sucursales conectadas: ${connectedCount.value}`)
    } else if (userRole.value === 'Administrador') {
      // Load admin-specific data
      usersCount.value = 0 // TODO: Load from service
      radiosCount.value = 0 // TODO: Load from service
    } else if (userRole.value === 'Reproductor' || userRole.value === 'Usuario') {
      const spots = await spotService.getSpotsBycodCliente().catch(error => {
        console.error('[Dashboard] Error obteniendo spots:', error)
        return []
      })
      spotsCount.value = spots.length
    }

    console.log('[Dashboard] ✅ Datos cargados correctamente')
  } catch (error) {
    console.error('[Dashboard] ❌ Error cargando datos:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  checkConfigurationStatus()
  loadDashboardData()
  loadPendingInvoices()

  console.log('[Dashboard] ✅ Dashboard inicializado con connection monitor')
  console.log('[Dashboard] 📊 El sistema de monitoreo de conexiones está activo')
})

onUnmounted(() => {
  console.log('[Dashboard] 🧹 Dashboard desmontado')
})
</script>

<style scoped>
/* ===== DASHBOARD CONTAINER ===== */
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== CONFIGURATION ALERT ===== */
.config-alert {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.1);
  animation: slideDown 0.4s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-alert-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-alert-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.config-alert-icon {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f59e0b;
}

.config-alert-text {
  flex: 1;
}

.config-alert-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.config-alert-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.config-progress-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 0.5rem;
  border: 1px solid rgba(251, 191, 36, 0.15);
}

.config-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-progress-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.config-progress-percentage {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f59e0b;
}

.config-progress-bar {
  height: 0.75rem;
  background: rgba(209, 213, 219, 0.5);
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}

.config-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 9999px;
  transition: width 0.5s ease-in-out;
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.4);
}

.config-missing-items {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.config-missing-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6b7280;
}

.config-missing-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.config-missing-tag {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #d97706;
}

.config-alert-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.config-btn-primary,
.config-btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: none;
}

.config-btn-primary {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.config-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(251, 191, 36, 0.4);
}

.config-btn-secondary {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.config-btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  color: #374151;
}

/* ===== WELCOME HEADER ===== */
.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  backdrop-filter: blur(20px);
  animation: slideInLeft 0.6s ease-out;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.welcome-content {
  flex: 1;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  line-height: 1.2;
}

.welcome-name {
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.welcome-badge {
  display: flex;
  align-items: center;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
}

.badge-admin {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.badge-cliente {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-reproductor {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.1) 100%);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.badge-usuario {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

/* ===== STATS GRID ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: var(--accent-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15), 0 0 0 1px var(--accent-color);
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-color));
  opacity: 0.2;
  border-radius: 0.875rem;
  flex-shrink: 0;
}

.stat-icon svg {
  color: var(--accent-color);
  opacity: 1;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0 0 0.375rem 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.stat-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin: 0.375rem 0 0 0;
}

/* ===== INTERACTIVE CARDS GRID ===== */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
  animation: fadeInUp 0.6s ease-out 0.4s both;
}

.interactive-card {
  position: relative;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  padding: 1.75rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.interactive-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--card-color), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.interactive-card:hover::before {
  opacity: 0.05;
}

.interactive-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: var(--card-color);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px var(--card-color),
    0 0 30px rgba(var(--card-color), 0.3);
}

.featured-card {
  grid-column: span 1;
}

@media (min-width: 1024px) {
  .featured-card {
    grid-column: span 2;
  }
}

.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, var(--card-color) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.6s ease;
  pointer-events: none;
}

.interactive-card:hover .card-glow {
  opacity: 0.08;
}

.card-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--card-color), var(--card-color));
  opacity: 0.15;
  border-radius: 1rem;
  color: var(--card-color);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.interactive-card:hover .card-icon {
  opacity: 0.25;
  transform: scale(1.1) rotate(5deg);
}

.card-icon svg {
  opacity: 1;
}

.card-badge {
  padding: 0.375rem 0.875rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--card-color);
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  transition: color 0.3s ease;
}

.interactive-card:hover .card-title {
  color: var(--card-color);
}

.card-description {
  font-size: 0.9375rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

.card-stats {
  display: flex;
  gap: 2rem;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card-stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.card-stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--card-color);
  line-height: 1;
}

.card-stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
}

.card-footer {
  display: flex;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.card-action {
  display: flex;
  align-items: center;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--card-color);
  transition: all 0.3s ease;
}

.interactive-card:hover .card-action {
  transform: translateX(4px);
}

.card-arrow {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.interactive-card:hover .card-arrow {
  transform: translateX(4px);
}

/* ===== QUICK ACTIONS ===== */
.quick-actions {
  animation: fadeInUp 0.6s ease-out 0.6s both;
}

.quick-actions-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1.25rem 0;
}

.quick-actions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.quick-action-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1.25rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.quick-action-pill:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(59, 130, 246, 0.5);
  color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.quick-action-pill svg {
  transition: transform 0.3s ease;
}

.quick-action-pill:hover svg {
  transform: scale(1.1);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .welcome-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }

  .welcome-title {
    font-size: 1.75rem;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .featured-card {
    grid-column: span 1;
  }
}

@media (max-width: 640px) {
  .dashboard-container {
    gap: 1.5rem;
  }

  .welcome-header {
    padding: 1.5rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .cards-grid {
    gap: 1rem;
  }

  .interactive-card {
    padding: 1.25rem;
  }

  .config-alert {
    padding: 1rem;
  }
}
</style>
