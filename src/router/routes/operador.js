// Routes for Operador role
// Note: Spots routes are shared with Cliente and Reproductor roles
// The actual route definitions with all roles are in cliente.js
export default [
  // ===== SPOTS (compartido: Cliente, Operador, Reproductor) =====
  {
    path: 'bibliotecaSpot',
    name: 'BibliotecaSpot',
    component: () => import('@/pages/Spots/bibliotecaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Operador'], title: 'Biblioteca de Spots' }
  },
  {
    path: 'altaSpot',
    name: 'Cargá tu spot',
    component: () => import('@/pages/Spots/altaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Operador'], title: 'Cargar Spot' }
  },
  {
    path: 'programaSpot',
    name: 'Mis programaciones de spots',
    component: () => import('@/pages/Spots/programaSpot.vue'),
    meta: { requiresAuth: true, roles: ['Operador'], title: 'Programaciones' }
  },
  {
    path: 'administrarProgramacion',
    name: 'Programaciones de spot',
    component: () => import('@/pages/Spots/administrarProgramacion.vue'),
    meta: { requiresAuth: true, roles: ['Operador'], title: 'Programar Spots' }
  },
  {
    path: 'altaProgramacionSpots',
    name: 'Nueva programación de spot',
    component: () => import('@/pages/Spots/altaProgramacionSpots.vue'),
    meta: { requiresAuth: true, roles: ['Operador'], title: 'Nueva Programación' }
  },
  {
    path: 'resumenSpot',
    name: 'Resumen de Spot',
    component: () => import('@/pages/Spots/resumenSpot.vue'),
    meta: { requiresAuth: true, roles: ['Operador'], title: 'Resumen Spot' }
  }
]
