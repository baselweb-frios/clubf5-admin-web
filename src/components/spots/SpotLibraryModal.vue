<template>
  <Modal
    :model-value="modelValue"
    size="full"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <i class="fa fa-music text-primary-400" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-text-primary">
            Biblioteca de Spots
          </h3>
          <p class="text-sm text-text-secondary">
            Gestiona tus spots publicitarios
          </p>
        </div>
      </div>
    </template>

    <template #default>
      <SpotTable
        :spots="spots"
        :selected-spots="selectedSpots"
        @create="$emit('create')"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @selection-change="$emit('selection-change', $event)"
      />
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <button
          class="btn btn-secondary"
          @click="$emit('update:modelValue', false)"
        >
          Cerrar
        </button>

        <div class="flex gap-2">
          <button
            class="btn btn-primary"
            @click="$emit('create')"
          >
            <i class="fa fa-plus mr-2" />
            Crear Nuevo Spot
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup>
import Modal from '@/components/ui/Modal.vue'
import SpotTable from '@/pages/Spots/SpotTable.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  spots: {
    type: Array,
    default: () => []
  },
  selectedSpots: {
    type: Array,
    default: () => []
  }
})

defineEmits(['update:modelValue', 'create', 'edit', 'delete', 'selection-change'])
</script>
