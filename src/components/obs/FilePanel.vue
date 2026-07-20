<template>
  <div
    class="commander-panel flex flex-col h-full rounded border"
    :class="active ? 'border-primary-500/60 bg-dark-primary' : 'border-dark-border bg-dark-secondary'"
    @click="$emit('activate')"
  >
    <!-- Path bar -->
    <div v-if="isLocal" class="flex items-center gap-1 px-2 py-1 border-b border-dark-border bg-dark-primary shrink-0">
      <i class="fas fa-laptop text-[11px] text-success-400 flex-shrink-0" />
      <span class="text-xs text-text-secondary flex-1 min-w-0 truncate" :title="path">{{ path || 'Sin carpeta seleccionada' }}</span>
      <button class="btn-icon text-xs text-text-tertiary hover:text-primary-400" title="Cambiar carpeta local" @click="$emit('pickFolder')">
        <i class="fas fa-folder-open" />
      </button>
      <span class="text-[10px] text-text-tertiary flex-shrink-0 ml-1">{{ selectedCount > 0 ? selectedCount + '/' : '' }}{{ totalItems }}</span>
    </div>
    <div v-else class="flex items-center gap-1 px-2 py-1 border-b border-dark-border bg-dark-primary shrink-0">
      <button
        class="btn-icon text-xs text-text-tertiary hover:text-text-primary p-0.5"
        title="Raíz"
        @click="$emit('navigate', '')"
      >
        <i class="fas fa-home" />
      </button>
      <div class="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto text-xs">
        <template v-for="(seg, idx) in pathSegments" :key="idx">
          <i v-if="idx > 0" class="fas fa-chevron-right text-text-quaternary text-[9px] flex-shrink-0" />
          <button
            class="text-text-secondary hover:text-primary-400 whitespace-nowrap px-0.5 py-0.5 rounded hover:bg-dark-hover transition-colors"
            :class="{ 'text-text-primary font-medium': idx === pathSegments.length - 1 }"
            @click="$emit('navigate', buildPath(idx))"
          >
            {{ seg || '📁' }}
          </button>
        </template>
      </div>
      <span class="text-[10px] text-text-tertiary flex-shrink-0 ml-1">{{ selectedCount > 0 ? selectedCount + '/' : '' }}{{ totalItems }}</span>
    </div>

    <!-- Column headers -->
    <div class="flex items-center px-2 py-0.5 text-[10px] text-text-tertiary uppercase tracking-wider border-b border-dark-border/50 bg-dark-primary shrink-0">
      <span class="flex-1 pl-1 cursor-pointer select-none hover:text-text-secondary" @click="toggleSort('name')">
        Nombre {{ sortBy === 'name' ? (sortAsc ? '▲' : '▼') : '' }}
      </span>
      <span class="w-12 text-center cursor-pointer select-none hover:text-text-secondary" @click="toggleSort('size')">
        Tamaño {{ sortBy === 'size' ? (sortAsc ? '▲' : '▼') : '' }}
      </span>
      <span class="w-[72px] text-right cursor-pointer select-none hover:text-text-secondary" @click="toggleSort('date')">
        Fecha {{ sortBy === 'date' ? (sortAsc ? '▲' : '▼') : '' }}
      </span>
    </div>

    <!-- File list -->
    <div
      ref="listRef"
      class="flex-1 overflow-y-auto overflow-x-hidden select-none"
      tabindex="0"
      @keydown="handleKeydown"
      @focus="$emit('activate')"
    >
      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <i class="fas fa-spinner fa-spin text-text-tertiary text-sm" />
      </div>

      <!-- Empty -->
      <div v-else-if="filteredItems.length === 0" class="flex items-center justify-center py-8 text-text-tertiary text-xs">
        {{ searchQuery ? 'Sin resultados' : 'Vacío' }}
      </div>

      <!-- Items -->
      <template v-else>
        <div
          v-for="(item, idx) in filteredItems"
          :key="item.objectKey"
          class="commander-row flex items-center text-xs"
          :class="[
            idx % 2 === 0 ? 'bg-dark-secondary' : 'bg-dark-primary',
            selected.has(item.objectKey) ? 'commander-selected' : '',
            cursorIdx === idx ? 'bg-primary-500/20' : ''
          ]"
          @click="handleClick(item, $event)"
          @dblclick="handleDblClick(item)"
          @contextmenu.prevent="handleContextMenu(item, $event)"
        >
          <!-- Icon + Name -->
          <div class="flex items-center gap-1.5 flex-1 min-w-0 pl-1.5 pr-1 truncate">
            <i :class="[getIcon(item), 'flex-shrink-0 text-[13px]', item.isFolder ? 'text-warning-400' : 'text-primary-400']" />
            <span class="truncate" :class="item.isFolder ? 'text-warning-300' : 'text-text-primary'">{{ item.name }}</span>
            <span v-if="!item.isFolder" class="text-text-quaternary text-[10px] flex-shrink-0">{{ item.ext }}</span>
          </div>
          <!-- Size -->
          <span class="w-12 text-right px-1 text-text-tertiary flex-shrink-0">{{ item.isFolder ? '&lt;DIR&gt;' : item.sizeFmt }}</span>
          <!-- Date -->
          <span class="w-[72px] text-right px-1.5 text-text-tertiary flex-shrink-0">{{ item.dateFmt }}</span>
        </div>
      </template>
    </div>

    <!-- Quick search -->
    <div class="flex items-center gap-1 px-1.5 py-0.5 border-t border-dark-border bg-dark-primary shrink-0">
      <i class="fas fa-search text-[10px] text-text-tertiary" />
      <input
        v-model="searchQuery"
        type="text"
        class="bg-transparent text-xs text-text-primary outline-none flex-1 min-w-0 placeholder-text-quaternary"
        placeholder="Filtrar..."
        @keydown.stop
      />
      <button
        v-if="searchQuery"
        class="text-text-tertiary hover:text-text-primary text-[10px]"
        @click="searchQuery = ''"
      >
        <i class="fas fa-times" />
      </button>
    </div>

    <!-- Context menu (shown on right-click) -->
    <Teleport to="body">
      <div
        v-if="contextMenu.visible"
        class="fixed z-[9999] bg-dark-secondary border border-dark-border rounded-md shadow-xl py-1 min-w-[160px] text-xs"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
        @click.stop
      >
        <button class="w-full text-left px-3 py-1.5 hover:bg-dark-hover text-text-primary flex items-center gap-2" @click="ctxDownload">
          <i class="fas fa-download" /> Descargar
        </button>
        <template v-if="!isLocal">
          <div class="border-t border-dark-border my-1" />
          <button
            v-if="contextMenu.item && !contextMenu.item.isFolder"
            class="w-full text-left px-3 py-1.5 hover:bg-dark-hover text-text-primary flex items-center gap-2"
            @click="ctxRename"
          >
            <i class="fas fa-pen" /> Renombrar
          </button>
          <button
            v-if="contextMenu.item && !contextMenu.item.isFolder"
            class="w-full text-left px-3 py-1.5 hover:bg-dark-hover text-text-primary flex items-center gap-2"
            @click="ctxLink"
          >
            <i class="fas fa-link" /> Generar link
          </button>
          <button
            v-if="contextMenu.item && !contextMenu.item.isFolder"
            class="w-full text-left px-3 py-1.5 hover:bg-dark-hover text-text-primary flex items-center gap-2"
            @click="ctxMoveToFolder"
          >
            <i class="fas fa-folder-tree" /> Mover a carpeta...
          </button>
          <button
            class="w-full text-left px-3 py-1.5 hover:bg-dark-hover text-text-primary flex items-center gap-2"
            @click="ctxInfo"
          >
            <i class="fas fa-circle-info" /> Info
          </button>
        </template>
        <div class="border-t border-dark-border my-1" />
        <button class="w-full text-left px-3 py-1.5 hover:bg-dark-hover text-danger-400 flex items-center gap-2" @click="ctxDelete">
          <i class="fas fa-trash" /> Eliminar
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  path: { type: String, default: '' },
  files: { type: Array, default: () => [] },
  folders: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  title: { type: String, default: '' },
  isLocal: { type: Boolean, default: false }
})

