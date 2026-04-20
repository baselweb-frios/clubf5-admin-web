// Routes for Administrador role
export default [
  ///====== GETIÓN RADIOS (Solo Administrador) =====
  {
    path: 'radios',
    name: 'Radios',
    component: () => import('@/pages/Radios/Index.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Gestión de Radios' }
  },
  // ===== GESTIÓN DE USUARIOS (Solo Administrador) =====
  {
    path: 'usuarios',
    name: 'Usuarios',
    component: () => import('@/pages/Usuarios/UsuariosUnificado.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Gestión de Usuarios' }
  },

  // ===== FACTURACIÓN (Solo Administrador) =====
  {
    path: 'facturasAdmin',
    name: 'Facturas',
    component: () => import('@/pages/Facturas/FacturasAdmin.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Facturación' }
  },

  // ===== GESTIÓN DE MÚSICA (Solo Administrador) =====
  {
    path: 'musica/generos',
    name: 'Generos Musicales',
    component: () => import('@/pages/Musica/GenerosMusicales.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Géneros Musicales' }
  },
  {
    path: 'musica/subgeneros/:codigoGenero?',
    name: 'Subgeneros Musicales',
    component: () => import('@/pages/Musica/SubgenerosMusicales.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Subgéneros Musicales' }
  },
  {
    path: 'musica/archivos',
    name: 'Gestion Archivos',
    component: () => import('@/pages/Musica/GestionArchivos.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Gestión de Archivos' }
  },

  // ===== GESTIÓN DE PAQUETES (Solo Administrador) =====
  {
    path: 'paquetes',
    name: 'Paquetes',
    component: () => import('@/pages/Paquetes/ABM_Paquetes.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Gestión de Paquetes' }
  },

  // ===== BANCO DE PRUEBAS DE EMAIL (Solo Administrador) =====
  {
    path: 'email-test',
    name: 'EmailTest',
    component: () => import('@/pages/Admin/EmailTestBench.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Banco de Pruebas de Email' }
  },

  // ===== VOCES ELEVENLABS (Solo Administrador) =====
  {
    path: 'voces-elevenlabs',
    name: 'VocesElevenLabs',
    component: () => import('@/pages/Admin/VocesElevenLabs/Index.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Voces ElevenLabs' }
  },

  // ===== EDITOR LANDING PAGE (Solo Administrador) =====
  {
    path: 'landing-editor',
    name: 'LandingEditor',
    component: () => import('@/pages/Admin/LandingEditor/Index.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'Editor Landing Page' }
  },

  // ===== CONSOLA OBS API (Solo Administrador) =====
  {
    path: 'obs-api-console',
    name: 'ObsApiConsole',
    component: () => import('@/pages/Admin/ObsApiConsole/Index.vue'),
    meta: { requiresAuth: true, roles: ['Administrador'], title: 'OBS API Console' }
  }
]
