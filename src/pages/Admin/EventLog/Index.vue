<template>
  <div class="min-h-screen bg-[#0a0e17] text-[#c5cdd8] font-mono">
    <!-- Top Status Bar -->
    <div class="bg-[#0d1117] border-b border-[#1e2d3d] px-6 py-2 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="flex gap-1.5">
          <span class="w-3 h-3 rounded-full bg-[#ff5f57]"></span>
          <span class="w-3 h-3 rounded-full bg-[#febc2e]"></span>
          <span class="w-3 h-3 rounded-full bg-[#28c840]"></span>
        </div>
        <span class="text-xs text-[#5a6a7a] ml-2">event-log@clubf5 — systemd journal viewer</span>
      </div>
      <div class="flex items-center gap-4 text-xs text-[#5a6a7a]">
        <span class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-[#28c840] animate-pulse"></span>
          LIVE
        </span>
        <span>{{ currentTime }}</span>
      </div>
    </div>

    <div class="p-6 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold text-[#e6edf3] flex items-center gap-3">
            <i class="fa-solid fa-terminal text-[#58a6ff]"></i>
            System Event Monitor
          </h1>
          <p class="text-xs text-[#5a6a7a] mt-1">
            <span class="text-[#58a6ff]">admin@clubf5</span>:<span class="text-[#58a6ff]">~</span>$ journalctl --system --all
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1.5 text-xs bg-[#161b22] border border-[#30363d] rounded text-[#c5cdd8] hover:bg-[#1c2333] hover:border-[#58a6ff] transition-all flex items-center gap-2"
            :disabled="loading"
            @click="loadAllData()"
          >
            <i class="fa-solid fa-rotate" :class="{ 'fa-spin': loading }"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <!-- Total Events -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg p-4 hover:border-[#58a6ff]/30 transition-colors group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-[#5a6a7a]">Total Events</span>
            <i class="fa-solid fa-list text-[#58a6ff] text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div class="text-2xl font-bold text-[#e6edf3]">{{ stats.totalEvents?.toLocaleString('es-AR') || '0' }}</div>
          <div class="text-[10px] text-[#5a6a7a] mt-1">last 24h</div>
        </div>

        <!-- Total Errors -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg p-4 hover:border-[#f85149]/30 transition-colors group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-[#5a6a7a]">Total Errors</span>
            <i class="fa-solid fa-bug text-[#f85149] text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div class="text-2xl font-bold text-[#f85149]">{{ stats.totalErrors?.toLocaleString('es-AR') || '0' }}</div>
          <div class="text-[10px] text-[#5a6a7a] mt-1">last 24h</div>
        </div>

        <!-- Warnings -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg p-4 hover:border-[#d29922]/30 transition-colors group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-[#5a6a7a]">Warnings</span>
            <i class="fa-solid fa-triangle-exclamation text-[#d29922] text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div class="text-2xl font-bold text-[#d29922]">{{ stats.totalWarnings?.toLocaleString('es-AR') || '0' }}</div>
          <div class="text-[10px] text-[#5a6a7a] mt-1">last 24h</div>
        </div>

        <!-- Critical -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg p-4 hover:border-[#f85149]/30 transition-colors group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-[#5a6a7a]">Critical</span>
            <i class="fa-solid fa-circle-xmark text-[#f85149] text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div class="text-2xl font-bold text-[#f85149]">{{ stats.totalCritical?.toLocaleString('es-AR') || '0' }}</div>
          <div class="text-[10px] text-[#5a6a7a] mt-1">last 24h</div>
        </div>

        <!-- Unhandled Errors -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg p-4 hover:border-[#f85149]/30 transition-colors group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-[#5a6a7a]">Unhandled</span>
            <i class="fa-solid fa-circle-exclamation text-[#f85149] text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div class="text-2xl font-bold text-[#f85149]">{{ stats.unhandledErrors?.toLocaleString('es-AR') || '0' }}</div>
          <div class="text-[10px] text-[#5a6a7a] mt-1">pending review</div>
        </div>

        <!-- Handled Rate -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg p-4 hover:border-[#28c840]/30 transition-colors group">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[10px] uppercase tracking-wider text-[#5a6a7a]">Handled Rate</span>
            <i class="fa-solid fa-check-circle text-[#28c840] text-xs opacity-50 group-hover:opacity-100 transition-opacity"></i>
          </div>
          <div class="text-2xl font-bold text-[#28c840]">{{ stats.handledRate || '0' }}%</div>
          <div class="text-[10px] text-[#5a6a7a] mt-1">resolution rate</div>
        </div>
      </div>

      <!-- Severity Distribution Bar -->
      <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs uppercase tracking-wider text-[#5a6a7a]">Severity Distribution</span>
          <span class="text-xs text-[#5a6a7a]">{{ stats.totalEvents?.toLocaleString('es-AR') || '0' }} total</span>
        </div>
        <div class="flex h-3 rounded-full overflow-hidden bg-[#161b22]">
          <div
            class="bg-[#58a6ff] transition-all duration-500"
            :style="{ width: severityPercent('info') + '%' }"
            title="Info"
          ></div>
          <div
            class="bg-[#d29922] transition-all duration-500"
            :style="{ width: severityPercent('warning') + '%' }"
            title="Warning"
          ></div>
          <div
            class="bg-[#f85149] transition-all duration-500"
            :style="{ width: severityPercent('error') + '%' }"
            title="Error"
          ></div>
          <div
            class="bg-[#bc4c4c] transition-all duration-500"
            :style="{ width: severityPercent('critical') + '%' }"
            title="Critical"
          ></div>
        </div>
        <div class="flex items-center gap-4 mt-2 text-[10px] text-[#5a6a7a]">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#58a6ff]"></span> Info {{ severityPercent('info') }}%</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#d29922]"></span> Warning {{ severityPercent('warning') }}%</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#f85149]"></span> Error {{ severityPercent('error') }}%</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-[#bc4c4c]"></span> Critical {{ severityPercent('critical') }}%</span>
        </div>
      </div>

      <!-- Two Column Layout: Latest Warnings + Event Type Breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Latest Warnings -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div class="px-4 py-3 border-b border-[#1e2d3d] flex items-center justify-between">
            <h2 class="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation text-[#d29922]"></i>
              Latest Warnings & Errors
            </h2>
            <span class="text-[10px] text-[#5a6a7a]">last 10</span>
          </div>
          <div class="divide-y divide-[#1e2d3d]">
            <div
              v-if="loadingWarnings"
              class="p-4 text-center text-[#5a6a7a] text-xs"
            >
              <i class="fa-solid fa-spinner fa-spin mr-2"></i> Loading...
            </div>
            <div
              v-else-if="latestWarnings.length === 0"
              class="p-4 text-center text-[#5a6a7a] text-xs"
            >
              <i class="fa-solid fa-check-circle text-[#28c840] mr-2"></i> No recent warnings
            </div>
            <div
              v-for="(item, idx) in latestWarnings"
              :key="idx"
              class="p-3 hover:bg-[#161b22] transition-colors cursor-pointer"
              @click="openDetail(item)"
            >
              <div class="flex items-start gap-3">
                <span
                  class="mt-0.5 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded"
                  :class="getSeverityBadgeClass(item.severity)"
                >
                  {{ getSeverityLabel(item.severity) }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-xs text-[#c5cdd8] truncate">{{ item.message || item.errorMessage || item.description || 'No message' }}</p>
                  <div class="flex items-center gap-3 mt-1 text-[10px] text-[#5a6a7a]">
                    <span class="flex items-center gap-1">
                      <i class="fa-regular fa-clock"></i>
                      {{ formatTimeAgo(item) }}
                    </span>
                    <span class="flex items-center gap-1">
                      <i class="fa-solid fa-code"></i>
                      {{ item.controller || 'system' }}
                    </span>
                    <span v-if="item.userId" class="flex items-center gap-1">
                      <i class="fa-solid fa-user"></i>
                      {{ item.userId }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Type Breakdown -->
        <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg overflow-hidden">
          <div class="px-4 py-3 border-b border-[#1e2d3d] flex items-center justify-between">
            <h2 class="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
              <i class="fa-solid fa-chart-bar text-[#58a6ff]"></i>
              Events by Category
            </h2>
            <span class="text-[10px] text-[#5a6a7a]">breakdown</span>
          </div>
          <div class="p-4 space-y-3">
            <div
              v-for="(item, idx) in eventTypeBreakdown"
              :key="idx"
              class="flex items-center gap-3"
            >
              <span class="text-[10px] text-[#5a6a7a] w-28 truncate" :title="item.label">{{ item.label }}</span>
              <div class="flex-1 h-2 bg-[#161b22] rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :style="{ width: item.percent + '%', backgroundColor: item.color }"
                ></div>
              </div>
              <span class="text-xs text-[#c5cdd8] w-10 text-right font-mono">{{ item.count }}</span>
            </div>
            <div v-if="eventTypeBreakdown.length === 0" class="text-center text-[#5a6a7a] text-xs py-4">
              <i class="fa-solid fa-spinner fa-spin mr-2" v-if="loading"></i>
              {{ loading ? 'Loading...' : 'No data available' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Main Log Viewer -->
      <div class="bg-[#0d1117] border border-[#1e2d3d] rounded-lg overflow-hidden">
        <!-- Tabs -->
        <div class="flex items-center border-b border-[#1e2d3d]">
          <button
            class="px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'events' ? 'border-[#58a6ff] text-[#58a6ff] bg-[#58a6ff]/5' : 'border-transparent text-[#5a6a7a] hover:text-[#c5cdd8]'"
            @click="switchTab('events')"
          >
            <i class="fa-solid fa-list"></i>
            Events
            <span class="px-1.5 py-0.5 text-[9px] bg-[#161b22] rounded-full">{{ totalCount }}</span>
          </button>
          <button
            class="px-4 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-2"
            :class="activeTab === 'errors' ? 'border-[#f85149] text-[#f85149] bg-[#f85149]/5' : 'border-transparent text-[#5a6a7a] hover:text-[#c5cdd8]'"
            @click="switchTab('errors')"
          >
            <i class="fa-solid fa-bug"></i>
            Errors
            <span class="px-1.5 py-0.5 text-[9px] bg-[#161b22] rounded-full">{{ totalCount }}</span>
          </button>
        </div>

        <!-- Filters Bar -->
        <div class="px-4 py-3 border-b border-[#1e2d3d] bg-[#0a0e17]/50">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Date Range -->
            <div class="flex items-center gap-1.5">
              <label class="text-[10px] text-[#5a6a7a] uppercase">From:</label>
              <input
                v-model="filters.from"
                type="datetime-local"
                class="bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c5cdd8] focus:border-[#58a6ff] focus:outline-none"
              >
            </div>
            <div class="flex items-center gap-1.5">
              <label class="text-[10px] text-[#5a6a7a] uppercase">To:</label>
              <input
                v-model="filters.to"
                type="datetime-local"
                class="bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c5cdd8] focus:border-[#58a6ff] focus:outline-none"
              >
            </div>

            <!-- Type/Category -->
            <select
              v-if="activeTab === 'events'"
              v-model="filters.eventType"
              class="bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c5cdd8] focus:border-[#58a6ff] focus:outline-none"
            >
              <option value="">All Types</option>
              <option v-for="(label, val) in EventTypeLabels" :key="val" :value="Number(val)">{{ label }}</option>
            </select>
            <select
              v-else
              v-model="filters.category"
              class="bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c5cdd8] focus:border-[#58a6ff] focus:outline-none"
            >
              <option value="">All Categories</option>
              <option v-for="(label, val) in ErrorCategoryLabels" :key="val" :value="Number(val)">{{ label }}</option>
            </select>

            <!-- Severity -->
            <select
              v-model="filters.minSeverity"
              class="bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c5cdd8] focus:border-[#58a6ff] focus:outline-none"
            >
              <option value="">All Severities</option>
              <option v-for="(label, val) in EventSeverityLabels" :key="val" :value="Number(val)">{{ label }}</option>
            </select>

            <!-- Search -->
            <div class="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <i class="fa-solid fa-magnifying-glass text-[#5a6a7a] text-xs"></i>
              <input
                v-model="filters.controller"
                type="text"
                placeholder="Search controller..."
                class="bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c5cdd8] focus:border-[#58a6ff] focus:outline-none w-full"
              >
            </div>

            <!-- Action Buttons -->
            <button
              class="px-3 py-1 text-xs bg-[#238636] text-white rounded hover:bg-[#2ea043] transition-colors flex items-center gap-1.5"
              :disabled="loading"
              @click="applyFilters()"
            >
              <i class="fa-solid fa-filter"></i>
              Apply
            </button>
            <button
              class="px-3 py-1 text-xs bg-[#161b22] border border-[#30363d] text-[#c5cdd8] rounded hover:bg-[#1c2333] transition-colors"
              @click="clearFilters()"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        <!-- Log Table -->
        <div class="overflow-x-auto">
          <div v-if="loading" class="flex items-center justify-center py-12 gap-3 text-[#5a6a7a]">
            <i class="fa-solid fa-spinner fa-spin text-lg"></i>
            <span class="text-xs">Loading entries...</span>
          </div>

          <table v-else class="w-full text-xs">
            <thead>
              <tr class="border-b border-[#1e2d3d] text-[#5a6a7a] uppercase text-[10px] tracking-wider">
                <th class="text-left px-4 py-2.5 font-medium">Timestamp</th>
                <th class="text-left px-4 py-2.5 font-medium">Level</th>
                <th class="text-left px-4 py-2.5 font-medium">Source</th>
                <th class="text-left px-4 py-2.5 font-medium">Message</th>
                <th v-if="activeTab === 'events'" class="text-left px-4 py-2.5 font-medium">Type</th>
                <th v-if="activeTab === 'errors'" class="text-left px-4 py-2.5 font-medium">Category</th>
                <th v-if="activeTab === 'errors'" class="text-center px-4 py-2.5 font-medium">Status</th>
                <th class="text-center px-4 py-2.5 font-medium w-16">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1e2d3d]/50">
              <tr v-if="rows.length === 0">
                <td :colspan="activeTab === 'events' ? 6 : 7" class="text-center py-12 text-[#5a6a7a]">
                  <i class="fa-solid fa-inbox text-2xl mb-2 block"></i>
                  No entries found
                </td>
              </tr>
              <tr
                v-for="(row, i) in rows"
                :key="i"
                class="hover:bg-[#161b22] transition-colors cursor-pointer"
                @click="openDetail(row)"
              >
                <td class="px-4 py-2.5 text-[#5a6a7a] whitespace-nowrap font-mono text-[11px]">
                  {{ formatDate(row) }}
                </td>
                <td class="px-4 py-2.5">
                  <span
                    class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded"
                    :class="getSeverityBadgeClass(row.severity)"
                  >
                    {{ getSeverityLabel(row.severity) }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-[#58a6ff] font-mono text-[11px] max-w-[120px] truncate" :title="row.controller">
                  {{ row.controller || 'system' }}
                </td>
                <td class="px-4 py-2.5 text-[#c5cdd8] max-w-[300px] truncate" :title="row.message || row.errorMessage || row.description">
                  {{ row.message || row.errorMessage || row.description || '-' }}
                </td>
                <td v-if="activeTab === 'events'" class="px-4 py-2.5">
                  <span class="px-1.5 py-0.5 text-[9px] bg-[#1f6feb]/20 text-[#58a6ff] rounded">
                    {{ getEventTypeLabel(row.eventType) }}
                  </span>
                </td>
                <td v-if="activeTab === 'errors'" class="px-4 py-2.5">
                  <span class="px-1.5 py-0.5 text-[9px] bg-[#d29922]/20 text-[#d29922] rounded">
                    {{ getErrorCategoryLabel(row.category) }}
                  </span>
                </td>
                <td v-if="activeTab === 'errors'" class="px-4 py-2.5 text-center">
                  <span
                    class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded"
                    :class="row.isHandled ? 'bg-[#28c840]/20 text-[#28c840]' : 'bg-[#f85149]/20 text-[#f85149]'"
                  >
                    {{ row.isHandled ? 'OK' : 'FAIL' }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-center">
                  <button
                    class="text-[#5a6a7a] hover:text-[#58a6ff] transition-colors"
                    @click.stop="openDetail(row)"
                  >
                    <i class="fa-solid fa-expand text-xs"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="totalCount > 0 && !loading" class="px-4 py-3 border-t border-[#1e2d3d] flex items-center justify-between">
          <span class="text-[10px] text-[#5a6a7a]">
            Showing {{ skip + 1 }}–{{ Math.min(skip + pageSize, totalCount) }} of {{ totalCount.toLocaleString('es-AR') }}
          </span>
          <div class="flex items-center gap-2">
            <select
              v-model.number="pageSize"
              class="bg-[#161b22] border border-[#30363d] rounded px-2 py-1 text-xs text-[#c5cdd8] focus:border-[#58a6ff] focus:outline-none"
              @change="applyFilters()"
            >
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
            <button
              class="px-2 py-1 text-xs bg-[#161b22] border border-[#30363d] text-[#c5cdd8] rounded hover:bg-[#1c2333] transition-colors disabled:opacity-30"
              :disabled="currentPage <= 1"
              @click="goToPage(currentPage - 1)"
            >
              <i class="fa-solid fa-chevron-left"></i>
            </button>
            <span class="text-xs text-[#5a6a7a]">{{ currentPage }} / {{ totalPages }}</span>
            <button
              class="px-2 py-1 text-xs bg-[#161b22] border border-[#30363d] text-[#c5cdd8] rounded hover:bg-[#1c2333] transition-colors disabled:opacity-30"
              :disabled="currentPage >= totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <teleport to="body">
      <transition name="fade">
        <div
          v-if="selectedRow"
          class="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          @click.self="closeDetail()"
        >
          <div class="bg-[#0d1117] border border-[#30363d] rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <!-- Modal Header -->
            <div class="px-4 py-3 border-b border-[#1e2d3d] flex items-center justify-between bg-[#161b22]">
              <h3 class="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
                <i class="fa-solid fa-circle-info text-[#58a6ff]"></i>
                Entry Details
              </h3>
              <button
                class="text-[#5a6a7a] hover:text-[#e6edf3] transition-colors"
                @click="closeDetail()"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <!-- Modal Body -->
            <div class="p-4 overflow-auto flex-1">
              <div class="space-y-3">
                <div v-for="(value, key) in flattenObject(selectedRow)" :key="key" class="flex gap-3">
                  <span class="text-[10px] text-[#5a6a7a] uppercase tracking-wider w-32 flex-shrink-0 pt-0.5">{{ key }}</span>
                  <span class="text-xs text-[#c5cdd8] font-mono break-all">{{ formatValue(value) }}</span>
                </div>
              </div>
            </div>
            <!-- Modal Footer -->
            <div class="px-4 py-3 border-t border-[#1e2d3d] bg-[#161b22] flex justify-end">
              <button
                class="px-3 py-1.5 text-xs bg-[#21262d] border border-[#30363d] text-[#c5cdd8] rounded hover:bg-[#30363d] transition-colors"
                @click="closeDetail()"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </transition>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from '@/composables/useToast'
import eventLogService, {
  EventTypeLabels,
  EventSeverityLabels,
  EventSeverityColors,
  ErrorCategoryLabels,
  EventSeverity
} from '@/services/EventLogServices'

const toast = useToast()

// ===== STATE =====
const activeTab = ref('events')
const loading = ref(false)
const loadingWarnings = ref(false)
const rows = ref([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(25)
const selectedRow = ref(null)
const latestWarnings = ref([])
const currentTime = ref('')

const stats = ref({
  totalEvents: 0,
  totalErrors: 0,
  totalWarnings: 0,
  totalCritical: 0,
  unhandledErrors: 0,
  handledRate: 0,
  bySeverity: {}
})

const eventTypeBreakdown = ref([])

const emptyFilters = () => ({
  from: '',
  to: '',
  eventType: '',
  category: '',
  minSeverity: '',
  userId: '',
  controller: '',
  actionCode: '',
  isHandled: ''
})

const filters = ref(emptyFilters())

// ===== COMPUTED =====
const skip = computed(() => (currentPage.value - 1) * pageSize.value)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize.value)))

// ===== TIME =====
const updateTime = () => {
  currentTime.value = new Date().toLocaleTimeString('es-AR', { hour12: false })
}

let timeInterval = null

// ===== HELPERS =====
const buildDateParam = (val) => {
  if (!val) return undefined
  return new Date(val)
}

const buildParams = () => {
  const p = {
    skip: skip.value,
    take: pageSize.value
  }
  if (filters.value.from) p.from = buildDateParam(filters.value.from)
  if (filters.value.to) p.to = buildDateParam(filters.value.to)
  if (filters.value.minSeverity !== '') p.minSeverity = filters.value.minSeverity
  if (filters.value.userId) p.userId = filters.value.userId
  if (filters.value.controller) p.controller = filters.value.controller
  return p
}

const severityPercent = (level) => {
  const total = stats.value.totalEvents || 1
  const count = stats.value.bySeverity?.[level] || 0
  return Math.round((count / total) * 100)
}

const getSeverityBadgeClass = (val) => {
  const map = {
    [EventSeverity.Debug]: 'bg-[#30363d] text-[#8b949e]',
    [EventSeverity.Info]: 'bg-[#1f6feb]/20 text-[#58a6ff]',
    [EventSeverity.Warning]: 'bg-[#d29922]/20 text-[#d29922]',
    [EventSeverity.Error]: 'bg-[#f85149]/20 text-[#f85149]',
    [EventSeverity.Critical]: 'bg-[#bc4c4c]/30 text-[#ff7b72]'
  }
  return map[val] ?? 'bg-[#30363d] text-[#8b949e]'
}

const getSeverityLabel = (val) => EventSeverityLabels[val] ?? val ?? '-'
const getEventTypeLabel = (val) => EventTypeLabels[val] ?? val ?? '-'
const getErrorCategoryLabel = (val) => ErrorCategoryLabels[val] ?? val ?? '-'

const formatTimeAgo = (row) => {
  const raw = row.timestamp ?? row.createdAt ?? row.date ?? row.occurredAt
  if (!raw) return '-'
  try {
    const date = new Date(raw)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  } catch {
    return '-'
  }
}

const formatDate = (row) => {
  const raw = row.timestamp ?? row.createdAt ?? row.date ?? row.occurredAt
  if (!raw) return '-'
  try {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(new Date(raw))
  } catch {
    return raw
  }
}

const flattenObject = (obj, prefix = '') => {
  const result = {}
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
      Object.assign(result, flattenObject(obj[key], fullKey))
    } else {
      result[fullKey] = obj[key]
    }
  }
  return result
}

const formatValue = (val) => {
  if (val === null || val === undefined) return 'null'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

// ===== DATA LOADING =====
const loadStats = async () => {
  try {
    const dashboard = await eventLogService.getDashboard()
    if (dashboard) {
      stats.value = {
        totalEvents: dashboard.totalEvents || 0,
        totalErrors: dashboard.totalErrors || 0,
        totalWarnings: dashboard.totalWarnings || 0,
        totalCritical: dashboard.totalCritical || 0,
        unhandledErrors: dashboard.unhandledErrors || 0,
        handledRate: dashboard.handledRate || 0,
        bySeverity: dashboard.bySeverity || {}
      }

      // Build event type breakdown
      if (dashboard.eventTypeBreakdown) {
        const colors = ['#58a6ff', '#d29922', '#f85149', '#28c840', '#bc4c4c', '#8b949e', '#a371f7', '#3fb950']
        const total = Object.values(dashboard.eventTypeBreakdown).reduce((a, b) => a + b, 0) || 1
        eventTypeBreakdown.value = Object.entries(dashboard.eventTypeBreakdown).map(([key, count], idx) => ({
          label: EventTypeLabels[key] || `Type ${key}`,
          count,
          percent: Math.round((count / total) * 100),
          color: colors[idx % colors.length]
        }))
      }
    }
  } catch (err) {
    console.warn('Error loading stats:', err)
  }
}

const loadLatestWarnings = async () => {
  loadingWarnings.value = true
  try {
    const res = await eventLogService.getErrors({
      take: 10,
      minSeverity: EventSeverity.Warning
    })
    latestWarnings.value = res.data ?? res ?? []
  } catch (err) {
    console.warn('Error loading warnings:', err)
  } finally {
    loadingWarnings.value = false
  }
}

const loadData = async () => {
  loading.value = true
  try {
    if (activeTab.value === 'events') {
      const params = buildParams()
      if (filters.value.eventType !== '') params.eventType = filters.value.eventType
      if (filters.value.actionCode) params.actionCode = filters.value.actionCode
      const res = await eventLogService.getEvents(params)
      rows.value = res.data ?? res
      totalCount.value = res.total ?? rows.value.length
    } else {
      const params = buildParams()
      if (filters.value.category !== '') params.category = filters.value.category
      if (filters.value.isHandled !== '') params.isHandled = filters.value.isHandled
      const res = await eventLogService.getErrors(params)
      rows.value = res.data ?? res
      totalCount.value = res.total ?? rows.value.length
    }
  } catch (err) {
    toast.error('Error al cargar los registros')
    rows.value = []
    totalCount.value = 0
  } finally {
    loading.value = false
  }
}

const loadAllData = async () => {
  await Promise.all([loadStats(), loadLatestWarnings(), loadData()])
}

// ===== ACTIONS =====
const applyFilters = () => {
  currentPage.value = 1
  loadData()
}

const clearFilters = () => {
  filters.value = emptyFilters()
  currentPage.value = 1
  loadData()
}

const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  filters.value = emptyFilters()
  currentPage.value = 1
  rows.value = []
  totalCount.value = 0
  loadData()
}

const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadData()
}

// ===== DETAIL MODAL =====
const openDetail = (row) => { selectedRow.value = row }
const closeDetail = () => { selectedRow.value = null }

// ===== LIFECYCLE =====
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  loadAllData()
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0d1117;
}
::-webkit-scrollbar-thumb {
  background: #30363d;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #484f58;
}
</style>