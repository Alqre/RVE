import {app} from 'electron';
import path from 'node:path';

export const ASSETS_DIR = app.isPackaged
  ? path.join(path.dirname(app.getPath('exe')), 'assets')
  : path.join(app.getAppPath(), '..', 'assets');

export const REMOTION_DIR = app.isPackaged
  ? path.join(process.resourcesPath, 'remotion-template')
  : path.join(app.getAppPath(), '..', 'remotion-template');

export const SELECTED_ASSETS_DIR = path.join(REMOTION_DIR, 'public', 'selected');

export const OUTPUT_DIR = app.isPackaged
  ? path.join(path.dirname(app.getPath('exe')), 'exports')
  : path.join(app.getAppPath(), '..', 'output');
