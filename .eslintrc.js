module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:react-hooks/recommended',
    'plugin:compat/recommended',
    'plugin:ecmalist/recommended',
  ],
  settings: { es: { aggressive: true } },
  env: {
    browser: true,
    mocha: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'chai-friendly/no-unused-expressions': 2,
    'import/extensions': [
      'error',
      { js: 'always' },
    ],
    'import/no-cycle': 0,
    'linebreak-style': [
      'error',
      'unix',
    ],
    'no-await-in-loop': 0,
    'no-param-reassign': [
      2,
      { props: false },
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message: 'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
      },
      {
        selector: 'LabeledStatement',
        message: 'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
      },
      {
        selector: 'WithStatement',
        message: '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-return-assign': [
      'error',
      'except-parens',
    ],
    'no-unused-expressions': 0,
    'object-curly-newline': [
      'error',
      {
        ObjectExpression: {
          multiline: true,
          minProperties: 6,
        },
        ObjectPattern: {
          multiline: true,
          minProperties: 6,
        },
        ImportDeclaration: {
          multiline: true,
          minProperties: 6,
        },
        ExportDeclaration: {
          multiline: true,
          minProperties: 6,
        },
      },
    ],
  },
  overrides: [
    {
      files: [
        'test/**/*.js',
      ],
      rules: { 'no-console': 0 },
    },
    {
      // Node CLI, so browser-compat and browser-ES-level rules do not apply.
      files: [
        'tools/da-migrate/**/*.js',
      ],
      env: { browser: false, node: true },
      rules: {
        'compat/compat': 'off',
        'ecmalist/no-object-fromentries': 'off',
        'import/extensions': 'off',
        'import/no-extraneous-dependencies': 'off',
        'no-console': 'off',
        'object-curly-newline': 'off',
      },
    },
    {
      files: [
        'nala/**/*.js',
        'nala/**/*.test.js',
      ],
      rules: {
        'no-console': 0,
        'import/no-extraneous-dependencies': 0,
        'max-len': 0,
        'chai-friendly/no-unused-expressions': 0,
        'no-plusplus': 0,
        'global-require': 0,
        'object-curly-newline': 'off',
        'no-unused-vars': 'off',
        'arrow-parens': 'off',
        'compat/compat': 'off',
        'one-var-declaration-per-line': 'off',
      },
    },
  ],
  ignorePatterns: [
    '/libs/deps/*',
    '/tools/loc/*',
  ],
  plugins: [
    'chai-friendly',
  ],
};
