import fs from 'node:fs';
import {ASSETS_DIR, SEED_ASSETS_DIR} from './paths';

export function seedAssetsIfMissing(): void {
  if (fs.existsSync(ASSETS_DIR)) return;
  fs.cpSync(SEED_ASSETS_DIR, ASSETS_DIR, {recursive: true});
}
