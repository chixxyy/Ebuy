<script setup>
import { useProductStore } from "../stores/products";
import ProductCard from "../components/ProductCard.vue";
import ProductSkeleton from "../components/ProductSkeleton.vue";
import { Search, Filter, SlidersHorizontal, ChevronDown } from "lucide-vue-next";
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

// import { useIntlayer } from 'vue-intlayer' // Removed
// import dictionary from '../manual-dictionary.json' // Removed
import { useContent, normalizeCategory } from "../composables/useContent";

const productStore = useProductStore();
const { products: storeProducts, isLoading } = storeToRefs(productStore);
const { products, add_product } = useContent();

const searchQuery = ref("");
const selectedCategory = ref("All");
const showCategoryDropdown = ref(false);

const categories = computed(() => {
  const cats = new Set(storeProducts.value.map((p) => normalizeCategory(p.category)));
  return ["All", ...Array.from(cats)];
});

const filteredProducts = computed(() => {
  return storeProducts.value.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === "All" || normalizeCategory(p.category) === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

const selectCategory = (category) => {
  selectedCategory.value = category;
  showCategoryDropdown.value = false;
};
</script>

<template>
  <div class="bg-gray-50 min-h-screen pt-24 pb-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header & Controls -->
      <div
        class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div>
          <h2 class="text-3xl font-extrabold text-gray-900 tracking-tight">
            {{ products.title }}
          </h2>
          <p class="mt-2 text-gray-500">{{ products.subtitle }}</p>
        </div>

        <div class="flex gap-3">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
            />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="products.search"
              class="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none w-full md:w-64 transition-all"
            />
          </div>
          <div class="relative">
            <button
              @click="showCategoryDropdown = !showCategoryDropdown"
              class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors"
            >
              <Filter class="w-5 h-5" />
              <span class="hidden sm:inline">{{ selectedCategory === 'All' ? products.filters : (add_product.categories?.[selectedCategory] || selectedCategory) }}</span>
              <ChevronDown class="w-4 h-4 ml-1" />
            </button>
            <div
              v-if="showCategoryDropdown"
              class="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
            >
              <button
                v-for="category in categories"
                :key="category"
                @click="selectCategory(category)"
                class="w-full text-left px-4 py-2 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                :class="{ 'text-indigo-600 bg-indigo-50 font-medium': selectedCategory === category }"
              >
                {{ category === 'All' ? products.filters : (add_product.categories?.[category] || category) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid -->
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
      >
        <!-- Skeleton Loading -->
        <template v-if="isLoading">
          <ProductSkeleton v-for="n in 8" :key="n" />
        </template>

        <!-- Actual Products -->
        <template v-else>
          <div v-if="filteredProducts.length === 0" class="col-span-full py-20 text-center text-gray-500">
            {{ products.empty_search }}
          </div>
          <ProductCard
            v-else
            v-for="product in filteredProducts"
            :key="product.id"
            :product="product"
          />
        </template>
      </div>
    </div>
  </div>
</template>
