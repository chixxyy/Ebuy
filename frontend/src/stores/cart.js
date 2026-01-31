import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { showToast } from "../utils/swal";

export const useCartStore = defineStore("cart", () => {
  const items = ref(JSON.parse(localStorage.getItem("cart")) || []);

  const totalItems = computed(() =>
    items.value.reduce((total, item) => total + item.quantity, 0),
  );
  const totalPrice = computed(() =>
    items.value.reduce((total, item) => total + item.price * item.quantity, 0),
  );

  async function addItem(product) {
    // 1. Optimistic Update (Frontend feels instant)
    const existingItem = items.value.find((item) => item.id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    // Check Stock
    if (product.stock !== undefined && currentQty + 1 > product.stock) {
        showToast(`抱歉, 只有 ${product.stock} 件商品在庫。`, "error");
        return;
    }

    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({
        ...product,
        quantity: 1,
      });
    }
    saveCart();

    // 2. Background Sync (If logged in)
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      try {
        await fetch("http://localhost:3000/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1,
          }),
        });
        // Note: We don't await the final result because the backend is debounced.
        // We trust the optimistic update, creating a snappy feel.
      } catch (e) {
        console.error("Failed to sync cart:", e);
        // Ideally rollback here if strict consistency is needed
      }
    }
  }

  async function removeItem(productId) {
    const index = items.value.findIndex((item) => item.id === productId);
    if (index !== -1) {
      items.value.splice(index, 1);
      saveCart();
    }

    // Sync with backend
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
        try {
            await fetch(`http://localhost:3000/api/cart/${productId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.token}` }
            });
        } catch(e) { console.error(e); }
    }
  }

  async function updateQuantity(productId, quantity) {
    const item = items.value.find((item) => item.id === productId);
    if (item) {
      item.quantity = quantity;
      if (item.quantity <= 0) {
        removeItem(productId);
        return; // Remove handles api call
      } else {
        saveCart();
      }
    }

    // Sync with backend
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token && quantity > 0) {
        try {
            await fetch(`http://localhost:3000/api/cart`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user.token}` 
                },
                body: JSON.stringify({ productId, quantity })
            });
        } catch(e) { console.error(e); }
    }
  }

  function clearCart() {
    items.value = [];
    saveCart();
  }

  async function fetchCart() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.token) {
      try {
        const res = await fetch("http://localhost:3000/api/cart", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Backend returns { userId, items: [{ product: {...}, quantity: 1 }] }
          // We need to map it to our flat structure: { ...product, quantity }
          if (data && data.items) {
             items.value = data.items.map(item => ({
                 ...item.product,
                 quantity: item.quantity
             }));
             saveCart();
          }
        }
      } catch (e) {
        console.error("Failed to fetch cart:", e);
      }
    }
  }

  function saveCart() {
    localStorage.setItem("cart", JSON.stringify(items.value));
  }

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    updateQuantity,
    clearCart,
    fetchCart,
  };
});
