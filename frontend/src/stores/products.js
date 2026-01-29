import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useProductStore = defineStore('products', () => {
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchProducts() {
    isLoading.value = true
    error.value = null
    try {
      const response = await fetch('http://localhost:3000/api/products')
      if (!response.ok) throw new Error('Failed to fetch products')
      products.value = await response.json()
    } catch (e) {
      error.value = e.message
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(productData) {
    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })
      if (!response.ok) throw new Error('Failed to add product')
      const newProduct = await response.json()
      products.value.push(newProduct)
      return true
    } catch (e) {
      error.value = e.message
      console.error(e)
      return false
    }
  }

  async function updateProduct(id, productData) {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })
      if (!response.ok) throw new Error('Failed to update product')
      const updatedProduct = await response.json()
      const index = products.value.findIndex(p => p.id === id)
      if (index !== -1) {
        products.value[index] = updatedProduct
      }
      return true
    } catch (e) {
      error.value = e.message
      console.error(e)
      return false
    }
  }

  async function deleteProduct(id) {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete product')
      products.value = products.value.filter(p => p.id !== id)
      return true
    } catch (e) {
      error.value = e.message
      console.error(e)
      return false
    }
  }

  async function addComment(productId, content) {
    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user')).token}`
        },
        body: JSON.stringify({ content })
      })
      if (!response.ok) throw new Error('Failed to add comment')
      console.log('Comment added')
      return true
    } catch (e) {
      error.value = e.message
      console.error(e)
      return false
    }
  }

  function getProductById(id) {
    return products.value.find(p => p.id === id)
  }

  // Initial fetch
  fetchProducts()

  return { products, isLoading, error, fetchProducts, addProduct, updateProduct, deleteProduct, getProductById, addComment }
})
