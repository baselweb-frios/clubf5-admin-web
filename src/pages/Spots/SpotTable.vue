<template>
  <div class="space-y-4">
    <!-- Media Preview Modal -->
    <Modal
      v-model="showMediaModal"
      :title="mediaPreviewSpot?.nombreSpot || 'Vista previa'"
      size="lg"
    >
      <div class="flex flex-col items-center justify-center p-4">
        <div v-if="mediaPreviewSpot?.mediaTipo === 'streaming'" class="text-center">
          <i class="fas fa-broadcast-tower text-4xl text-primary-400 mb-4" />
          <p class="text-text-secondary mb-2">URL de Streaming:</p>
          <a
            :href="mediaPreviewSpot?.url"
            target="_blank"
            class="text-primary-400 hover:text-primary-300 break-all"
          >
            {{ mediaPreviewSpot?.url }}
          </a>
        </div>
        <video
          v-else-if="mediaPreviewSpot?.mediaTipo === 'video'"
          controls
          :src="mediaPreviewSpot?.url"
          class="w-full max-h-[60vh] rounded-lg"
        >
          Tu navegador no soporta el elemento de video.
        </video>
        <audio
          v-else-if="mediaPreviewSpot?.mediaTipo === 'audio'"
          controls
          :src="mediaPreviewSpot?.url"
          class="w-full"
        >
          Tu navegador no soporta el elemento de audio.
        </audio>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="closeMediaPreview">
          Cerrar
        </button>
      </template>
    </Modal>
    <!-- Header Section -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 class="text-xl font-semibold text-text-primary flex items-center gap-2">
            <i class="fas fa-microphone-alt text-primary-400" />
            Gestión de Spots
          </h2>
          <p class="text-sm text-text-secondary mt-1">
            {{ filteredSpots.length }} de {{ spots.length }} spots
          </p>
        </div>
        <div>
          <button
            class="btn btn-primary"
            aria-label="Crear nuevo spot"
            @click="handleCreate()"
          >
            <i class="fas fa-plus" />
            Nuevo Spot
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Search Filter -->
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fas fa-search" />
            Buscar
          </label>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              class="input pr-8"
              placeholder="Buscar por nombre..."
              @input="handleSearch"
            >
            <button
              v-if="searchQuery"
              class="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
              @click="clearSearch()"
            >
              <i class="fas fa-times" />
            </button>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fas fa-layer-group" />
            Categoría
          </label>
          <select v-model="categoryFilter" class="select" @change="handleFilterChange">
            <option value="">Todas las categorías</option>
            <option value="inst">Institucional</option>
            <option value="noti">Noticias</option>
            <option value="prom">Promocional</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="form-group">
          <label class="label flex items-center gap-2">
            <i class="fas fa-clock" />
            Estado
          </label>
          <select v-model="statusFilter" class="select" @change="handleFilterChange">
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="expired">Vencidos</option>
            <option value="expiring">Por vencer</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <div class="form-group flex items-end">
          <button
            v-if="hasActiveFilters"
            class="btn btn-secondary btn-sm"
            @click="clearAllFilters()"
          >
            <i class="fas fa-eraser" />
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Table Actions -->
    <div
      v-if="localSelectedSpots.length > 0"
      class="card bg-primary-500/10 border-primary-500/30"
    >
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="flex items-center gap-2 text-sm text-primary-400">
          <i class="fas fa-info-circle" />
          {{ localSelectedSpots.length }} spot{{ localSelectedSpots.length > 1 ? 's' : '' }} seleccionado{{ localSelectedSpots.length > 1 ? 's' : '' }}
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="btn btn-secondary btn-sm"
            :disabled="localSelectedSpots.length !== 1"
            aria-label="Editar spot seleccionado"
            @click="handleEdit"
          >
            <i class="fas fa-edit" />
            Editar
          </button>

          <button
            class="btn btn-danger btn-sm"
            :disabled="localSelectedSpots.length === 0"
            aria-label="Eliminar spots seleccionados"
            @click="handleDelete"
          >
            <i class="fas fa-trash" />
            Eliminar
          </button>

          <button
            class="btn btn-ghost btn-sm"
            aria-label="Limpiar selección"
            @click="clearSelection"
          >
            <i class="fas fa-times" />
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Table Section -->
    <div>
      <!-- Desktop Table View -->
      <div class="table-container hidden md:block">
        <table class="table" role="table" aria-label="Lista de spots">
          <thead>
            <tr>
              <th scope="col" class="w-10">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  :indeterminate="isIndeterminate"
                  class="checkbox"
                  aria-label="Seleccionar todos los spots"
                  @change="toggleSelectAll"
                >
              </th>
              <th scope="col">
                <button
                  class="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
                  @click="toggleSort('nombre')"
                >
                  <i class="fas fa-sort text-xs" />
                  Nombre
                </button>
              </th>
              <th scope="col">
                <button
                  class="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
                  @click="toggleSort('categoria')"
                >
                  <i class="fas fa-sort text-xs" />
                  Tipo
                </button>
              </th>
              <th scope="col">
                <button
                  class="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors"
                  @click="toggleSort('vencimiento')"
                >
                  <i class="fas fa-sort text-xs" />
                  Vencimiento
                </button>
              </th>
              <th scope="col">
                <span class="flex items-center gap-1">
                  <i class="fas fa-music" />
                  Media
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="spot in paginatedSpots"
              :key="spot.codSpot"
              class="cursor-pointer transition-colors"
              :class="{ 'bg-primary-500/10': isSelected(spot) }"
              @click="toggleSelection(spot)"
            >
              <td>
                <input
                  type="checkbox"
                  :checked="isSelected(spot)"
                  class="checkbox"
                  aria-label="Seleccionar spot"
                  @change="toggleSelection(spot)"
                >
              </td>
              <td>
                <div>
                  <div class="font-medium text-text-primary">{{ spot.nombreSpot }}</div>
                  <div class="text-xs text-text-tertiary">ID: {{ spot.codSpot }}</div>
                </div>
              </td>
              <td>
                <span :class="`badge badge-${getCategoryVariant(spot.tipo)}`">
                  <i :class="getCategoryIcon(spot.tipo)" />
                  {{ getCategoryLabel(spot.tipo) }}
                </span>
              </td>
              <td>
                <div class="space-y-1">
                  <span :class="`badge ${getExpirationClass(spot)}`">
                    <i :class="getExpirationIcon(spot)" />
                    {{ (typeof spot.fechaFin==='boolean')?'No vence':spot.fechaFin }}
                  </span>
                  <div v-if="getDaysUntilExpiration(spot) !== null" class="text-xs text-text-tertiary">
                    {{ getExpirationStatusText(spot) }}
                  </div>
                </div>
              </td>
              <td>
                <button
                  v-if="spot.mediaTipo"
                  class="btn btn-ghost btn-sm flex items-center gap-2"
                  @click.stop="openMediaPreview(spot)"
                >
                  <i :class="getMediaIcon(spot.mediaTipo)" />
                  <span class="text-xs">{{ getMediaLabel(spot.mediaTipo) }}</span>
                </button>
                <span v-else class="text-text-tertiary text-sm">Sin media</span>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="paginatedSpots.length === 0">
              <td colspan="5" class="text-center py-12">
                <div class="flex flex-col items-center gap-4">
                  <i class="fas fa-microphone-slash text-4xl text-text-tertiary" />
                  <h3 class="text-lg font-semibold text-text-secondary">No se encontraron spots</h3>
                  <p class="text-sm text-text-tertiary">{{ getEmptyStateMessage() }}</p>
                  <button v-if="hasActiveFilters" class="btn btn-primary" @click="clearAllFilters()">
                    <i class="fas fa-eraser" />
                    Limpiar Filtros
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards View -->
      <div class="md:hidden space-y-3">
        <div
          v-for="spot in paginatedSpots"
          :key="spot.codSpot"
          class="card cursor-pointer transition-all"
          :class="{ 'ring-2 ring-primary-500 bg-primary-500/5': isSelected(spot) }"
          @click="toggleSelection(spot)"
        >
          <div class="flex items-start gap-3 mb-3">
            <input
              type="checkbox"
              :checked="isSelected(spot)"
              class="checkbox mt-1"
              aria-label="Seleccionar spot"
              @change.stop="toggleSelection(spot)"
            >
            <div class="flex-1 min-w-0">
              <h4 class="font-semibold text-text-primary truncate">{{ spot.nombreSpot }}</h4>
              <span class="text-xs text-text-tertiary">ID: {{ spot.codSpot }}</span>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-text-secondary flex items-center gap-2">
                <i class="fas fa-tag" />
                Tipo
              </span>
              <span :class="`badge badge-${getCategoryVariant(spot.tipo)}`">
                <i :class="getCategoryIcon(spot.tipo)" />
                {{ getCategoryLabel(spot.tipo) }}
              </span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-sm text-text-secondary flex items-center gap-2">
                <i class="fas fa-calendar-alt" />
                Vencimiento
              </span>
              <div class="text-right">
                <span :class="`badge ${getExpirationClass(spot)}`">
                  <i :class="getExpirationIcon(spot)" />
                  {{ (typeof spot.fechaFin==='boolean')?'No vence':spot.fechaFin }}
                </span>
                <div v-if="getDaysUntilExpiration(spot) !== null" class="text-xs text-text-tertiary mt-1">
                  {{ getExpirationStatusText(spot) }}
                </div>
              </div>
            </div>

            <div v-if="spot.mediaTipo" class="pt-2 border-t border-dark-border">
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary flex items-center gap-2">
                  <i class="fas fa-music" />
                  Media
                </span>
                <button
                  class="btn btn-ghost btn-sm flex items-center gap-2"
                  @click.stop="openMediaPreview(spot)"
                >
                  <i :class="getMediaIcon(spot.mediaTipo)" />
                  <span class="text-xs">{{ getMediaLabel(spot.mediaTipo) }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State for Mobile -->
        <div v-if="paginatedSpots.length === 0" class="card text-center py-12">
          <div class="flex flex-col items-center gap-4">
            <i class="fas fa-microphone-slash text-4xl text-text-tertiary" />
            <h3 class="text-lg font-semibold text-text-secondary">No se encontraron spots</h3>
            <p class="text-sm text-text-tertiary">{{ getEmptyStateMessage() }}</p>
            <button v-if="hasActiveFilters" class="btn btn-primary" @click="clearAllFilters()">
              <i class="fas fa-eraser" />
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div
      v-if="filteredSpots.length > 0"
      class="card"
    >
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="text-sm text-text-secondary">
          Mostrando {{ paginationInfo.start }} - {{ paginationInfo.end }} de {{ filteredSpots.length }} spots
        </div>

        <div class="flex items-center gap-2">
          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === 1"
            @click="goToFirstPage"
          >
            <i class="fas fa-angle-double-left" />
          </button>
          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === 1"
            @click="goToPreviousPage"
          >
            <i class="fas fa-angle-left" />
          </button>

          <div class="flex items-center gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="btn btn-sm min-w-[36px]"
              :class="page === currentPage ? 'btn-primary' : 'btn-ghost'"
              :disabled="page === '...'"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === totalPages"
            @click="goToNextPage"
          >
            <i class="fas fa-angle-right" />
          </button>
          <button
            class="btn btn-secondary btn-sm btn-icon"
            :disabled="currentPage === totalPages"
            @click="goToLastPage"
          >
            <i class="fas fa-angle-double-right" />
          </button>
        </div>

        <div>
          <select v-model="pageSize" class="select w-auto" @change="handlePageSizeChange">
            <option :value="10">10 por página</option>
            <option :value="25">25 por página</option>
            <option :value="50">50 por página</option>
            <option :value="100">100 por página</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Modal from '@/components/ui/Modal.vue'

export default {
  name: 'SpotTable',
  components: {
    Modal
  },
  props: {
    spots: {
      type: Array,
      default: () => [],
      validator: (value) => {
        console.log('SpotTable: Props validator - spots:', value?.length || 0)
        return true
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    selectedSpots: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localSelectedSpots: [],
      // Filter properties
      searchQuery: '',
      categoryFilter: '',
      statusFilter: '',
      searchTimeout: null,
      // Sort properties
      sortBy: 'nombre',
      sortOrder: 'asc',
      // Pagination properties
      currentPage: 1,
      pageSize: 25,
      // Audio durations cache
      audioDurations: {},
      // Media preview modal
      showMediaModal: false,
      mediaPreviewSpot: null
    }
  },
  computed: {
    isAllSelected() {
      return this.filteredSpots.length > 0 && this.localSelectedSpots.length === this.filteredSpots.length
    },
    isIndeterminate() {
      return this.localSelectedSpots.length > 0 && this.localSelectedSpots.length < this.filteredSpots.length
    },
    hasActiveFilters() {
      return this.searchQuery || this.categoryFilter || this.statusFilter
    },
    filteredSpots() {
      console.log('SpotTable: Computing filtered spots')
      let filtered = [...this.spots]

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(spot =>
          spot.nombreSpot && spot.nombreSpot.toLowerCase().includes(query)
        )
      }

      // Category filter
      if (this.categoryFilter) {
        filtered = filtered.filter(spot => spot.tipo === this.categoryFilter)
      }

      // Status filter
      if (this.statusFilter) {
        filtered = filtered.filter(spot => {
          switch (this.statusFilter) {
            case 'active':
              return !this.isExpired(spot)
            case 'expired':
              return this.isExpired(spot)
            case 'expiring':
              return this.isExpiringSoon(spot)
            default:
              return true
          }
        })
      }

      // Sort
      filtered.sort((a, b) => {
        let aValue, bValue

        switch (this.sortBy) {
          case 'nombre':
            aValue = (a.nombreSpot || '').toLowerCase()
            bValue = (b.nombreSpot || '').toLowerCase()
            break
          case 'categoria':
            aValue = this.getCategoryLabel(a.tipo)
            bValue = this.getCategoryLabel(b.tipo)
            break
          case 'vencimiento':
            aValue = a.vencido
            bValue = b.vencido
            break
          default:
            return 0
        }

        if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1
        if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1
        return 0
      })

      console.log(`SpotTable: Filtered ${filtered.length} spots from ${this.spots.length} total`)
      return filtered
    },
    paginatedSpots() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredSpots.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredSpots.length / this.pageSize)
    },
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          pages.push(1, 2, 3, 4, 5, '...', total)
        } else if (current >= total - 3) {
          pages.push(1, '...', total - 4, total - 3, total - 2, total - 1, total)
        } else {
          pages.push(1, '...', current - 1, current, current + 1, '...', total)
        }
      }

      return pages
    },
    paginationInfo() {
      const start = (this.currentPage - 1) * this.pageSize + 1
      const end = Math.min(this.currentPage * this.pageSize, this.filteredSpots.length)
      return { start, end }
    }
  },
  watch: {
    spots: {
      handler(newSpots, oldSpots) {
        console.log('SpotTable: Spots data changed:', {
          from: oldSpots?.length || 0,
          to: newSpots?.length || 0,
          spots: newSpots?.map(s => ({ id: s.codSpot, name: s.nombreSpot })) || []
        })
        // Reset pagination when spots data changes
        this.currentPage = 1
        // Clear selections if they reference spots that no longer exist
        this.validateSelections()
      },
      immediate: true,
      deep: true
    },
    selectedSpots: {
      handler(newSelectedSpots) {
        console.log('SpotTable: selectedSpots changed:', newSelectedSpots)
        this.localSelectedSpots = [...(newSelectedSpots || [])]
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    console.log('SpotTable: Component mounted with', this.spots?.length || 0, 'spots')

    // Load saved page size preference
    const savedPageSize = localStorage.getItem('spotTablePageSize')
    if (savedPageSize) {
      this.pageSize = parseInt(savedPageSize)
    }

    // Ensure selections are valid after mount
    this.$nextTick(() => {
      this.validateSelections()
    })
  },

  updated() {
    // Debug logging for updates
    console.log('SpotTable: Component updated', {
      spots: this.spots?.length || 0,
      filtered: this.filteredSpots?.length || 0,
      selected: this.localSelectedSpots?.length || 0,
      page: this.currentPage,
      pageSize: this.pageSize
    })
  },
  methods: {
    // Selection methods
    isSelected(spot) {
      return this.localSelectedSpots.some(s => s.codSpot === spot.codSpot)
    },

    validateSelections() {
      // Remove selections for spots that no longer exist
      const validSpotIds = this.spots.map(s => s.codSpot)
      const validSelections = this.localSelectedSpots.filter(s =>
        validSpotIds.includes(s.codSpot)
      )

      if (validSelections.length !== this.localSelectedSpots.length) {
        console.log('SpotTable: Cleaned up invalid selections')
        this.localSelectedSpots = validSelections
        this.$emit('selection-change', [...this.localSelectedSpots])
      }
    },

    toggleSelectAll() {
      if (this.isAllSelected) {
        this.localSelectedSpots = []
      } else {
        this.localSelectedSpots = [...this.filteredSpots]
      }
      console.log('SpotTable: Selection changed:', this.localSelectedSpots.length, 'spots selected')
      this.$emit('selection-change', [...this.localSelectedSpots])
    },

    toggleSelection(spot) {
      const index = this.localSelectedSpots.findIndex(s => s.codSpot === spot.codSpot)
      if (index > -1) {
        this.localSelectedSpots.splice(index, 1)
      } else {
        this.localSelectedSpots.push(spot)
      }
      console.log('SpotTable: Spot selection toggled:', spot.nombreSpot, 'selected:', !index)
      this.$emit('selection-change', [...this.localSelectedSpots])
    },

    clearSelection() {
      this.localSelectedSpots = []
      this.$emit('selection-change', this.localSelectedSpots)
    },

    // Action handlers
    handleCreate() {
      console.log('SpotTable: Creating new spot')
      this.$emit('create')
    },

    handleEdit() {
      if (this.localSelectedSpots.length === 1) {
        console.log('SpotTable: Editing selected spot:', this.localSelectedSpots[0])
        this.$emit('edit', this.localSelectedSpots[0])
      } else {
        console.warn('SpotTable: No spot to edit')
      }
    },

    handleDelete() {
      const spotsToDelete = this.localSelectedSpots
      console.log('SpotTable: Deleting spots:', spotsToDelete.length, 'spots')
      if (spotsToDelete.length > 0) {
        this.$emit('delete', spotsToDelete)
      } else {
        console.warn('SpotTable: No spots to delete')
      }
    },

    handlePlay(spot) {
      console.log('SpotTable: Playing spot:', spot)
      this.$emit('play', spot)
    },

    // Media preview methods
    openMediaPreview(spot) {
      console.log('SpotTable: Opening media preview for:', spot.nombreSpot)
      this.mediaPreviewSpot = spot
      this.showMediaModal = true
    },

    closeMediaPreview() {
      this.showMediaModal = false
      this.mediaPreviewSpot = null
    },

    // Filter methods
    handleSearch() {
      clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        console.log('SpotTable: Search triggered:', this.searchQuery)
        this.currentPage = 1
        this.$emit('filter-change', {
          search: this.searchQuery,
          category: this.categoryFilter,
          status: this.statusFilter
        })
      }, 300)
    },

    handleFilterChange() {
      console.log('SpotTable: Filter changed:', {
        search: this.searchQuery,
        category: this.categoryFilter,
        status: this.statusFilter
      })
      this.currentPage = 1
      this.$emit('filter-change', {
        search: this.searchQuery,
        category: this.categoryFilter,
        status: this.statusFilter
      })
    },

    clearSearch() {
      this.searchQuery = ''
      this.handleSearch()
    },

    clearAllFilters() {
      console.log('SpotTable: Clearing all filters')
      this.searchQuery = ''
      this.categoryFilter = ''
      this.statusFilter = ''
      this.currentPage = 1
      this.$emit('filter-change', {
        search: '',
        category: '',
        status: ''
      })
    },

    // Sort methods
    toggleSort(column) {
      if (this.sortBy === column) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortBy = column
        this.sortOrder = 'asc'
      }
      this.currentPage = 1
    },

    // Pagination methods
    goToPage(page) {
      if (page === '...') return
      this.currentPage = page
    },

    goToFirstPage() {
      this.currentPage = 1
    },

    goToLastPage() {
      this.currentPage = this.totalPages
    },

    goToNextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
      }
    },

    goToPreviousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    handlePageSizeChange() {
      this.currentPage = 1
      localStorage.setItem('spotTablePageSize', this.pageSize)
    },

    // Audio methods
    handleAudioLoad(event, spot) {
      const audio = event.target
      if (audio.duration) {
        this.audioDurations[spot.codSpot] = this.formatDuration(audio.duration)
      }
    },

    getAudioDuration(spot) {
      return this.audioDurations[spot.codSpot] || ''
    },

    formatDuration(seconds) {
      if (!seconds) return ''
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = Math.floor(seconds % 60)
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },

    // Category and status methods
    getCategoryVariant(tipo) {
      const variants = {
        inst: 'primary',
        prom: 'warning',
        noti: 'info'
      }
      return variants[tipo] || 'secondary'
    },

    getCategoryLabel(tipo) {
      const labels = {
        inst: 'Institucional',
        prom: 'Promocional',
        noti: 'Noticias'
      }
      return labels[tipo] || tipo
    },

    getCategoryIcon(tipo) {
      const icons = {
        inst: 'fas fa-building',
        prom: 'fas fa-bullhorn',
        noti: 'fas fa-newspaper'
      }
      return icons[tipo] || 'fas fa-tag'
    },

    getMediaIcon(mediaTipo) {
      const icons = {
        audio: 'fas fa-headphones',
        video: 'fas fa-video',
        streaming: 'fas fa-broadcast-tower'
      }
      return icons[mediaTipo] || 'fas fa-play'
    },

    getMediaLabel(mediaTipo) {
      const labels = {
        audio: 'Escuchar',
        video: 'Ver video',
        streaming: 'Ver URL'
      }
      return labels[mediaTipo] || 'Ver'
    },

    getExpirationClass(spot) {
      if (spot.vencido<=0) return 'badge-danger'
      if (spot.vencido<5&&spot.vencido>0) return 'badge-warning'
      return 'badge-success'
    },

    getExpirationIcon(spot) {
      if (this.isExpired(spot)) return 'fas fa-times-circle'
      if (this.isExpiringSoon(spot)) return 'fas fa-exclamation-triangle'
      return 'fas fa-check-circle'
    },

    isExpired(spot) {
      return spot.vencido
    },

    isExpiringSoon(spot) {
      return spot.vencido <= 7 && spot.vencido > 0
    },

    getDaysUntilExpiration(spot) {
      if (spot.vencido>0) return null
      return spot.vencido
    },

    getExpirationStatusText(spot) {
      const days = this.getDaysUntilExpiration(spot)
      if (days === null) return ''
      if (isNaN(days)) return ''

      if (days < 0) {
        return `Vencido hace ${Math.abs(days)} día${Math.abs(days) > 1 ? 's' : ''}`
      } else if (days === 0) {
        return 'Vence hoy'
      } else if (days === 1) {
        return 'Vence mañana'
      } else {
        return `Vence en ${Math.abs(days)} día${Math.abs(days) > 1 ? 's' : ''}`
      }
    },

    formatDate(dateString) {
      // Handle special cases
      if (dateString === 'No vence' || dateString === 'Vencido' || dateString === 'Sin fecha') {
        return dateString
      }

      if (!dateString) {
        return 'Sin fecha'
      }

      try {
        // If it's already in DD-MM-YYYY format, return as is
        if (typeof dateString === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
          return dateString
        }

        // Try to parse as ISO date
        if (dateString=='No vence') {
          return 'No vence'
        }
        const date = this.$moment(dateString)

        if (!date.isValid()) {
          console.warn('SpotTable: Invalid date format:', dateString)
          return 'Fecha inválida'
        }

        return date.format('DD-MM-YYYY')
      } catch (error) {
        console.error('SpotTable: Error formatting date:', dateString, error)
        return 'Error de fecha'
      }
    },

    getEmptyStateMessage() {
      if (this.spots.length === 0) {
        return 'No hay spots cargados en el sistema. Crea tu primer spot para comenzar.'
      } else if (this.hasActiveFilters) {
        return 'No se encontraron spots que coincidan con los filtros aplicados.'
      }
      return 'No se pudieron cargar los spots.'
    },

    // Force refresh computed properties
    refresh() {
      console.log('SpotTable: Forcing refresh of computed properties')
      this.$forceUpdate()
    },

    // Method to handle external data updates
    updateSpots(newSpots) {
      console.log('SpotTable: External spots update received:', newSpots?.length || 0, 'spots')
      this.$emit('spots-updated', newSpots)
    }
  }
}
</script>

