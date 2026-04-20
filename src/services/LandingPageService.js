/**
 * LandingPageService - Servicio para gestion de configuracion de Landing Page
 *
 * Actualmente usa localStorage como almacenamiento temporal.
 * Cuando el backend este disponible, solo cambiar las implementaciones internas.
 */

const STORAGE_KEY = 'landing_page_config'

// Configuracion por defecto
const getDefaultConfig = () => ({
  hero: {
    title: 'ClubF5',
    tagline: 'El placer de escuchar',
    subtitle: 'Plataforma integral de gestion de radio y streaming en tiempo real. Administra contenido, programacion y spots publicitarios desde una solucion completa y profesional.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-city-lights-at-night-4158-large.mp4',
    ctaButtons: [
      { id: 1, text: 'Explorar Plataformas', link: '#plataformas', icon: 'fas fa-play', variant: 'primary' },
      { id: 2, text: 'Ver Caracteristicas', link: '#caracteristicas', icon: 'fas fa-info-circle', variant: 'outline' }
    ]
  },
  platforms: {
    title: 'Nuestras Plataformas',
    description: 'Soluciones disenadas para cada necesidad de tu negocio de radio',
    items: [
      {
        id: 1,
        icon: 'fas fa-users-cog',
        title: 'Panel de control (Gestion)',
        description: 'Sistema completo de gestion de radio y publicidad con control total sobre programacion musica y publicidad.',
        features: [
          'Gestion de programacion de radio',
          'Control de spots publicitarios',
          'Gestion de locutores y clientes',
          'Generacion de voz con IA',
          'Panel de control en tiempo real'
        ]
      },
      {
        id: 2,
        icon: 'fas fa-mobile-alt',
        title: 'Reproductor',
        description: 'Experiencia de usuario premium con reproduccion en vivo, PWA y soporte offline.',
        features: [
          'Streaming de radio en vivo (HLS)',
          'Progressive Web App (PWA)',
          'Reproduccion offline',
          'Optimizado para moviles',
          'Actualizaciones en tiempo real'
        ]
      }
    ]
  },
  features: {
    title: 'Caracteristicas Destacadas',
    description: 'Tecnologia de vanguardia para una experiencia completa',
    items: [
      {
        id: 1,
        icon: 'fas fa-broadcast-tower',
        title: 'Streaming en Tiempo Real',
        description: 'Transmision de alta calidad con protocolo HLS y conexiones con sincronizacion instantanea.'
      },
      {
        id: 2,
        icon: 'fas fa-calendar-alt',
        title: 'Programacion Inteligente',
        description: 'Sistema avanzado de calendarizacion de contenido con gestion de horarios, repetidoras y dias habiles.'
      },
      {
        id: 3,
        icon: 'fas fa-ad',
        title: 'Gestion de Publicidad',
        description: 'Control completo de spots publicitarios, con seguimiento de reproducciones y generacion automatizada.'
      },
      {
        id: 4,
        icon: 'fas fa-microphone',
        title: 'Voz Sintetica con IA',
        description: 'Integracion con Agentes de IA para generar locuciones profesionales con inteligencia artificial.'
      }
    ]
  },
  stats: {
    items: [
      { id: 1, number: '2', label: 'Plataformas Integradas' },
      { id: 2, number: '24/7', label: 'Transmision Continua' },
      { id: 3, number: '100%', label: 'Web Responsive' },
      { id: 4, number: 'PWA', label: 'Instalable' }
    ]
  },
  footer: {
    copyrightText: 'ClubF5. Todos los derechos reservados.'
  }
})

const LandingPageService = {}

/**
 * Obtener configuracion publica (sin autenticacion)
 * @returns {Promise<Object>} Configuracion de la landing page
 */
LandingPageService.getPublic = async function() {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 100))

  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : getDefaultConfig()
}

/**
 * Obtener configuracion (admin con autenticacion)
 * @returns {Promise<Object>} Configuracion de la landing page
 */
LandingPageService.get = async function() {
  // En el futuro: return api.get('/LandingPage/admin').then(res => res.data)
  await new Promise(resolve => setTimeout(resolve, 100))

  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : getDefaultConfig()
}

/**
 * Actualizar configuracion completa
 * @param {Object} config - Nueva configuracion
 * @returns {Promise<Object>} Configuracion actualizada
 */
LandingPageService.update = async function(config) {
  // En el futuro: return api.put('/LandingPage', config).then(res => res.data)
  await new Promise(resolve => setTimeout(resolve, 200))

  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  return config
}

/**
 * Actualizar una seccion especifica
 * @param {string} section - Nombre de la seccion (hero, platforms, features, stats, footer)
 * @param {Object} data - Datos de la seccion
 * @returns {Promise<Object>} Configuracion actualizada
 */
LandingPageService.updateSection = async function(section, data) {
  // En el futuro: return api.patch(`/LandingPage/${section}`, data).then(res => res.data)
  await new Promise(resolve => setTimeout(resolve, 150))

  const config = await LandingPageService.get()
  config[section] = data
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  return config
}

/**
 * Restaurar configuracion por defecto
 * @returns {Promise<Object>} Configuracion por defecto
 */
LandingPageService.resetToDefault = async function() {
  await new Promise(resolve => setTimeout(resolve, 100))

  const defaultConfig = getDefaultConfig()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig))
  return defaultConfig
}

/**
 * Obtener configuracion por defecto (para referencia/comparacion)
 * @returns {Object} Configuracion por defecto
 */
LandingPageService.getDefaultConfig = getDefaultConfig

export default LandingPageService
