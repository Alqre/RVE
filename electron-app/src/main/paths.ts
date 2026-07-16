import {app} from 'electron';
import path from 'node:path';

/**
 * En dev, le monorepo est: Projet_App_Revival/{assets,remotion-template,electron-app}.
 * En packagé, remotion-template/node_modules sont copiés dans resourcesPath (voir
 * electron-builder.yml) : ce sont le "moteur", pas à modifier par l'utilisateur.
 *
 * assets/ est différent : c'est la bibliothèque de contenu (logos, killers, maps,
 * bracket...) que l'utilisateur final doit pouvoir modifier après installation sans
 * avoir à reconstruire l'appli. Il vit donc à côté du .exe (extraFiles), pas figé
 * dans resources/ (extraResources) comme le reste.
 */
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
