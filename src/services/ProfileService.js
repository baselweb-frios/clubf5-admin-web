import api from './api'

/**
 * Servicio para gestionar el perfil del usuario autenticado
 * Todos los usuarios pueden acceder a estos endpoints sin importar su rol
 */
const profileService = {}

/**
 * Obtener el perfil del usuario autenticado
 * GET /api/profile
 * @returns {Promise<Object>} Datos del perfil del usuario
 */
profileService.getMyProfile = async function() {
  try {
    const response = await api.get('/Profile')
    return response.data
  } catch (error) {
    console.error('Error obteniendo perfil:', error)
    throw error
  }
}

/**
 * Actualizar el perfil del usuario autenticado
 * PUT /api/profile
 * @param {Object} profileData - Datos del perfil a actualizar
 * @param {string} profileData.nombre - Nombre completo
 * @param {string} [profileData.email] - Email
 * @param {string} [profileData.telefono] - Teléfono
 * @param {string} [profileData.fechaNacimiento] - Fecha de nacimiento (ISO format)
 * @param {string} [profileData.domicilio] - Domicilio
 * @param {string} [profileData.localidad] - Localidad
 * @param {string} [profileData.logo] - URL del logo (solo para clientes)
 * @param {number} [profileData.frecuenciaSpots] - Frecuencia de reproducción de spots en minutos (solo para clientes)
 * @param {number} [profileData.diaVencimientoPaquete] - Día de vencimiento del paquete (solo para clientes)
 * @returns {Promise<Object>} Resultado de la operación con perfil actualizado
 */
profileService.updateMyProfile = async function(profileData) {
  try {
    const payload = {
      Nombre: profileData.nombre,
      Email: profileData.email || null,
      Telefono: profileData.telefono || null,
      FechaNacimiento: profileData.fechaNacimiento || null,
      Domicilio: profileData.domicilio || null,
      Localidad: profileData.localidad || null,
      // Campos específicos de Cliente
      Logo: profileData.logo || null,
      FrecuenciaSpots: profileData.frecuenciaSpots || null,
      DiaVencimientoPaquete: profileData.diaVencimientoPaquete || null
    }

    const response = await api.put('/Profile', payload)
    return response.data
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    throw error
  }
}

/**
 * Cambiar la contraseña del usuario autenticado
 * PUT /api/profile/change-password
 * @param {Object} passwordData - Datos para cambiar la contraseña
 * @param {string} passwordData.currentPassword - Contraseña actual
 * @param {string} passwordData.newPassword - Nueva contraseña
 * @param {string} passwordData.confirmPassword - Confirmar nueva contraseña
 * @returns {Promise<Object>} Resultado de la operación
 */
profileService.changePassword = async function(passwordData) {
  try {
    const payload = {
      CurrentPassword: passwordData.currentPassword,
      NewPassword: passwordData.newPassword,
      ConfirmPassword: passwordData.confirmPassword
    }

    const response = await api.put('/Profile/change-password', payload)
    return response.data
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    throw error
  }
}

export default profileService
