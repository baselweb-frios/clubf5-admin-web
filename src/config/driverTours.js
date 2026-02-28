/**
 * ============================================================================
 * CONFIGURACIÓN DE TOURS - DRIVER.JS
 * ============================================================================
 *
 * Este archivo centraliza todas las configuraciones de tours guiados.
 * Para agregar un nuevo tour, simplemente añade una nueva entrada.
 *
 * ESTRUCTURA DE UN STEP:
 * {
 *   element: '[data-tour="nombre"]',  // Selector CSS del elemento
 *   popover: {
 *     title: 'Título',
 *     description: 'Descripción del paso',
 *     side: 'left|right|top|bottom',
 *     align: 'start|center|end'
 *   }
 * }
 *
 * CÓMO AGREGAR DATA-TOUR A UN ELEMENTO:
 * <div data-tour="nombre-elemento">...</div>
 */

// ============================================================================
// CONFIGURACIÓN GLOBAL
// ============================================================================
export const driverGlobalConfig = {
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  animate: true,
  overlayOpacity: 0.75,
  stagePadding: 10,
  stageRadius: 8,
  allowClose: true,
  overlayClickExit: false,
  keyboardControl: true,
  nextBtnText: 'Siguiente',
  prevBtnText: 'Anterior',
  doneBtnText: 'Finalizar',
  progressText: '{{current}} de {{total}}',
  popoverClass: 'driverjs-theme-clubf5'
}

// ============================================================================
// TOURS POR VISTA
// ============================================================================

/**
 * DASHBOARD
 */
export const dashboardTour = {
  id: 'dashboard-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: '¡Bienvenido a ClubF5!',
        description: 'Te guiaremos por las principales funciones del panel de control.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="stats-cards"]',
      popover: {
        title: 'Estadísticas',
        description: 'Resumen de tus sucursales, spots y reproducciones activas.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="dashboard-cards"]',
      popover: {
        title: 'Módulos Principales',
        description: 'Accede rápidamente a cada sección del sistema.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="quick-actions"]',
      popover: {
        title: 'Acciones Rápidas',
        description: 'Realiza las tareas más comunes con un solo clic.',
        side: 'top',
        align: 'start'
      }
    }
  ]
}

/**
 * LOGIN
 */
