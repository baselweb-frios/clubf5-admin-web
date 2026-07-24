<template>
  <div class="min-h-screen bg-dark-primary">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed left-0 top-0 h-screen z-fixed',
        'bg-dark-secondary border-r border-dark-border',
        'flex flex-col transition-all duration-300 ease-apple',
        'shadow-lg shadow-black/20',
        sidebarOpen ? 'w-64' : 'w-20',
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center px-4 border-b border-dark-border">
        <router-link
          to="/"
          class="flex items-center gap-3 group"
        >
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex-center flex-shrink-0 shadow-lg shadow-primary-500/30 group-hover:shadow-primary-500/50 transition-shadow duration-300">
            <span class="text-lg font-bold text-white">C5</span>
          </div>
          <span
            :class="[
              'font-semibold text-text-primary whitespace-nowrap transition-all duration-200',
              sidebarOpen ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden'
            ]"
          >
            Club F5
          </span>
        </router-link>
      </div>

      <!-- Sidebar Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-dark-hover scrollbar-track-transparent">
        <router-link
          v-for="link in sidebarLinks"
          :key="link.name"
          :to="link.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
            'text-sm font-medium',
            isActiveRoute(link.path)
              ? 'bg-primary-500/10 text-primary-400 shadow-inner shadow-primary-500/5'
              : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary hover:shadow-sm hover:shadow-black/10'
          ]"
        >
          <span class="w-5 h-5 flex-center flex-shrink-0">
            <i :class="[getIconClass(link.icon), 'text-base']"></i>
          </span>
          <span
            :class="[
              'whitespace-nowrap transition-all duration-200',
              sidebarOpen ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden'
            ]"
          >
            {{ link.name }}
          </span>
          <!-- Active indicator -->
          <span
            v-if="isActiveRoute(link.path)"
            class="ml-auto w-1 h-5 rounded-full bg-primary-400"
          ></span>
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-dark-border">
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'text-sm font-medium text-text-secondary',
            'hover:bg-danger-500/10 hover:text-danger-400 transition-all duration-200',
            'group'
          ]"
          @click="logout"
        >
          <i class="fa-solid fa-right-from-bracket w-5 h-5 flex-center flex-shrink-0 text-base"></i>
          <span
            :class="[
              'whitespace-nowrap transition-all duration-200',
              sidebarOpen ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 overflow-hidden'
            ]"
          >
            Cerrar sesion
          </span>
        </button>
      </div>
    </aside>

    <!-- Main Wrapper -->
    <div
      :class="[
        'min-h-screen transition-all duration-300',
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20',
        isMobile ? 'ml-0' : ''
      ]"
    >
      <!-- Topbar -->
      <header class="sticky top-0 z-sticky h-16 bg-dark-secondary/80 backdrop-blur-xl border-b border-dark-border shadow-sm shadow-black/10">
        <div class="h-full px-4 flex-between">
          <!-- Left: Menu Toggle -->
          <button
            class="btn btn-ghost btn-icon hover:bg-dark-hover rounded-lg transition-all duration-200"
            @click="toggleSidebar"
          >
            <i class="fa-solid fa-bars text-xl text-text-secondary"></i>
          </button>

          <!-- Right: User Menu -->
          <div class="relative">
            <button
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-hover transition-all duration-200 group"
              @click.stop="toggleUserMenu"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex-center shadow-md shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow duration-300">
                <span class="text-sm font-medium text-white">{{ userInitials }}</span>
              </div>
              <span class="hidden sm:block text-sm font-medium text-text-primary">
                {{ currentUser?.Nombre || 'Usuario' }}
              </span>
              <i
                :class="[
                  'fa-solid fa-chevron-down text-xs text-text-tertiary transition-transform duration-200',
                  showUserMenu ? 'rotate-180' : ''
                ]"
              ></i>
            </button>

            <!-- Dropdown -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95 translate-y-[-4px]"
              enter-to-class="opacity-100 scale-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100 translate-y-0"
              leave-to-class="opacity-0 scale-95 translate-y-[-4px]"
            >
              <div
                v-if="showUserMenu"
                v-click-outside="closeUserMenu"
                class="absolute right-0 mt-2 w-52 bg-dark-elevated rounded-xl border border-dark-border shadow-xl shadow-black/30 overflow-hidden"
              >
                <button
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-dark-hover hover:text-text-primary transition-colors"
                  @click="openProfileModal"
                >
                  <i class="fa-solid fa-user w-4 h-4 flex-center"></i>
                  Perfil
                </button>
                <router-link
                  v-if="currentUser?.role === 'Cliente'"
                  to="/configuracion-cliente"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-dark-hover hover:text-text-primary transition-colors"
                  @click="closeUserMenu"
                >
                  <i class="fa-solid fa-gear w-4 h-4 flex-center"></i>
                  Configuracion
                </router-link>
                <div class="border-t border-dark-border" />
                <button
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger-400 hover:bg-danger-500/10 transition-colors"
                  @click="logout"
                >
                  <i class="fa-solid fa-right-from-bracket w-4 h-4 flex-center"></i>
                  Cerrar sesion
                </button>
              </div>
            </transition>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="min-h-[calc(100vh-4rem)]">
        <router-view />
      </main>

      <!-- Footer -->
      <footer class="py-4 px-6 border-t border-dark-border bg-dark-secondary/50">
        <div class="flex-between flex-wrap gap-4 text-sm text-text-tertiary">
          <p class="flex items-center gap-2">
            <i class="fa-regular fa-copyright text-xs"></i>
            2024 Club F5. Todos los derechos reservados.
          </p>
          <p class="flex items-center gap-2">
            <i class="fa-solid fa-code-branch text-xs"></i>
            v{{ appVersion }}
          </p>
        </div>
      </footer>
    </div>

    <!-- Mobile Overlay -->
    <transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="sidebarOpen && isMobile"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        @click="closeSidebar"
      />
    </transition>

    <!-- Profile Modal -->
    <ProfileModal
      :is-open="showProfileModal"
      @close="closeProfileModal"
      @updated="handleProfileUpdated"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ProfileModal from '@/components/ProfileModal.vue'
