<template>
  <div class="dashboard-layout">
    <!-- Sidebar -->
    <aside :class="sidebarClasses" class="sidebar">
      <div class="sidebar-header">
        <router-link to="/" class="flex items-center space-x-2">
          <div class="logo-icon">
            <span>C5</span>
          </div>
          <span class="logo-text">Club F5</span>
        </router-link>
      </div>

      <nav class="sidebar-nav">
        <sidebar-link
          v-for="link in sidebarLinks"
          :key="link.name"
          :to="link.path"
          :icon="link.icon"
          :active="isActiveRoute(link.path)"
        >
          {{ link.name }}
        </sidebar-link>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': !sidebarOpen }">
      <!-- Top navbar -->
      <header class="topbar">
        <button @click="toggleSidebar" class="menu-toggle">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>

        <div class="topbar-actions">
          <!-- User menu -->
          <div class="user-menu-wrapper">
            <button @click.stop="toggleUserMenu" class="user-menu-button">
              <div class="user-avatar">
                <span>{{ userInitials }}</span>
              </div>
              <span class="user-name">{{ currentUser?.Nombre || 'Usuario' }}</span>
              <i class="fas fa-chevron-down dropdown-icon" :class="{ 'rotate-180': showUserMenu }"></i>
            </button>

            <!-- Dropdown menu -->
            <transition name="dropdown">
              <div v-if="showUserMenu" v-click-outside="closeUserMenu" class="dropdown-menu" @click.stop>
                <button @click="openProfileModal" class="dropdown-item">
                  <i class="fas fa-user"></i>
                  Perfil
                </button>
                <router-link to="/configuracion-cliente" v-if="currentUser?.role === 'Cliente'" class="dropdown-item" >
                  <i class="fas fa-cog"></i>
                  Configuración
                </router-link>
                <button @click="logout" class="dropdown-item">
                  <i class="fas fa-sign-out-alt"></i>
                  Cerrar sesión
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="main-content">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="footer">
        <content-footer />
      </footer>
    </div>

    <!-- Sidebar overlay for mobile -->
    <transition name="fade">
      <div v-if="sidebarOpen && isMobile" @click="closeSidebar" class="sidebar-overlay"></div>
    </transition>

    <!-- Profile Modal -->
    <ProfileModal
      :isOpen="showProfileModal"
      @close="closeProfileModal"
      @updated="handleProfileUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SidebarLink from '@/components/layout/SidebarLink.vue'
import ContentFooter from '@/components/layout/ContentFooter.vue'
import ProfileModal from '@/components/ProfileModal.vue'
import { useSignalRAuth } from '@/composables/useSignalRAuth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// SignalR
const signalR = useSignalRAuth()

const sidebarOpen = ref(true)
const showUserMenu = ref(false)
const showProfileModal = ref(false)
const isMobile = ref(false)

// Links del sidebar - computados para filtrar por rol
const sidebarLinks = computed(() => {
  const userRole = currentUser.value?.role
  const links = []

  // Dashboard - Todos los roles
  links.push({
    name: 'Dashboard',
    icon: 'chart-pie-36',
    path: '/dashboard'
  })

  // Sucursales - Solo Cliente y Administrador
  if (userRole === 'Cliente') {
    links.push({
      name: 'Sucursales',
      icon: 'building',
      path: '/sucursales'
    })
  }

  // Configuración - Solo Cliente y Administrador
  

  // Mi música - Solo Cliente
  if (userRole === 'Cliente') {
    links.push({
      name: 'Mi música',
      icon: 'music',
      path: '/programaMusica'
    })
  }

  // Facturas - Solo Cliente
  if (userRole === 'Cliente') {
    links.push({
      name: 'Mis Recibos',
      icon: 'file-invoice',
      path: '/facturas'
    })
  }

  // Mis spots - Todos: Cliente, Usuario, Administrador
  if (userRole === 'Cliente' || userRole == 'Reproductor') {
    links.push({
      name: 'Mis spots',
      icon: 'bullhorn',
      path: '/bibliotecaSpot'
    })
  }
 

  // Gestión de Usuarios - Solo Cliente y Administrador
  if (userRole === 'Administrador') {
    links.push({
      name: 'Gestión de Usuarios',
      icon: 'users',
      path: '/usuarios'
    },
    {
    path: '/radios',
    name: 'Radios',
    icon: 'music',
    },
    {
    path: '/facturasAdmin',
    name: 'Recibos',
    icon: 'document',
    },
    {
    path: '/event-logs',
    name: 'Monitor de Eventos',
    icon: 'cog',
    },
    {
    path: '/paquetes',
    name: 'Paquetes y Precios',
    icon: 'list-alt',
    }
  )
  }

  return links
})

