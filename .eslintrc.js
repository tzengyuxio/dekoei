/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  extends: [
    "plugin:vue/vue3-essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier/skip-formatting",
    "prettier",
  ],
  overrides: [],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  plugins: ["vue", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "no-bitwise": "off",
  },
};
