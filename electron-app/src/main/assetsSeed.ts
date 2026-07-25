import fs from 'node:fs';
import path from 'node:path';
import {app} from 'electron';
import {ASSETS_DIR, SEED_ASSETS_DIR} from './paths';

export function seedAssetsIfMissing(): void {
  if (fs.existsSync(ASSETS_DIR)) return;

  const legacyAssetsDir = app.isPackaged ? path.join(path.dirname(app.getPath('exe')), 'assets') : null;
  if (legacyAssetsDir && fs.existsSync(legacyAssetsDir)) {
    fs.cpSync(legacyAssetsDir, ASSETS_DIR, {recursive: true});
    return;
  }

  fs.cpSync(SEED_ASSETS_DIR, ASSETS_DIR, {recursive: true});
}
