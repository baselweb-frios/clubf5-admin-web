<template>
  <div
    class="rounded-xl border transition-all duration-300 overflow-hidden group"
    :class="configured
      ? 'border-dark-border bg-dark-secondary/30 hover:border-primary-500/30 hover:bg-dark-secondary/50 cursor-pointer'
      : 'border-dark-border bg-dark-secondary/30'"
    @click="configured && $emit('configure')"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 border-b border-dark-border/50">
      <div class="flex items-center gap-3">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
          :class="configured ? 'bg-success-500/15 group-hover:bg-success-500/25' : 'bg-dark-tertiary'"
        >
          <i :class="[icon, configured ? 'text-success-400' : 'text-text-tertiary']" />
        </div>
        <div>
          <h3 class="text-sm font-semibold text-text-primary">{{ title }}</h3>
          <p v-if="!configured" class="text-xs text-text-tertiary mt-0.5">{{ emptyText }}</p>
          <p v-else class="text-xs text-success-400/70 mt-0.5">Configurado</p>
        </div>
      </div>
      <button
        class="flex items-center gap-1.5 text-xs font-medium transition-all px-3 py-1.5 rounded-lg flex-shrink-0"
        :class="configured
          ? 'text-primary-400 bg-primary-500/10 hover:bg-primary-500/25 hover:text-primary-300 border border-primary-500/20 group-hover:border-primary-500/40'
          : 'text-primary-400 hover:text-primary-300 bg-primary-500/10 hover:bg-primary-500/20'"
        @click.stop="$emit('configure')"
      >
        <i :class="configured ? 'fas fa-pen' : 'fas fa-plus'" class="text-[10px]" />
        {{ configured ? 'Editar' : 'Configurar' }}
      </button>
    </div>

    <!-- Body -->
    <div class="px-5 py-4 relative">
      <slot>
        <div v-if="!configured" class="flex flex-col items-center justify-center py-3 text-center">
          <i :class="[icon, 'text-2xl text-text-tertiary/40 mb-2']" />
          <p class="text-sm text-text-tertiary">{{ emptyText }}</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  configured: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No configurado' }
})

defineEmits(['configure'])
</script>