module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      'react-app',
      'prettier',
      'airbnb',
      'airbnb/hooks',
      'plugin:react/recommended',
      'plugin:jsx-a11y/recommended',
      'plugin:import/recommended',
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: [
      'react',
      'jsx-a11y',
      'import',
    ],
    rules: {
      'react/jsx-filename-extension': [1, { extensions: ['.jsx', '.js'] }],
      "import/prefer-default-export": "off",
      'react/react-in-jsx-scope': 'off',
    },
  };
  