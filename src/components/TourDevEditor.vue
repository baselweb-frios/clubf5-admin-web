<template>
  <div v-if="isDev">
    <!-- Toggle Button -->
    <button
      class="tour-dev-toggle"
      :class="{ 'tour-dev-toggle--active': isOpen }"
      title="Tour Editor (Ctrl+Shift+T)"
      @click="isOpen = !isOpen"
    >
      <i class="fa fa-map-signs" />
      <span>Tour</span>
      <span
        v-if="localSteps.length"
        class="tour-dev-badge"
      >{{ localSteps.length }}</span>
    </button>

    <!-- Main Panel -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        class="tour-dev-panel"
        :style="panelStyle"
      >
        <!-- Header -->
        <div
          class="tour-dev-header"
          @mousedown="startDrag"
        >
          <div class="tour-dev-header__title">
            <i class="fa fa-map-signs" />
            Tour Dev Editor
            <span class="tour-dev-route">{{ currentRoute }}</span>
          </div>
          <div class="tour-dev-header__actions">
            <button
              class="tour-dev-icon-btn"
              title="Minimizar"
              @click="minimized = !minimized"
            >
              <i :class="minimized ? 'fa fa-expand' : 'fa fa-minus'" />
            </button>
            <button
              class="tour-dev-icon-btn tour-dev-icon-btn--close"
              title="Cerrar"
              @click="isOpen = false"
            >
              <i class="fa fa-times" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div
          v-if="!minimized"
          class="tour-dev-body"
        >
          <!-- Toolbar -->
          <div class="tour-dev-toolbar">
            <button
              class="tour-dev-btn tour-dev-btn--primary"
              title="Agregar step vacío"
              @click="addStep"
            >
              <i class="fa fa-plus" /> Step
            </button>
            <button
              class="tour-dev-btn tour-dev-btn--info"
              :class="{ 'tour-dev-btn--active': pickerMode }"
              title="Seleccionar elemento del DOM"
              @click="togglePickerMode"
            >
              <i class="fa fa-crosshairs" />
              {{ pickerMode ? 'Cancelar' : 'Picker' }}
            </button>
            <button
              class="tour-dev-btn tour-dev-btn--success"
              :disabled="!localSteps.length"
              title="Probar tour con config actual"
              @click="testTour"
            >
              <i class="fa fa-play" /> Probar
            </button>
            <button
              class="tour-dev-btn tour-dev-btn--warning"
              :disabled="!localSteps.length"
              title="Exportar código"
              @click="showExport = !showExport"
            >
              <i class="fa fa-code" /> Export
            </button>
            <button
              class="tour-dev-btn"
              title="Cargar tour de la ruta actual"
              @click="loadCurrentRouteTour"
            >
              <i class="fa fa-download" /> Cargar
            </button>
            <button
              class="tour-dev-btn"
              title="Limpiar todos los steps"
              @click="clearSteps"
            >
              <i class="fa fa-trash" />
            </button>
          </div>

          <!-- Picker info -->
          <div
            v-if="pickerMode"
            class="tour-dev-picker-info"
          >
            <i class="fa fa-crosshairs" />
            <span>Haz clic en cualquier elemento para capturar su selector</span>
            <span
              v-if="pickerTargetStep !== null"
              class="tour-dev-picker-target"
            >→ Step {{ pickerTargetStep + 1 }}</span>
          </div>

          <!-- Export Panel -->
          <div
            v-if="showExport"
            class="tour-dev-export"
          >
            <div class="tour-dev-export__header">
              <span>Código exportado</span>
              <button
                class="tour-dev-btn tour-dev-btn--xs"
                @click="copyExport"
              >
                <i :class="copied ? 'fa fa-check' : 'fa fa-copy'" />
                {{ copied ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
            <pre class="tour-dev-export__code">{{ exportedCode }}</pre>
          </div>

          <!-- Steps List -->
          <div class="tour-dev-steps">
            <div
              v-if="!localSteps.length"
              class="tour-dev-empty"
            >
              <i class="fa fa-inbox" />
              <p>Sin steps. Agrega uno o carga el tour de la ruta.</p>
            </div>

            <div
              v-for="(step, index) in localSteps"
              :key="index"
              class="tour-dev-step"
              :class="{ 'tour-dev-step--expanded': expandedSteps.includes(index) }"
            >
              <!-- Step Header -->
              <div
                class="tour-dev-step__header"
                @click="toggleStep(index)"
              >
                <div class="tour-dev-step__num">
{{ index + 1 }}
</div>
                <div class="tour-dev-step__summary">
                  <span class="tour-dev-step__title">{{ step.popover?.title || '(sin título)' }}</span>
                  <span
                    v-if="step.element"
                    class="tour-dev-step__selector"
                  >{{ step.element }}</span>
                  <span
                    v-else
                    class="tour-dev-step__overlay"
                  >overlay</span>
                </div>
                <div class="tour-dev-step__actions">
                  <button
                    class="tour-dev-icon-btn"
                    title="Capturar elemento con picker"
                    @click.stop="activatePickerForStep(index)"
                  >
                    <i
class="fa fa-crosshairs"
:class="{ 'text-yellow-400': pickerMode && pickerTargetStep === index }"
/>
                  </button>
                  <button
                    class="tour-dev-icon-btn"
                    title="Probar solo este step"
                    @click.stop="testStep(index)"
                  >
                    <i class="fa fa-eye" />
                  </button>
                  <button
                    :disabled="index === 0"
                    class="tour-dev-icon-btn"
                    title="Subir"
                    @click.stop="moveStep(index, -1)"
                  >
                    <i class="fa fa-arrow-up" />
                  </button>
                  <button
                    :disabled="index === localSteps.length - 1"
                    class="tour-dev-icon-btn"
                    title="Bajar"
                    @click.stop="moveStep(index, 1)"
                  >
                    <i class="fa fa-arrow-down" />
                  </button>
                  <button
                    class="tour-dev-icon-btn tour-dev-icon-btn--danger"
                    title="Eliminar step"
                    @click.stop="removeStep(index)"
                  >
                    <i class="fa fa-trash" />
                  </button>
                </div>
              </div>

              <!-- Step Editor (expanded) -->
              <div
                v-if="expandedSteps.includes(index)"
                class="tour-dev-step__body"
              >
                <!-- Element selector -->
                <div class="tour-dev-field">
                  <label class="tour-dev-label">
                    <i class="fa fa-code" /> Selector CSS
                    <span class="tour-dev-label__hint">(vacío = overlay)</span>
                  </label>
                  <div class="tour-dev-field__row">
                    <input
                      v-model="step.element"
                      class="tour-dev-input"
                      placeholder="[data-tour='mi-elemento']"
                      @input="validateElement(step)"
                    >
                    <button
                      class="tour-dev-btn tour-dev-btn--xs"
                      title="Highlight elemento en pantalla"
                      @click="highlightElement(step.element)"
                    >
                      <i class="fa fa-eye" />
                    </button>
                  </div>
                  <span
                    v-if="step._elementValid === false"
                    class="tour-dev-field__error"
                  >
                    <i class="fa fa-exclamation-triangle" /> Elemento no encontrado en el DOM
                  </span>
                  <span
                    v-else-if="step._elementValid === true"
                    class="tour-dev-field__ok"
                  >
                    <i class="fa fa-check-circle" /> Elemento encontrado
                  </span>
                </div>

                <!-- Title -->
                <div class="tour-dev-field">
                  <label class="tour-dev-label">
                    <i class="fa fa-header" /> Título
                  </label>
                  <input
                    v-model="step.popover.title"
                    class="tour-dev-input"
                    placeholder="Título del popover"
                  >
                </div>

                <!-- Description -->
                <div class="tour-dev-field">
                  <label class="tour-dev-label">
                    <i class="fa fa-align-left" /> Descripción
                  </label>
                  <textarea
                    v-model="step.popover.description"
                    class="tour-dev-textarea"
                    rows="3"
                    placeholder="Descripción del paso..."
                  />
                </div>

                <!-- Side & Align -->
                <div class="tour-dev-field tour-dev-field--row">
                  <div class="tour-dev-field__half">
                    <label class="tour-dev-label">
                      <i class="fa fa-arrows" /> Side
                    </label>
                    <select
                      v-model="step.popover.side"
                      class="tour-dev-select"
                    >
                      <option value="">
auto
</option>
                      <option value="top">
top
</option>
                      <option value="bottom">
bottom
</option>
                      <option value="left">
left
</option>
                      <option value="right">
right
</option>
                      <option value="over">
over (overlay)
</option>
                    </select>
                  </div>
                  <div class="tour-dev-field__half">
                    <label class="tour-dev-label">
                      <i class="fa fa-align-center" /> Align
                    </label>
                    <select
                      v-model="step.popover.align"
                      class="tour-dev-select"
                    >
                      <option value="start">
start
</option>
                      <option value="center">
center
</option>
                      <option value="end">
end
</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Element Picker Overlay -->
      <div
        v-if="pickerMode"
        class="tour-dev-picker-overlay"
        @mousemove="onPickerMove"
        @click.prevent.stop="onPickerClick"
        @keydown.esc="togglePickerMode"
      />

      <!-- Picker highlight box -->
      <div
        v-if="pickerMode && pickerHighlight.visible"
        class="tour-dev-picker-highlight"
        :style="{
          top: pickerHighlight.top + 'px',
          left: pickerHighlight.left + 'px',
          width: pickerHighlight.width + 'px',
          height: pickerHighlight.height + 'px'
        }"
      >
        <span class="tour-dev-picker-highlight__label">{{ pickerHighlight.selector }}</span>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { driver } from 'driver.js'
import { getTourByRoute, driverGlobalConfig } from '@/config/driverTours'

// ============================================================================
// CSS selector generator (preferring data-tour attributes)
// ============================================================================
function generateSelector(el) {
  if (!el || el === document.body) return ''

  // 1. Prefer data-tour attribute
  const dataTour = el.getAttribute('data-tour')
  if (dataTour) return `[data-tour="${dataTour}"]`

  // 2. Use id if available
  if (el.id) return `#${el.id}`

  // 3. Build class-based selector with tag
  const tag = el.tagName.toLowerCase()
  const classes = Array.from(el.classList)
    .filter(c => !c.startsWith('hover:') && !c.startsWith('focus:') && c.length < 30)
    .slice(0, 2)
    .join('.')

  const base = classes ? `${tag}.${classes}` : tag

  // 4. Add nth-of-type if needed for uniqueness
  if (document.querySelectorAll(base).length === 1) return base

  const parent = el.parentElement
  if (!parent) return base

  const siblings = Array.from(parent.children).filter(c => c.tagName === el.tagName)
  if (siblings.length > 1) {
    const idx = siblings.indexOf(el) + 1
    return `${generateSelector(parent)} > ${tag}:nth-of-type(${idx})`
  }

  return `${generateSelector(parent)} > ${base}`
}

export default {
  name: 'TourDevEditor',
  setup() {
    const isDev = import.meta.env.DEV
    const route = useRoute()

    // Panel state
    const isOpen = ref(false)
    const minimized = ref(false)
    const showExport = ref(false)
    const copied = ref(false)
    const expandedSteps = ref([])

    // Drag state
    const panelPos = reactive({ x: window.innerWidth - 480, y: 60 })
    const drag = reactive({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 })

    const panelStyle = computed(() => ({
      left: `${panelPos.x}px`,
      top: `${panelPos.y}px`
    }))

    const startDrag = (e) => {
      drag.active = true
      drag.startX = e.clientX
      drag.startY = e.clientY
      drag.originX = panelPos.x
      drag.originY = panelPos.y
    }

    const onMouseMove = (e) => {
      if (!drag.active) return
      panelPos.x = drag.originX + (e.clientX - drag.startX)
      panelPos.y = drag.originY + (e.clientY - drag.startY)
    }

    const onMouseUp = () => { drag.active = false }

    // Steps
    const localSteps = ref([])

    const currentRoute = computed(() => route.path)

    const loadCurrentRouteTour = () => {
      const config = getTourByRoute(route.path)
      if (!config) {
        alert(`No hay tour configurado para: ${route.path}`)
        return
      }
      // Deep clone to avoid mutating originals
      localSteps.value = JSON.parse(JSON.stringify(config.steps)).map(s => ({
        ...s,
        element: s.element || '',
        popover: {
          title: s.popover?.title || '',
          description: s.popover?.description || '',
          side: s.popover?.side || 'bottom',
          align: s.popover?.align || 'center'
        }
      }))
      expandedSteps.value = []
    }

    const addStep = () => {
      const newStep = {
        element: '',
        popover: { title: '', description: '', side: 'bottom', align: 'center' }
      }
      localSteps.value.push(newStep)
      expandedSteps.value.push(localSteps.value.length - 1)
    }

    const removeStep = (index) => {
      localSteps.value.splice(index, 1)
      expandedSteps.value = expandedSteps.value
        .filter(i => i !== index)
        .map(i => (i > index ? i - 1 : i))
    }

    const clearSteps = () => {
      if (!localSteps.value.length) return
      if (!confirm('¿Limpiar todos los steps?')) return
      localSteps.value = []
      expandedSteps.value = []
    }

    const moveStep = (index, dir) => {
      const newIndex = index + dir
      if (newIndex < 0 || newIndex >= localSteps.value.length) return
      const steps = [...localSteps.value]
      ;[steps[index], steps[newIndex]] = [steps[newIndex], steps[index]]
      localSteps.value = steps
      // Update expanded indices
      expandedSteps.value = expandedSteps.value.map(i => {
        if (i === index) return newIndex
        if (i === newIndex) return index
        return i
      })
    }

    const toggleStep = (index) => {
      const idx = expandedSteps.value.indexOf(index)
      if (idx > -1) {
        expandedSteps.value.splice(idx, 1)
      } else {
        expandedSteps.value.push(index)
      }
    }

    const validateElement = (step) => {
      if (!step.element) {
        step._elementValid = null
        return
      }
      try {
        step._elementValid = !!document.querySelector(step.element)
      } catch {
        step._elementValid = false
      }
    }

    // Element picker
    const pickerMode = ref(false)
    const pickerTargetStep = ref(null)
    const pickerHighlight = reactive({ visible: false, top: 0, left: 0, width: 0, height: 0, selector: '' })

    const togglePickerMode = () => {
      pickerMode.value = !pickerMode.value
      if (!pickerMode.value) {
        pickerHighlight.visible = false
        pickerTargetStep.value = null
      }
    }

    const activatePickerForStep = (index) => {
      pickerTargetStep.value = index
      pickerMode.value = true
      // Expand this step so user can see the result
      if (!expandedSteps.value.includes(index)) {
        expandedSteps.value.push(index)
      }
    }

    // Elements to ignore when picking (our own UI)
    const IGNORED_SELECTORS = ['.tour-dev-picker-overlay', '.tour-dev-panel', '.tour-dev-toggle', '.tour-dev-picker-highlight']

    const getPickableElement = (e) => {
      const els = document.elementsFromPoint(e.clientX, e.clientY)
      return els.find(el => !IGNORED_SELECTORS.some(s => el.closest(s)))
    }

    const onPickerMove = (e) => {
      const el = getPickableElement(e)
      if (!el || el === document.body || el === document.documentElement) {
        pickerHighlight.visible = false
        return
      }
      const rect = el.getBoundingClientRect()
      pickerHighlight.visible = true
      pickerHighlight.top = rect.top + window.scrollY
      pickerHighlight.left = rect.left + window.scrollX
      pickerHighlight.width = rect.width
      pickerHighlight.height = rect.height
      pickerHighlight.selector = generateSelector(el)
    }

    const onPickerClick = (e) => {
      const el = getPickableElement(e)
      if (!el) return

      const selector = generateSelector(el)
      pickerHighlight.visible = false
      pickerMode.value = false

      if (pickerTargetStep.value !== null) {
        // Assign to specific step
        const step = localSteps.value[pickerTargetStep.value]
        if (step) {
          step.element = selector
          validateElement(step)
        }
        pickerTargetStep.value = null
      } else {
        // Create a new step with this element
        const newStep = {
          element: selector,
          popover: { title: '', description: '', side: 'bottom', align: 'center' },
          _elementValid: true
        }
        localSteps.value.push(newStep)
        const newIndex = localSteps.value.length - 1
        expandedSteps.value.push(newIndex)
      }
    }

    // Highlight element on page (using driver)
    let devDriver = null
    const getDevDriver = () => {
      if (!devDriver) {
        devDriver = driver({ ...driverGlobalConfig, allowClose: true, overlayClickExit: true })
      }
      return devDriver
    }

    const highlightElement = (selector) => {
      if (!selector) return
      const el = document.querySelector(selector)
      if (!el) { alert(`Elemento no encontrado: ${selector}`); return }
      getDevDriver().highlight({ element: selector, popover: { title: 'Elemento', description: selector } })
    }

    const testTour = async () => {
      if (!localSteps.value.length) return
      await nextTick()

      const steps = localSteps.value.map(s => ({
        ...(s.element ? { element: s.element } : {}),
        popover: {
          title: s.popover.title,
          description: s.popover.description,
          ...(s.popover.side ? { side: s.popover.side } : {}),
          ...(s.popover.align ? { align: s.popover.align } : {})
        }
      }))

      const d = driver({
        ...driverGlobalConfig,
        onDestroyed: () => {}
      })
      d.setSteps(steps)
      d.drive()
    }

    const testStep = async (index) => {
      const step = localSteps.value[index]
      if (!step) return
      await nextTick()
      getDevDriver().highlight({
        ...(step.element ? { element: step.element } : {}),
        popover: {
          title: step.popover.title,
          description: step.popover.description,
          side: step.popover.side,
          align: step.popover.align
        }
      })
    }

    // Export code
    const exportedCode = computed(() => {
      if (!localSteps.value.length) return ''

      const tourId = getTourByRoute(route.path)?.id || 'mi-tour'
      const stepsJson = localSteps.value.map(s => {
        const lines = []
        if (s.element) lines.push(`      element: '${s.element}',`)
        lines.push(`      popover: {`)
        lines.push(`        title: '${(s.popover.title || '').replace(/'/g, "\\'")}',`)
        lines.push(`        description: '${(s.popover.description || '').replace(/'/g, "\\'")}',`)
        if (s.popover.side) lines.push(`        side: '${s.popover.side}',`)
        if (s.popover.align) lines.push(`        align: '${s.popover.align}'`)
        lines.push(`      }`)
        return `    {\n${lines.join('\n')}\n    }`
      }).join(',\n')

      return `export const ${toCamelCase(tourId)} = {\n  id: '${tourId}',\n  showOnFirstVisit: true,\n  steps: [\n${stepsJson}\n  ]\n}`
    })

    const toCamelCase = (str) =>
      str.replace(/-([a-z])/g, (_, c) => c.toUpperCase())

    const copyExport = async () => {
      try {
        await navigator.clipboard.writeText(exportedCode.value)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
      } catch {
        // fallback
        const ta = document.createElement('textarea')
        ta.value = exportedCode.value
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        copied.value = true
        setTimeout(() => { copied.value = false }, 2000)
      }
    }

    // Keyboard shortcut
    const onKeydown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        isOpen.value = !isOpen.value
      }
      if (e.key === 'Escape' && pickerMode.value) {
        togglePickerMode()
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', onKeydown)
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', onKeydown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      devDriver?.destroy()
    })

    return {
      isDev,
      isOpen,
      minimized,
      showExport,
      copied,
      expandedSteps,
      localSteps,
      currentRoute,
      panelStyle,
      pickerMode,
      pickerTargetStep,
      pickerHighlight,
      exportedCode,
      startDrag,
      loadCurrentRouteTour,
      addStep,
      removeStep,
      clearSteps,
      moveStep,
      toggleStep,
      validateElement,
      highlightElement,
      togglePickerMode,
      activatePickerForStep,
      onPickerMove,
      onPickerClick,
      testTour,
      testStep,
      copyExport
    }
  }
}
</script>

