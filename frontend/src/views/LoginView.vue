<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { useContent } from "../composables/useContent";
import { Eye, EyeOff } from "lucide-vue-next";

const email = ref("");
const password = ref("");
const authStore = useAuthStore();
const router = useRouter();
const error = ref("");
const { auth } = useContent();
const showPassword = ref(false);

const handleLogin = async () => {
  if (await authStore.login(email.value, password.value)) {
    router.push("/");
  } else {
    error.value = auth.value.invalid_credentials;
  }
};
</script>

<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {{ auth.signin_title }}
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">{{ auth.email }}</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :placeholder="auth.email"
            />
          </div>
          <div class="relative">
            <label for="password" class="sr-only">{{ auth.password }}</label>
            <input
              id="password"
              v-model="password"
              name="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              :placeholder="auth.password"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center z-20 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <Eye v-if="!showPassword" class="h-5 w-5" aria-hidden="true" />
              <EyeOff v-else class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ auth.signin_btn }}
          </button>
        </div>
      </form>
      <div class="text-center">
        <router-link
          to="/register"
          class="font-medium text-indigo-600 hover:text-indigo-500"
        >
          {{ auth.no_account }}
        </router-link>
      </div>
    </div>
  </div>
</template>
