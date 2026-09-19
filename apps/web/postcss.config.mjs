// Tailwind v4 through PostCSS: Next.js's build pipeline is PostCSS-based, not
// Vite-based like Blume's (which used `@tailwindcss/vite` — see
// `blume/package.json`). `@tailwindcss/postcss` is the v4 PostCSS plugin that
// replaces that Vite plugin for this app.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
