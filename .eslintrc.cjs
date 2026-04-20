/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
    'vue/html-indent': 'off',
    
    // JavaScript
    'no-unused-vars': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
    // Desactivar reglas de formato (Prettier lo maneja)
    'no-trailing-spaces': 'off',
    'indent': 'off',
    'semi': 'off',
    'quotes': 'off',
    'no-multi-spaces': 'off',
    'key-spacing': 'off',
    'keyword-spacing': 'off',
    'comma-spacing': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'space-before-function-paren': 'off',
    'space-infix-ops': 'off',
    'space-unary-ops': 'off'
  }
}