const currentUser = computed(() => authStore.user)

const userInitials = computed(() => {
  const name = currentUser.value?.Nombre || 'Usuario'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const sidebarClasses = computed(() => {
  return {
    'collapsed': !sidebarOpen.value
  }
})

const isActiveRoute = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  // Guardar estado en localStorage
  localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen.value))
}

const closeSidebar = () => {
  sidebarOpen.value = false
  localStorage.setItem('sidebarOpen', JSON.stringify(false))
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  console.log('Toggle user menu:', showUserMenu.value)
}

const closeUserMenu = () => {
  showUserMenu.value = false
  console.log('Close user menu')
}

const logout = async () => {
  console.log('Logout clicked')
  closeUserMenu()
  await authStore.logout()
  router.push('/login')
}

const openProfileModal = () => {
  showProfileModal.value = true
  closeUserMenu()
}

const closeProfileModal = () => {
  showProfileModal.value = false
}

const handleProfileUpdated = () => {
  // Aquí puedes recargar datos del usuario si es necesario
  console.log('Profile updated')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024

  // En móvil, cerrar sidebar por defecto
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(async () => {
  // Inicializar
  checkMobile()

  // Si es desktop, verificar estado guardado
  if (!isMobile.value) {
    const savedState = localStorage.getItem('sidebarOpen')
    if (savedState !== null) {
      sidebarOpen.value = JSON.parse(savedState)
    }
  }

  // Escuchar cambios de tamaño
  window.addEventListener('resize', checkMobile)

  // Inicializar SignalR para toda la aplicacion
  try {
    await signalR.connect()
    console.log('SignalR inicializado correctamente en DashboardLayout')
  } catch (error) {
    console.error('Error al inicializar SignalR:', error)
  }
})

onBeforeUnmount(async () => {
  window.removeEventListener('resize', checkMobile)

  // Detener SignalR al desmontar
  try {
    await signalR.disconnect()
    console.log('SignalR detenido correctamente')
  } catch (error) {
    // Suppress connection already closed errors during cleanup
    if (!error.message || !error.message.includes('connection being closed')) {
      console.error('Error al detener SignalR:', error)
    }
  }
})

// Click outside directive
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      // Delay para permitir que el toggle se ejecute primero
      setTimeout(() => {
        if (!(el === event.target || el.contains(event.target))) {
          binding.value(event)
        }
      }, 10)
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
}
</script>

<style scoped>
/* ===== PREMIUM APPLE-STYLE DASHBOARD ===== */
.dashboard-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%);
  color: var(--text-primary);
  display: flex;
  position: relative;
  overflow: hidden;
}

/* Animated Background Pattern */
.dashboard-layout::before {
  content: '';
  position: fixed;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.06) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* ===== PREMIUM SIDEBAR ===== */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 16rem;
  background: rgba(17, 17, 17, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 50;
  display: flex;
  flex-direction: column;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.sidebar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
  pointer-events: none;
}

.sidebar.collapsed {
  transform: translateX(-16rem);
}

/* Sidebar Header */
.sidebar-header {
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  position: relative;
  z-index: 1;
}

.sidebar-header a {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  width: 2.5rem;
  height: 2.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 10px 20px -5px rgba(59, 130, 246, 0.4);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-icon:hover {
  transform: scale(1.05) rotate(-5deg);
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.2),
    0 15px 30px -5px rgba(59, 130, 246, 0.6);
}

