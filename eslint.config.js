import js from '@eslint/js'
import pluginReact from 'eslint-plugin-react'
import pluginReactHooks from 'eslint-plugin-react-hooks'
import pluginImport from 'eslint-plugin-import'
import pluginPrettier from 'eslint-plugin-prettier'
import babelParser from '@babel/eslint-parser'

export default [
  {
    ignores: [
      'node_modules/',
      'public/',
      'vendor/',
      'storage/',
      'bootstrap/',
    ],
  },

  js.configs.recommended,

  {
    files: ['resources/js/**/*.{js,jsx}'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-react'],
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      import: pluginImport,
      prettier: pluginPrettier,
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': {
        node: { extensions: ['.js', '.jsx'] },
        alias: {
          map: [['@', './resources/js/src']],
          extensions: ['.js', '.jsx'],
        },
      },
    },
    rules: {
      "no-undef": "off",

      'react/prop-types': 'off',

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      'react/jsx-uses-vars': 'error',

      'import/order': ['warn', {
        alphabetize: { order: 'asc', caseInsensitive: true },
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      }],

      'prettier/prettier': ['warn', {
        printWidth: 100,
        tabWidth: 2,
        singleQuote: true,
        semi: false,
      }],
    },
  },
]