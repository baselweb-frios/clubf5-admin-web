<template>
  <div class="min-h-screen bg-dark-primary relative overflow-hidden">
    <!-- Background Effects -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <!-- Gradient Orbs -->
      <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl" />
      <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-purple/20 rounded-full blur-3xl" />
      <!-- Grid Pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
    </div>

    <!-- Content -->
    <div class="relative z-10 min-h-screen flex items-center justify-center p-4">
      <router-view />
    </div>
  </div>
</template>

<script setup>
// Simple layout for login and authentication pages
</script>

<style scoped>
/* No custom styles needed */
</style>
