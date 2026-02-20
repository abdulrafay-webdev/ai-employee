// apps/dashboard/.eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'next/core-web-vitals', // Next.js specific linting
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier', 
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json', // Points to root tsconfig.json
  },
  rules: {
    // Add any project-specific rules here
  },
};
