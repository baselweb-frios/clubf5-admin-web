<template>
  <div class="min-h-screen bg-dark-primary">
    <!-- Sidebar -->
    <aside
      :class="[
        'fixed left-0 top-0 h-screen z-fixed',
        'bg-dark-secondary border-r border-dark-border',
        'flex flex-col transition-all duration-300 ease-apple',
        sidebarOpen ? 'w-64' : 'w-20',
        isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
      ]"
    >
      <!-- Sidebar Header -->
      <div class="h-16 flex items-center px-4 border-b border-dark-border">
        <router-link
to="/"
class="flex items-center gap-3"
>
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-purple flex-center flex-shrink-0">
            <span class="text-lg font-bold text-white">C5</span>
          </div>
          <span
            :class="[
              'font-semibold text-text-primary whitespace-nowrap transition-opacity duration-200',
              sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            ]"
          >
            Club F5
          </span>
        </router-link>
      </div>

      <!-- Sidebar Nav -->
      <nav class="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <router-link
          v-for="link in sidebarLinks"
          :key="link.name"
          :to="link.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
            'text-sm font-medium',
            isActiveRoute(link.path)
              ? 'bg-primary-500/10 text-primary-400'
              : 'text-text-secondary hover:bg-dark-hover hover:text-text-primary'
          ]"
        >
          <span class="w-5 h-5 flex-center flex-shrink-0">
            <component
:is="getIcon(link.icon)"
class="w-5 h-5"
/>
          </span>
          <span
            :class="[
              'whitespace-nowrap transition-opacity duration-200',
              sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
            ]"
          >
            {{ link.name }}
          </span>
        </router-link>
      </nav>

      <!-- Sidebar Footer -->
      <div class="p-3 border-t border-dark-border">
        <button
          :class="[
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
            'text-sm font-medium text-text-secondary',
            'hover:bg-danger-500/10 hover:text-danger-400 transition-all duration-200'
          ]"
          @click="logout"
        >
          <svg
class="w-5 h-5 flex-shrink-0"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
            <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
/>
          </svg>
          <span
            :class="[
              'whitespace-nowrap transition-opacity duration-200',
              sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
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
      <header class="sticky top-0 z-sticky h-16 bg-dark-secondary/80 backdrop-blur-xl border-b border-dark-border">
        <div class="h-full px-4 flex-between">
          <!-- Left: Menu Toggle -->
          <button
            class="btn btn-ghost btn-icon"
            @click="toggleSidebar"
          >
            <svg
class="w-6 h-6"
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
              <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M4 6h16M4 12h16M4 18h16"
/>
            </svg>
          </button>

          <!-- Right: User Menu -->
          <div class="relative">
            <button
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-dark-hover transition-colors"
              @click.stop="toggleUserMenu"
            >
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-purple flex-center">
                <span class="text-sm font-medium text-white">{{ userInitials }}</span>
              </div>
              <span class="hidden sm:block text-sm font-medium text-text-primary">
                {{ currentUser?.Nombre || 'Usuario' }}
              </span>
              <svg
                :class="['w-4 h-4 text-text-tertiary transition-transform duration-200', showUserMenu ? 'rotate-180' : '']"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M19 9l-7 7-7-7"
/>
              </svg>
            </button>

            <!-- Dropdown -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="showUserMenu"
                v-click-outside="closeUserMenu"
                class="absolute right-0 mt-2 w-48 bg-dark-elevated rounded-xl border border-dark-border shadow-xl overflow-hidden"
              >
                <button
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-dark-hover hover:text-text-primary transition-colors"
                  @click="openProfileModal"
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
d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
/>
                  </svg>
                  Perfil
                </button>
                <router-link
                  v-if="currentUser?.role === 'Cliente'"
                  to="/configuracion-cliente"
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-text-secondary hover:bg-dark-hover hover:text-text-primary transition-colors"
                  @click="closeUserMenu"
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
d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
/>
                    <path
stroke-linecap="round"
stroke-linejoin="round"
stroke-width="2"
d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
/>
                  </svg>
                  Configuracion
                </router-link>
                <div class="border-t border-dark-border" />
                <button
                  class="w-full flex items-center gap-3 px-4 py-3 text-sm text-danger-400 hover:bg-danger-500/10 transition-colors"
                  @click="logout"
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
d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
/>
                  </svg>
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
      <footer class="py-4 px-6 border-t border-dark-border">
        <div class="flex-between flex-wrap gap-4 text-sm text-text-tertiary">
          <p>2024 Club F5. Todos los derechos reservados.</p>
          <p>v{{ appVersion }}</p>
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
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
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
import { ref, computed, onMounted, onBeforeUnmount, watch, h } from 'vue'
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

// Icon components
const icons = {
  'chart-pie-36': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' })
  ]),
  'building': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
  ]),
  'music': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' })
  ]),
  'bullhorn': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' })
  ]),
  'file-invoice': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
  ]),
  'users': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
  ]),
  'cog': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })
  ]),
  'document': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' })
  ]),
  'list-alt': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' })
  ])
  // ,
  // 'cloud': () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  //   h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-10A7 7 0 105 14.9' })
  // ])
}

const getIcon = (iconName) => icons[iconName] || icons['document']

const sidebarLinks = computed(() => {
  const userRole = currentUser.value?.role
  const links = []

  links.push({ name: 'Inicio', icon: 'chart-pie-36', path: '/dashboard' })

  if (userRole === 'Cliente') {
    links.push({ name: 'Sucursales', icon: 'building', path: '/sucursales' })
    links.push({ name: 'Mi Musica', icon: 'music', path: '/programaMusica' })
    links.push({ name: 'Mis Recibos', icon: 'file-invoice', path: '/facturas' })
    links.push({ name: 'Mis Spots', icon: 'bullhorn', path: '/bibliotecaSpot' })
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
    links.push({ name: 'Editor de pagina', icon: 'building', path: '/landing-editor' })
    links.push({ name: 'Logs del Sistema', icon: 'document', path: '/event-log' })
    links.push({ name: 'Banco de Pruebas de Email', icon: 'document', path: '/email-test' })
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
/* No custom styles needed */
</style>
