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
  }
]
