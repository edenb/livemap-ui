import js from "@eslint/js";
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import pluginVuetify from "eslint-plugin-vuetify";
import pluginCypress from "eslint-plugin-cypress";
import pluginPrettier from "eslint-plugin-prettier/recommended";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,vue}"],
    plugins: { js },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: { "no-unused-vars": "off" },
  },
  pluginVue.configs["flat/recommended"],
  pluginVuetify.configs["flat/recommended"],
  pluginCypress.configs["recommended"],
  pluginPrettier, // Prettier always last
]);
