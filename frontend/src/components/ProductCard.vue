<script setup>
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { useProductStore } from "../stores/products";
import { ShoppingCart, Pencil, Trash2 } from "lucide-vue-next";

// import dictionary from '../manual-dictionary.json' // Removed
import { useContent } from "../composables/useContent";
import { computed, ref, watch } from "vue";
import { showConfirm, showToast } from "../utils/swal";

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const cartStore = useCartStore();
const authStore = useAuthStore();
const productStore = useProductStore();
const { products, home, items, alert } = useContent();

const addToCart = () => {
  cartStore.addItem(props.product);
};

const handleDelete = async () => {
  const result = await showConfirm(
    alert.warning,
    alert.delete_confirm,
    alert.yes,
    alert.no,
  );

  if (result.isConfirmed) {
    await productStore.deleteProduct(props.product.id);
    showToast(alert.delete_success);
  }
};

const displayName = computed(() => {
  return items.value[String(props.product.id)]?.name || props.product.name;
});

const displayDescription = computed(() => {
  return (
    items.value[String(props.product.id)]?.description ||
    props.product.description
  );
});

const displayCategory = computed(() => {
  return (
    items.value[String(props.product.id)]?.category || props.product.category
  );
});

const canModifyProduct = computed(() => {
  return (
    authStore.user &&
    props.product.seller &&
    authStore.user.id === props.product.seller.id
  );
});

const isStockAnimating = ref(false);

// Watch for stock changes to trigger animation
watch(
  () => props.product.stock,
  (newVal, oldVal) => {
    if (oldVal !== undefined && newVal !== oldVal) {
      isStockAnimating.value = true;
      setTimeout(() => {
        isStockAnimating.value = false;
      }, 1000);
    }
  },
);
</script>

<template>
  <div
    class="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full"
  >
    <!-- Image Container -->
    <router-link
      :to="`/products/${product.id}`"
      class="relative aspect-square overflow-hidden bg-gray-50 block cursor-pointer"
    >
      <img
        :src="product.image"
        :alt="displayName"
        class="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      <!-- Quick Action Overlay -->
      <div
        class="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0"
      >
        <button
          @click.stop="addToCart"
          class="w-full bg-indigo-600/90 backdrop-blur-sm text-white py-3 rounded-xl font-medium shadow-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <ShoppingCart class="w-5 h-5" />
          {{ products.add_to_cart }}
        </button>
      </div>
      <!-- Edit/Delete Actions (Only for logged in users) -->
      <div v-if="canModifyProduct" class="absolute top-3 right-3 flex gap-2">
        <button
          @click.stop="$router.push(`/edit-product/${product.id}`)"
          class="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-gray-600 hover:text-indigo-600 hover:bg-white transition-all"
          :title="products.edit"
        >
          <Pencil class="w-4 h-4" />
        </button>
        <button
          @click.stop="handleDelete"
          class="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-gray-600 hover:text-red-600 hover:bg-white transition-all"
          :title="products.delete"
        >
          <Trash2 class="w-4 h-4" />
        </button>
      </div>

      <!-- Badge (Example) -->
      <div
        v-if="product.rating > 4.5"
        class="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-indigo-600 shadow-sm"
      >
        {{ home.top_rated }}
      </div>
    </router-link>

    <div class="p-5 flex flex-col flex-grow">
      <div class="flex justify-between items-center mb-1">
        <div
          class="text-xs font-medium text-indigo-500 uppercase tracking-wider"
        >
          {{ displayCategory }}
        </div>
        <router-link
          v-if="product.seller"
          :to="{ name: 'user-profile', params: { id: product.seller.id } }"
          class="text-xs text-gray-400 hover:text-indigo-600 truncate max-w-[50%]"
        >
          {{ products.by }} {{ product.seller.name }}
        </router-link>
      </div>
      <h3
        class="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors"
      >
        <router-link :to="`/products/${product.id}`">{{
          displayName
        }}</router-link>
      </h3>
      <p
        class="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow"
      >
        {{ displayDescription }}
      </p>

      <div
        class="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto"
      >
        <div class="flex flex-col">
          <span class="text-xs text-gray-400 font-medium">{{
            products.price
          }}</span>
          <span class="text-xl font-bold text-gray-900"
            >${{ product.price }}</span
          >
        </div>
        <div class="flex flex-col items-end gap-1">
          <div class="text-sm text-gray-500 flex items-center gap-1">
            <span class="text-yellow-400">★</span>
            {{ product.rating }}
          </div>
          <div
            v-if="product.stock !== undefined"
            class="text-xs font-semibold transition-colors duration-300"
            :class="{
              'text-red-500 animate-pulse-fast': isStockAnimating,
              'text-gray-400': !isStockAnimating,
            }"
          >
            {{ products.stock }}: {{ product.stock }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse-fast {
  animation: pulse-red 0.5s ease-in-out;
}
@keyframes pulse-red {
  0%,
  100% {
    color: #f87171;
    transform: scale(1);
  }
  50% {
    color: #dc2626;
    transform: scale(1.1);
  }
}
</style>
