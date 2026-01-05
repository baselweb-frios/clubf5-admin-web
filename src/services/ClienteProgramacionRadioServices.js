import api from './api'

/**
 * ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * CLIENTE PROGRAMACION RADIO SERVICES
 * ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio minimalista para gestión de programación de radios con validación de horarios y conflictos.
 * Optimizado para interfaz oscura con estructura limpia y funcional.
 *
 * Características principales:
 * • Validación estricta de horarios y conflictos de tiempo
 * • Integración con horarios específicos del cliente
 * • Estructura minimalista y optimizada
 * • Compatibilidad total con funciones existentes
 * • Estilo de código oscuro y conciso
 */

const clienteProgramacionRadioService = {}

/**
 * Obtiene todas las programaciones de radio para un código de programación específico
 * @param {number} codigoProgramacion - Código único de la programación
 * @returns {Promise<Array>} Lista de programaciones existentes
 */
clienteProgramacionRadioService.getProgramacionesByProg = async function (codigoProgramacion) {
  return api.get(`/clienteprogramacionradio/${codigoProgramacion}`).then(res => res.data)
}

/**
 * Guarda una nueva programación de radio con validación completa de horarios personalizados
 * @param {number} codigoProgramacion - Código de programación
 * @param {number} codigoRadio - Código de la radio
 * @param {number} numeroDia - Número del día (0-6, domingo a sábado)
 * @param {string} horaDesde - Hora de inicio (HH:mm)
 * @param {string} horaHasta - Hora de fin (HH:mm)
 * @returns {Promise<Object>} Resultado del guardado con validaciones aplicadas
 */
clienteProgramacionRadioService.guardarProgRadio = async function (codigoProgramacion, codigoRadio, numeroDia, horaDesde, horaHasta) {
  // Validar parámetros básicos
  if (!codigoProgramacion || !codigoRadio || numeroDia === undefined) {
    throw new Error('Parámetros obligatorios faltantes para guardar programación')
  }

  // Si se especifican horarios, validarlos estrictamente
  if (horaDesde && horaHasta) {
    if (!clienteProgramacionRadioService.validarFormatoHorario(horaDesde) || !clienteProgramacionRadioService.validarFormatoHorario(horaHasta)) {
      throw new Error('Formato de horario inválido. Use formato HH:mm')
    }

    if (!clienteProgramacionRadioService.validarLogicaHorarios(horaDesde, horaHasta)) {
      throw new Error('Hora de inicio debe ser anterior a hora de fin')
    }
  } else {
    // Si no se especifican horarios, usar valores por defecto
    horaDesde = horaDesde || '00:00'
    horaHasta = horaHasta || '23:59'
  }

  return api.post('/clienteprogramacionradio/', {
    codigoProgramacion,
    codigoRadio,
    numeroDia,
    horaDesde,
    horaHasta
  }).then(res => res.data)
}

/**
 * Edita una programación existente con validaciones completas de horarios personalizados
 * @param {number} codigo - Código único de la programación a editar
 * @param {number} codigoProgramacion - Código de programación
 * @param {number} codigoRadio - Código de la radio
 * @param {number} numeroDia - Número del día
 * @param {string} horaDesde - Nueva hora de inicio
 * @param {string} horaHasta - Nueva hora de fin
 * @returns {Promise<Object>} Resultado de la edición
 */
