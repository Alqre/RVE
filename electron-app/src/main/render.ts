import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {REMOTION_DIR, OUTPUT_DIR} from './paths';

const COMPOSITION_ID = 'MainScene';

export type ExportFormat = 'mp4' | 'webm';

/**
 * On rebundle à chaque export (quelques secondes) plutôt que de réutiliser un bundle
 * pré-construit : le bundle capture un instantané de public/selected au moment du
 * bundling, or ce dossier change à chaque nouvelle sélection d'asset. Un bundle
 * mis en cache ou pré-construit au packaging servirait des assets périmés.
 */
async function getServeUrl(): Promise<string> {
  return bundle({entryPoint: path.join(REMOTION_DIR, 'src', 'index.ts')});
}

/** ex: "19072026_2120" (DDMMYYYY_HHmm, heure locale au moment de l'export). */
function timestampForFilename(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const date = `${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${date}_${time}`;
}

export async function exportVideo(
  inputProps: Record<string, unknown>,
  format: ExportFormat,
  onProgress: (progress: number) => void,
): Promise<string> {
  const serveUrl = await getServeUrl();

  const composition = await selectComposition({
    serveUrl,
    id: COMPOSITION_ID,
    inputProps,
  });

  fs.mkdirSync(OUTPUT_DIR, {recursive: true});
  const outputPath = path.join(OUTPUT_DIR, `export_${timestampForFilename()}.${format}`);

  await renderMedia({
    composition,
    serveUrl,
    codec: format === 'webm' ? 'vp9' : 'h264',
    pixelFormat: 'yuv420p',
    outputLocation: outputPath,
    inputProps,
    onProgress: ({progress}) => onProgress(progress),
    // Chaque frame est piquée vers ffmpeg en JPEG avant l'encodage final ; passer
    // sa qualité au maximum réduit la perte de qualité (légers artefacts de
    // contraste/teinte) qui s'accumule avec la compression du codec final.
    jpegQuality: 100,
    /**
     * Remotion pipe les frames vers ffmpeg en JPEG (JPEG utilise toujours la
     * pleine plage 0-255), ce qui fait sortir l'encodage vidéo en "full range"
     * (yuvj420p / color_range=pc). La plupart des lecteurs/outils broadcast
     * (VLC, OBS, Twitch...) attendent la plage limitée standard (16-235) pour du
     * H.264/VP9 classique et n'honorent pas toujours ce tag correctement, ce qui
     * donnait un rendu bien plus contrasté qu'à l'écran une fois exporté.
     *
     * (Forcer aussi la matrice en bt709 a été testé pour un souci de teinte
     * rouge->orange séparé, mais n'a rien changé au rendu réel : la cause de ce
     * souci-là est ailleurs, donc on ne garde que le fix de plage ici.)
     *
     * L'étape qui fait l'encodage réel varie selon le codec : pour le H.264 c'est
     * la phase 'pre-stitcher' (la phase 'stitcher' ne fait que copier/muxer avec
     * l'audio via -c:v copy, sans réencoder) ; pour le VP9/webm il n'y a qu'une
     * seule phase 'stitcher' qui fait l'encodage ET le muxage en une fois. On
     * détecte donc la bonne étape en cherchant un vrai encodeur vidéo dans -c:v
     * plutôt qu'en se fiant au nom de la phase.
     */
    ffmpegOverride: ({args}) => {
      const codecIndex = args.indexOf('-c:v');
      const videoCodec = codecIndex !== -1 ? args[codecIndex + 1] : null;
      if (videoCodec !== 'libx264' && videoCodec !== 'libvpx-vp9') return args;
      const outputIndex = args.length - 1;
      return [
        ...args.slice(0, outputIndex),
        '-vf',
        'scale=in_range=full:out_range=limited',
        '-color_range',
        'tv',
        ...args.slice(outputIndex),
      ];
    },
  });

  return outputPath;
}
