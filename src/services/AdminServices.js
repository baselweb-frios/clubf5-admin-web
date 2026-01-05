import api from './api'

const adminService = {}

adminService.getAdminAll = async function () {
  return api.get('/Admin').then(res => res.data)
}

adminService.buscarAdminPorId = async function (id) {
  return api.get(`/Admin/${id}`).then(res => res.data)
}


adminService.altaCuenta = async function (datosCuenta) {
  return api.post("/Admin/alta", datosCuenta).then(res => res.data)
}

adminService.del = async function (id) {
  return api.delete(`/Admin/${id}`)
}

adminService.update = async function (id, adminData) {
  return api.put(`/Admin/${id}`, adminData).then(res => res.data)
}

/**
 * Blanquea la contraseña de un usuario
 * Genera una nueva contraseña segura y la envía por email
 * @param {string} username - Username del usuario
 * @returns {Promise<{success: boolean, message: string, emailSent: boolean}>}
 */
adminService.blanquearPassword = async function (username) {
  return api.post(`/Admin/blanquear-password/${username}`).then(res => res.data)
}

export default adminService