clienteProgramacionRadioService.editarProgRadio = async function (codigo, codigoProgramacion, codigoRadio, numeroDia, horaDesde, horaHasta) {
  // Validar parámetros básicos
  if (!codigo || !codigoProgramacion || !codigoRadio || numeroDia === undefined) {
    throw new Error('Parámetros obligatorios faltantes para editar programación')
  }

  // Si se especifican horarios, validarlos estrictamente
  if (horaDesde && horaHasta) {
    if (!clienteProgramacionRadioService.validarFormatoHorario(horaDesde) || !clienteProgramacionRadioService.validarFormatoHorario(horaHasta)) {
      throw new Error('Formato de horario inválido. Use formato HH:mm')
    }

    if (!clienteProgramacionRadioService.validarLogicaHorarios(horaDesde, horaHasta)) {
      throw new Error('Hora de inicio debe ser anterior a hora de fin')
    }
  } else {
    // Si no se especifican horarios, usar valores por defecto
    horaDesde = horaDesde || '00:00'
    horaHasta = horaHasta || '23:59'
  }

  return api.put('/clienteprogramacionradio/', {
    codigo,
    codigoProgramacion,
    codigoRadio,
    numeroDia,
    horaDesde,
    horaHasta
  }).then(res => res.data)
}

/**
 * Elimina una programación de radio
 * @param {number} codigoProgramacionRadio - Código único de la programación a eliminar
 * @returns {Promise<Object>} Resultado de la eliminación
 */
clienteProgramacionRadioService.bajaProgramacionRadio = async function (codigoProgramacionRadio) {
  if (!codigoProgramacionRadio) {
    throw new Error('Código de programación requerido para eliminación')
  }

  return api.delete(`/clienteprogramacionradio/${codigoProgramacionRadio}`).then(res => res.data)
}

/**
 * Guarda múltiples programaciones con validación de conflictos y horarios específicos del cliente
 * @param {Array} programmingData - Array de datos de programación
 * @param {Object} clienteHorario - Horario específico del cliente (opcional)
 * @returns {Promise<Array>} Resultados del guardado masivo
 */
clienteProgramacionRadioService.guardarProgramacionMultiple = async function (programmingData, clienteHorario = null) {
  if (!Array.isArray(programmingData) || programmingData.length === 0) {
    throw new Error('Datos de programación inválidos o vacíos')
  }

  // Validar cada programación individualmente
  for (const prog of programmingData) {
    clienteProgramacionRadioService.validarProgramacionIndividual(prog, clienteHorario)
  }

  // Verificar conflictos entre programaciones del mismo día
  clienteProgramacionRadioService.validarConflictosProgramacion(programmingData)

  return api.post('/clienteprogramacionradio/bulk', {
    programaciones: programmingData
  }).then(res => res.data)
}

/**
 * Método alternativo usando guardados individuales (fallback)
 * @param {Array} programmingData - Array de datos de programación
 * @param {Object} clienteHorario - Horario específico del cliente (opcional)
 * @returns {Promise<Array>} Resultados de los guardados individuales
 */
clienteProgramacionRadioService.guardarProgramacionMultipleFallback = async function (programmingData, clienteHorario = null) {
  if (!Array.isArray(programmingData) || programmingData.length === 0) {
    throw new Error('Datos de programación inválidos o vacíos')
  }

  // Validar todas las programaciones antes de proceder
  for (const prog of programmingData) {
    clienteProgramacionRadioService.validarProgramacionIndividual(prog, clienteHorario)
  }

  // Verificar conflictos
  clienteProgramacionRadioService.validarConflictosProgramacion(programmingData)

  const savePromises = programmingData.map(async (prog) => {
    if (prog.clprra_codigo && prog.clprra_codigo > 0) {
      return this.editarProgRadio(
        prog.clprra_codigo,
        prog.prog_codigo,
        prog.rad_codigo,
        prog.clprra_numeroDia,
        prog.horaDesde || '00:00',
        prog.horaHasta || '23:59'
      )
    } else {
      return this.guardarProgRadio(
        prog.prog_codigo,
        prog.rad_codigo,
        prog.clprra_numeroDia,
        prog.horaDesde || '00:00',
        prog.horaHasta || '23:59'
      )
    }
  })

  return Promise.all(savePromises)
}

/**
 * Valida el formato de un horario (HH:mm)
 * @param {string} horario - Horario a validar
 * @returns {boolean} True si el formato es válido
 */
