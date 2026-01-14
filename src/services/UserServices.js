/* eslint-disable eqeqeq */
import api from './api'

const userService = {}

userService.login = async function (username, password) {
  return api.post('/Token/Login', {admin:1}, {
    auth: {
      username:username,
      password:password
    }
  })
}

userService.error = async function (statusCode) {
  return api.get(`/Admin/error/${statusCode}`, {
  }).then(res => res.data)
}

userService.logout = async function () {
  const refresh = localStorage.refresh_token
  const username = this.current()?.unique_name
  return api.put('/Token/Logout', {
    refresh, username
  }).then(res => {
    localStorage.clear()
    // Navigate to login without reload
    window.location.hash = '#/login'
  })
}
userService.logoutRemoto = async function (username) {
  return api.get(`/ControlAire/LogoutRemoto/${username}`, {
    action: 'logout', username
  }).then(res => console.log(res))
}

userService.current = function () {

  if (typeof localStorage.user == 'undefined') return false
  return JSON.parse(localStorage.user)
}
userService.currentCliente = function () {
  if (typeof localStorage.user == 'undefined') return false
  return JSON.parse(JSON.parse(localStorage.user).Cliente)
}

userService.valirdarToken = function () {
  if (!localStorage.user) return false
  const user = this.current()
  user.exp = user.exp + '000'
  var fecha = Date.parse(Date())
  if (fecha > user.exp) {
    return false
  }
  return true
}

userService.autenticado = function () {
  if (this.valirdarToken()) {
    return true
  }

  return false
}

// ===== GESTIÓN DE USUARIOS =====

/**
 * Listar usuarios del cliente actual
 */
userService.listarUsuarios = async function() {
  try {
    const response = await api.get('/Usuario/ListarPorCliente')
    return response.data
  } catch (error) {
    console.error('Error listando usuarios:', error)
    throw error
  }
}

/**
 * Crear un nuevo usuario
 * @param {Object} userData - Datos del usuario a crear
 * @param {string} userData.nombre - Nombre completo del usuario
 * @param {string} userData.email - Email del usuario (será el username)
 * @param {string} userData.password - Contraseña
 * @param {string} userData.rol - Rol del usuario (por defecto 'Usuario')
 */
userService.crearUsuario = async function(userData) {
  try {
    const payload = {
      nombre: userData.nombre,
      email: userData.email,
      username: userData.email, // Email como username
      password: userData.password,
      rol: userData.rol || 'Usuario', // Por defecto rol Usuario
      activo: true
    }

    const response = await api.post('/Usuario/Crear', payload)
    return response.data
  } catch (error) {
    console.error('Error creando usuario:', error)
    throw error
  }
}

/**
 * Actualizar datos de un usuario
 */
userService.actualizarUsuario = async function(userId, userData) {
  try {
    const payload = {
      id: userId,
      nombre: userData.nombre,
      email: userData.email,
      activo: userData.activo !== undefined ? userData.activo : true
    }

    const response = await api.put(`/Usuario/Actualizar/${userId}`, payload)
    return response.data
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    throw error
  }
}

/**
 * Eliminar un usuario
 */
userService.eliminarUsuario = async function(userId) {
  try {
    const response = await api.delete(`/Usuario/Eliminar/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    throw error
  }
}

/**
 * Cambiar contraseña de un usuario
 */
userService.cambiarPassword = async function(userId, newPassword) {
  try {
    const payload = {
      userId: userId,
      newPassword: newPassword
    }

    const response = await api.put(`/Usuario/CambiarPassword/${userId}`, payload)
    return response.data
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
    throw error
  }
}

/**
 * Activar/Desactivar usuario
 */
userService.toggleActivarUsuario = async function(userId, activo) {
  try {
    const response = await api.put(`/Usuario/Activar/${userId}`, { activo })
    return response.data
  } catch (error) {
    console.error('Error activando/desactivando usuario:', error)
    throw error
  }
}

// ===== RECUPERACIÓN DE CONTRASEÑA =====

/**
 * Solicitar recuperación de contraseña
 * @param {string} email - Email del usuario
 */
userService.requestPasswordReset = async function(email) {
  try {
    const UrlResetPassword = import.meta.env.VITE_RESET_PASSWORD_URL || 'https://localhost:3000/reset-password'
    const response = await api.post('/Admin/solicitar-recuperacion', { email , UrlResetPassword})
    return response.data
  } catch (error) {
    console.error('Error solicitando recuperación de contraseña:', error)
    throw error
  }
}

/**
 * Restablecer contraseña con token
 * @param {string} token - Token de recuperación
 * @param {string} newPassword - Nueva contraseña
 */
userService.resetPassword = async function(token, newPassword) {
  try {
    const response = await api.post('/Admin/restablecer-password', {
      token,
      newPassword
    })
    return response.data
  } catch (error) {
    console.error('Error restableciendo contraseña:', error)
    throw error
  }
}

export default userService