const emit = defineEmits(['navigate', 'activate', 'download', 'delete', 'openFile', 'pickFolder', 'rename', 'link', 'moveToFolder', 'info'])

const searchQuery = ref('')
const selected = ref(new Set())
const cursorIdx = ref(0)
const sortBy = ref('name')
const sortAsc = ref(true)
const listRef = ref(null)

const contextMenu = ref({ visible: false, x: 0, y: 0, item: null })

const pathSegments = computed(() => (props.path || '').split('/').filter(Boolean))

const buildPath = (idx) => pathSegments.value.slice(0, idx + 1).join('/') + '/'

const allItems = computed(() => {
  const items = [
    ...props.folders.map(f => ({ ...f, name: getBaseName(f.objectKey), isFolder: true, ext: '', sizeFmt: '<DIR>', dateFmt: fmtDate(f.lastModified) })),
    ...props.files.map(f => {
      const name = getBaseName(f.objectKey)
      const dot = name.lastIndexOf('.')
      const ext = dot > -1 ? name.slice(dot + 1) : ''
      return { ...f, name: dot > -1 ? name.slice(0, dot) : name, ext, isFolder: false, sizeFmt: fmtSize(f.size), dateFmt: fmtDate(f.lastModified) }
    })
  ]
  items.sort((a, b) => {
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1
    const va = sortBy.value === 'size' ? (a.size || 0) : sortBy.value === 'date' ? (a.lastModified || '') : a.name.toLowerCase()
    const vb = sortBy.value === 'size' ? (b.size || 0) : sortBy.value === 'date' ? (b.lastModified || '') : b.name.toLowerCase()
    return sortAsc.value ? (va < vb ? -1 : va > vb ? 1 : 0) : (va > vb ? -1 : va < vb ? 1 : 0)
  })
  return items
})

