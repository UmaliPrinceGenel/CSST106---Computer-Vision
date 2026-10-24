import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const API_URL = `${env.VITE_APP_BASE_NAME}`;
    const PORT = 3000;

    return {
        server: {
            open: false,
            port: PORT,
            host: '0.0.0.0'
        },
        build: {
            chunkSizeWarningLimit: 1600
        },
        preview: {
            open: true,
            host: '0.0.0.0'
        },
        define: {
            global: 'window'
        },
        resolve: {
            alias: [
                { find: /^~/, replacement: '' },
                { find: '@', replacement: path.resolve(__dirname, 'src') },
                { find: 'api', replacement: path.resolve(__dirname, 'src/api') },
                { find: 'assets', replacement: path.resolve(__dirname, 'src/assets') },
                { find: 'contexts', replacement: path.resolve(__dirname, 'src/contexts') },
                { find: 'hooks', replacement: path.resolve(__dirname, 'src/hooks') },
                { find: 'layout', replacement: path.resolve(__dirname, 'src/layout') },
                { find: 'menu-items', replacement: path.resolve(__dirname, 'src/menu-items') },
                { find: 'routes', replacement: path.resolve(__dirname, 'src/routes') },
                { find: 'store', replacement: path.resolve(__dirname, 'src/store') },
                { find: 'themes', replacement: path.resolve(__dirname, 'src/themes') },
                { find: 'ui-component', replacement: path.resolve(__dirname, 'src/ui-component') },
                { find: 'utils', replacement: path.resolve(__dirname, 'src/utils') },
                { find: 'views', replacement: path.resolve(__dirname, 'src/views') },
                { find: 'App', replacement: path.resolve(__dirname, 'src/App.jsx') },
                { find: 'config', replacement: path.resolve(__dirname, 'src/config.js') },
                { find: 'serviceWorker', replacement: path.resolve(__dirname, 'src/serviceWorker.jsx') },
                { find: 'reportWebVitals', replacement: path.resolve(__dirname, 'src/reportWebVitals.js') }
            ]
        },
        base: API_URL || '/',
        optimizeDeps: {
            include: [
                '@mui/material',
                '@mui/material/styles',
                '@mui/material/colors',
                '@mui/system',
                '@emotion/react',
                '@emotion/styled',
                '@tabler/icons-react',
                'axios',
                'framer-motion',
                'lodash-es',
                'react-router',
                'react-router-dom',
                'react-perfect-scrollbar',
                'swr'
            ],
            esbuildOptions: {
                target: 'esnext'
            }
        },
        plugins: [react()]
    };
});
