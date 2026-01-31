<script setup>
import { onMounted, ref, nextTick } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import { useRouter } from 'vue-router'
import { showToast, showConfirm } from '../utils/swal'
import { useCartStore } from '../stores/cart'
import { useContent } from '../composables/useContent'

const { payment, alert, cart } = useContent()

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder')

const router = useRouter()
const cartStore = useCartStore()

const isLoading = ref(true)
const isProcessing = ref(false)
const errorMessage = ref('')
const clientSecret = ref('')
const amount = ref(0)
const currency = ref('')
const stripe = ref(null)
const elements = ref(null)
const cardElement = ref(null)

onMounted(async () => {
    // Sync cart first to ensure amounts match
    await cartStore.fetchCart()

    try {
        // 1. Fetch Client Secret
        const user = JSON.parse(localStorage.getItem('user'))
        if (!user) {
            router.push('/login')
            return
        }

        const res = await fetch('http://localhost:3000/api/payment/create-payment-intent', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            }
        })
        
        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                 showToast(alert.login_failed || 'Session expired', 'error')
                 localStorage.removeItem('user')
                 router.push('/login')
                 return
            }
            const err = await res.json()
            throw new Error(err.message || payment.value.error_init)
        }

        const data = await res.json()
        clientSecret.value = data.clientSecret
        amount.value = data.amount // Backend should return amount for display
        currency.value = data.currency || 'USD'

        // 2. Initialize Stripe
        stripe.value = await stripePromise
        elements.value = stripe.value.elements()
        
        // 3. Create & Mount Card Element
        isLoading.value = false // Set loading to false FIRST so DOM exists

        await nextTick() // Wait for Vue to update DOM and render v-else block

        // Style can be customized to match "Premium" look
        const style = {
            base: {
                color: '#32325d',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px',
                '::placeholder': {
                    color: '#aab7c4'
                }
            },
            invalid: {
                color: '#fa755a',
                iconColor: '#fa755a'
            }
        }
        
        cardElement.value = elements.value.create('card', { style })
        cardElement.value.mount('#card-element')
        
        // Handle validation errors in real-time
        cardElement.value.on('change', (event) => {
            if (event.error) {
                errorMessage.value = event.error.message
            } else {
                errorMessage.value = ''
            }
        })



    } catch (e) {
        console.error(e)
        errorMessage.value = e.message
        isLoading.value = false
    }
})

const handlePayment = async () => {
    if (isProcessing.value) return
    isProcessing.value = true
    errorMessage.value = ''

    try {
        const result = await stripe.value.confirmCardPayment(clientSecret.value, {
            payment_method: {
                card: cardElement.value,
                billing_details: {
                    // Optional: Prefill if we had user address
                    name: 'Test User'
                }
            }
        })

        if (result.error) {
            // Show error in UI
            errorMessage.value = result.error.message
        } else {
            // Success!
            if (result.paymentIntent.status === 'succeeded') {
                // Call backend to finalize order (deduct stock, clear cart)
                const user = JSON.parse(localStorage.getItem('user'))
                await fetch('http://localhost:3000/api/payment/checkout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    }
                })

                showToast(payment.value.success, 'success')
                // Clear cart locally since backend payment succeeded implies purchase
                cartStore.clearCart() 
                // Navigate to success page or orders
                router.push('/products')
            }
        }
    } catch (e) {
        errorMessage.value = payment.value.error_process
        console.error(e)
    } finally {
        isProcessing.value = false
    }
}
</script>

<template>

  <div class="bg-gray-50 min-h-screen pt-24 pb-12 flex flex-col items-center justify-center px-4">
      <div class="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">
          <h2 class="text-3xl font-extrabold text-gray-900 mb-1 text-center">{{ payment.title }}</h2>
          <p class="text-center text-gray-500 mb-8">{{ payment.secure }}</p>
      
      <div v-if="isLoading" class="flex justify-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>

      <div v-else>
          <!-- Order Summary -->
          <div class="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-100">
              <h3 class="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wider">Order Summary</h3>
              
              <div class="space-y-3 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                  <div v-for="item in cartStore.items" :key="item.id" class="flex justify-between items-start text-sm">
                      <div class="flex-1 pr-4">
                          <span class="text-gray-700 font-medium">{{ item.quantity }}x {{ item.name }}</span>
                      </div>
                      <span class="text-gray-900">${{ item.price * item.quantity }}</span>
                  </div>
              </div>

              <div class="border-t border-gray-200 pt-4 flex justify-between items-center">
                  <span class="text-gray-600 font-medium">{{ cart.total }}</span>
                  <div class="flex items-center gap-1">
                      <span class="text-lg font-medium text-gray-400">{{ currency }}</span>
                      <span class="text-2xl font-bold text-indigo-600">${{ amount }}</span>
                  </div>
              </div>
              <div class="text-xs text-gray-400 text-right mt-1">
                Includes taxes and fees
              </div>
          </div>

          <!-- Card Input -->
          <div class="mb-8">
              <label class="block text-sm font-medium text-gray-700 mb-3">{{ payment.card_details }}</label>
              <div id="card-element" class="p-4 border border-gray-200 rounded-xl bg-white shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all min-h-[50px]">
                  <!-- Stripe Element mounts here -->
              </div>
              <div v-if="errorMessage" class="text-red-500 text-sm mt-2 font-medium">
                  {{ errorMessage }}
              </div>
          </div>

          <button 
            @click="handlePayment" 
            :disabled="isProcessing || !clientSecret"
            class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all transform active:scale-95"
          >
              <span v-if="isProcessing">{{ payment.processing }}</span>
              <span v-else>{{ payment.pay_now }}</span>
          </button>
      </div>
  </div>
  </div>
</template>