clienteProgramacionRadioService.validarFormatoHorario = function (horario) {
  if (typeof horario !== 'string') return false

  const horarioRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!horarioRegex.test(horario)) return false

  const [horas, minutos] = horario.split(':').map(Number)
  return horas >= 0 && horas <= 23 && minutos >= 0 && minutos <= 59
}

/**
 * Valida que la hora de inicio sea anterior a la hora de fin
 * @param {string} horaDesde - Hora de inicio
 * @param {string} horaHasta - Hora de fin
 * @returns {boolean} True si la lógica es correcta
 */
clienteProgramacionRadioService.validarLogicaHorarios = function (horaDesde, horaHasta) {
  if (!horaDesde || !horaHasta) return false

  const desde = horaDesde.split(':').map(Number)
  const hasta = horaHasta.split(':').map(Number)

  const minutosDesde = desde[0] * 60 + desde[1]
  const minutosHasta = hasta[0] * 60 + hasta[1]

  return minutosDesde < minutosHasta
}

/**
 * Valida una programación individual contra horarios del cliente
 * @param {Object} programacion - Datos de la programación
 * @param {Object} clienteHorario - Horario específico del cliente
 */
clienteProgramacionRadioService.validarProgramacionIndividual = function (programacion, clienteHorario = null) {
  // Validar parámetros básicos
  if (!programacion.prog_codigo || !programacion.rad_codigo || programacion.clprra_numeroDia === undefined) {
    throw new Error('Datos de programación incompletos')
  }

  // Validar horarios si están presentes
  if (programacion.horaDesde && programacion.horaHasta) {
    if (!clienteProgramacionRadioService.validarFormatoHorario(programacion.horaDesde) ||
        !clienteProgramacionRadioService.validarFormatoHorario(programacion.horaHasta)) {
      throw new Error(`Formato de horario inválido para programación del día ${programacion.clprra_numeroDia}`)
    }

    if (!clienteProgramacionRadioService.validarLogicaHorarios(programacion.horaDesde, programacion.horaHasta)) {
      throw new Error(`Horario inválido para programación del día ${programacion.clprra_numeroDia}: hora de inicio debe ser anterior a hora de fin`)
    }

    // Validar contra horario del cliente si está disponible
    if (clienteHorario && clienteHorario.startTime && clienteHorario.endTime) {
      clienteProgramacionRadioService.validarHorarioCliente(programacion, clienteHorario)
    }
  }
}

/**
 * Valida que una programación esté dentro del horario permitido del cliente
 * @param {Object} programacion - Datos de la programación
 * @param {Object} clienteHorario - Horario del cliente
 */
clienteProgramacionRadioService.validarHorarioCliente = function (programacion, clienteHorario) {
  const progDesde = programacion.horaDesde.split(':').map(Number)
  const progHasta = programacion.horaHasta.split(':').map(Number)
  const clienteDesde = clienteHorario.startTime.split(':').map(Number)
  const clienteHasta = clienteHorario.endTime.split(':').map(Number)

  const progMinDesde = progDesde[0] * 60 + progDesde[1]
  const progMinHasta = progHasta[0] * 60 + progHasta[1]
  const clienteMinDesde = clienteDesde[0] * 60 + clienteDesde[1]
  const clienteMinHasta = clienteHasta[0] * 60 + clienteHasta[1]

  if (progMinDesde < clienteMinDesde || progMinHasta > clienteMinHasta) {
    throw new Error(`Programación del día ${programacion.clprra_numeroDia} fuera del horario permitido del cliente (${clienteHorario.startTime}-${clienteHorario.endTime})`)
  }
}

/**
 * Valida que no existan conflictos de tiempo entre programaciones del mismo día
 * @param {Array} programaciones - Array de programaciones a validar
 */
