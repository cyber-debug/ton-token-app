import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    // Relative base so the static build works under GitHub Pages subpaths.
    base: './',
    plugins: [react()],
    // This project (migrated from Create React App) keeps JSX inside .js files,
    // so tell esbuild to parse them as JSX.
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: { '.js': 'jsx' },
        },
    },
    server: {
        // Proxy non-static requests to the Express API (replaces the old
        // Create React App "proxy" field).
        proxy: 'http://localhost:3001',
    },
    build: {
        // Emit into "build/" so the existing Express server keeps serving
        // the SPA without changes.
        outDir: 'build',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1200,
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.js'],
    },
});
