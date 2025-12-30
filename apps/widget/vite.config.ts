import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'DeskFlowWidget',
      fileName: () => `widget.js`, // Force this name
      formats: ['iife'], // IIFE for direct script tag usage
    },
    rollupOptions: {
      // Ensure no external dependencies, bundle Preact and everything
      external: [], 
    },
    // Minify code
    minify: 'terser', 
  },
  define: {
    'process.env': {} // Avoid errors from some libraries
  }
});
