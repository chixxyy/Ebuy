<script setup>
import { ref, computed } from "vue";
import {
  ShoppingBag,
  ArrowRight,
  Star,
  Shield,
  Truck,
  Phone,
  Clock,
} from "lucide-vue-next";
// import { useIntlayer } from 'vue-intlayer' // Removed
// import dictionary from '../manual-dictionary.json' // Removed
import { useContent } from "../composables/useContent";
import ProductCard from "../components/ProductCard.vue";
import { useProductStore } from "../stores/products";
import { storeToRefs } from "pinia";

const { home, items } = useContent();
const productStore = useProductStore();
const { products: storeProducts } = storeToRefs(productStore);

const featuredProducts = computed(() => storeProducts.value.slice(0, 4));
</script>

<template>
  <main class="overflow-hidden">
    <!-- Hero Section -->
    <div
      class="relative bg-white pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden"
    >
      <!-- Decoratives -->
      <div
        class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"
      ></div>
      <div
        class="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-sky-50 rounded-full blur-3xl opacity-50 z-0 pointer-events-none"
      ></div>

      <div
        class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col md:flex-row items-center gap-12"
      >
        <!-- Text Content -->
        <div class="flex-1 text-center md:text-left">
          <div
            class="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full font-semibold text-sm mb-6"
          >
            <span class="relative flex h-2 w-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"
              ></span>
              <span
                class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"
              ></span>
            </span>
            {{ home.new_collection }}
          </div>
          <h1
            class="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6"
          >
            {{ home.hero_title }} <br />
            <span
              class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600"
              >{{ home.hero_subtitle }}</span
            >
          </h1>
          <p
            class="text-lg md:text-xl text-gray-600 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed"
          >
            {{ home.hero_desc }}
          </p>
          <div
            class="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
          >
            <router-link
              to="/products"
              class="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
            >
              {{ home.shop_now }}
              <ArrowRight
                class="w-5 h-5 group-hover:translate-x-1 transition-transform"
              />
            </router-link>
            <button
              class="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              {{ home.learn_more }}
            </button>
          </div>
        </div>

        <!-- Hero Image/Graphic -->
        <div class="flex-1 w-full max-w-[500px] md:max-w-none relative">
          <div
            class="aspect-square rounded-3xl overflow-hidden shadow-2xl ring-1 ring-gray-100 rotate-2 hover:rotate-0 transition-transform duration-700"
          >
            <img
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1000&q=80"
              alt="Hero Product"
              class="w-full h-full object-cover"
            />
          </div>
          <!-- Floating Badge -->
          <div
            class="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-gray-50 flex items-center gap-4 bounce-slow"
          >
            <div class="bg-green-100 p-2 rounded-lg">
              <Star class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p class="text-xs text-gray-500 font-semibold uppercase">
                {{ home.top_rated }}
              </p>
              <p class="text-gray-900 font-bold">{{ home.quality_5_star }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="bg-white py-12 border-y border-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div
            class="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div class="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Truck class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">
                {{ home.features.shipping }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ home.features.shipping_desc }}
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div class="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Shield class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">
                {{ home.features.secure }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ home.features.secure_desc }}
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div class="bg-indigo-100 p-3 rounded-xl text-indigo-600">
              <Clock class="w-6 h-6" />
            </div>
            <div>
              <h3 class="font-bold text-gray-900">
                {{ home.features.support }}
              </h3>
              <p class="text-sm text-gray-500">
                {{ home.features.support_desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Featured Products -->
    <div class="bg-gray-50 py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-end mb-12">
          <div>
            <h2 class="text-3xl font-extrabold text-gray-900 mb-2">
              {{ home.featured_title }}
            </h2>
            <p class="text-gray-500">{{ home.featured_desc }}</p>
          </div>
          <router-link
            to="/products"
            class="hidden md:flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors gap-1"
          >
            {{ home.view_all }} <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <ProductCard
            v-for="product in featuredProducts"
            :key="product.id"
            :product="product"
          />
        </div>

        <div class="mt-12 text-center md:hidden">
          <router-link
            to="/products"
            class="inline-flex items-center text-indigo-600 font-bold hover:text-indigo-700 transition-colors gap-1"
          >
            {{ home.view_all }} <ArrowRight class="w-4 h-4" />
          </router-link>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.bounce-slow {
  animation: bounce 3s infinite;
}
@keyframes bounce {
  0%,
  100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>