export const loginTour = {
  id: 'login-tour',
  showOnFirstVisit: false,
  steps: [
    {
      element: '[data-tour="login-form"]',
      popover: {
        title: 'Iniciar Sesión',
        description: 'Ingresa tus credenciales para acceder al sistema.',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '[data-tour="forgot-password"]',
      popover: {
        title: '¿Olvidaste tu contraseña?',
        description: 'Recupera el acceso a tu cuenta desde aquí.',
        side: 'top',
        align: 'center'
      }
    }
  ]
}

/**
 * SUCURSALES
 */
export const sucursalesTour = {
  id: 'sucursales-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Gestión de Sucursales',
        description: 'Administra todas tus sucursales y ubicaciones.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="sucursal-stats"]',
      popover: {
        title: 'Estadísticas',
        description: 'Vista rápida del estado de tus sucursales.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="sucursal-search"]',
      popover: {
        title: 'Búsqueda',
        description: 'Busca sucursales por nombre o usuario.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="sucursal-add"]',
      popover: {
        title: 'Nueva Sucursal',
        description: 'Agrega una nueva sucursal a tu cuenta.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '[data-tour="sucursal-list"]',
      popover: {
        title: 'Lista de Sucursales',
        description: 'Todas tus sucursales con estado de conexión en tiempo real.',
        side: 'top',
        align: 'center'
      }
    }
  ]
}

/**
 * BIBLIOTECA DE SPOTS
 */
export const bibliotecaSpotTour = {
  id: 'biblioteca-spot-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Biblioteca de Spots',
        description: 'Gestiona todos tus spots publicitarios.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="spot-programacion"]',
      popover: {
        title: 'Programación Activa',
        description: 'Tu programación actual de spots.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="spot-tabs"]',
      popover: {
        title: 'Pestañas',
        description: 'Alterna entre la vista de spots y la programación.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="spot-table"]',
      popover: {
        title: 'Tabla de Spots',
        description: 'Lista de todos tus spots con opciones de edición.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="spot-add"]',
      popover: {
        title: 'Crear Spot',
        description: 'Crea un nuevo spot publicitario.',
        side: 'left',
        align: 'center'
      }
    }
  ]
}

/**
 * ALTA DE SPOT
 */
export const altaSpotTour = {
  id: 'alta-spot-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Crear Nuevo Spot',
        description: 'Sigue estos pasos para crear tu spot publicitario.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="spot-info"]',
      popover: {
        title: 'Información del Spot',
        description: 'Nombre, tipo y fechas de vigencia.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="spot-media-tabs"]',
      popover: {
        title: 'Tipo de Media',
        description: 'Sube audio, video, genera con IA o usa streaming.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="spot-upload"]',
      popover: {
        title: 'Subir Archivo',
        description: 'Arrastra o selecciona tu archivo de audio/video.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="spot-ai"]',
      popover: {
        title: 'Generar con IA',
        description: 'Convierte texto a voz con locutores virtuales.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="spot-save"]',
      popover: {
        title: 'Guardar',
        description: 'Guarda tu spot para poder programarlo.',
        side: 'top',
        align: 'center'
      }
    }
  ]
}

/**
 * PROGRAMACIÓN MUSICAL
 */
export const programacionMusicalTour = {
  id: 'programacion-musical-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Programación Musical',
        description: 'Configura la música para tus sucursales.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="music-header"]',
      popover: {
        title: 'Programación Actual',
        description: 'Información de la programación seleccionada.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="music-filter"]',
      popover: {
        title: 'Filtros',
        description: 'Filtra por día de la semana.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '[data-tour="music-schedule"]',
      popover: {
        title: 'Horarios',
        description: 'Programa diferentes estilos según la hora.',
        side: 'top',
        align: 'center'
      }
    },
    {
      element: '[data-tour="music-add"]',
      popover: {
        title: 'Nueva Programación',
        description: 'Crea una nueva franja horaria musical.',
        side: 'left',
        align: 'center'
      }
    }
  ]
}

/**
 * GESTIÓN DE USUARIOS (Admin)
 */
export const usuariosTour = {
  id: 'usuarios-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Gestión de Usuarios',
        description: 'Administra usuarios y permisos del sistema.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="user-tabs"]',
      popover: {
        title: 'Secciones',
        description: 'Clientes activos y solicitudes pendientes.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="user-add"]',
      popover: {
        title: 'Nuevo Cliente',
        description: 'Agrega un nuevo cliente al sistema.',
        side: 'left',
        align: 'center'
      }
    },
    {
      element: '[data-tour="user-list"]',
      popover: {
        title: 'Lista de Usuarios',
        description: 'Todos los usuarios con opciones de gestión.',
        side: 'top',
        align: 'center'
      }
    }
  ]
}

/**
 * RADIOS (Admin)
 */
export const radiosTour = {
  id: 'radios-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Gestión de Radios',
        description: 'Administra las radios del sistema.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="radio-list"]',
      popover: {
        title: 'Lista de Radios',
        description: 'Todas las radios configuradas.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="radio-add"]',
      popover: {
        title: 'Nueva Radio',
        description: 'Crea una nueva configuración de radio.',
        side: 'left',
        align: 'center'
      }
    }
  ]
}

/**
 * CONFIGURACIÓN CLIENTE
 */
export const configuracionClienteTour = {
  id: 'configuracion-cliente-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Configuración Inicial',
        description: 'Completa tu configuración para usar todas las funciones.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="config-horarios"]',
      popover: {
        title: 'Horarios',
        description: 'Define los horarios de operación de tu negocio.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="config-dias"]',
      popover: {
        title: 'Días Disponibles',
        description: 'Selecciona qué días opera tu negocio.',
        side: 'top',
        align: 'start'
      }
    },
    {
      element: '[data-tour="config-empresa"]',
      popover: {
        title: 'Tipo de Empresa',
        description: 'Configura el tipo de negocio.',
        side: 'top',
        align: 'center'
      }
    }
  ]
}

/**
 * FACTURAS
 */
export const facturasTour = {
  id: 'facturas-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Gestión de Recibos',
        description: 'Consulta y gestiona tus recibos de pago.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="facturas-list"]',
      popover: {
        title: 'Lista de Recibos',
        description: 'Historial de recibos y estado de pago.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="facturas-filter"]',
      popover: {
        title: 'Filtros',
        description: 'Filtra por fecha, estado o monto.',
        side: 'left',
        align: 'center'
      }
    }
  ]
}

/**
 * PERFIL
 */
export const perfilTour = {
  id: 'perfil-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Tu Perfil',
        description: 'Administra tu información personal.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="profile-info"]',
      popover: {
        title: 'Información Personal',
        description: 'Actualiza tus datos de contacto.',
        side: 'right',
        align: 'start'
      }
    },
    {
      element: '[data-tour="profile-security"]',
      popover: {
        title: 'Seguridad',
        description: 'Cambia tu contraseña.',
        side: 'left',
        align: 'center'
      }
    }
  ]
}

/**
 * CATEGORÍAS
 */
