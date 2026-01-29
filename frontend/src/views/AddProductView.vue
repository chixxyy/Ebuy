<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '../stores/products'
import { showAlert, showToast } from '../utils/swal'
import { useContent } from '../composables/useContent'
import { X as XIcon } from 'lucide-vue-next'

const router = useRouter()
const productStore = useProductStore()
const { add_product, alert } = useContent()

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
        showToast(alert.value.create_success)
        router.push('/products')
    } else {
        showAlert(alert.value.error, add_product.value.error || 'Failed to add product', 'error', alert.value.confirm)
    }
}

const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData
        })

        if (response.ok) {
            const data = await response.json()
            form.value.image = data.imageUrl
        } else {
            showToast('Image upload failed')
        }
    } catch (e) {
        console.error(e)
        showToast('Image upload error')
    }
}

const removeImage = () => {
    form.value.image = ''
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">{{ add_product.title }}</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">{{ add_product.name }}</label>
          <input v-model="form.name" type="text" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">{{ add_product.price }}</label>
          <input v-model="form.price" type="number" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">{{ add_product.category }}</label>
          <select v-model="form.category" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ add_product.categories[cat] }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">{{ add_product.image }}</label>
          <div class="mt-1 flex items-center gap-4">
              <input @change="handleFileUpload" type="file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100">
          </div>
          <div v-if="form.image" class="mt-4 relative inline-block group">
              <img :src="form.image" alt="Preview" class="h-32 w-32 object-cover rounded-lg border border-gray-200">
              <button type="button" @click="removeImage" class="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-200 transition-colors">
                  <XIcon class="w-4 h-4" />
              </button>
          </div>
        </div>

        <div>
           <label class="block text-sm font-medium text-gray-700">{{ add_product.description }}</label>
           <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"></textarea>
        </div>

        <div class="flex justify-end gap-4">
             <button type="button" @click="$router.back()" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">{{ add_product.cancel }}</button>
             <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {{ add_product.submit }}
             </button>
        </div>
      </form>
    </div>
  </div>
</template>
