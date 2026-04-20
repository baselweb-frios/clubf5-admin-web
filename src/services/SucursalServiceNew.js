import { dispatcherService } from './dispatcherService'
import userService from './UserServices'

/**
 * Servicio para manejar operaciones de sucursales usando SignalR Dispatcher
 * @namespace SucursalService
 */
const SucursalService = {}

/**
 * Plantilla de cliente sucursal
 * @type {Object}
 */
const clienteSucursal = {
  clisuc_codigo: 0,
  clisuc_numeroSucursal: 0,
  clisuc_nombre: '',
  clisuc_fechaAlta: '',
  clisuc_idSucursal: 0,
  cli_codigo: 0,
  cli_usuari: '',
  username: '',
  password: '',
  adm_NroIntentos: 0,
  adm_fechaDesde: '',
  sucpgr_codigoSucursal: 0,
  clipro_nombre: ''
}

SucursalService.cliSucursal = clienteSucursal

/**
 * Obtiene la plantilla de cliente sucursal
 * @returns {Object} Plantilla de sucursal
 */
SucursalService.get = function () {
  return clienteSucursal
}

/**
 * Establece el modo de reproducción de una sucursal
 * @param {string} codSuc - Código de la sucursal
 * @param {number} modo - Modo de reproducción (1: Radio, 2: Spots, 3: Mixto)
 * @returns {Promise<Object>} Resultado de la operación
 */
SucursalService.setModoReprod = async function (codSuc, modo) {
  return await dispatcherService.execute({
    controller: 'Sucursal',
    action: 'SetModoReprod',
    parameters: {
      sucursalCode: codSuc,
      modoActual: modo
    },
    broadcastResult: true // Notificar a todos los clientes conectados
  })
}

/**
 * Obtiene sucursales del cliente
 * @param {number} [clientCode] - Código del cliente (opcional, usa el del usuario actual si no se proporciona)
 * @returns {Promise<Array>} Lista de sucursales
 */
SucursalService.getcliSucursalByCliente = async function (clientCode) {
  try {
    // Si no se proporciona clientCode, intentar obtenerlo del usuario actual
    if (!clientCode) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      clientCode = user.clientCode
    }

    const response = await dispatcherService.execute({
      controller: 'Sucursal',
      action: 'GetSucursales',
      parameters: {
        clientCode
      }
    })

    // Procesar y enriquecer las sucursales con datos adicionales
    const result = response.map(element => {
      return {
        ...element,
        detalle: 'Sin novedad',
        event: 'desconectado',
        avance: -1,
        conected: 0,
        userId:null,
        audio_vivo: element.clisuc_idSucursal == null
          ? ''
          : `https://sonic.dattalive.com:${element.clisuc_idSucursal}/stream.aac`
      }
    })

    // Guardar en localStorage para caché
    localStorage.setItem('sucursales', JSON.stringify(result))

    return result
  } catch (error) {
    console.error('[SucursalService.getcliSucursalByCliente]', error)
    throw error
  }
}

/**
 * Obtiene la programación de spot de una sucursal
 * @param {string} nombreSucursal - Nombre de la sucursal
 * @returns {Promise<Object>} Programación de spot
 */
SucursalService.getprogSpotBySuc = async function (nombreSucursal) {
  return await dispatcherService.execute({
    controller: 'Sucursal',
    action: 'GetProgramacionSpot',
    parameters: {
      nombreSucursal
    }
  })
}

/**
 * Crea una nueva sucursal
 * @param {Object} sucursal - Datos de la sucursal
 * @param {string} sucursal.nombreSucursal - Nombre de la sucursal
 * @param {string} sucursal.nombreUsuario - Nombre de usuario
 * @param {string} sucursal.contrasenia - Contraseña
 * @param {string} sucursal.clientePrefijo - Prefijo del cliente
 * @param {string} [sucursal.usuarioPrincipal] - Usuario principal (opcional)
 * @returns {Promise<Object>} Resultado de la operación
 */
