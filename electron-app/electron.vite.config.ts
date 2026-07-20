import {resolve} from 'node:path';
import {defineConfig, externalizeDepsPlugin} from 'electron-vite';
import type {Plugin} from 'vite';
import react from '@vitejs/plugin-react';

// Le dossier public/ est partagé avec remotion-template afin que l'aperçu live
// (Remotion Player) résolve les mêmes chemins staticFile() que le rendu final.
const remotionPublicDir = resolve(__dirname, '../remotion-template/public');

/**
 * Les fichiers dans public/selected/<slotId>.<ext> gardent le même nom d'un choix à
 * l'autre (voir selectFileForSlot dans assets.ts) : seul le contenu change. En dev,
 * le serveur Vite laisse le navigateur mettre ces réponses en cache par URL, donc
 * changer d'asset dans un slot peut réafficher l'ancienne image tant que le cache
 * HTTP n'expire pas. Non reproductible en build (app:// ne met pas en cache de la
 * même façon), d'où le fix ciblé uniquement ici plutôt que côté composition.
 */
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
