<template>
  <base-card title="Footer" subtitle="Configuracion del pie de pagina">
    <template #actions>
      <base-button
        variant="ghost"
        size="sm"
        @click="resetSection"
      >
        <i class="fas fa-undo mr-2" />
        Restaurar
      </base-button>
    </template>

    <div class="space-y-4">
      <base-input
        v-model="localData.copyrightText"
        label="Texto de Copyright"
        placeholder="Ej: ClubF5. Todos los derechos reservados."
        hint="El ano actual se agrega automaticamente"
        @input="emitUpdate"
      />

      <div class="preview-box">
        <span class="preview-label">Vista previa:</span>
        <p class="preview-text">
          &copy; {{ currentYear }} {{ localData.copyrightText }}
        </p>
      </div>
    </div>
  </base-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  },
  defaultData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const localData = ref({ ...props.modelValue })

const currentYear = computed(() => new Date().getFullYear())

watch(() => props.modelValue, (newVal) => {
  localData.value = { ...newVal }
}, { deep: true })

const emitUpdate = () => {
  emit('update:modelValue', { ...localData.value })
}

const resetSection = () => {
  if (props.defaultData) {
    localData.value = { ...props.defaultData }
    emitUpdate()
  }
}
</script>

<style scoped>
.preview-box {
  @apply p-4 rounded-lg bg-dark-secondary border border-dark-border;
}

.preview-label {
  @apply text-xs text-text-tertiary block mb-2;
}

.preview-text {
  @apply text-text-secondary text-center;
}
</style>
