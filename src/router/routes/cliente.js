// Routes for Cliente role
export default [
  // ===== MI PLAN (Solo Cliente) =====
  {
    path: 'mi-plan',
    name: 'MiPlan',
    component: () => import('@/pages/MiPlan/index.vue'),
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Mi Plan' }
  },

  // ===== CONFIGURACIÓN (Solo Cliente) =====
  {
    path: 'configuracion-cliente',
    name: 'ConfiguracionCliente',
    component: () => import('@/pages/ConfiguracionCliente/index.vue'),
    meta: { requiresAuth: true, roles: ['Cliente', 'Administrador'], title: 'Configuración del Cliente' }
  },

  // ===== FACTURAS (Solo Cliente) =====
  {
    path: 'facturas',
    name: 'FacturasCliente',
    component: () => import('@/pages/Facturas/FacturasCliente.vue'),
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Mis Facturas' }
  },

  // ===== SUCURSALES (Solo Cliente) =====
  {
    path: 'sucursales',
    name: 'Sucursales',
    component: () => import('@/pages/Sucursales/GestionSucursalesCards.vue'),
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Gestión de Sucursales' }
  },

  // ===== MÚSICA (Solo Cliente) =====
  {
    path: 'programaMusica',
    name: 'ProgramaMusica',
    component: () => import('@/pages/Musica/Index.vue'),
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Mis Programaciones' }
  },
  {
    path: 'altaProgramacionMusica/:codigoProgramacion/:nombreProgramacion?',
    name: 'Nueva programación de música',
    component: () => import('@/pages/Musica/altaProgramacion.vue'),
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Nueva Programación' }
  },
  {
    path: 'programacionSemanal/:codigoProgramacion/:nombreProgramacion',
    name: 'Programaciones de música',
    component: () => import('@/pages/Musica/programacionSemanal.vue'),
    meta: { requiresAuth: true, roles: ['Cliente'], title: 'Programación Semanal' }
  },

  // ===== SPOTS (Cliente, Operador, Reproductor) =====
  {
    path: 'bibliotecaSpot',
    name: 'BibliotecaSpot',
    component: () => import('@/pages/Spots/bibliotecaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Cliente', 'Reproductor'], title: 'Biblioteca de Spots' }
  },
  {
    path: 'altaSpot',
    name: 'Cargá tu spot',
    component: () => import('@/pages/Spots/altaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Cliente', 'Reproductor'], title: 'Cargar Spot' }
  },
  {
    path: 'programaSpot',
    name: 'Mis programaciones de spots',
    component: () => import('@/pages/Spots/programaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Cliente', 'Reproductor'], title: 'Programaciones' }
  },
  {
    path: 'administrarProgramacion',
    name: 'Programaciones de spot',
    component: () => import('@/pages/Spots/administrarProgramacion.vue'),
    meta: { requiresAuth: true, roles: ['Cliente', 'Reproductor'], title: 'Programar Spots' }
  },
  {
    path: 'altaProgramacionSpots',
    name: 'Nueva programación de spot',
    component: () => import('@/pages/Spots/altaProgramacionSpots.vue'),
    meta: { requiresAuth: true, roles: ['Cliente', 'Reproductor'], title: 'Nueva Programación' }
  }
]
