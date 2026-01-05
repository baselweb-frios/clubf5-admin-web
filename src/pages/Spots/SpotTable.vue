<template>
  <div class="spot-table-container">
    <!-- Header Section -->
    <div class="table-header">
      <div class="header-content">
        <div class="header-info">
          <h2 class="table-title">
            <i class="fas fa-microphone-alt"></i>
            Gestión de Spots
          </h2>
          <p class="table-subtitle">
            {{ filteredSpots.length }} de {{ spots.length }} spots
          </p>
        </div>
        <div class="header-actions">
          <button
            class="btn btn-primary"
            @click="handleCreate()"
            aria-label="Crear nuevo spot"
          >
            <i class="fas fa-plus"></i>
            Nuevo Spot
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <div class="filters-grid">
        <!-- Search Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="fas fa-search"></i>
            Buscar
          </label>
          <div class="filter-input-wrapper">
            <input
              v-model="searchQuery"
              type="text"
              class="form-input"
              placeholder="Buscar por nombre..."
              @input="handleSearch"
            >
            <i v-if="searchQuery" class="fas fa-times clear-search" @click="clearSearch()"></i>
          </div>
        </div>

        <!-- Category Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="fas fa-layer-group"></i>
            Categoría
          </label>
          <select v-model="categoryFilter" class="form-select" @change="handleFilterChange">
            <option value="">Todas las categorías</option>
            <option value="inst">Institucional</option>
            <option value="noti">Noticias</option>
            <option value="prom">Promocional</option>
          </select>
        </div>

        <!-- Status Filter -->
        <div class="filter-group">
          <label class="filter-label">
            <i class="fas fa-clock"></i>
            Estado
          </label>
          <select v-model="statusFilter" class="form-select" @change="handleFilterChange">
            <option value="">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="expired">Vencidos</option>
            <option value="expiring">Por vencer</option>
          </select>
        </div>

        <!-- Clear Filters -->
        <div class="filter-group filter-actions">
          <button
            v-if="hasActiveFilters"
            class="btn btn-outline btn-sm"
            @click="clearAllFilters()"
          >
            <i class="fas fa-eraser"></i>
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Table Actions -->
    <div class="table-actions" v-if="localSelectedSpots.length > 0">
      <div class="selection-info">
        <i class="fas fa-info-circle"></i>
        {{ localSelectedSpots.length }} spot{{ localSelectedSpots.length > 1 ? 's' : '' }} seleccionado{{ localSelectedSpots.length > 1 ? 's' : '' }}
      </div>
      <div class="action-buttons">
        <button
          class="btn btn-outline btn-sm"
          @click="handleEdit"
          :disabled="localSelectedSpots.length !== 1"
          aria-label="Editar spot seleccionado"
        >
          <i class="fas fa-edit"></i>
          Editar
        </button>

        <button
          class="btn btn-danger btn-sm"
          @click="handleDelete"
          :disabled="localSelectedSpots.length === 0"
          aria-label="Eliminar spots seleccionados"
        >
          <i class="fas fa-trash"></i>
          Eliminar
        </button>

        <button
          class="btn btn-secondary btn-sm"
          @click="clearSelection"
          aria-label="Limpiar selección"
        >
          <i class="fas fa-times"></i>
          Limpiar
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="table-section">
      <!-- Desktop Table View -->
      <div class="table-container desktop-table">
        <table class="table" role="table" aria-label="Lista de spots">
          <thead>
            <tr>
              <th scope="col" class="checkbox-column">
                <input
                  type="checkbox"
                  :checked="isAllSelected"
                  @change="toggleSelectAll"
                  :indeterminate="isIndeterminate"
                  aria-label="Seleccionar todos los spots"
                >
              </th>
              <th scope="col" class="name-column">
                <button class="sort-button" @click="toggleSort('nombre')">
                  <i class="fas fa-sort"></i>
                  Nombre
                </button>
              </th>
              <th scope="col" class="category-column">
                <button class="sort-button" @click="toggleSort('categoria')">
                  <i class="fas fa-sort"></i>
                  Tipo
                </button>
              </th>
              <th scope="col" class="date-column">
                <button class="sort-button" @click="toggleSort('vencimiento')">
                  <i class="fas fa-sort"></i>
                  Vencimiento
                </button>
              </th>
              <th scope="col" class="audio-column">
                <i class="fas fa-music"></i>
                Media
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="spot in paginatedSpots"
              :key="spot.codSpot"
              :class="{ 'is-selected': isSelected(spot) }"
              @click="toggleSelection(spot)"
            >
              <td class="checkbox-cell">
                <input
                  type="checkbox"
                  :checked="isSelected(spot)"
                  @change="toggleSelection(spot)"
                  aria-label="Seleccionar spot"
                >
              </td>
              <td class="name-cell">
                <div class="spot-info">
                  <div class="spot-name">{{ spot.nombreSpot }}</div>
                  <div class="spot-code">ID: {{ spot.codSpot }}</div>
                </div>
              </td>
              <td class="category-cell">
                <span :class="`badge badge-${getCategoryVariant(spot.tipo)}`">
                  <i :class="getCategoryIcon(spot.tipo)"></i>
                  {{ getCategoryLabel(spot.tipo) }}
                </span>
              </td>
              <td class="date-cell">
                <div class="date-info">
                  <span :class="`badge ${getExpirationClass(spot)}`">
                    <i :class="getExpirationIcon(spot)"></i>
                    {{ (typeof spot.fechaFin==='boolean')?'No vence':spot.fechaFin }}
                  </span>
                  <div class="date-status" v-if="getDaysUntilExpiration(spot) !== null">
                    {{ getExpirationStatusText(spot) }}
                  </div>
                </div>
              </td>
              <td class="audio-cell">

                <div class="audio-controls" v-if="spot.mediaTipo=='streaming'">
                  <p>{{ spot.url }}</p>
                </div>  
                <div class="audio-controls" v-if="spot.mediaTipo=='video'">
                  <video
                    controls
                    :src="spot.url"
                    class="audio-preview"
                  >
                    Tu navegador no soporta el elemento de video.
                  </video>
                </div>
                <div class="audio-controls" v-if="spot.mediaTipo=='audio'">
                  <audio
                    controls
                    :src="spot.url"
                    class="audio-preview"
                  >
                    Tu navegador no soporta el elemento de audio.
                  </audio>
                </div>
              </td>
            
            </tr>

            <!-- Empty State -->
            <tr v-if="paginatedSpots.length === 0">
              <td colspan="6" class="empty-state">
                <div class="empty-content">
                  <i class="fas fa-microphone-slash"></i>
                  <h3>No se encontraron spots</h3>
                  <p>{{ getEmptyStateMessage() }}</p>
                  <button v-if="hasActiveFilters" class="btn btn-primary" @click="clearAllFilters()">
                    <i class="fas fa-eraser"></i>
                    Limpiar Filtros
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards View -->
      <div class="mobile-cards">
        <div
          v-for="spot in paginatedSpots"
          :key="spot.codSpot"
          class="mobile-card"
          :class="{ 'is-selected': isSelected(spot) }"
          @click="toggleSelection(spot)"
        >
          <div class="mobile-card-header">
            <input
              type="checkbox"
              :checked="isSelected(spot)"
              @change.stop="toggleSelection(spot)"
              class="card-checkbox"
              aria-label="Seleccionar spot"
            >
            <div class="card-title-section">
              <h4 class="card-spot-name">{{ spot.nombreSpot }}</h4>
              <span class="card-spot-code">ID: {{ spot.codSpot }}</span>
            </div>
          </div>

          <div class="mobile-card-body">
            <div class="card-row">
              <span class="card-label">
                <i class="fas fa-tag"></i>
                Tipo
              </span>
              <span :class="`badge badge-${getCategoryVariant(spot.tipo)}`">
                <i :class="getCategoryIcon(spot.tipo)"></i>
                {{ getCategoryLabel(spot.tipo) }}
              </span>
            </div>

            <div class="card-row">
              <span class="card-label">
                <i class="fas fa-calendar-alt"></i>
                Vencimiento
              </span>
              <div class="card-value">
                <span :class="`badge ${getExpirationClass(spot)}`">
                  <i :class="getExpirationIcon(spot)"></i>
                  {{ (typeof spot.fechaFin==='boolean')?'No vence':spot.fechaFin }}
                </span>
                <div class="card-date-status" v-if="getDaysUntilExpiration(spot) !== null">
                  {{ getExpirationStatusText(spot) }}
                </div>
              </div>
            </div>

            <div class="card-row" v-if="spot.mediaTipo">
              <span class="card-label">
                <i class="fas fa-music"></i>
                Media
              </span>
              <div class="card-media">
                <div v-if="spot.mediaTipo=='streaming'">
                  <p class="streaming-url">{{ spot.url }}</p>
                </div>
                <video
                  v-if="spot.mediaTipo=='video'"
                  controls
                  :src="spot.url"
                  class="card-audio-preview"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
                <audio
                  v-if="spot.mediaTipo=='audio'"
                  controls
                  :src="spot.url"
                  class="card-audio-preview"
                >
                  Tu navegador no soporta el elemento de audio.
                </audio>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State for Mobile -->
        <div v-if="paginatedSpots.length === 0" class="empty-state">
          <div class="empty-content">
            <i class="fas fa-microphone-slash"></i>
            <h3>No se encontraron spots</h3>
            <p>{{ getEmptyStateMessage() }}</p>
            <button v-if="hasActiveFilters" class="btn btn-primary" @click="clearAllFilters()">
              <i class="fas fa-eraser"></i>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
      <div class="pagination-section" v-if="totalPages > 1">
        <div class="pagination-info">
          <span class="pagination-text">
            Mostrando {{ paginationInfo.start }} - {{ paginationInfo.end }} de {{ filteredSpots.length }} spots
          </span>
        </div>
        <div class="pagination-controls">
          <button
            class="btn btn-outline btn-sm"
            @click="goToFirstPage"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button
            class="btn btn-outline btn-sm"
            @click="goToPreviousPage"
            :disabled="currentPage === 1"
          >
            <i class="fas fa-angle-left"></i>
          </button>

          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="btn btn-page"
              :class="{ 'btn-primary': page === currentPage, 'btn-outline': page !== currentPage }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </div>

          <button
            class="btn btn-outline btn-sm"
            @click="goToNextPage"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-angle-right"></i>
          </button>
          <button
            class="btn btn-outline btn-sm"
            @click="goToLastPage"
            :disabled="currentPage === totalPages"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>

        <div class="pagination-size">
          <select v-model="pageSize" @change="handlePageSizeChange" class="form-select">
            <option :value="10">10 por página</option>
            <option :value="25">25 por página</option>
            <option :value="50">50 por página</option>
            <option :value="100">100 por página</option>
          </select>
        </div>
      </div>
  </div>
