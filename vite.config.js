import { defineConfig } from 'vite';

export default defineConfig({
  // Served from a sub-path on GitHub Pages (/projects/<name>/), so emit
  // relative asset URLs instead of absolute /assets/... ones.
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5273,
    strictPort: true,
  },
  build: {
    target: 'esnext',
  },
});
