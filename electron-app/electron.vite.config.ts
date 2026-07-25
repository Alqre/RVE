import {resolve} from 'node:path';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import type {Plugin} from 'vite';
import react from '@vitejs/plugin-react';

const remotionPublicDir = resolve(__dirname, '../remotion-template/public');

function disableSelectedAssetCache(): Plugin {
  return {
    name: 'disable-selected-asset-cache',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith('/selected/')) {
          res.setHeader('Cache-Control', 'no-store');
        }
        next();
      });
    },
  };
}

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    publicDir: remotionPublicDir,
    server: {
      fs: {
        allow: [resolve(__dirname, '..')],
      },
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html'),
      },
    },
    plugins: [react(), disableSelectedAssetCache()],
  },
});