.logo-text {
  color: var(--text-primary);
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #ffffff 0%, #a1a1aa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Sidebar Navigation */
.sidebar-nav {
  padding: 1.5rem 0.75rem;
  flex: 1;
  overflow-y: auto;
  position: relative;
  z-index: 9999999;
}

/* Scrollbar estilo premium */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.5));
  border-radius: 3px;
  transition: background 0.3s ease;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.5), rgba(37, 99, 235, 0.7));
}

/* ===== MAIN WRAPPER ===== */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 16rem;
  transition: margin-left 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
}

.main-wrapper.sidebar-collapsed {
  margin-left: 0;
}

/* ===== PREMIUM TOPBAR ===== */
.topbar {
  height: 4.5rem;
  background: rgba(17, 17, 17, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.05);
}

.menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.menu-toggle:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.12);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.menu-toggle:active {
  transform: translateY(0);
}

.menu-toggle svg {
  width: 1.5rem;
  height: 1.5rem;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
}

/* ===== PREMIUM USER MENU ===== */
.user-menu-wrapper {
  position: relative;
}

.user-menu-button {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.user-menu-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.user-menu-button:active {
  transform: translateY(0);
}

.user-avatar {
  width: 2.25rem;
  height: 2.25rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.75rem;
  flex-shrink: 0;
  box-shadow: 
    0 0 0 2px rgba(255, 255, 255, 0.05),
    0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.user-menu-button:hover .user-avatar {
  box-shadow: 
    0 0 0 2px rgba(255, 255, 255, 0.1),
    0 8px 20px rgba(59, 130, 246, 0.5);
  transform: scale(1.05);
}

.user-name {
  color: var(--text-primary);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.dropdown-icon {
  font-size: 0.75rem;
  color: var(--text-secondary);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-left: 0.25rem;
}

.dropdown-icon.rotate-180 {
  transform: rotate(180deg);
  color: var(--text-primary);
}

/* Premium Dropdown Menu */
.dropdown-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.75rem);
  min-width: 13rem;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 1rem;
  padding: 0.5rem;
  box-shadow: 
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 20px 40px -10px rgba(0, 0, 0, 0.6),
    0 0 30px rgba(59, 130, 246, 0.2);
  z-index: 9999;
  animation: slideInDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  padding: 0.75rem 0.875rem;
  background: transparent;
  border: none;
  border-radius: 0.625rem;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  letter-spacing: -0.01em;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  transform: translateX(4px);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08);
}

.dropdown-item:active {
  transform: translateX(2px);
}

.dropdown-item i {
  width: 1.125rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.dropdown-item:hover i {
  transform: scale(1.1);
}

/* Logout button destacado */
.dropdown-item:last-child {
  margin-top: 0.375rem;
  padding-top: 0.875rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.dropdown-item:last-child:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

.dropdown-item:last-child:hover i {
  color: #f87171;
  transform: scale(1.1) rotate(-5deg);
}

/* ===== MAIN CONTENT ===== */
.main-content {
  flex: 1;
  padding: 2.5rem 2rem;
  max-width: 100rem;
  width: 100%;
  margin: 0 auto;
}

/* ===== PREMIUM FOOTER ===== */
.footer {
  background: rgba(17, 17, 17, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: 1.75rem 2rem;
  box-shadow: 0 -1px 0 0 rgba(255, 255, 255, 0.05);
}

/* ===== OVERLAY ===== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 40;
}

/* ===== PREMIUM ANIMATIONS ===== */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .main-wrapper {
    margin-left: 0;
  }

  .user-name {
    display: none;
  }
  
  .topbar {
    padding: 0 1.5rem;
  }
}

@media (max-width: 640px) {
  .main-content {
    padding: 1.5rem 1rem;
  }

  .topbar {
    padding: 0 1rem;
    height: 4rem;
  }
  
  .footer {
    padding: 1.25rem 1rem;
  }
}

/* ===== MICRO-INTERACTIONS ===== */
@keyframes pulse-subtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.9;
  }
}

/* Efecto de resplandor suave en hover */
.user-menu-button:hover,
.menu-toggle:hover {
  animation: pulse-subtle 2s ease-in-out infinite;
}
</style>
