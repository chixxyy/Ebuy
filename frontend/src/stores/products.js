import { defineStore } from "pinia";
import { ref } from "vue";

export const useProductStore = defineStore("products", () => {
  const products = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  async function fetchProducts() {
    isLoading.value = true;
    error.value = null;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      if (!response.ok) throw new Error("Failed to fetch products");
      products.value = await response.json();
    } catch (e) {
      error.value = e.message;
      console.error(e);
    } finally {
      isLoading.value = false;
    }
  }

  // WebSocket Logic (Socket.IO)
  let socket = null;
  function connectWebSocket() {
    if (socket) return;

    // Dynamic import to avoid SSR issues if any, though here it's SPA
    import("socket.io-client").then(({ io }) => {
      socket = io(import.meta.env.VITE_API_URL);

      socket.on("connect", () => {
        console.log("📦 Socket.IO Connected");
      });

      // Listen for the specific event requested
      socket.on("INVENTORY_UPDATE", (payload) => {
        console.log("📦 Received INVENTORY_UPDATE:", payload);
        const { productId, stock } = payload;
        // Ensure IDs match type (string vs number)
        const product = products.value.find((p) => p.id == productId);
        if (product) {
          product.stock = stock;
        }
      });

      socket.on("disconnect", () => {
        console.log("📦 Socket.IO Disconnected");
      });
    });
    // ... WS logic above ...
  }

  async function addProduct(productData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to add product");
      const newProduct = await response.json();
      products.value.push(newProduct);
      return true;
    } catch (e) {
      error.value = e.message;
      console.error(e);
      return false;
    }
  }

  async function updateProduct(id, productData) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Failed to update product");
      
      const updatedProduct = await response.json();
      
      // Local State Mutation: Find and Update
      // Using '==' to handle potential string/number mismatches from API/Route params
      const index = products.value.findIndex((p) => p.id == id);
      if (index !== -1) {
        // Update the product in the array to trigger reactivity
        products.value[index] = updatedProduct;
      }
      return true;
    } catch (e) {
      error.value = e.message;
      console.error(e);
      return false;
    }
  }

  async function deleteProduct(id) {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("user"))?.token}`,
        }
      });
      if (!response.ok) throw new Error("Failed to delete product");
      
      // Local State Mutation: Remove from array
      // This is more efficient than re-fetching the entire list
      products.value = products.value.filter((p) => p.id != id);
      
      return true;
    } catch (e) {
      error.value = e.message;
      console.error(e);
      return false;
    }
  }

  async function addComment(productId, content) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${productId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
          },
          body: JSON.stringify({ content }),
        },
      );
      if (!response.ok) throw new Error("Failed to add comment");
      return true;
    } catch (e) {
      error.value = e.message;
      console.error(e);
      return false;
    }
  }

  async function updateComment(commentId, content) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
          },
          body: JSON.stringify({ content }),
        },
      );
      if (!response.ok) throw new Error("Failed to update comment");
      return true;
    } catch (e) {
      error.value = e.message;
      console.error(e);
      return false;
    }
  }

  async function deleteComment(commentId) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${JSON.parse(localStorage.getItem("user")).token}`,
          },
        },
      );
      if (!response.ok) throw new Error("Failed to delete comment");
      return true;
    } catch (e) {
      error.value = e.message;
      console.error(e);
      return false;
    }
  }

  function getProductById(id) {
    return products.value.find((p) => p.id == id);
  }

  // Initial fetch
  fetchProducts();
  connectWebSocket();

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addComment,
    updateComment,
    deleteComment,
  };
});
