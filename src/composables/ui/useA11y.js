/**
 * ============================================================================
 * useA11y - Composable para Helpers de Accesibilidad
 * ============================================================================
 *
 * Proporciona utilidades para mejorar la accesibilidad (a11y) en componentes.
 * Basado en WCAG 2.2 Level AA.
 */

import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

/**
 * Genera IDs únicos y estables para elementos
 * Evita IDs aleatorios que cambian en cada render (problema en SSR)
 */
let idCounter = 0
export function useUniqueId(prefix = 'id') {
  const id = ref('')

  onMounted(() => {
    if (!id.value) {
      id.value = `${prefix}-${++idCounter}-${Date.now()}`
    }
  })

  return id
}

/**
 * Focus Trap - Mantiene el foco dentro de un elemento (útil para modales)
 *
 * @param {Ref<HTMLElement>} elementRef - Referencia al elemento contenedor
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Métodos activate/deactivate
 *
 * @example
 * const modalRef = ref(null)
 * const { activate, deactivate } = useFocusTrap(modalRef)
 *
 * watch(isModalOpen, (open) => {
 *   if (open) activate()
 *   else deactivate()
 * })
 */
export function useFocusTrap(elementRef, options = {}) {
  const {
    initialFocus = null,
    returnFocus = true,
    allowOutsideClick = false
  } = options

  let previousActiveElement = null
  let isActive = false

  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]'
  ].join(', ')

  const getFocusableElements = () => {
    if (!elementRef.value) return []
    return Array.from(elementRef.value.querySelectorAll(focusableSelectors))
      .filter(el => !el.hasAttribute('disabled') && el.tabIndex !== -1)
  }

  const handleKeyDown = (event) => {
    if (!isActive || event.key !== 'Tab') return

    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) {
      event.preventDefault()
      return
    }

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Shift + Tab en el primer elemento -> ir al último
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
    }
    // Tab en el último elemento -> ir al primero
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  const handleClickOutside = (event) => {
    if (!isActive || allowOutsideClick) return
    if (elementRef.value && !elementRef.value.contains(event.target)) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  const activate = async () => {
    if (isActive) return

    // Guardar el elemento que tenía el foco
    previousActiveElement = document.activeElement

    await nextTick()

    // Enfocar el primer elemento o el especificado
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      const elementToFocus = initialFocus || focusableElements[0]
      elementToFocus.focus()
    }

    // Agregar event listeners
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside, true)

    isActive = true
  }

  const deactivate = () => {
    if (!isActive) return

    // Remover event listeners
    document.removeEventListener('keydown', handleKeyDown)
    document.removeEventListener('mousedown', handleClickOutside, true)

    // Restaurar foco al elemento anterior
    if (returnFocus && previousActiveElement) {
      nextTick(() => {
        previousActiveElement?.focus?.()
      })
    }

    isActive = false
  }

  // Limpiar al desmontar
  onUnmounted(() => {
    deactivate()
  })

  return {
    activate,
    deactivate,
    isActive: () => isActive
  }
}

/**
 * Announcer para lectores de pantalla
 * Usa un live region para anunciar mensajes dinámicos
 *
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Método announce
 *
 * @example
 * const { announce } = useScreenReaderAnnouncer()
 * announce('Spot programado correctamente', 'polite')
 */
