import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:5173", // Use env var or Vite default port
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