import { useSignalRAuth } from '@/composables/useSignalRAuth'

const appVersion = __APP_VERSION__

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const signalR = useSignalRAuth()

const sidebarOpen = ref(true)
const showUserMenu = ref(false)
const showProfileModal = ref(false)
const isMobile = ref(false)

// Observar cambios en autenticación para desconectar SignalR
watch(
  () => authStore.isAuthenticated,
  async (isAuthenticated) => {
    if (!isAuthenticated && signalR.isConnected.value) {
      try {
        await signalR.disconnect()
        console.log('[SignalR] Desconectado por cambio de autenticación')
      } catch (error) {
        console.warn('[SignalR] Error al desconectar por auth:', error)
      }
    }
  }
)

// Font Awesome icon mapping
const iconMap = {
  'chart-pie-36': 'fa-solid fa-chart-pie',
  'building': 'fa-solid fa-building',
  'music': 'fa-solid fa-music',
  'bullhorn': 'fa-solid fa-bullhorn',
  'file-invoice': 'fa-solid fa-file-invoice',
  'users': 'fa-solid fa-users',
  'cog': 'fa-solid fa-gear',
  'document': 'fa-solid fa-file-lines',
  'list-alt': 'fa-solid fa-list',
  'web-editor': 'fa-solid fa-pen-ruler',
  'folder-tree': 'fa-solid fa-folder-tree',
  'lab-email': 'fa fa-flask',
  'log-bug': 'fa-solid fa-bug',
  'gear': 'fa-solid fa-gear',
  'credit-card': 'fa-solid fa-credit-card'
}

const getIconClass = (iconName) => iconMap[iconName] || 'fa-solid fa-file'

const sidebarLinks = computed(() => {
  const userRole = currentUser.value?.role
  const links = []

  links.push({ name: 'Inicio', icon: 'chart-pie-36', path: '/dashboard' })

  if (userRole === 'Cliente') {
    links.push({ name: 'Sucursales', icon: 'building', path: '/sucursales' })
    links.push({ name: 'Mi Musica', icon: 'music', path: '/programaMusica' })
    links.push({ name: 'Mis Recibos', icon: 'file-invoice', path: '/facturas' })
    links.push({ name: 'Mis Spots', icon: 'bullhorn', path: '/bibliotecaSpot' })
    links.push({ name: 'Mi Plan', icon: 'credit-card', path: '/mi-plan' })
  }

  if (userRole === 'Reproductor') {
    links.push({ name: 'Mis spots', icon: 'bullhorn', path: '/bibliotecaSpot' })
  }

  if (userRole === 'Administrador') {
    links.push({ name: 'Gestion de Usuarios', icon: 'users', path: '/usuarios' })
    links.push({ name: 'Radios', icon: 'music', path: '/radios' })
    links.push({ name: 'Recibos', icon: 'document', path: '/facturasAdmin' })
    links.push({ name: 'Paquetes y Precios', icon: 'list-alt', path: '/paquetes' })
    links.push({ name: 'Locutores (Voces IA)', icon: 'cog', path: '/voces-elevenlabs' })
    links.push({ name: 'Editor de pagina', icon: 'web-editor', path: '/landing-editor' })
    links.push({ name: 'Sistema de archivos (OBS)', icon: 'folder-tree', path: '/obs-api-console' })
    links.push({ name: 'Laboratorio Email', icon: 'lab-email', path: '/email-test' })
    links.push({ name: 'Logs', icon: 'log-bug', path: '/event-log' })
  }

  return links
})

const currentUser = computed(() => authStore.user)

const userInitials = computed(() => {
  const name = currentUser.value?.Nombre || 'Usuario'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
})

const isActiveRoute = (path) => {
  return route.path === path || route.path.startsWith(path + '/')
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen.value))
}

const closeSidebar = () => {
  sidebarOpen.value = false
  localStorage.setItem('sidebarOpen', JSON.stringify(false))
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const logout = async () => {
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
  console.log('Profile updated')
}

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(async () => {
  checkMobile()

  if (!isMobile.value) {
    const savedState = localStorage.getItem('sidebarOpen')
    if (savedState !== null) {
      sidebarOpen.value = JSON.parse(savedState)
    }
  }

  window.addEventListener('resize', checkMobile)

  try {
    await signalR.connect()
    console.log('SignalR inicializado correctamente')
  } catch (error) {
    console.error('Error al inicializar SignalR:', error)
  }
})

onBeforeUnmount(async () => {
  window.removeEventListener('resize', checkMobile)

  try {
    await signalR.disconnect()
  } catch (error) {
    if (!error.message || !error.message.includes('connection being closed')) {
      console.error('Error al detener SignalR:', error)
    }
  }
})

const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
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
/* Custom scrollbar styles */
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>