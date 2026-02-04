import { defineStore } from "pinia";
import { ref } from "vue";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(JSON.parse(localStorage.getItem("user")) || null);
  const router = useRouter();
  const token = ref(user.value ? user.value.token : null);

  async function login(email, password) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        user.value = { ...data.user, token: data.token };
        token.value = data.token;
        localStorage.setItem("user", JSON.stringify(user.value));
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async function register(username, password, email) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: username, email, password }),
      });

      if (response.ok) {
        // Auto login after register or just redirect to login?
        // Implementation plan said "ensure registered users can log in".
        // Let's just return true for now, usually backend returns userId.
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem("user");
  }

  return { user, token, login, register, logout };
});