</template>

<script>
export default {
  name: 'SpotTable',
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
      audioDurations: {}
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
  }
}
</script>

<style scoped>
/* ===== PREMIUM SPOT TABLE - APPLE STYLE ===== */
.spot-table-container {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
  border-radius: var(--radius-2xl);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ===== HEADER SECTION ===== */
.table-header {
  padding: var(--spacing-6) var(--spacing-8);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.table-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e5e7eb;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  letter-spacing: -0.02em;
}

.table-title i {
  color: #60a5fa;
  filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.5));
}

.table-subtitle {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

/* ===== FILTERS SECTION ===== */
.filters-section {
  padding: var(--spacing-6) var(--spacing-8);
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-6);
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #e5e7eb;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.filter-label i {
  color: #60a5fa;
}

.filter-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input,
.form-select {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: #e5e7eb;
  font-size: 0.9375rem;
  outline: none;
  transition: all 0.2s ease;
  height: 42px;
}

.form-input:focus,
.form-select:focus {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.clear-search {
  position: absolute;
  right: var(--spacing-3);
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.1);
}

/* ===== TABLE ACTIONS ===== */
.table-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-8);
  background: rgba(59, 130, 246, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.selection-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: 0.875rem;
  color: #e5e7eb;
  font-weight: 500;
}

