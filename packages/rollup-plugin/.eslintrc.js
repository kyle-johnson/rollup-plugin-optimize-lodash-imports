module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint", "jest"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:unicorn/recommended",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "prettier",
  ],
  rules: {
    "unicorn/no-null": "off",
    "unicorn/prefer-module": "off",
    "unicorn/expiring-todo-comments": "off",
  },
};
