<template>
  <div class="base-card group" :class="cardClasses">
    <!-- Card Header -->
    <div v-if="$slots.header || title || subtitle" class="card-header">
      <div class="card-header-content">
        <div class="card-header-text">
          <slot name="header">
            <h3 v-if="title" class="card-title">{{ title }}</h3>
            <p v-if="subtitle" class="card-subtitle">{{ subtitle }}</p>
          </slot>
        </div>
        <div v-if="$slots.actions" class="card-header-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="card-body" :class="bodyClasses">
      <slot></slot>
    </div>

    <!-- Card Footer -->
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>

    <!-- Glass Shine Effect -->
    <div v-if="glass" class="card-shine"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  noPadding: {
    type: Boolean,
    default: false
  },
  hover: {
    type: Boolean,
    default: true
  },
  shadow: {
    type: String,
    default: 'lg',
    validator: (value) => ['none', 'sm', 'md', 'lg', 'xl', '2xl'].includes(value)
  },
  glass: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: true
  }
})

const cardClasses = computed(() => {
  return [
    `card-shadow-${props.shadow}`,
    {
      'card-hover': props.hover,
      'card-glass': props.glass,
      'card-bordered': props.bordered
    }
  ]
})

const bodyClasses = computed(() => {
  return {
    'no-padding': props.noPadding
  }
})
</script>

<style scoped>
/* ===== BASE CARD - DARKLITE DESIGN SYSTEM ===== */
.base-card {
  position: relative;
  background: rgba(26, 26, 26, 0.7);
  border-radius: 1.25rem;
  overflow: hidden;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glass Effect */
.card-glass {
  background: rgba(26, 26, 26, 0.6);
  backdrop-filter: blur(40px) saturate(180%);
}

/* Border */
.card-bordered {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Glass Shine Effect */
.card-shine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.15) 50%,
    transparent 100%
  );
  opacity: 0.8;
}

/* Hover State */
.card-hover:hover {
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-4px);
}

.card-hover:hover.card-glass {
  background: rgba(26, 26, 26, 0.75);
}

/* ===== SHADOW VARIANTS ===== */
.card-shadow-none {
  box-shadow: none;
}

.card-shadow-sm {
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.08);
}

.card-shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1);
}

.card-shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.12);
}

.card-shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.15);
}

.card-shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
}

.card-hover:hover.card-shadow-lg,
.card-hover:hover.card-shadow-xl,
.card-hover:hover.card-shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
}

/* ===== CARD HEADER ===== */
.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
}

.card-header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.card-header-text {
  flex: 1;
}

.card-title {
  margin: 0;
  font-size: 1.3125rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.card-subtitle {
  margin: 0.375rem 0 0 0;
  font-size: 0.9375rem;
  font-weight: 400;
  color: #a1a1aa;
  letter-spacing: -0.01em;
  line-height: 1.5;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* ===== CARD BODY ===== */
.card-body {
  padding: 2rem;
  color: #ffffff;
  line-height: 1.7;
}

.card-body.no-padding {
  padding: 0;
}

/* ===== CARD FOOTER ===== */
.card-footer {
  padding: 1.25rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
  .base-card {
    border-radius: 1rem;
  }

  .card-header {
    padding: 1.25rem 1.5rem;
  }

  .card-header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .card-title {
    font-size: 1.125rem;
  }

  .card-subtitle {
    font-size: 0.875rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .card-body.no-padding {
    padding: 0;
  }

  .card-footer {
    padding: 1rem 1.5rem;
    flex-direction: column;
    align-items: stretch;
  }
}

/* ===== ANIMATION IMPROVEMENTS ===== */
@media (prefers-reduced-motion: reduce) {
  .base-card {
    transition: none;
  }

  .card-hover:hover {
    transform: none;
  }
}
</style>