const filteredItems = computed(() => {
  if (!searchQuery.value) return allItems.value
  const q = searchQuery.value.toLowerCase()
  return allItems.value.filter(i => i.name.toLowerCase().includes(q) || i.ext.toLowerCase().includes(q))
})

const selectedCount = computed(() => selected.value.size)
const totalItems = computed(() => allItems.value.length)

const getBaseName = (key) => (key || '').split('/').filter(p => p).pop() || key || ''
const fmtSize = (b) => { if (!b) return '0'; const u = ['', 'K', 'M', 'G']; const i = Math.floor(Math.log(b) / Math.log(1024)); return parseFloat((b / Math.pow(1024, i)).toFixed(1)) + ' ' + u[i]; }
const fmtDate = (d) => { if (!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }); }

const getIcon = (item) => {
  if (item.isFolder) return 'fas fa-folder'
  const e = item.ext?.toLowerCase()
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(e)) return 'fas fa-file-audio'
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(e)) return 'fas fa-file-video'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(e)) return 'fas fa-file-image'
  if (['pdf'].includes(e)) return 'fas fa-file-pdf'
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(e)) return 'fas fa-file-archive'
  return 'fas fa-file'
}

const toggleSort = (field) => {
  if (sortBy.value === field) sortAsc.value = !sortAsc.value
  else { sortBy.value = field; sortAsc.value = true }
}

const handleClick = (item, e) => {
  if (e.ctrlKey || e.metaKey) {
    const s = new Set(selected.value)
    s.has(item.objectKey) ? s.delete(item.objectKey) : s.add(item.objectKey)
    selected.value = s
  } else if (e.shiftKey) {
    // Not implementing range select for simplicity
    const s = new Set(selected.value)
    s.has(item.objectKey) ? s.delete(item.objectKey) : s.add(item.objectKey)
    selected.value = s
  } else {
    selected.value = new Set()
  }
  cursorIdx.value = filteredItems.value.findIndex(i => i.objectKey === item.objectKey)
}

