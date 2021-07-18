/* eslint-disable indent */
// eslint-disable-next-line no-undef
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/essential',
    "eslint:recommended",
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'vue',
    '@typescript-eslint',
  ],
  globals: {
    // from vendor.js:
    "NoSleep": "readonly",
    "moment": "readonly",
    "toastr": "readonly",
    "bootbox": "readonly",
    "Popper": "readonly",
    "$": "readonly", // sigh...
  },
  rules: {
    "no-unused-vars": ["error", { vars: "all", args: "none" }],
    "indent": ["error", "tab"],
    "brace-style": ["error", "allman", { "allowSingleLine": true }],
    "semi": ["error", "always", { "omitLastInOneLineBlock": true }],
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: '@typescript-eslint/parser',
      extends: [
        'plugin:vue/essential',
        "eslint:recommended",
        'plugin:@typescript-eslint/recommended',
      ],
      parserOptions: {
        project: "./tsconfig.json",
      }
    },
    {
      files: ["*.vue"],
      parser: "vue-eslint-parser",
      parserOptions: {
        parser: '@typescript-eslint/parser',
        vueFeatures: {
          filter: false,
          interpolationAsNonHTML: true
        }
      }
    }
  ]
};