export function useScreenReaderAnnouncer(options = {}) {
  const {
    role = 'status',
    'aria-live': ariaLive = 'polite'
  } = options

  let announcerElement = null

  onMounted(() => {
    // Crear live region si no existe
    announcerElement = document.getElementById('sr-announcer')

    if (!announcerElement) {
      announcerElement = document.createElement('div')
      announcerElement.id = 'sr-announcer'
      announcerElement.setAttribute('role', role)
      announcerElement.setAttribute('aria-live', ariaLive)
      announcerElement.setAttribute('aria-atomic', 'true')
      announcerElement.className = 'sr-only'
      announcerElement.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `
      document.body.appendChild(announcerElement)
    }
  })

  const announce = (message, priority = 'polite') => {
    if (!announcerElement) return

    // Actualizar aria-live según prioridad
    announcerElement.setAttribute('aria-live', priority)

    // Limpiar y luego agregar mensaje para que se anuncie
    announcerElement.textContent = ''
    setTimeout(() => {
      announcerElement.textContent = message
    }, 100)
  }

  return {
    announce
  }
}

/**
 * Manejo de navegación por teclado
 * Útil para listas, grids, etc.
 *
 * @param {Ref<Array>} items - Ref con array de items
 * @param {Object} options - Opciones
 * @returns {Object} - Estado y handlers
 *
 * @example
 * const items = ref([...])
 * const { currentIndex, handleKeyDown } = useKeyboardNavigation(items, {
 *   onSelect: (item) => console.log('Selected:', item)
 * })
 */
export function useKeyboardNavigation(items, options = {}) {
  const {
    loop = true,
    onSelect = null,
    orientation = 'vertical' // 'vertical' | 'horizontal' | 'both'
  } = options

  const currentIndex = ref(-1)

  const next = () => {
    if (currentIndex.value < items.value.length - 1) {
      currentIndex.value++
    } else if (loop) {
      currentIndex.value = 0
    }
  }

  const previous = () => {
    if (currentIndex.value > 0) {
      currentIndex.value--
    } else if (loop) {
      currentIndex.value = items.value.length - 1
    }
  }

  const first = () => {
    currentIndex.value = 0
  }

  const last = () => {
    currentIndex.value = items.value.length - 1
  }

  const select = () => {
    if (currentIndex.value >= 0 && currentIndex.value < items.value.length) {
      const item = items.value[currentIndex.value]
      onSelect?.(item, currentIndex.value)
    }
  }

  const handleKeyDown = (event) => {
    const { key } = event

    const verticalKeys = ['ArrowUp', 'ArrowDown']
    const horizontalKeys = ['ArrowLeft', 'ArrowRight']

    let handled = false

    if (orientation === 'vertical' || orientation === 'both') {
      if (key === 'ArrowDown') {
        next()
        handled = true
      } else if (key === 'ArrowUp') {
        previous()
        handled = true
      }
    }

    if (orientation === 'horizontal' || orientation === 'both') {
      if (key === 'ArrowRight') {
        next()
        handled = true
      } else if (key === 'ArrowLeft') {
        previous()
        handled = true
      }
    }

    if (key === 'Home') {
      first()
      handled = true
    } else if (key === 'End') {
      last()
      handled = true
    } else if (key === 'Enter' || key === ' ') {
      select()
      handled = true
    }

    if (handled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  return {
    currentIndex,
    next,
    previous,
    first,
    last,
    select,
    handleKeyDown
  }
}

/**
 * Detecta si el usuario prefiere reducir movimiento
 * Útil para respetar preferencias de accesibilidad
 */
export function usePrefersReducedMotion() {
  const prefersReducedMotion = ref(false)

  onMounted(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion.value = mediaQuery.matches

    const handler = (e) => {
      prefersReducedMotion.value = e.matches
    }

    mediaQuery.addEventListener('change', handler)

    onUnmounted(() => {
      mediaQuery.removeEventListener('change', handler)
    })
  })

  return prefersReducedMotion
}

/**
 * Gestión de descripciones ARIA
 * Vincula descripciones de error, hint, etc. con inputs
 */
export function useAriaDescribedBy() {
  const descriptionIds = ref([])

  const addDescription = (id) => {
    if (!descriptionIds.value.includes(id)) {
      descriptionIds.value.push(id)
    }
  }

  const removeDescription = (id) => {
    const index = descriptionIds.value.indexOf(id)
    if (index > -1) {
      descriptionIds.value.splice(index, 1)
    }
  }

  const describedBy = computed(() => {
    return descriptionIds.value.join(' ') || undefined
  })

  return {
    describedBy,
    addDescription,
    removeDescription
  }
}
