const {heroui} = require('@heroui/theme');
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "// Inclui todos os arquivos React no diretório src",
    "./node_modules/@heroui/theme/dist/components/(dropdown|form|menu|divider|popover|button|ripple|spinner).js"
  ],
  theme: {
    extend: {},
  },
  plugins: [heroui()],
};
