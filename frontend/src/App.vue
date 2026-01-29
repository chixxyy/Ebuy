<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="font-sans antialiased text-gray-900 bg-white min-h-screen flex flex-col">
    <NavBar />
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- Simple Footer -->
    <footer class="bg-gray-50 border-t border-gray-100 py-12 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="flex items-center gap-2">
           <div class="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">E</div>
           <span class="font-bold text-gray-900">E-Buy</span>
        </div>
        <div class="text-sm text-gray-500">
          &copy; 2026 E-Buy. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