<style scoped>
/* ============================================================
   TOGGLE BUTTON
   ============================================================ */
.tour-dev-toggle {
  position: fixed;
  bottom: 12px;
  left: 12px;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #1e293b;
  border: 1px solid #7c3aed;
  color: #a78bfa;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,.4);
  transition: all .15s;
}
.tour-dev-toggle:hover,
.tour-dev-toggle--active {
  background: #7c3aed;
  color: #fff;
  border-color: #7c3aed;
}
.tour-dev-badge {
  background: #7c3aed;
  color: #fff;
  border-radius: 999px;
  padding: 0 6px;
  font-size: 10px;
  line-height: 16px;
}
.tour-dev-toggle--active .tour-dev-badge {
  background: #fff;
  color: #7c3aed;
}

/* ============================================================
   MAIN PANEL
   ============================================================ */
.tour-dev-panel {
  position: fixed;
  z-index: 99998;
  width: 460px;
  max-height: 85vh;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,.7);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
  font-size: 12px;
}

/* Header */
.tour-dev-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: #1e293b;
  border-bottom: 1px solid #334155;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
}
.tour-dev-header__title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #a78bfa;
  font-weight: 700;
  font-size: 13px;
}
.tour-dev-route {
  font-size: 10px;
  color: #64748b;
  font-weight: 400;
  background: #0f172a;
  padding: 2px 6px;
  border-radius: 4px;
}
.tour-dev-header__actions {
  display: flex;
  gap: 4px;
}

