<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProductStore } from '../stores/products'
import ProductCard from '../components/ProductCard.vue'
import { User, Calendar, Edit2, Save, X } from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()
const productStore = useProductStore()

const user = ref(null)
const loading = ref(true)
const isEditing = ref(false)
const editForm = ref({
    bio: '',
    name: ''
})

const isCurrentUser = computed(() => {
    return authStore.user && user.value && authStore.user.id == user.value.id
})

const fetchUserProfile = async () => {
    loading.value = true
    try {
        const response = await fetch(`http://localhost:3000/api/users/${route.params.id}`)
        if (response.ok) {
            user.value = await response.json()
        }
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

const startEdit = () => {
    editForm.value = {
        bio: user.value.bio || '',
        name: user.value.name || ''
    }
    isEditing.value = true
}

const cancelEdit = () => {
    isEditing.value = false
}

const saveProfile = async () => {
    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`
            },
            body: JSON.stringify(editForm.value)
        })
        
        if (response.ok) {
            const updatedUser = await response.json()
            user.value = { ...user.value, ...updatedUser } // Update local user data
            authStore.user = { ...authStore.user, ...updatedUser } // Update auth store
            localStorage.setItem('user', JSON.stringify(authStore.user))
            isEditing.value = false
        } else {
            alert('Failed to update profile')
        }
    } catch (e) {
        console.error(e)
        alert('Error updating profile')
    }
}

onMounted(() => {
    fetchUserProfile()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-24 pb-12">
    <div v-if="loading" class="flex justify-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>

    <div v-else-if="user" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Profile Header -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div class="flex flex-col md:flex-row items-start gap-8">
                <div class="bg-indigo-100 p-6 rounded-full">
                    <User class="w-16 h-16 text-indigo-600" />
                </div>
                
                <div class="flex-1 w-full">
                    <div class="flex justify-between items-start">
                        <div class="w-full">
                            <div v-if="isEditing">
                                 <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('profile.name') }}</label>
                                 <input v-model="editForm.name" type="text" class="mb-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2">
                                 
                                 <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('profile.bio') }}</label>
                                 <textarea v-model="editForm.bio" rows="4" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2" :placeholder="$t('profile.bio_placeholder')"></textarea>
                            </div>
                            <div v-else>
                                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ user.name }}</h1>
                                <p v-if="user.bio" class="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap">{{ user.bio }}</p>
                                <div v-else class="text-gray-400 italic">
                                    <p v-if="!isCurrentUser">{{ $t('profile.no_bio') }}</p>
                                    <button v-else @click="startEdit" class="text-indigo-600 hover:text-indigo-500 font-medium underline decoration-dashed underline-offset-4">
                                        {{ $t('profile.create') }} &rarr;
                                    </button>
                                </div>
                            </div>
                            
                            <div class="flex items-center gap-2 text-gray-400 text-sm mt-4">
                                <Calendar class="w-4 h-4" />
                                <span>{{ $t('profile.joined') }} {{ new Date(user.createdAt).toLocaleDateString() }}</span>
                            </div>
                        </div>

                        <div v-if="isCurrentUser" class="ml-4 flex-shrink-0">
                            <div v-if="isEditing" class="flex gap-2">
                                <button @click="cancelEdit" class="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                                    <X class="w-4 h-4" /> {{ $t('profile.cancel') }}
                                </button>
                                <button @click="saveProfile" class="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                                    <Save class="w-4 h-4" /> {{ $t('profile.save') }}
                                </button>
                            </div>
                            <!-- Hide the top edit button if we are showing the large "Create Profile" CTA below -->
                            <button v-else-if="user.bio" @click="startEdit" class="flex items-center gap-1 px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors">
                                <Edit2 class="w-4 h-4" /> {{ $t('profile.edit') }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- User Products -->
        <h2 class="text-2xl font-bold text-gray-900 mb-6">{{ $t('profile.user_products', { name: user.name }) }}</h2>
        
        <div v-if="user.products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <ProductCard 
                v-for="product in user.products" 
                :key="product.id" 
                :product="product"
            />
        </div>
        <div v-else class="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            {{ $t('profile.no_products') }}
        </div>
    </div>
    
    <div v-else class="text-center py-20">
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('profile.user_not_found') }}</h2>
        <router-link to="/" class="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">{{ $t('profile.return_home') }}</router-link>
    </div>
  </div>
</template>
