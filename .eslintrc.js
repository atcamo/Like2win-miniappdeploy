module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Disable problematic rules for production build
    '@next/next/no-img-element': 'off',
    'react-hooks/exhaustive-deps': 'off',
  },
  ignorePatterns: [
    'node_modules/',
    '.next/',
    'out/',
    'build/',
    'lib/generated/',
  ],
};