/* Body */
.tour-dev-body {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex: 1;
}

/* Toolbar */
.tour-dev-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #1e293b;
  background: #0f172a;
  flex-shrink: 0;
}

/* Picker info */
.tour-dev-picker-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(245,158,11,.1);
  border-bottom: 1px solid rgba(245,158,11,.2);
  color: #fbbf24;
  font-size: 11px;
  flex-shrink: 0;
}
.tour-dev-picker-target {
  margin-left: auto;
  background: rgba(245,158,11,.2);
  padding: 2px 6px;
  border-radius: 4px;
}

/* Export */
.tour-dev-export {
  flex-shrink: 0;
  border-bottom: 1px solid #1e293b;
  max-height: 200px;
  overflow: auto;
}
.tour-dev-export__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  background: #1e293b;
  color: #94a3b8;
  font-size: 11px;
}
.tour-dev-export__code {
  margin: 0;
  padding: 10px 12px;
  color: #86efac;
  font-size: 10px;
  line-height: 1.6;
  white-space: pre;
  overflow-x: auto;
}

/* Steps */
.tour-dev-steps {
  overflow-y: auto;
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.tour-dev-empty {
  text-align: center;
  padding: 24px;
  color: #475569;
}
.tour-dev-empty i {
  display: block;
  font-size: 24px;
  margin-bottom: 8px;
}

/* Step item */
.tour-dev-step {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color .15s;
}
.tour-dev-step--expanded {
  border-color: #7c3aed;
}
.tour-dev-step__header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  cursor: pointer;
}
.tour-dev-step__header:hover {
  background: rgba(124,58,237,.07);
}
.tour-dev-step__num {
  width: 22px;
  height: 22px;
  background: #7c3aed;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}
.tour-dev-step__summary {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tour-dev-step__title {
  color: #e2e8f0;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tour-dev-step__selector {
  color: #7c3aed;
  font-size: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tour-dev-step__overlay {
  color: #64748b;
  font-size: 10px;
  font-style: italic;
}
.tour-dev-step__actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

/* Step body */
.tour-dev-step__body {
  padding: 10px;
  border-top: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #0f172a;
}

/* Fields */
.tour-dev-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tour-dev-field--row {
  flex-direction: row;
  gap: 8px;
}
.tour-dev-field__half {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tour-dev-field__row {
  display: flex;
  gap: 6px;
}
.tour-dev-field__error {
  color: #f87171;
  font-size: 10px;
}
.tour-dev-field__ok {
  color: #4ade80;
  font-size: 10px;
}
.tour-dev-label {
  color: #64748b;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .05em;
}
.tour-dev-label__hint {
  color: #475569;
  font-weight: 400;
  text-transform: none;
  margin-left: 4px;
}
.tour-dev-input,
.tour-dev-textarea,
.tour-dev-select {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #e2e8f0;
  padding: 6px 8px;
  font-size: 12px;
  font-family: inherit;
  outline: none;
  width: 100%;
  transition: border-color .15s;
  box-sizing: border-box;
}
.tour-dev-input:focus,
.tour-dev-textarea:focus,
.tour-dev-select:focus {
  border-color: #7c3aed;
}
.tour-dev-textarea {
  resize: vertical;
  min-height: 60px;
}
.tour-dev-select {
  appearance: auto;
}

/* Buttons */
.tour-dev-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #1e293b;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all .12s;
  white-space: nowrap;
}
.tour-dev-btn:hover:not(:disabled) {
  background: #334155;
  color: #e2e8f0;
}
.tour-dev-btn:disabled {
  opacity: .4;
  cursor: not-allowed;
}
.tour-dev-btn--xs {
  padding: 3px 7px;
  font-size: 10px;
}
.tour-dev-btn--primary {
  border-color: #7c3aed;
  color: #a78bfa;
}
.tour-dev-btn--primary:hover {
  background: rgba(124,58,237,.15);
  color: #c4b5fd;
}
.tour-dev-btn--info {
  border-color: #0ea5e9;
  color: #38bdf8;
}
.tour-dev-btn--info:hover:not(:disabled) {
  background: rgba(14,165,233,.15);
  color: #7dd3fc;
}
.tour-dev-btn--active {
  background: rgba(245,158,11,.15);
  border-color: #f59e0b;
  color: #fbbf24;
}
.tour-dev-btn--success {
  border-color: #22c55e;
  color: #4ade80;
}
.tour-dev-btn--success:hover:not(:disabled) {
  background: rgba(34,197,94,.15);
}
.tour-dev-btn--warning {
  border-color: #f59e0b;
  color: #fbbf24;
}
.tour-dev-btn--warning:hover:not(:disabled) {
  background: rgba(245,158,11,.15);
}

.tour-dev-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 11px;
  transition: all .12s;
  flex-shrink: 0;
  padding: 0;
}
.tour-dev-icon-btn:hover:not(:disabled) {
  background: #334155;
  color: #e2e8f0;
}
.tour-dev-icon-btn:disabled {
  opacity: .25;
  cursor: not-allowed;
}
.tour-dev-icon-btn--close:hover {
  background: rgba(239,68,68,.15) !important;
  color: #f87171 !important;
}
.tour-dev-icon-btn--danger:hover {
  background: rgba(239,68,68,.15) !important;
  color: #f87171 !important;
}

/* ============================================================
   ELEMENT PICKER
   ============================================================ */
.tour-dev-picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 99990;
  cursor: crosshair;
}

.tour-dev-picker-highlight {
  position: absolute;
  z-index: 99991;
  pointer-events: none;
  outline: 2px dashed #f59e0b;
  outline-offset: 2px;
  background: rgba(245, 158, 11, .08);
  border-radius: 3px;
}

.tour-dev-picker-highlight__label {
  position: absolute;
  bottom: calc(100% + 4px);
  left: 0;
  background: #1e293b;
  border: 1px solid #f59e0b;
  color: #fbbf24;
  font-size: 10px;
  font-family: ui-monospace, monospace;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
