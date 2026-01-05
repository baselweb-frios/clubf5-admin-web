import { useAuthStore } from '@/stores/auth'

/**
 * Authentication guard
 * Redirects to login if user is not authenticated
 */
export const authGuard = (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

/**
 * Role-based access control guard
 * Redirects to dashboard if user doesn't have required role
 */
export const roleGuard = (allowedRoles) => {
  return (to, from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isAuthenticated) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (!allowedRoles.includes(authStore.userRole)) {
      next({ name: 'Dashboard' })
    } else {
      next()
    }
  }
}

/**
 * Guest guard
 * Redirects authenticated users to dashboard
 */
export const guestGuard = (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
}

/**
 * Check if user has permission for route
 */
export const checkPermission = (to) => {
  const authStore = useAuthStore()

  if (!to.meta.roles) {
    return true
  }

  return to.meta.roles.includes(authStore.userRole)
}
