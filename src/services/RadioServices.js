import api from './api'

const RadioService = {}

// ========== CRUD de Radios ==========

// Obtener todas las radios (Admin)
RadioService.getAllRadios = async function () {
  return api.get('/Radio/RadioLibre').then(res => res.data)
}

// Obtener una radio por código
RadioService.getRadioByCodigo = async function (codigoRadio) {
  return api.get(`/Radio/${codigoRadio}`).then(res => res.data)
}

// Crear nueva radio
RadioService.crearRadio = async function (radioData) {
  return api.post('/Radio/Alta', radioData).then(res => res.data)
}

// Modificar radio existente
RadioService.modificarRadio = async function (radioData) {
  return api.put('/Radio/Modificar', radioData).then(res => res.data)
}

// Eliminar radio
RadioService.eliminarRadio = async function (codigoRadio) {
  return api.delete(`/Radio/${codigoRadio}`).then(res => res.data)
}

// Obtener subgéneros relacionados con una radio
RadioService.getSubGenerosByRadio = async function (codigoRadio) {
  return api.get(`/Radio/${codigoRadio}/SubGeneros`).then(res => res.data)
}

// Relacionar géneros musicales con una radio
RadioService.relacionarGenerosMusicales = async function (codigoRadio, codigosGMS) {
  const payload = {
    codigoRadio,
    codigosGMS
  }
  console.log('=== RadioService.relacionarGenerosMusicales ===')
  console.log('Payload enviado al backend:', payload)
  console.log('URL:', '/Radio/RelacionarGenerosMusicales')

  return api.post('/Radio/RelacionarGenerosMusicales', payload).then(res => res.data)
}

// ========== Gestión de Ritmos ==========

// Obtener ritmos relacionados con una radio
RadioService.getRitmosByRadio = async function (codigoRadio) {
  return api.get(`/Radio/${codigoRadio}/Ritmos`).then(res => res.data)
}

// Relacionar ritmos con una radio
RadioService.relacionarRitmos = async function (codigoRadio, codigosRitmo) {
  const payload = {
    codigoRadio,
    codigosRitmo
  }
  console.log('=== RadioService.relacionarRitmos ===')
  console.log('Payload enviado al backend:', payload)

  return api.post('/Radio/RelacionarRitmos', payload).then(res => res.data)
}

// ========== Gestión de Tipo Empresa y Estilos ==========

// Obtener tipos de empresa relacionados con una radio
RadioService.getTiposEmpresaByRadio = async function (codigoRadio) {
  return api.get(`/Radio/${codigoRadio}/TiposEmpresa`).then(res => res.data)
}

// Obtener estilos relacionados con una radio
RadioService.getEstilosByRadio = async function (codigoRadio) {
  return api.get(`/Radio/${codigoRadio}/Estilos`).then(res => res.data)
}

// Relacionar tipos de empresa y estilos con una radio
RadioService.relacionarTipoEmpresaEstilo = async function (codigoRadio, codigosTipoEmpresa, codigosEstilo) {
  const payload = {
    codigoRadio,
    codigosTipoEmpresa,
    codigosEstilo
  }
  console.log('=== RadioService.relacionarTipoEmpresaEstilo ===')
  console.log('Payload enviado al backend:', payload)

  return api.post('/Radio/RelacionarTipoEmpresaEstilo', payload).then(res => res.data)
}

// ========== Programación de Radios ==========

RadioService.getProgramacionesByCliente = async function () {
  return api.get('/Radio/programacion/').then(res => res.data)
}

RadioService.getRadiosByCliente = async function () {
  try {
    // Try POST first (original implementation)
    return await api.post('/Radio/DescargaObs', {Source:'',Name:JSON.parse(localStorage.user).unique_name}, {
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => res.data)
  } catch (error) {
    // If POST fails with 415 or 405, try GET
    if (error.response?.status === 415 || error.response?.status === 405) {
      console.log('RadioService: POST failed, trying GET for DescargaObs')
      return await api.get('/Radio/DescargaObs').then(res => res.data)
    }

    // For 404 or other errors, return empty array to avoid blocking
    if (error.response?.status === 404) {
      console.warn('RadioService: DescargaObs endpoint not found, returning empty array')
      return []
    }

    throw error
  }
}

RadioService.altaProgramacion = async function (codigoProgramacion, nombreProgramacion) {
  return api.post('/Radio/programacion', {
    codigoProgramacion, nombreProgramacion
  }).then(res => res.data)
}

RadioService.bajaProgramacion = async function (codigoProgramacion) {
   return api.delete(`/Radio/programacion/${codigoProgramacion}`)
     .then(res => res.data)
 }

// Métodos para programación musical semanal
RadioService.getProgramacionesByPrograma = async function (codigoProgramacion) {
  return api.get(`/ClienteProgramacionRadio/${codigoProgramacion}`)
    .then(res => res.data)
}

RadioService.guardarProgramacionHorario = async function (programacionData) {
  return api.post('/ClienteProgramacionRadio/ProgramacionHorario', programacionData)
    .then(res => res.data)
}

RadioService.editarProgramacionHorario = async function (codigo, programacionData) {
  return api.put(`/ClienteProgramacionRadio/ProgramacionHorario/${codigo}`, programacionData)
    .then(res => res.data)
}

RadioService.bajaProgramacionHorario = async function (codigo) {
  return api.delete(`/ClienteProgramacionRadio/ProgramacionHorario/${codigo}`)
    .then(res => res.data)
}

RadioService.getProgramacionSemanal = async function (codigoPrograma) {
  return api.get(`/ClienteProgramacionRadio/${codigoPrograma}`)
    .then(res => res.data)
}

RadioService.guardarProgramacionSemanal = async function (programacionSemanal) {
  return api.post('/ClienteProgramacionRadio/', programacionSemanal)
    .then(res => res.data)
}

export default RadioService
