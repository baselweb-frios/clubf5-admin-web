import api from './api'

const clienteProgramacionSpotService = {}




// Services para el controller clienteProgramacionSpot
// Ver por que no funciona un get con varios parametros (por ahora hice la petición por post cuando es un get)
clienteProgramacionSpotService.getProgramacionesByProg = function (codigoProgramacion, horaDesde) {
  console.log(`🌐 Service: Solicitando programaciones - codigoProgramacion=${codigoProgramacion}, horaDesde=${horaDesde}`)

  return api.post('/clienteprogramacionspot/getSpots', { codigoProgramacion, horaDesde }, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }).then((response)=>{
    const data = response.data
    console.log('🌐 Service: Respuesta recibida:', data)
    console.log(`🌐 Service: Tipo de datos: ${Array.isArray(data) ? 'Array' : typeof data}`)

    if (Array.isArray(data)) {
      console.log(`🌐 Service: Total de registros: ${data.length}`)

      // Verificar si hay errores en la respuesta
      if (data.length > 0 && data[0].clprsp_codigo === -1) {
        console.error('❌ Service: Error en la respuesta del servidor:', data[0].spo_nombre)
        throw new Error(data[0].spo_nombre || 'Error al cargar programaciones')
      }
    }

    return data
  }).catch((error) => {
    console.error('❌ Service: Error en la petición:', error)
    throw error
  })
}

// post para guardar un spot en el calendar
clienteProgramacionSpotService.guardarProgSpot = async function (spotsProg) {
  try {
    console.log('ClienteProgramacionSpotServices - Guardando programas:', spotsProg)

    if (!Array.isArray(spotsProg) || spotsProg.length === 0) {
      throw new Error('No hay programas para guardar o el formato es inválido')
    }

    const resPromises = spotsProg.map((spoprog, index) => {
      console.log(`Programa ${index + 1}:`, spoprog)
      return api.post('/clienteprogramacionspot/', spoprog)
    })

    const response = await Promise.all(resPromises)
    console.log('Respuesta del servidor:', response)

    const result = response.filter(r => r.data)
    console.log('Programas guardados exitosamente:', result.length, 'de', spotsProg.length)

    return result
  } catch (error) {
    console.error('Error en ClienteProgramacionSpotServices.guardarProgSpot:', error)
    throw error
  }
}

// put para cambiar el modificar un spot en el calendar
clienteProgramacionSpotService.editarProgSpot = async function (codigo, codigoProgramacion, codigoSpot, numeroDia, horaDesde, horaHasta, orden) {
  return api.put('/clienteprogramacionspot/', {

    codigo, codigoProgramacion, codigoSpot, numeroDia, horaDesde, horaHasta, orden

  }).then(res => res.data)
}

clienteProgramacionSpotService.permutarProgSpot = async function (pdata) {
  return api.post('/clienteprogramacionspot/moverSpot', { ...pdata }).then(res => res.data)
}

clienteProgramacionSpotService.eliminarProgSpot = async function (codigoProgramacion, usuarioSpot) {
  return api.delete(`/clienteprogramacionspot/${codigoProgramacion}/${usuarioSpot}`
  ).then(res => res.data)
}

clienteProgramacionSpotService.getProgSpotSucursal = async function (codigoProgramacion) {
  return api.get(`/clienteprogramacionspot/sucursales/${codigoProgramacion}`, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  }).then(res => res.data)
}

export default clienteProgramacionSpotService
