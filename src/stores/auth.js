import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import userService from '@/services/UserServices'
import { useStoreLoader } from '@/composables/useStoreLoader'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const refreshToken = ref(localStorage.getItem('refresh_token') || '')
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'Cliente')
  const userName = computed(() => user.value?.Nombre || '')
  const userId = computed(() => user.value?.id || user.value?.sub || null)

  // Helper Functions
  const decodeToken = (token) => {
    try {
      // JWT tiene formato: header.payload.signature
      const parts = token.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid token format')
      }

      // Decodificar el payload (segunda parte)
      const payload = parts[1]

      // Reemplazar caracteres URL-safe
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')

      // Decodificar base64
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )

      return JSON.parse(jsonPayload)
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }

  // Actions
  const login = async (username, password) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await userService.login(username, password)

      token.value = response.data.access_token
      refreshToken.value = response.data.refresh_token || ''

      // Decode user data from token
      const tokenPayload = decodeToken(token.value)
      user.value = {
        ...tokenPayload,
        Nombre: tokenPayload.Nombre || tokenPayload.unique_name || username,
        role: tokenPayload.role || 'Cliente'
      }

      // Store in localStorage
      localStorage.setItem('token', token.value)
      if (refreshToken.value) {
        localStorage.setItem('refresh_token', refreshToken.value)
      }
      localStorage.setItem('user', JSON.stringify(user.value))

      // Load all stores in parallel for better UX
      const { loadAllStoresParallel } = useStoreLoader()
      await loadAllStoresParallel(user.value.role)
      console.log('All stores loaded after login')

      return response
    } catch (err) {
      error.value = err.response.data || 'Error durante el login'
      throw  err.response.data
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    console.log('🚪 Cerrando sesión y limpiando datos...')

    user.value = null
    token.value = ''
    refreshToken.value = ''

    // Limpiar TODOS los datos del localStorage relacionados con la sesión
    const keysToRemove = [
      'token',
      'refresh_token',
      'user',
      'spots',
      'listProgSpot',
      'sidebarOpen',
      // Agregar más keys si es necesario
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })

    // También podríamos limpiar todo el localStorage (opcional)
    // localStorage.clear()

    console.log('✅ Sesión cerrada y datos limpiados')

    userService.logout()
  }

  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await userService.refreshToken(refreshToken.value)

      token.value = response.data.access_token
      refreshToken.value = response.data.refresh_token || refreshToken.value

      localStorage.setItem('token', token.value)
      if (refreshToken.value) {
        localStorage.setItem('refresh_token', refreshToken.value)
      }

      return response
    } catch (err) {
      logout()
      throw err
    }
  }

  const loadUserFromStorage = async () => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      try {
        user.value = JSON.parse(storedUser)
        token.value = storedToken
        refreshToken.value = localStorage.getItem('refresh_token') || ''

        // Load all stores in parallel
        if (user.value?.role) {
          const { loadAllStoresParallel } = useStoreLoader()
          await loadAllStoresParallel(user.value.role)
          console.log('All stores loaded from storage')
        }
      } catch (error) {
        console.error('Error loading user from storage:', error)
        logout()
      }
    }
  }

  const updateUser = (userData) => {
    user.value = { ...user.value, ...userData }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  const requestPasswordReset = async (email) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await userService.requestPasswordReset(email)
      return response
    } catch (err) {
      error.value = err.response?.data || 'Error al solicitar recuperación de contraseña'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  const resetPassword = async (token, newPassword) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await userService.resetPassword(token, newPassword)
      return response
    } catch (err) {
      error.value = err.response?.data || 'Error al restablecer la contraseña'
      throw error.value
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    user,
    token,
    refreshToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    userRole,
    userName,
    userId,

    // Actions
    login,
    logout,
    refreshAuthToken,
    loadUserFromStorage,
    updateUser,
    decodeToken,
    requestPasswordReset,
    resetPassword
  }
})
