import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }), // Enabled by default
  ],
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      "@": resolve(__dirname, "./src"),
    },
  },
});
