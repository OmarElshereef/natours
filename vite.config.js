import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: '.', // root is current dir
    build: {
        outDir: 'public/js', // 🔥 Output Vite bundle to public
        emptyOutDir: true,
        rollupOptions: {
            input: './src/js/index.js', // 🔥 Main JS entry
        },
    },
});
