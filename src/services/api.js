import axios from 'axios';

// Configuración de la URL base de la API
// Se obtiene desde las variables de entorno (.env)
// Por defecto usa HTTP para desarrollo local
let baseURL = import.meta.env.VITE_API_BASE_URL || 'http://149.50.131.163:3003/api/'

console.log('[API Config] Base URL:', baseURL)

const instance = axios.create({
    baseURL,
    timeout: 90000, // 90 segundos de timeout (aumentado para operaciones de eliminación)
    headers: {
      'Content-Type': 'application/json'
    }
});



instance.interceptors.request.use(
    (config) => {
      // Intentar obtener el token de diferentes ubicaciones para compatibilidad
      const token = localStorage.getItem('token') || localStorage.access_token

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

// Interceptor de respuesta para manejar errores 401
instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token inválido o expirado
        console.warn('Token inválido o expirado. Redirigiendo al login...')

        // Limpiar storage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('refresh_token')

        // Redirigir al login (si no estamos ya ahí)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }

      return Promise.reject(error)
    }
  )
  
export default instance
