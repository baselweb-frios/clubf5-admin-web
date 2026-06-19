<template>
  <div
id="app"
class="min-h-screen bg-gray-50"
>
    <router-view v-slot="{ Component, route }">
      <transition
name="fade"
mode="out-in"
>
        <component
:is="Component"
:key="route.path"
/>
      </transition>
    </router-view>
    <TourDevEditor />
    <UpdateNotification />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import TourDevEditor from '@/components/TourDevEditor.vue'
import UpdateNotification from '@/components/UpdateNotification.vue'

const authStore = useAuthStore()

onMounted(() => {
  // Load user from localStorage on app mount
  authStore.loadUserFromStorage()
})
</script>
