<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/products'
import { showAlert, showToast } from '../utils/swal'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const productStore = useProductStore()
const { t } = useI18n()

const form = ref({
  name: '',
  price: '',
  description: '',
  image: '',
  category: ''
})

const categories = ['Audio', 'Furniture', 'Gaming', 'Wearables', 'Accessories', 'Bags', 'Other']

const handleSubmit = async () => {
    // Validate
    if (!form.value.name || !form.value.price) return

    const success = await productStore.addProduct(form.value)
    if (success) {
        showToast(t('alert.create_success'))
        router.push('/products')
    } else {
        showAlert(t('alert.error'), t('add_product.error') || 'Failed to add product', 'error', t('alert.confirm'))
    }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">{{ $t('add_product.title') }}</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('add_product.name') }}</label>
          <input v-model="form.name" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('add_product.price') }}</label>
          <input v-model="form.price" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('add_product.category') }}</label>
          <select v-model="form.category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ $t(`add_product.categories.${cat}`) }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">{{ $t('add_product.image') }}</label>
          <input v-model="form.image" type="url" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700">{{ $t('add_product.description') }}</label>
           <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"></textarea>
        </div>

        <div class="flex justify-end gap-4">
             <button type="button" @click="$router.back()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">{{ $t('add_product.cancel') }}</button>
             <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {{ $t('add_product.submit') }}
             </button>
        </div>
      </form>
    </div>
  </div>
</template>