.selection-info i {
  color: #60a5fa;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-3);
}

/* ===== TABLE SECTION ===== */
.table-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for nested flex scroll */
}

.table-container {
  overflow: auto;
  flex: 1;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.9375rem;
}

.table th {
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(12px);
  padding: var(--spacing-4) var(--spacing-6);
  text-align: left;
  font-weight: 600;
  color: #9ca3af;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

.table td {
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  color: #e5e7eb;
  vertical-align: middle;
  transition: background 0.2s ease;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.table tbody tr.is-selected {
  background: rgba(59, 130, 246, 0.1);
}

.table tbody tr.is-selected td {
  border-bottom-color: rgba(59, 130, 246, 0.2);
}

/* Column Styles */
.checkbox-column { width: 48px; text-align: center; }
.checkbox-cell { text-align: center; }
.name-column { min-width: 240px; }
.category-column { width: 160px; }
.date-column { width: 180px; }
.audio-column { width: 240px; }

/* Spot Info */
.spot-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.spot-name {
  font-weight: 600;
  color: #e5e7eb;
}

.spot-code {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
}

/* Date Info */
.date-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.date-status {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Sort Button */
.sort-button {
  background: none;
  border: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 0;
  transition: color 0.2s ease;
}

.sort-button:hover {
  color: #e5e7eb;
}

/* Audio Controls */
.audio-preview {
  width: 100%;
  height: 36px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border: 1px solid transparent;
}

.badge-primary {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

.badge-secondary {
  background: rgba(107, 114, 128, 0.15);
  color: #9ca3af;
  border-color: rgba(107, 114, 128, 0.3);
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

.badge-info {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border-color: rgba(6, 182, 212, 0.3);
}

/* ===== PAGINATION ===== */
.pagination-section {
  padding: var(--spacing-4) var(--spacing-8);
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.pagination-info {
  font-size: 0.875rem;
  color: #9ca3af;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.page-numbers {
  display: flex;
  gap: 2px;
}

.btn-page {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  background: transparent;
  color: #9ca3af;
}

.btn-page:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
}

.btn-page.btn-primary {
  background: #3b82f6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.4);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  padding: var(--spacing-12) !important;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  max-width: 400px;
  margin: 0 auto;
}

.empty-content i {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.1);
}

.empty-content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #e5e7eb;
  margin: 0;
}

.empty-content p {
  color: #9ca3af;
  margin: 0;
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: 8px 16px;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8125rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #e5e7eb;
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
}

.btn-danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.25);
}

.btn-outline {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #9ca3af;
}

.btn-outline:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.3);
  color: #e5e7eb;
  background: rgba(255, 255, 255, 0.05);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}

