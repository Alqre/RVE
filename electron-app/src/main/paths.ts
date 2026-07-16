import {app} from 'electron';
import path from 'node:path';

/**
 * En dev, le monorepo est: Projet_App_Revival/{assets,remotion-template,electron-app}.
 * En packagé, ces dossiers sont copiés dans resourcesPath (voir electron-builder.yml).
 */
export const ASSETS_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(app.getAppPath(), '..', 'assets');

export const REMOTION_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'remotion-template')
  : path.join(app.getAppPath(), '..', 'remotion-template');

export const SELECTED_ASSETS_DIR = path.join(REMOTION_DIR, 'public', 'selected');

export const OUTPUT_DIR = app.isPackaged
  ? path.join(path.dirname(app.getPath('exe')), 'exports')
  : path.join(app.getAppPath(), '..', 'output');
