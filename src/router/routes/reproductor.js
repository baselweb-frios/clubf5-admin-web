// Routes for Reproductor role
export default [
  // ===== SPOTS (Solo Reproductor) =====
  {
    path: 'bibliotecaSpot',
    name: 'BibliotecaSpot',
    component: () => import('@/pages/Spots/bibliotecaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Biblioteca de Spots' }
  },
  {
    path: 'altaSpot',
    name: 'Cargá tu spot',
    component: () => import('@/pages/Spots/altaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Cargar Spot' }
  },
  {
    path: 'programaSpot',
    name: 'Mis programaciones de spots',
    component: () => import('@/pages/Spots/programaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Programaciones' }
  },
  {
    path: 'administrarProgramacion',
    name: 'Programaciones de spot',
    component: () => import('@/pages/Spots/administrarProgramacion.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Programar Spots' }
  },
  {
    path: 'altaProgramacionSpots',
    name: 'Nueva programación de spot',
    component: () => import('@/pages/Spots/altaProgramacionSpots.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Nueva Programación' }
  },
  {
    path: 'pedidoSpot',
    name: 'Pedidos de Spot',
    component: () => import('@/pages/Spots/pedidoSpot.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Pedidos de Spots' }
  },
  {
    path: 'altaPedidoSpot',
    name: 'Nuevo Pedido de Spot',
    component: () => import('@/pages/Spots/altaPedidoSpot.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Nuevo Pedido' }
  },
  {
    path: 'resumenSpot',
    name: 'Resumen de Spot',
    component: () => import('@/pages/Spots/resumenSpot.vue'),
    meta: { requiresAuth: true, roles: ['Reproductor'], title: 'Resumen Spot' }
  }
]
