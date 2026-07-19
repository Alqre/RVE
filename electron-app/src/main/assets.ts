import fs from 'node:fs';
import path from 'node:path';
import {ASSETS_DIR, SELECTED_ASSETS_DIR} from './paths';
import {toAssetUrl} from './protocol';

export type SlotType = 'image' | 'video' | 'text' | 'select' | 'datetime';

export interface ManifestSlot {
  id: string;
  type: SlotType;
  label: string;
  propPath: string;
  folder?: string;
  /** Pour un slot image/video : id d'un slot texte à auto-remplir avec le nom du fichier choisi. */
  linkedTextSlot?: string;
  /** Pour un slot 'select' : les valeurs proposées. */
  options?: string[];
  /** Pour les slots liés à une manche (killer/map) : numéro de manche, utilisé pour le filtrage selon le format BO3/BO5/BO7. */
  gameNumber?: number;
}

interface ManifestFile {
  slots: ManifestSlot[];
}

export interface AssetFile {
  name: string;
  path: string;
  url: string;
}

export interface SlotWithFiles extends ManifestSlot {
  files: AssetFile[];
  /** Nom du fichier actuellement copié dans public/selected pour ce slot, s'il existe. */
  currentFile: string | null;
}

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp']);
const VIDEO_EXT = new Set(['.mp4', '.mov', '.webm']);

export function readManifest(): ManifestFile {
  const raw = fs.readFileSync(path.join(ASSETS_DIR, 'manifest.json'), 'utf-8');
  return JSON.parse(raw) as ManifestFile;
}

function listFilesForSlot(slot: ManifestSlot): AssetFile[] {
  if (!slot.folder) return [];
  const dir = path.join(ASSETS_DIR, slot.folder);
  if (!fs.existsSync(dir)) return [];
  const exts = slot.type === 'image' ? IMAGE_EXT : VIDEO_EXT;
  return fs
    .readdirSync(dir)
    .filter((f) => exts.has(path.extname(f).toLowerCase()))
    .map((f) => {
      const filePath = path.join(dir, f);
      return {name: f, path: filePath, url: toAssetUrl(filePath)};
    });
}

function currentFileForSlot(slot: ManifestSlot): string | null {
  if (slot.type !== 'image' && slot.type !== 'video') return null;
  if (!fs.existsSync(SELECTED_ASSETS_DIR)) return null;
  const match = fs.readdirSync(SELECTED_ASSETS_DIR).find((f) => path.parse(f).name === slot.id);
  return match ?? null;
}

export function listSlots(): SlotWithFiles[] {
  const manifest = readManifest();
  return manifest.slots.map((slot) => {
    const files = listFilesForSlot(slot);

    // Si un seul fichier est disponible pour ce slot (ex: image de bracket remplacée en
    // externe par l'utilisateur), on le (re)copie automatiquement à chaque démarrage :
    // pas besoin de le resélectionner à la main après l'avoir remplacé sur le disque.
    if ((slot.type === 'image' || slot.type === 'video') && files.length === 1) {
      selectFileForSlot(slot.id, files[0].path);
    }

    return {
      ...slot,
      files,
      currentFile: currentFileForSlot(slot),
    };
  });
}

/**
 * Copie le fichier choisi par l'utilisateur dans remotion-template/public/selected/<slotId>.<ext>,
 * en remplaçant toute sélection précédente pour ce slot (y compris si l'extension a changé).
 * Retourne le chemin relatif (résolu ensuite via staticFile() côté Remotion) à stocker dans les props.
 */
export function selectFileForSlot(slotId: string, sourcePath: string): string {
  fs.mkdirSync(SELECTED_ASSETS_DIR, {recursive: true});

  for (const existing of fs.readdirSync(SELECTED_ASSETS_DIR)) {
    if (path.parse(existing).name === slotId) {
      fs.rmSync(path.join(SELECTED_ASSETS_DIR, existing));
    }
  }

  const ext = path.extname(sourcePath);
  const destName = `${slotId}${ext}`;
  fs.copyFileSync(sourcePath, path.join(SELECTED_ASSETS_DIR, destName));

  return `selected/${destName}`;
}
