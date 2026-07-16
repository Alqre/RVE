import {protocol} from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import {REMOTION_DIR} from './paths';

export const APP_PROTOCOL = 'app';
export const APP_URL = `${APP_PROTOCOL}://bundle/index.html`;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.mov': 'video/quicktime',
  '.webm': 'video/webm',
};

/**
 * Doit être appelé avant `app.whenReady()`.
 *
 * En production, la fenêtre est chargée via ce protocole plutôt qu'un simple
 * `loadFile()` (file://), pour que la scène puisse servir `remotion-template/public`
 * EN DIRECT (comme le fait le serveur Vite en dev) plutôt que figé au moment du build.
 * Sans ça, staticFile() dans les compositions ne trouve pas les assets choisis par
 * l'utilisateur après le packaging de l'appli.
 */
export function registerAppProtocolScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_PROTOCOL,
      privileges: {standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true},
    },
  ]);
}

/** Doit être appelé après `app.whenReady()`. */
export function handleAppProtocol(rendererDir: string): void {
  protocol.handle(APP_PROTOCOL, async (request) => {
    const url = new URL(request.url);
    const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);

    // remotion-template/public en priorité (contenu dynamique : logos/killers/maps
    // choisis par l'utilisateur), sinon le build de la fenêtre (React/Vite).
    const candidates = [path.join(REMOTION_DIR, 'public', pathname), path.join(rendererDir, pathname)];

    for (const candidate of candidates) {
      try {
        const data = await fs.promises.readFile(candidate);
        const mime = MIME_TYPES[path.extname(candidate).toLowerCase()] ?? 'application/octet-stream';
        // no-store : les fichiers sous public/selected changent de contenu sans que leur
        // nom change (même slotId), il ne faut donc jamais servir une version en cache.
        return new Response(data, {headers: {'Content-Type': mime, 'Cache-Control': 'no-store'}});
      } catch {
        continue;
      }
    }

    return new Response(null, {status: 404});
  });
}
