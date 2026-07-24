<template>
  <Modal
    :model-value="modelValue"
    size="full"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <i class="fa fa-calendar-plus-o text-primary-400" />
        </div>
        <div>
          <h3 class="text-xl font-bold text-text-primary">
            Programar Salidas
          </h3>
          <p class="text-sm text-text-secondary">
            Programa manualmente o de forma inteligente tus spots
          </p>
        </div>
      </div>
    </template>

    <template #default>
      <ProgrammingInterface
        :spots="spots"
        :programaciones="programaciones"
        :reproductores="reproductores"
        :codigo-programacion="codigoProgramacion"
        :initial-reproductor="initialReproductor"
        :initial-start-time="initialStartTime"
        :initial-end-time="initialEndTime"
        :initial-selected-days="initialSelectedDays"
        :initial-spot-code="initialSpotCode"
        v-bind="$attrs"
        @delete-programaciones="$emit('delete-programaciones', $event)"
        @refresh-programaciones="$emit('refresh-programaciones')"
        @filter-change="$emit('filter-change', $event)"
      />
    </template>

    <template #footer>
      <button
        class="btn btn-secondary"
        @click="$emit('update:modelValue', false)"
      >
        Cerrar
      </button>
    </template>
  </Modal>
</template>

<script setup>
import Modal from '@/components/ui/Modal.vue'
import ProgrammingInterface from '@/pages/Spots/ProgrammingInterface.vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  spots: {
    type: Array,
    default: () => []
  },
  programaciones: {
    type: Array,
    default: () => []
  },
  reproductores: {
    type: Array,
    default: () => []
  },
  codigoProgramacion: {
    type: [String, Number],
    default: null
  },
  initialReproductor: {
    type: String,
    default: ''
  },
  initialStartTime: {
    type: String,
    default: ''
  },
  initialEndTime: {
    type: String,
    default: ''
  },
  initialSelectedDays: {
    type: Array,
    default: () => []
  },
  initialSpotCode: {
    type: Number,
    default: null
  }
})

defineEmits(['update:modelValue', 'delete-programaciones', 'refresh-programaciones', 'filter-change'])
</script>
