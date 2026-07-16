import {protocol} from 'electron';
import fs from 'node:fs';
import path from 'node:path';

export const ASSET_PROTOCOL = 'app-file';

const MIME_TYPES: Record<string, string> = {
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
 * Permet de servir des fichiers arbitraires du disque (bibliothèque d'assets) à l'UI
 * sans désactiver websecurity et sans exposer un accès Node direct au renderer.
 */
export function registerAssetProtocolScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: ASSET_PROTOCOL,
      privileges: {standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true},
    },
  ]);
}

/**
 * Doit être appelé après `app.whenReady()`.
 * On lit le fichier nous-mêmes et on fixe le Content-Type explicitement : laisser
 * Chromium deviner le type MIME d'une URL file:// est peu fiable (les .svg en
 * particulier finissent souvent sans type correct, ce qui casse le décodage <img>).
 */
export function handleAssetProtocol(): void {
  protocol.handle(ASSET_PROTOCOL, async (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    // "/C:/Users/..." -> "C:/Users/..." (chemins Windows avec lettre de lecteur)
    if (/^\/[A-Za-z]:/.test(pathname)) {
      pathname = pathname.slice(1);
    }

    try {
      const data = await fs.promises.readFile(pathname);
      const mime = MIME_TYPES[path.extname(pathname).toLowerCase()] ?? 'application/octet-stream';
      return new Response(data, {headers: {'Content-Type': mime}});
    } catch {
      return new Response(null, {status: 404});
    }
  });
}

export function toAssetUrl(absolutePath: string): string {
  const normalized = absolutePath.replace(/\\/g, '/');
  const withLeadingSlash = normalized.startsWith('/') ? normalized : `/${normalized}`;
  return `${ASSET_PROTOCOL}://${withLeadingSlash}`;
}
