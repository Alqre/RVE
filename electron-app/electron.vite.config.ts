import {resolve} from 'node:path';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import react from '@vitejs/plugin-react';

// Le dossier public/ est partagé avec remotion-template afin que l'aperçu live
// (Remotion Player) résolve les mêmes chemins staticFile() que le rendu final.
const remotionPublicDir = resolve(__dirname, '../remotion-template/public');

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
    plugins: [react()],
  },
});
