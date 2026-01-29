import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProductsView from '../views/ProductsView.vue'
import CartView from '../views/CartView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView
    },
    {
        path: '/add-product',
        name: 'add-product',
        component: () => import('../views/AddProductView.vue')
    },
    {
        path: '/products/:id',
        name: 'product-detail',
        component: () => import('../views/ProductDetailView.vue')
    },
    {
        path: '/edit-product/:id',
        name: 'edit-product',
        component: () => import('../views/EditProductView.vue')
    },
    {
        path: '/user/:id',
        name: 'user-profile',
        component: () => import('../views/UserProfileView.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router
