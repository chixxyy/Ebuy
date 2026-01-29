<script setup>
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { useRouter } from 'vue-router'
import { ShoppingCart, User, LogOut, Menu, Globe, PlusCircle } from 'lucide-vue-next'
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const { locale } = useI18n()
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleLanguage = () => {
  const newLocale = locale.value === 'zh-TW' ? 'en' : 'zh-TW'
  locale.value = newLocale
  localStorage.setItem('locale', newLocale)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav 
    class="fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b"
    :class="[
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md border-gray-200 shadow-sm py-2' 
        : 'bg-transparent border-transparent py-4'
    ]"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <router-link to="/" class="flex-shrink-0 flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg ring-2 ring-indigo-200 group-hover:ring-indigo-400 transition-all">E</div>
          <span class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">E-Buy</span>
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link to="/products" class="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors">{{ $t('nav.products') }}</router-link>
          
          <div class="h-4 w-px bg-gray-300"></div>

          <div class="flex items-center space-x-4">
            <!-- Language Switcher -->
            <button 
              @click="toggleLanguage" 
              class="flex items-center gap-1 p-2 text-gray-600 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100/50"
              :title="locale === 'zh-TW' ? 'Switch to English' : '切換至繁體中文'"
            >
              <Globe class="w-5 h-5" />
              <span class="text-sm font-medium w-6 text-center">{{ locale === 'zh-TW' ? 'EN' : '繁' }}</span>
            </button>

            <template v-if="authStore.user">
               <router-link to="/add-product" class="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-1.5 transition-colors">
                  <PlusCircle class="w-4 h-4" />
                  <span class="hidden lg:inline">{{ $t('nav.add_product') }}</span>
               </router-link>

               <router-link :to="`/user/${authStore.user.id}`" class="flex items-center gap-2 text-sm font-medium text-gray-700 px-3 py-1.5 rounded-full bg-gray-100/50 hover:bg-gray-100 transition-colors">
                  <User class="w-4 h-4 text-indigo-600" />
                  {{ authStore.user.name }}
               </router-link>
               <button @click="logout" class="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                 <LogOut class="w-5 h-5" />
               </button>
            </template>
            <template v-else>
              <router-link to="/login" class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">{{ $t('nav.login') }}</router-link>
              <router-link to="/register" class="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all">
                {{ $t('nav.signup') }}
              </router-link>
            </template>
            
            <router-link to="/cart" class="relative p-2 text-gray-600 hover:text-indigo-600 transition-colors">
              <ShoppingCart class="w-6 h-6" />
              <!-- Badge -->
              <span v-if="cartStore.totalItems > 0" class="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-white">{{ cartStore.totalItems }}</span>
            </router-link>
          </div>
        </div>
        
         <!-- Mobile menu button -->
        <div class="flex items-center gap-4 md:hidden">
          <button 
                @click="toggleLanguage" 
                class="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
              >
            <Globe class="h-6 w-6" />
          </button>
          <button class="p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100">
            <Menu class="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
