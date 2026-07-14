// postcss.config.js
// Processes src/styles/globals.css: expands the three @import 'tailwindcss/*'
// directives into real CSS, then autoprefixes for the browser support matrix
// declared in package.json's (implicit) browserslist defaults.

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