export const categoriasTour = {
  id: 'categorias-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Gestión de Categorías',
        description: 'Administra las categorías de spots.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="categoria-list"]',
      popover: {
        title: 'Lista de Categorías',
        description: 'Todas las categorías disponibles.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="categoria-add"]',
      popover: {
        title: 'Nueva Categoría',
        description: 'Crea una nueva categoría.',
        side: 'left',
        align: 'center'
      }
    }
  ]
}

/**
 * GÉNEROS MUSICALES
 */
export const generosMusicTour = {
  id: 'generos-music-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Géneros Musicales',
        description: 'Explora los géneros disponibles.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="generos-grid"]',
      popover: {
        title: 'Catálogo',
        description: 'Todos los géneros musicales disponibles.',
        side: 'bottom',
        align: 'center'
      }
    }
  ]
}

/**
 * VOCES ELEVENLABS
 */
export const vocesElevenLabsTour = {
  id: 'voces-elevenlabs-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Voces de IA',
        description: 'Gestiona las voces para texto a voz.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="voces-list"]',
      popover: {
        title: 'Lista de Voces',
        description: 'Voces configuradas con ElevenLabs.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="voces-add"]',
      popover: {
        title: 'Nueva Voz',
        description: 'Agrega una nueva voz al sistema.',
        side: 'left',
        align: 'center'
      }
    }
  ]
}

/**
 * PROGRAMACIÓN DE SPOTS
 */
export const programacionSpotsTour = {
  id: 'programacion-spots-tour',
  showOnFirstVisit: true,
  steps: [
    {
      popover: {
        title: 'Programación de Spots',
        description: 'Define cuándo se reproducen tus spots.',
        side: 'over',
        align: 'center'
      }
    },
    {
      element: '[data-tour="prog-reproductor"]',
      popover: {
        title: 'Seleccionar Reproductor',
        description: 'Elige en qué sucursal programar.',
        side: 'bottom',
        align: 'start'
      }
    },
    {
      element: '[data-tour="prog-horarios"]',
      popover: {
        title: 'Horarios',
        description: 'Define el horario de reproducción.',
        side: 'right',
        align: 'center'
      }
    },
    {
      element: '[data-tour="prog-dias"]',
      popover: {
        title: 'Días',
        description: 'Selecciona los días de la semana.',
        side: 'bottom',
        align: 'center'
      }
    },
    {
      element: '[data-tour="prog-spots"]',
      popover: {
        title: 'Spots Disponibles',
        description: 'Selecciona los spots a programar.',
        side: 'top',
        align: 'center'
      }
    }
  ]
}

// ============================================================================
// MAPEO DE RUTAS A TOURS
// ============================================================================
export const toursByRoute = {
  '/dashboard': dashboardTour,
  '/': dashboardTour,
  '/login': loginTour,
  '/sucursales': sucursalesTour,
  '/bibliotecaSpot': bibliotecaSpotTour,
  '/altaSpot': altaSpotTour,
  '/administrarProgramacion': programacionSpotsTour,
  '/altaProgramacionSpots': programacionSpotsTour,
  '/programaMusica': programacionMusicalTour,
  '/programacionSemanal': programacionMusicalTour,
  '/usuarios': usuariosTour,
  '/radios': radiosTour,
  '/configuracion-cliente': configuracionClienteTour,
  '/facturasAdmin': facturasTour,
  '/facturasCliente': facturasTour,
  '/profile': perfilTour,
  '/categorias': categoriasTour,
  '/generosMusicales': generosMusicTour,
  '/subgenerosMusicales': generosMusicTour,
  '/vocesElevenLabs': vocesElevenLabsTour
}

// ============================================================================
// UTILIDADES
// ============================================================================

export function getTourByRoute(route) {
  return toursByRoute[route] || null
}

export function shouldShowTour(tourId) {
  const viewedTours = JSON.parse(localStorage.getItem('viewedTours') || '[]')
  return !viewedTours.includes(tourId)
}

export function markTourAsViewed(tourId) {
  const viewedTours = JSON.parse(localStorage.getItem('viewedTours') || '[]')
  if (!viewedTours.includes(tourId)) {
    viewedTours.push(tourId)
    localStorage.setItem('viewedTours', JSON.stringify(viewedTours))
  }
}

export function resetAllTours() {
  localStorage.removeItem('viewedTours')
}

export function resetTour(tourId) {
  const viewedTours = JSON.parse(localStorage.getItem('viewedTours') || '[]')
  const index = viewedTours.indexOf(tourId)
  if (index > -1) {
    viewedTours.splice(index, 1)
    localStorage.setItem('viewedTours', JSON.stringify(viewedTours))
  }
}

export function getAllTours() {
  return Object.values(toursByRoute)
}
