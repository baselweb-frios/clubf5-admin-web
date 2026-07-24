import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import configValidationService from '@/services/ConfigValidationService'

// Import layouts
import LoginLayout from '@/layouts/LoginLayout.vue'
import DynamicLayout from '@/layouts/DynamicLayout.vue'

// Import pages
import LandingPage from '@/pages/LandingPage.vue'
import Login from '@/pages/Login.vue'
import ForgotPassword from '@/pages/ForgotPassword.vue'
import ResetPassword from '@/pages/ResetPassword.vue'
import Dashboard from '@/pages/Dashboard.vue'
import NotFound from '@/pages/NotFound.vue'

// Import route definitions
import clienteRoutes from './routes/cliente'
import administradorRoutes from './routes/administrador'

import reproductorRoutes from './routes/reproductor'

/**
 * Combine and deduplicate routes from all roles
 */
const getAllUniqueRoutes = () => {
  const allRoutes = [...clienteRoutes, ...administradorRoutes, ...reproductorRoutes]
  const uniqueRoutes = []
  const seenPaths = new Set()

  for (const route of allRoutes) {
    if (!seenPaths.has(route.path)) {
      seenPaths.add(route.path)
      uniqueRoutes.push(route)
    }
  }

  return uniqueRoutes
}

/**
 * Static routes configuration
 */
const routes = [
  // Landing Page - Public home (shown when not authenticated)
  {
    path: '/inicio',
    name: 'Landing',
    component: LandingPage,
    meta: { requiresAuth: false, title: 'Inicio' }
  },
  // Login route (kept for direct access)
  {
    path: '/login',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
      }
    ]
  },
  // Forgot Password route
  {
    path: '/forgot-password',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'ForgotPassword',
        component: ForgotPassword,
        meta: { requiresAuth: false }
      }
    ]
  },
  // Reset Password route
  {
    path: '/reset-password',
    component: LoginLayout,
    children: [
      {
        path: '',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: { requiresAuth: false }
      }
    ]
  },
  // Main app routes with dynamic layout based on user role
  {
    path: '/',
    component: DynamicLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true, roles: ['Administrador', 'Cliente', 'Reproductor'] }
      },
      ...getAllUniqueRoutes()
    ]
  },
  // 404 route - must be last
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

/**
 * Navigation guards
 */
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  // If trying to access a protected route without authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    return next({
      name: 'Landing',
      query: { redirect: to.fullPath }
    })
  }

  // If authenticated user tries to access login page or landing page
  if ((to.name === 'Login' || to.name === 'Landing') && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' })
  }

  // Role-based access control
  if (requiresAuth && authStore.isAuthenticated) {
    const userRole = authStore.userRole
    const routeRoles = to.meta.roles

    // If route has role restrictions and user doesn't have required role
    if (routeRoles && !routeRoles.includes(userRole)) {
      console.warn(`Access denied to ${to.path} for role ${userRole}`)

      // Antes esto redirigía en silencio; ahora se avisa al usuario por qué no pudo entrar.
      window.$toast?.('No tenés permisos para esa sección', 'error')

      // Prevent infinite redirect loop - only redirect if not already at Dashboard
      if (to.name !== 'Dashboard') {
        return next({ name: 'Dashboard' })
      } else {
        // If trying to access Dashboard without permission, go to login
        console.error(`User with role ${userRole} does not have access to any routes`)
        return next({ name: 'Login' })
      }
    }
  }

  // Client configuration validation - only for Cliente role
  if (requiresAuth && authStore.isAuthenticated && authStore.userRole === 'Cliente') {
    // Allow access to Dashboard, Configuración, and Programaciones without validation
    // User needs to create programaciones to complete configuration
    const allowedPaths = [
      '/dashboard',
      '/configuracion-cliente',
      '/programaMusica',
      '/altaProgramacionMusica',
      '/programaSpot',
      '/altaProgramacionSpots',
      '/bibliotecaSpot',
      '/altaSpot',
      '/mi-plan'
    ]
    const isAllowedPath = allowedPaths.some(path => to.path === path || to.path.startsWith(path + '/'))

    if (!isAllowedPath) {
      try {
        const configStatus = await configValidationService.checkConfigurationStatus()

        if (!configStatus.isComplete) {
          console.warn('Client configuration incomplete. Redirecting to configuration page.')
          console.warn('Missing:', configStatus.missing)

          return next({
            path: '/configuracion-cliente',
            query: {
              incomplete: 'true',
              redirect: to.fullPath
            }
          })
        }
      } catch (error) {
        console.error('Error checking client configuration:', error)
        // Allow navigation if there's an error checking configuration
        // This prevents blocking users due to API issues
      }
    }
  }

  // Update document title
  document.title = to.meta.title
    ? `${to.meta.title} - ClubF5`
    : 'ClubF5 - Sistema de Gestión'

  next()
})

/**
 * After each navigation
 */
router.afterEach((to, from) => {
  // Reset scroll position if needed
  // Track page views, etc.
})

export default router
