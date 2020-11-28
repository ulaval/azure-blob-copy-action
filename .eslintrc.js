module.exports = {
  root: true,

  env: {
    node: true,
  },

  parser: "@typescript-eslint/parser",

  parserOptions: {
    ecmaVersion: 2020,
  },

  plugins: ["prettier", "@typescript-eslint"],

  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  rules: {
    "prettier/prettier": ["error"],
    "no-console": "off",
    "@typescript-eslint/no-unused-vars": ["error", { varsIgnorePattern: "_", argsIgnorePattern: "^_" }],
  },

  overrides: [
    {
      files: ["**/*.spec.{j,t}s?(x)"],
      env: {
        jest: true,
      },
    },
  ],
};
