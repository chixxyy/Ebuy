<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useCartStore } from "../stores/cart";
import { useAuthStore } from "../stores/auth";
import { useProductStore } from "../stores/products";
import {
  ShoppingCart,
  Star,
  MessageSquare,
  Send,
  User,
  Edit2,
  Trash2,
} from "lucide-vue-next";
import { showConfirm, showToast } from "../utils/swal";
import { useContent } from "../composables/useContent";

const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const productStore = useProductStore();
const { products, alert, profile } = useContent();

const product = ref(null);
const loading = ref(true);
const newComment = ref("");

const fetchProduct = async () => {
  loading.value = true;
  try {
    const response = await fetch(
      `http://localhost:3000/api/products/${route.params.id}`,
    );
    if (response.ok) {
      product.value = await response.json();
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const addToCart = () => {
  if (product.value) {
    cartStore.addItem(product.value);
  }
};

const submitComment = async () => {
  if (!newComment.value.trim()) return;

  const success = await productStore.addComment(
    product.value.id,
    newComment.value,
  );
  if (success) {
    newComment.value = "";
    await fetchProduct(); // Refresh comments
  }
};

const editingCommentId = ref(null);
const editContent = ref("");

const startEditComment = (comment) => {
  editingCommentId.value = comment.id;
  editContent.value = comment.content;
};

const cancelEditComment = () => {
  editingCommentId.value = null;
  editContent.value = "";
};

const saveComment = async (commentId) => {
  if (!editContent.value.trim()) return;

  if (await productStore.updateComment(commentId, editContent.value)) {
    cancelEditComment();
    await fetchProduct();
  }
};

const deleteComment = async (commentId) => {
  const result = await showConfirm(
    alert.value.warning,
    alert.value.delete_confirm,
    alert.value.yes,
    alert.value.no,
  );

  if (result.isConfirmed) {
    if (await productStore.deleteComment(commentId)) {
      showToast(alert.value.delete_success);
      await fetchProduct();
    }
  }
};

onMounted(() => {
  fetchProduct();
});

// Image Zoom Logic
const zoomStyle = ref({
  transformOrigin: "center center",
  transform: "scale(1)",
});

const handleMouseMove = (e) => {
  const { left, top, width, height } = e.target.getBoundingClientRect();
  const x = ((e.clientX - left) / width) * 100;
  const y = ((e.clientY - top) / height) * 100;
  
  zoomStyle.value = {
    transformOrigin: `${x}% ${y}%`,
    transform: "scale(2)",
  };
};

const handleMouseLeave = () => {
  zoomStyle.value = {
    transformOrigin: "center center",
    transform: "scale(1)",
  };
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-12">
    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
      ></div>
    </div>

    <div v-else-if="product" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Product Image -->
        <div
          class="bg-white rounded-2xl p-8 shadow-sm flex items-center justify-center overflow-hidden cursor-zoom-in relative"
        >
          <img
            :src="product.image"
            :alt="product.name"
            class="max-h-[500px] object-contain transition-transform duration-200 ease-out origin-center"
            :style="zoomStyle"
            @mousemove="handleMouseMove"
            @mouseleave="handleMouseLeave"
          />
        </div>

        <!-- Product Info -->
        <div class="flex flex-col gap-8">
          <div class="bg-white rounded-2xl p-8 shadow-sm">
            <div
              class="flex items-center gap-2 text-indigo-600 font-medium mb-4"
            >
              <span class="px-3 py-1 bg-indigo-50 rounded-full text-sm">{{
                product.category
              }}</span>
            </div>

            <h1 class="text-4xl font-bold text-gray-900 mb-4">
              {{ product.name }}
            </h1>

            <div class="flex items-center gap-2 mb-6">
              <Star class="w-5 h-5 text-yellow-400 fill-current" />
              <span class="font-bold text-gray-900">{{ product.rating }}</span>
              <span class="text-gray-500"
                >({{
                  products.reviews_count.replace(
                    "{count}",
                    product.reviews.length || 0,
                  )
                }})</span
              >
            </div>

            <p class="text-gray-600 text-lg leading-relaxed mb-8">
              {{ product.description }}
            </p>

            <div
              class="flex items-center justify-between pt-6 border-t border-gray-100"
            >
              <span class="text-3xl font-bold text-gray-900"
                >${{ product.price }}</span
              >
              <button
                @click="addToCart"
                class="px-8 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:bg-indigo-700 hover:shadow-xl transition-all flex items-center gap-2"
              >
                <ShoppingCart class="w-5 h-5" />
                {{ products.add_to_cart }}
              </button>
            </div>
          </div>

          <!-- Seller Info -->
          <div v-if="product.seller" class="bg-white rounded-2xl p-8 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 mb-4">
              {{ products.sold_by }}
            </h3>
            <div class="flex items-start gap-4">
              <div class="bg-gray-100 p-3 rounded-full">
                <User class="w-8 h-8 text-gray-500" />
              </div>
              <div>
                <div class="font-bold text-lg text-gray-900 mb-1">
                  <router-link
                    :to="{
                      name: 'user-profile',
                      params: { id: product.seller.id },
                    }"
                    class="hover:text-indigo-600"
                  >
                    {{ product.seller.name }}
                  </router-link>
                </div>
                <p class="text-gray-600 text-sm mb-4">
                  {{ product.seller.bio || profile.no_bio }}
                </p>
                <a
                  :href="`mailto:${product.seller.email}`"
                  class="text-indigo-600 font-medium hover:text-indigo-500 text-sm"
                >
                  {{ products.contact_seller }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="mt-12 max-w-3xl">
        <h2
          class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"
        >
          <MessageSquare class="w-6 h-6" />
          {{ products.comments_title }}
        </h2>

        <!-- Add Comment -->
        <div
          v-if="authStore.user"
          class="bg-white rounded-xl p-6 shadow-sm mb-8"
        >
          <div class="flex gap-4">
            <div class="bg-indigo-50 p-2 rounded-full h-fit">
              <User class="w-6 h-6 text-indigo-600" />
            </div>
            <div class="flex-1">
              <textarea
                v-model="newComment"
                rows="2"
                class="w-full border-0 bg-gray-50 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500"
                :placeholder="products.ask_placeholder.value"
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="submitComment"
                  :disabled="!newComment.trim()"
                  class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send class="w-4 h-4" />
                  {{ products.post_comment }}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="bg-indigo-50 rounded-xl p-6 mb-8 text-center">
          <p class="text-indigo-800">
            {{ products.login_prompt_start }}
            <router-link to="/login" class="font-bold underline">{{
              products.login_link
            }}</router-link>
            {{ products.login_prompt_end }}
          </p>
        </div>

        <!-- Comment List -->
        <div class="space-y-6">
          <div
            v-for="comment in product.comments"
            :key="comment.id"
            class="bg-white rounded-xl p-6 shadow-sm group"
          >
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="font-bold text-gray-900">
                  {{ comment.user.name }}
                </div>
                <span class="text-xs text-gray-400">{{
                  new Date(comment.createdAt).toLocaleDateString()
                }}</span>
              </div>

              <!-- Actions for own comments -->
              <div
                v-if="authStore.user && authStore.user.id === comment.user.id"
                class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <button
                  v-if="editingCommentId !== comment.id"
                  @click="startEditComment(comment)"
                  class="text-gray-400 hover:text-indigo-600 p-1"
                  :title="products.edit"
                >
                  <Edit2 class="w-4 h-4" />
                </button>
                <button
                  v-if="editingCommentId !== comment.id"
                  @click="deleteComment(comment.id)"
                  class="text-gray-400 hover:text-red-500 p-1"
                  :title="products.delete"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div v-if="editingCommentId === comment.id">
              <textarea
                v-model="editContent"
                rows="3"
                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              ></textarea>
              <div class="flex justify-end gap-2 mt-2">
                <button
                  @click="cancelEditComment"
                  class="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  {{ products.cancel }}
                </button>
                <button
                  @click="saveComment(comment.id)"
                  class="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {{ products.save }}
                </button>
              </div>
            </div>
            <p v-else class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ comment.content }}
            </p>
          </div>

          <div
            v-if="product.comments && product.comments.length === 0"
            class="text-center py-8 text-gray-500"
          >
            {{ products.no_comments }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
