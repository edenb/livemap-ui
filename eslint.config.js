import js from "@eslint/js";
import cypress from "eslint-plugin-cypress/flat";
import prettier from "eslint-plugin-prettier/recommended";
import vue from "eslint-plugin-vue";
import vuetify from "eslint-plugin-vuetify";

export default [
  {
    files: ["**/*.js", "**/*.vue"],
    languageOptions: {
      ecmaVersion: 2021,
    },
  },
  js.configs.recommended,
  cypress.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...vuetify.configs["flat/recommended"],
  {
    rules: {
      "no-unused-vars": "off",
    },
  },
  prettier, // Prettier always last
];
