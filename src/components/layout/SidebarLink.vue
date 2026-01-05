<template>
  <router-link
    :to="to"
    class="sidebar-link"
    :class="{ 'active': active }"
  >
    <i v-if="icon" class="icon" :class="iconClass"></i>
    <span class="label"><slot></slot></span>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: {
    type: [String, Object],
    required: true
  },
  icon: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  }
})

const iconClass = computed(() => {
  const icons = {
    'chart-pie-36': 'fas fa-chart-pie',
    'building': 'fas fa-building',
    'music': 'fas fa-music',
    'bullhorn': 'fas fa-bullhorn',
    'users': 'fas fa-users',
    'cog': 'fas fa-cog',
    'document': 'fas fa-file-alt',
    'microphone': 'fas fa-microphone',
    'play': 'fas fa-play-circle',
    'calendar': 'fas fa-calendar-alt'
  }
  return icons[props.icon] || 'fas fa-bars'
})
</script>

<style scoped>
/* ===== PREMIUM APPLE-STYLE SIDEBAR LINK ===== */
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.125rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 1rem;
  font-size: 0.9375rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  margin-bottom: 0.375rem;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

/* Gradient background overlay on hover */
.sidebar-link::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 0;
}

/* Animated accent bar on the left */
.sidebar-link::after {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 0 3px 3px 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0);
  z-index: 2;
}

/* Hover State */
.sidebar-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
  transform: translateX(6px);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

.sidebar-link:hover::before {
  opacity: 1;
}

.sidebar-link:hover::after {
  height: 70%;
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

.sidebar-link:hover .icon {
  transform: scale(1.15) translateY(-1px);
  color: #60a5fa;
  filter: drop-shadow(0 2px 6px rgba(59, 130, 246, 0.4));
}

/* Active State - Premium Glow */
.sidebar-link.active {
  background: rgba(59, 130, 246, 0.12);
  backdrop-filter: blur(20px) saturate(180%);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 
    0 8px 16px -4px rgba(59, 130, 246, 0.25),
    0 4px 12px rgba(59, 130, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 24px rgba(59, 130, 246, 0.15);
  transform: translateX(8px);
}

.sidebar-link.active::before {
  opacity: 1;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%);
}

.sidebar-link.active::after {
  height: 80%;
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%);
  box-shadow: 
    0 0 20px rgba(59, 130, 246, 0.6),
    0 0 40px rgba(59, 130, 246, 0.3);
  animation: pulse-glow 2s ease-in-out infinite;
}

.sidebar-link.active .icon {
  color: #60a5fa;
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
  animation: float-subtle 3s ease-in-out infinite;
}

.sidebar-link.active .label {
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* Icon Styling */
.icon {
  font-size: 1.25rem;
  width: 1.375rem;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Label Styling */
.label {
  flex: 1;
  position: relative;
  z-index: 1;
  letter-spacing: -0.01em;
  transition: all 0.3s ease;
}

/* Premium Animations */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(59, 130, 246, 0.6),
      0 0 40px rgba(59, 130, 246, 0.3);
  }
  50% {
    box-shadow: 
      0 0 30px rgba(59, 130, 246, 0.8),
      0 0 60px rgba(59, 130, 246, 0.4);
  }
}

@keyframes float-subtle {
  0%, 100% {
    transform: scale(1.1) translateY(0);
  }
  50% {
    transform: scale(1.1) translateY(-2px);
  }
}

/* Touch devices - reduce transforms */
@media (hover: none) {
  .sidebar-link:hover {
    transform: translateX(4px);
  }
  
  .sidebar-link.active {
    transform: translateX(6px);
  }
}
</style>
