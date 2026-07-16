import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {REMOTION_DIR, OUTPUT_DIR} from './paths';

const COMPOSITION_ID = 'MainScene';

/**
 * On rebundle à chaque export (quelques secondes) plutôt que de réutiliser un bundle
 * pré-construit : le bundle capture un instantané de public/selected au moment du
 * bundling, or ce dossier change à chaque nouvelle sélection d'asset. Un bundle
 * mis en cache ou pré-construit au packaging servirait des assets périmés.
 */
async function getServeUrl(): Promise<string> {
  return bundle({entryPoint: path.join(REMOTION_DIR, 'src', 'index.ts')});
}

export async function exportVideo(
  inputProps: Record<string, unknown>,
  onProgress: (progress: number) => void,
): Promise<string> {
  const serveUrl = await getServeUrl();

  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps,
  });

  fs.mkdirSync(OUTPUT_DIR, {recursive: true});
  const outputPath = path.join(OUTPUT_DIR, `export-${Date.now()}.mp4`);

  await renderMedia({
    composition,
    serveUrl,
    codec: 'h264',
    pixelFormat: 'yuv420p',
    outputLocation: outputPath,
    inputProps,
    onProgress: ({progress}) => onProgress(progress),
  });

  return outputPath;
}
