// apps/backend/.eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', // Use prettier to disable conflicting formatting rules
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json', // Points to root tsconfig.json
  },
  env: {
    node: true,
    es2020: true,
  },
  rules: {
    // Add any project-specific rules here
  },
};
