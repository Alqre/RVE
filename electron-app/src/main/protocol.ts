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

export function registerAssetProtocolScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: ASSET_PROTOCOL,
      privileges: {standard: true, secure: true, supportFetchAPI: true, stream: true, bypassCSP: true},
    },
  ]);
}

export function handleAssetProtocol(): void {
  protocol.handle(ASSET_PROTOCOL, async (request) => {
    const url = new URL(request.url);
    let pathname = decodeURIComponent(url.pathname);
    if (/^\/[A-Za-z]:/.test(pathname)) {
      pathname = pathname.slice(1);
    }

    try {
      const data = await fs.promises.readFile(pathname);
      const mime = MIME_TYPES[path.extname(pathname).toLowerCase()] ?? 'application/octet-stream';
      return new Response(data, {headers: {'Content-Type': mime, 'Cache-Control': 'no-store'}});
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
