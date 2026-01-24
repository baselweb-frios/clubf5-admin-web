import api from './api'

/**
 * Servicio para administrar voces de ElevenLabs
 */
const VozElevenLabsServices = {}

// ========== Voces ElevenLabs ==========

/**
 * Obtener todas las voces sincronizadas
 * @returns {Promise<Array>}
 */
VozElevenLabsServices.getAll = async function () {
  return api.get('/VozElevenLabs').then(res => res.data)
}

/**
 * Obtener solo voces activas
 * @returns {Promise<Array>}
 */
VozElevenLabsServices.getActivas = async function () {
  return api.get('/VozElevenLabs/activas').then(res => res.data)
}

/**
 * Obtener voz por codigo
 * @param {number} codigo
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.getByCodigo = async function (codigo) {
  return api.get(`/VozElevenLabs/${codigo}`).then(res => res.data)
}

/**
 * Obtener voz con sus variaciones
 * @param {number} codigo
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.getVozCompleta = async function (codigo) {
  return api.get(`/VozElevenLabs/${codigo}/completa`).then(res => res.data)
}

/**
 * Sincronizar voces desde ElevenLabs API
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.sincronizar = async function () {
  return api.post('/VozElevenLabs/sincronizar').then(res => res.data)
}

/**
 * Cambiar estado de una voz (activar/desactivar)
 * @param {number} codigo
 * @param {string} estado - 'A' para activo, 'I' para inactivo
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.cambiarEstado = async function (codigo, estado) {
  return api.put(`/VozElevenLabs/${codigo}/estado`, { estado }).then(res => res.data)
}

/**
 * Eliminar una voz
 * @param {number} codigo
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.eliminar = async function (codigo) {
  return api.delete(`/VozElevenLabs/${codigo}`).then(res => res.data)
}

// ========== Variaciones ==========

/**
 * Obtener variaciones de una voz
 * @param {number} codigoVoz
 * @returns {Promise<Array>}
 */
VozElevenLabsServices.getVariaciones = async function (codigoVoz) {
  return api.get(`/VozElevenLabs/${codigoVoz}/completa`).then(res => res.data)
}

/**
 * Obtener una variacion por codigo
 * @param {number} codigo
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.getVariacion = async function (codigo) {
  return api.get(`/VozElevenLabs/variacion/${codigo}`).then(res => res.data)
}

/**
 * Crear nueva variacion
 * @param {number} codigoVoz
 * @param {Object} variacionData
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.crearVariacion = async function (codigoVoz, variacionData) {
  return api.post(`/VozElevenLabs/${codigoVoz}/variacion`, variacionData).then(res => res.data)
}

/**
 * Modificar variacion
 * @param {number} codigo
 * @param {Object} variacionData
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.modificarVariacion = async function (codigo, variacionData) {
  return api.put(`/VozElevenLabs/variacion/${codigo}`, variacionData).then(res => res.data)
}

/**
 * Eliminar variacion
 * @param {number} codigo
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.eliminarVariacion = async function (codigo) {
  return api.delete(`/VozElevenLabs/variacion/${codigo}`).then(res => res.data)
}

/**
 * Generar preview de una variacion
 * @param {number} codigoVariacion
 * @param {string} texto
 * @returns {Promise<Object>}
 */
VozElevenLabsServices.generarPreview = async function (codigoVariacion, texto) {
  return api.post(`/VozElevenLabs/variacion/${codigoVariacion}/preview`, { texto }).then(res => res.data)
}

/**
 * Obtener URL del preview
 * @param {string} fileName
 * @returns {string}
 */
VozElevenLabsServices.getPreviewUrl = function (fileName) {
  if (!fileName) return null
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/'
  // Remover /api/ del final para obtener la URL base del servidor
  const serverUrl = baseUrl.replace(/\/api\/?$/, '')
  return `${serverUrl}/Uploads/voces-previews/${fileName}`
}

/**
 * Obtener voces activas con sus variaciones para uso en generacion de audio
 * @returns {Promise<Array>}
 */
VozElevenLabsServices.getVocesConVariaciones = async function () {
  try {
    const voces = await this.getActivas()
    const vocesConVariaciones = []

    for (const voz of voces) {
      try {
        const {variaciones} = await this.getVariaciones(voz.vel_codigo)

        // Si la voz tiene variaciones, agregar cada variacion como opcion
        if (variaciones && variaciones.length > 0) {
          for (const variacion of variaciones) {
            if (variacion.vva_estado === 'A') {
              vocesConVariaciones.push({
                // Identificadores
                id: `${voz.vel_codigo}_${variacion.vva_codigo}`,
                voz_codigo: voz.vel_codigo,
                variacion_codigo: variacion.vva_codigo,

                // Datos de la voz original (para la API de ElevenLabs)
                voice_id: voz.vel_voice_id,

                // Nombre combinado para mostrar
                name: `${variacion.vva_nombre}`,
                voz_nombre: voz.vel_nombre,
                variacion_nombre: variacion.vva_nombre,

                // Configuraciones de la variacion
                settings: {
                  stability: variacion.vva_stability,
                  similarity_boost: variacion.vva_similarity,
                  style: variacion.vva_style,
                  use_speaker_boost: variacion.vva_speaker_boost,
                  modelId: variacion.vva_model_id
                },

                // Metadatos de la voz
                category: voz.vel_categoria,
                description: voz.vel_descripcion,
                labels: {
                  language: voz.vel_idioma,
                  gender: voz.vel_genero
                },

                // Preview
                preview_url: voz.vel_preview_url,
                variacion_preview_path: variacion.vva_preview_path,
                variacion_preview_texto: variacion.vva_preview_texto
              })
            }
          }
        }
      } catch (error) {
        console.warn(`Error cargando variaciones para voz ${voz.vel_codigo}:`, error)
      }
    }

    return vocesConVariaciones
  } catch (error) {
    console.error('Error cargando voces con variaciones:', error)
    throw error
  }
}

/**
 * Modelos disponibles en ElevenLabs
 */
VozElevenLabsServices.modelos = [
  { id: 'eleven_multilingual_v2', nombre: 'Multilingual v2 (Recomendado)', descripcion: 'Alta calidad, soporta 29 idiomas' },
  { id: 'eleven_turbo_v2_5', nombre: 'Turbo v2.5', descripcion: 'Muy rapido, baja latencia' },
  { id: 'eleven_turbo_v2', nombre: 'Turbo v2', descripcion: 'Rapido, buena calidad' },
  { id: 'eleven_monolingual_v1', nombre: 'Monolingual v1', descripcion: 'Solo ingles, alta calidad' },
  { id: 'eleven_flash_v2_5', nombre: 'Flash v2.5', descripcion: 'Ultra rapido, streaming' }
]

/**
 * Configuracion por defecto para variaciones
 */
VozElevenLabsServices.defaultSettings = {
  stability: 0.75,
  similarity: 0.75,
  style: 0.0,
  speakerBoost: true,
  modelId: 'eleven_multilingual_v2'
}

export default VozElevenLabsServices