/* ===== MOBILE CARDS VIEW ===== */
.mobile-cards {
  display: none; /* Hidden by default, shown in mobile breakpoint */
}

.mobile-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  margin-bottom: var(--spacing-4);
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;
}

.mobile-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.mobile-card.is-selected {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.mobile-card-header {
  padding: var(--spacing-4);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-3);
}

.card-checkbox {
  margin-top: 2px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-spot-name {
  margin: 0 0 4px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #e5e7eb;
  word-break: break-word;
}

.card-spot-code {
  font-size: 0.75rem;
  color: #9ca3af;
  font-family: monospace;
}

.mobile-card-body {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-3);
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.card-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.card-label {
  font-size: 0.8125rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

.card-label i {
  color: #60a5fa;
  font-size: 0.75rem;
}

.card-value {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.card-date-status {
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: right;
}

.card-media {
  width: 100%;
  max-width: 100%;
}

.card-audio-preview {
  width: 100%;
  height: 36px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

.streaming-url {
  font-size: 0.75rem;
  color: #60a5fa;
  word-break: break-all;
  margin: 0;
  text-align: right;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .table-header,
  .filters-section,
  .table-actions,
  .pagination-section {
    padding-left: var(--spacing-4);
    padding-right: var(--spacing-4);
  }
}

/* Tablet styles (769px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  
  .spot-table-container{
    padding: var(--spacing-4);
  }
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .table th,
  .table td {
    padding: var(--spacing-3) var(--spacing-5);
    font-size: 0.9375rem;
  }

  .name-column {
    min-width: 220px;
  }

  .category-column {
    width: 150px;
  }

  .date-column {
    width: 170px;
  }

  .audio-column {
    width: 220px;
  }

  .table-title {
    font-size: 1.375rem;
  }

  .btn {
    padding: 9px 17px;
  }
}

@media (max-width: 768px) {
  .spot-table-container{
    padding: var(--spacing-4);
  }
  
  .table-header,
  .filters-section,
  .table-actions,
  .pagination-section {
    padding: var(--spacing-4);
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
    justify-content: center;
  }

  .filters-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }

  .table-actions {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: stretch;
  }

  .action-buttons {
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .action-buttons .btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  /* Hide desktop table, show mobile cards */
  .desktop-table {
    display: none !important;
  }

  .mobile-cards {
    display: block;
    padding: var(--spacing-4);
  }

  .pagination-section {
    flex-direction: column;
    gap: var(--spacing-3);
    align-items: center;
  }

  .pagination-info {
    order: 3;
    text-align: center;
    font-size: 0.8125rem;
  }

  .pagination-controls {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--spacing-2);
    order: 1;
  }

  .page-numbers {
    order: 2;
    width: 100%;
    justify-content: center;
    margin: var(--spacing-2) 0;
  }

  .btn-page {
    width: 32px;
    height: 32px;
    font-size: 0.8125rem;
  }

  .table-title {
    font-size: 1.25rem;
  }

  .table-subtitle {
    font-size: 0.8125rem;
  }

  .filter-label {
    font-size: 0.75rem;
  }

  .form-input,
  .form-select {
    font-size: 1rem; /* Prevent zoom on iOS */
    height: 40px;
  }

  .btn {
    padding: 10px 16px;
    font-size: 0.875rem;
    min-height: 44px; /* Touch-friendly */
  }

  .btn-sm {
    padding: 8px 12px;
    font-size: 0.8125rem;
    min-height: 40px;
  }

  .empty-content i {
    font-size: 2.5rem;
  }

  .empty-content h3 {
    font-size: 1.125rem;
  }
}

@media (max-width: 640px) {
  .spot-table-container {
    border-radius: var(--radius-xl);
  }

  .table-header {
    padding: var(--spacing-3);
  }

  .table-title {
    font-size: 1.125rem;
  }

  .table-title i {
    font-size: 1.125rem;
  }

  .filters-section {
    padding: var(--spacing-3);
  }

  .table-actions {
    padding: var(--spacing-3);
  }

  .action-buttons .btn {
    min-width: 100px;
    font-size: 0.75rem;
  }

  /* Mobile cards adjustments */
  .mobile-cards {
    padding: var(--spacing-3);
  }

  .mobile-card {
    margin-bottom: var(--spacing-3);
  }

  .mobile-card-header {
    padding: var(--spacing-3);
  }

  .mobile-card-body {
    padding: var(--spacing-3);
  }

  .card-spot-name {
    font-size: 0.9375rem;
  }

  .card-spot-code {
    font-size: 0.6875rem;
  }

  .badge {
    font-size: 0.6875rem;
    padding: 3px 8px;
  }
}

@media (max-width: 480px) {
  .spot-table-container {
    padding: 0;
  }

  .table-header,
  .filters-section,
  .table-actions,
  .pagination-section {
    padding: var(--spacing-2) var(--spacing-3);
  }

  .header-content {
    gap: var(--spacing-2);
  }

  .table-title {
    font-size: 1rem;
    gap: var(--spacing-2);
  }

  .table-subtitle {
    font-size: 0.75rem;
  }

  .filters-grid {
    gap: var(--spacing-3);
  }

  .filter-label {
    font-size: 0.6875rem;
  }

  .form-input,
  .form-select {
    height: 38px;
    padding: var(--spacing-2) var(--spacing-3);
  }

  .action-buttons {
    gap: var(--spacing-2);
  }

  .action-buttons .btn {
    flex: 1;
    min-width: auto;
    padding: 8px;
    font-size: 0.6875rem;
  }

  .action-buttons .btn i {
    font-size: 0.875rem;
  }

  /* Ultra-compact mobile cards */
  .mobile-cards {
    padding: var(--spacing-2);
  }

  .mobile-card {
    margin-bottom: var(--spacing-2);
  }

  .mobile-card-header {
    padding: var(--spacing-2) var(--spacing-3);
  }

  .mobile-card-body {
    padding: var(--spacing-2) var(--spacing-3);
    gap: var(--spacing-2);
  }

  .card-row {
    padding-bottom: var(--spacing-2);
    gap: var(--spacing-2);
    flex-direction: column;
    align-items: flex-start;
  }

  .card-spot-name {
    font-size: 0.875rem;
  }

  .card-spot-code {
    font-size: 0.625rem;
  }

  .card-label {
    font-size: 0.75rem;
  }

  .card-value {
    align-items: flex-start;
    text-align: left;
  }

  .card-date-status {
    text-align: left;
    font-size: 0.6875rem;
  }

  .badge {
    font-size: 0.625rem;
    padding: 2px 6px;
  }

  .card-audio-preview {
    height: 32px;
  }

  .pagination-section {
    gap: var(--spacing-2);
  }

  .btn-page {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .btn {
    font-size: 0.75rem;
  }

  .btn-sm {
    font-size: 0.6875rem;
    padding: 6px 10px;
    min-height: 36px;
  }

  .empty-content i {
    font-size: 2rem;
  }

  .empty-content h3 {
    font-size: 1rem;
  }

  .empty-content p {
    font-size: 0.875rem;
  }
}
</style>