SucursalService.altaSucursal = async function (sucursal) {
  try {
    const cliente = JSON.parse(userService.current().Cliente || '{}')
    const currentUser = userService.current()
    
    const dataSucursaSend = {
      codigoCliente: cliente.cli_codigo,
      nombreSucursal: sucursal.nombreSucursal,
      nombreUsuario: sucursal.nombreUsuario,
      contrasenia: sucursal.contrasenia,
      clientePrefijo: cliente.cli_prefijo || 'laf5_',
      usuarioPrincipal: cliente.cli_usuari || '',
      dependencia: (currentUser.role === 'Cliente') ? cliente.cli_usuari : '',
      iscliente: 0,
      ...sucursal
    }

    return await dispatcherService.execute({
      controller: 'Sucursal',
      action: 'Create',
      parameters: dataSucursaSend,
      broadcastResult: true
    })
  } catch (error) {
    console.error('[SucursalService.altaSucursal]', error)
    throw error
  }
}

/**
 * Elimina sucursales
 * @param {Array<Object>} pDeletes - Array de sucursales a eliminar
 * @param {number} pDeletes[].clisuc_codigo - Código de la sucursal
 * @param {string} pDeletes[].username - Username de la sucursal
 * @returns {Promise<Array>} Resultados de las eliminaciones
 */
SucursalService.bajaSucursal = async function (pDeletes) {
  try {
    const promiseDelete = pDeletes.map(del =>
      dispatcherService.execute({
        controller: 'Sucursal',
        action: 'Delete',
        parameters: {
          sucursalCode: del.clisuc_codigo,
          username: del.username
        },
        broadcastResult: true
      })
    )

    const result = await Promise.all(promiseDelete)
    return result
  } catch (error) {
    console.error('[SucursalService.bajaSucursal]', error)
    throw error
  }
}

/**
 * Actualiza una sucursal existente
 * @param {Object} sucursal - Datos de la sucursal
 * @param {number} sucursal.idSucursal - ID de la sucursal
 * @param {string} sucursal.nombreSucu - Nombre de la sucursal
 * @param {string} sucursal.usernameSucu - Username de la sucursal
 * @param {string} sucursal.passSucu - Contraseña
 * @param {string} sucursal.progRadio - Programa de radio
 * @param {string} sucursal.progSpot - Programa de spot
 * @param {string} sucursal.programSpot - Permiso de programa spot
 * @param {number} sucursal.iscliente - Es cliente
 * @returns {Promise<Object>} Resultado de la operación
 */
SucursalService.put = async function (sucursal) {
  try {
    const dataSucursaSend = {
      idSucursal: sucursal.idSucursal,
      nombreSucursal: sucursal.nombreSucu,
      nombreUsuarioSucursal: sucursal.usernameSucu,
      clientePrefijo: 'laf5_',
      contrasenia: sucursal.passSucu,
      progRadioSelected: sucursal.progRadio,
      progSpotSelected: sucursal.progSpot,
      permisoSelected: sucursal.programSpot,
      iscliente: sucursal.iscliente
    }

    return await dispatcherService.execute({
      controller: 'Sucursal',
      action: 'Update',
      parameters: dataSucursaSend,
      broadcastResult: true
    })
  } catch (error) {
    console.error('[SucursalService.put]', error)
    throw error
  }
}

/**
 * Verifica el estado de conexión de una sucursal
 * @param {string} nombreUsuarioSucursal - Username de la sucursal
 * @returns {Promise<Object>} Estado de la sucursal
 */
SucursalService.estadoSucursal = async function (nombreUsuarioSucursal) {
  return await dispatcherService.execute({
    controller: 'Sucursal',
    action: 'VerificarEstado',
    parameters: {
      username: nombreUsuarioSucursal
    }
  })
}

/**
 * Obtiene sucursales online
 * @returns {Promise<Array>} Lista de sucursales online
 */
SucursalService.getSucursalesOnline = async function () {
  try {
    return await dispatcherService.execute({
      controller: 'Sucursal',
      action: 'GetSucursalesOnline',
      parameters: {}
    })
  } catch (error) {
    console.error('[SucursalService.getSucursalesOnline]', error)
    return []
  }
}

/**
 * Actualiza programación de una sucursal
 * @param {string} sucursalCode - Código de la sucursal
 * @param {string} programacionRadio - Programación de radio
 * @param {string} programacionSpot - Programación de spot
 * @returns {Promise<Object>} Resultado de la operación
 */
SucursalService.updateProgramacion = async function (sucursalCode, programacionRadio, programacionSpot) {
  return await dispatcherService.execute({
    controller: 'Sucursal',
    action: 'UpdateProgramacion',
    parameters: {
      sucursalCode,
      programacionRadio,
      programacionSpot
    },
    broadcastResult: true
  })
}

export default SucursalService
