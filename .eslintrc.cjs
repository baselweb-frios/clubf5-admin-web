/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-unused-vars': 'warn',
    'no-unused-vars': 'warn',
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Desactivar reglas de espacios/whitespace
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
