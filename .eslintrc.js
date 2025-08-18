module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable problematic rules for production build
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@next/next/no-img-element': 'warn',
    'react-hooks/exhaustive-deps': 'warn',
  },
};