const handleDblClick = (item) => {
  if (item.isFolder) emit('navigate', item.objectKey)
  else emit('openFile', item.objectKey)
}

const handleKeydown = (e) => {
  const items = filteredItems.value
  if (items.length === 0) return

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault(); cursorIdx.value = Math.max(0, cursorIdx.value - 1); break
    case 'ArrowDown':
      e.preventDefault(); cursorIdx.value = Math.min(items.length - 1, cursorIdx.value + 1); break
    case 'Enter':
      e.preventDefault()
      if (cursorIdx.value >= 0 && cursorIdx.value < items.length) {
        const item = items[cursorIdx.value]
        if (item.isFolder) emit('navigate', item.objectKey)
        else emit('openFile', item.objectKey)
      }
      break
    case ' ':
      e.preventDefault()
      if (cursorIdx.value >= 0 && cursorIdx.value < items.length) {
        const item = items[cursorIdx.value]
        const s = new Set(selected.value)
        s.has(item.objectKey) ? s.delete(item.objectKey) : s.add(item.objectKey)
        selected.value = s
      }
      break
    case 'Backspace':
      e.preventDefault()
      if (pathSegments.value.length > 0) emit('navigate', buildPath(pathSegments.value.length - 2))
      break
    case 'F2':
      if (!props.isLocal && cursorIdx.value >= 0 && cursorIdx.value < items.length) {
        const item = items[cursorIdx.value]
        if (!item.isFolder) { e.preventDefault(); emit('rename', item.objectKey) }
      }
      break
  }
}

const handleContextMenu = (item, e) => {
  selected.value = new Set([item.objectKey])
  cursorIdx.value = filteredItems.value.findIndex(i => i.objectKey === item.objectKey)
  contextMenu.value = { visible: true, x: e.clientX, y: e.clientY, item }
  setTimeout(() => window.addEventListener('click', closeCtx, { once: true }), 0)
}

const closeCtx = () => { contextMenu.value.visible = false }
const ctxDownload = () => { if (contextMenu.value.item) emit('download', contextMenu.value.item.objectKey); closeCtx() }
const ctxDelete = () => { if (contextMenu.value.item) emit('delete', contextMenu.value.item.objectKey); closeCtx() }
const ctxRename = () => { if (contextMenu.value.item && !contextMenu.value.item.isFolder) emit('rename', contextMenu.value.item.objectKey); closeCtx() }
const ctxLink = () => { if (contextMenu.value.item && !contextMenu.value.item.isFolder) emit('link', contextMenu.value.item.objectKey); closeCtx() }
const ctxMoveToFolder = () => { if (contextMenu.value.item && !contextMenu.value.item.isFolder) emit('moveToFolder', contextMenu.value.item.objectKey); closeCtx() }
const ctxInfo = () => { if (contextMenu.value.item) emit('info', contextMenu.value.item.objectKey); closeCtx() }

watch(() => props.path, () => {
  selected.value = new Set()
  cursorIdx.value = 0
  searchQuery.value = ''
}, { immediate: true })

const clearSelection = () => { selected.value = new Set() }
const selectAll = () => { selected.value = new Set(allItems.value.map(i => i.objectKey)) }

defineExpose({ clearSelection, selectAll, selected, cursorIdx })
</script>

<style scoped>
.commander-panel {
  min-height: 0;
}
.commander-row {
  min-height: 20px;
  line-height: 20px;
  cursor: default;
  transition: background 0.05s;
}
.commander-row:nth-child(even) {
  background: rgba(17,17,17,1);
}
.commander-row:nth-child(odd) {
  background: rgba(10,10,10,0.6);
}
.commander-row:hover {
  background: rgba(59,130,246,0.15);
}
.commander-selected {
  background: rgba(59,130,246,0.25) !important;
  color: #fff;
}
.commander-selected .text-text-tertiary {
  color: rgba(255,255,255,0.7);
}
.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-icon:hover {
  background: rgba(255,255,255,0.08);
}
</style>