import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition, makeCancelSignal} from '@remotion/renderer';
import {REMOTION_DIR, OUTPUT_DIR} from './paths';

const COMPOSITION_ID = 'MainScene';

export type ExportFormat = 'mp4' | 'webm';

export const EXPORT_CANCELLED_MESSAGE = 'EXPORT_CANCELLED';

let cancelRunningExport: (() => void) | null = null;
let cancelWasRequested = false;

export function cancelExport(): void {
  cancelWasRequested = true;
  cancelRunningExport?.();
}

async function getServeUrl(): Promise<string> {
  return bundle({entryPoint: path.join(REMOTION_DIR, 'src', 'index.ts')});
}

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
  const {cancelSignal, cancel} = makeCancelSignal();
  cancelRunningExport = cancel;
  cancelWasRequested = false;

  let outputPath: string;

  try {
    const serveUrl = await getServeUrl();

    const composition = await selectComposition({
      serveUrl,
      id: COMPOSITION_ID,
      inputProps,
    });

    fs.mkdirSync(OUTPUT_DIR, {recursive: true});
    outputPath = path.join(OUTPUT_DIR, `export_${timestampForFilename()}.${format}`);

    await renderMedia({
      composition,
      serveUrl,
      codec: format === 'webm' ? 'vp9' : 'h264',
      pixelFormat: 'yuv420p',
      outputLocation: outputPath,
      inputProps,
      cancelSignal,
      onProgress: ({progress}) => onProgress(progress),
      jpegQuality: 100,
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
  } catch (err) {
    if (cancelWasRequested) throw new Error(EXPORT_CANCELLED_MESSAGE);
    throw err;
  } finally {
    cancelRunningExport = null;
  }

  return outputPath;
}