clienteProgramacionRadioService.validarConflictosProgramacion = function (programaciones) {
  const conflictos = []

  // Agrupar por día
  const porDia = programaciones.reduce((acc, prog) => {
    if (!acc[prog.clprra_numeroDia]) {
      acc[prog.clprra_numeroDia] = []
    }
    acc[prog.clprra_numeroDia].push(prog)
    return acc
  }, {})

  // Verificar conflictos en cada día
  Object.keys(porDia).forEach(dia => {
    const progsDelDia = porDia[dia]

    for (let i = 0; i < progsDelDia.length; i++) {
      for (let j = i + 1; j < progsDelDia.length; j++) {
        const prog1 = progsDelDia[i]
        const prog2 = progsDelDia[j]

        if (clienteProgramacionRadioService.horariosSeSuperponen(
          prog1.horaDesde, prog1.horaHasta,
          prog2.horaDesde, prog2.horaHasta
        )) {
          conflictos.push({
            dia: dia,
            programacion1: prog1.rad_nombre || `Radio ${prog1.rad_codigo}`,
            programacion2: prog2.rad_nombre || `Radio ${prog2.rad_codigo}`,
            horario1: `${prog1.horaDesde}-${prog1.horaHasta}`,
            horario2: `${prog2.horaDesde}-${prog2.horaHasta}`
          })
        }
      }
    }
  })

  if (conflictos.length > 0) {
    const mensaje = conflictos.map(conf =>
      `Conflicto en día ${conf.dia}: ${conf.programacion1} (${conf.horario1}) se superpone con ${conf.programacion2} (${conf.horario2})`
    ).join('; ')
    throw new Error(`Conflictos de programación detectados: ${mensaje}`)
  }
}

/**
 * Verifica si dos horarios se superponen
 * @param {string} inicio1 - Hora de inicio primera programación
 * @param {string} fin1 - Hora de fin primera programación
 * @param {string} inicio2 - Hora de inicio segunda programación
 * @param {string} fin2 - Hora de fin segunda programación
 * @returns {boolean} True si se superponen
 */
clienteProgramacionRadioService.horariosSeSuperponen = function (inicio1, fin1, inicio2, fin2) {
  const minInicio1 = inicio1.split(':').map(Number).reduce((h, m) => h * 60 + m)
  const minFin1 = fin1.split(':').map(Number).reduce((h, m) => h * 60 + m)
  const minInicio2 = inicio2.split(':').map(Number).reduce((h, m) => h * 60 + m)
  const minFin2 = fin2.split(':').map(Number).reduce((h, m) => h * 60 + m)

  return minInicio1 < minFin2 && minInicio2 < minFin1
}

/**
 * Obtiene programaciones existentes para validar conflictos antes de guardar
 * @param {number} codigoProgramacion - Código de programación
 * @returns {Promise<Array>} Programaciones existentes
 */
clienteProgramacionRadioService.obtenerProgramacionesExistentes = async function (codigoProgramacion) {
  return this.getProgramacionesByProg(codigoProgramacion)
}

/**
 * Valida programación considerando las existentes (para evitar conflictos)
 * @param {Array} nuevasProgramaciones - Nuevas programaciones a validar
 * @param {number} codigoProgramacion - Código de programación para obtener existentes
 * @param {Object} clienteHorario - Horario del cliente
 * @returns {Promise<void>}
 */
clienteProgramacionRadioService.validarProgramacionCompleta = async function (nuevasProgramaciones, codigoProgramacion, clienteHorario = null) {
  // Obtener programaciones existentes
  const existentes = await this.obtenerProgramacionesExistentes(codigoProgramacion)

  // Combinar existentes con nuevas para validación completa
  const todasLasProgramaciones = [...existentes, ...nuevasProgramaciones]

  // Validar conflictos incluyendo las programaciones existentes
  clienteProgramacionRadioService.validarConflictosProgramacion(todasLasProgramaciones)

  // Validar cada nueva programación
  for (const prog of nuevasProgramaciones) {
    clienteProgramacionRadioService.validarProgramacionIndividual(prog, clienteHorario)
  }
}

export default clienteProgramacionRadioService
