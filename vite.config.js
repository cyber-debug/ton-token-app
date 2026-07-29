import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const environment = loadEnv(mode, process.cwd(), '');
    const backendPort = Number(environment.BACKEND_PORT || 4174);
    const frontendPort = Number(environment.DEV_FRONTEND_PORT || 4173);

    if (!Number.isInteger(backendPort) || backendPort < 1 || backendPort > 65535) {
        throw new Error('BACKEND_PORT must be a valid TCP port.');
    }
    if (!Number.isInteger(frontendPort) || frontendPort < 1 || frontendPort > 65535) {
        throw new Error('DEV_FRONTEND_PORT must be a valid TCP port.');
    }

    return {
        // Relative base so the static build works under GitHub Pages subpaths.
        base: './',
        plugins: [react()],
        server: {
            host: '127.0.0.1',
            port: frontendPort,
            strictPort: true,
            // Proxy API requests to the Express development server.
            proxy: {
                '/api': {
                    target: `http://127.0.0.1:${backendPort}`,
                },
            },
        },
        build: {
            // Emit into "build/" so Express can serve the SPA in production.
            outDir: 'build',
            emptyOutDir: true,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        const moduleId = id.replaceAll('\\', '/');

                        if (!moduleId.includes('/node_modules/')) {
                            return undefined;
                        }

                        if (
                            moduleId.includes('/node_modules/react/')
                            || moduleId.includes('/node_modules/react-dom/')
                            || moduleId.includes('/node_modules/scheduler/')
                        ) {
                            return 'react-vendor';
                        }

                        if (
                            moduleId.includes('/node_modules/@ton/')
                            || moduleId.includes('/node_modules/@tonconnect/')
                            || moduleId.includes('/node_modules/buffer/')
                        ) {
                            return 'tonconnect-vendor';
                        }

                        if (moduleId.includes('/node_modules/framer-motion/')) {
                            return 'motion-vendor';
                        }

                        return undefined;
                    },
                },
            },
        },
        test: {
            environment: 'jsdom',
            globals: true,
            setupFiles: ['./src/setupTests.js'],
        },
    };
});
