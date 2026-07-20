<template>
  <div class="flex items-center gap-0 px-2 py-1 bg-dark-primary border-t border-dark-border text-[11px]">
    <button
      v-for="btn in buttons"
      :key="btn.key"
      class="commander-fkey flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-dark-hover transition-colors"
      :class="{ 'opacity-40 cursor-not-allowed': btn.disabled, 'text-text-secondary': !btn.disabled }"
      :disabled="btn.disabled"
      :title="btn.title"
      @click="btn.action"
    >
      <kbd class="text-[10px] px-1 py-0.5 rounded bg-dark-secondary border border-dark-border text-text-tertiary font-mono">{{ btn.key }}</kbd>
      <span>{{ btn.label }}</span>
    </button>
    <div class="flex-1" />
    <span class="text-text-quaternary text-[10px]">
      <template v-if="singlePane">{{ rightCount }} items</template>
      <template v-else>{{ leftCount }}/{{ rightCount }} items</template>
    </span>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  leftSelected: { type: Array, default: () => [] },
  rightSelected: { type: Array, default: () => [] },
  leftCount: { type: Number, default: 0 },
  rightCount: { type: Number, default: 0 },
  activePanel: { type: String, default: 'left' },
  // Cuando no hay panel local, "copiar/mover al otro panel" no aplica:
  // F5 pasa a ser "descargar" y F6 "mover a otra carpeta".
  singlePane: { type: Boolean, default: false }
})

const emit = defineEmits(['view', 'edit', 'copy', 'move', 'newFolder', 'delete', 'refresh'])

const buttons = [
  { key: 'F3', label: 'Ver',    disabled: false, title: 'Ver archivo', action: () => emit('view') },
  { key: 'F4', label: 'Editar', disabled: false, title: 'Editar archivo', action: () => emit('edit') },
  {
    key: 'F5',
    label: props.singlePane ? 'Descargar' : 'Copiar',
    disabled: false,
    title: props.singlePane ? 'Descargar seleccionados a tu PC' : 'Copiar seleccionados al otro panel',
    action: () => emit('copy')
  },
  {
    key: 'F6',
    label: 'Mover',
    disabled: false,
    title: props.singlePane ? 'Mover seleccionados a otra carpeta' : 'Mover seleccionados al otro panel',
    action: () => emit('move')
  },
  { key: 'F7', label: 'Nuevo',  disabled: false, title: 'Nueva carpeta', action: () => emit('newFolder') },
  { key: 'F8', label: 'Elim',   disabled: false, title: 'Eliminar seleccionados', action: () => emit('delete') },
]

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeys)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeys)
})

const handleGlobalKeys = (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
  switch (e.key) {
    case 'F3': e.preventDefault(); buttons[0].action(); break
    case 'F4': e.preventDefault(); buttons[1].action(); break
    case 'F5': e.preventDefault(); buttons[2].action(); break
    case 'F6': e.preventDefault(); buttons[3].action(); break
    case 'F7': e.preventDefault(); buttons[4].action(); break
    case 'F8': e.preventDefault(); buttons[5].action(); break
  }
}
</script>

<style scoped>
.commander-fkey {
  cursor: pointer;
}
.commander-fkey:hover:not(.opacity-40) {
  background: rgba(59,130,246,0.15);
}
.commander-fkey:hover:not(.opacity-40) kbd {
  border-color: rgba(59,130,246,0.5);
  color: #60a5fa;
}
</style>