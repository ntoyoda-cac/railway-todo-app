import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";


export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    settings: {
      react: {
          version: 'detect',  // Reactのバージョンを自動検出
      },
      rules: {
        'react/prop-types': 'off',
      },
    },
  },
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
];
