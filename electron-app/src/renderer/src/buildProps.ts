import type {SlotWithFiles} from '../../main/assets';
import {GAMES_BY_FORMAT, type MatchFormat} from '../../../../remotion-template/src/schema';

export type SlotValues = Record<string, string>;

export const DEFAULT_TEXT_VALUES: SlotValues = {
  roundLabel: 'Demi-finale',
  matchFormat: 'BO3',
};

export function initialValues(slots: SlotWithFiles[]): SlotValues {
  const values: SlotValues = {};
  for (const slot of slots) {
    if (slot.type === 'text' || slot.type === 'select') {
      values[slot.id] = DEFAULT_TEXT_VALUES[slot.id] ?? slot.options?.[0] ?? '';
    } else if (slot.files.length === 1) {
      // Un seul fichier possible (ex: bracket) : auto-sélectionné côté main process,
      // on peut se fier à currentFile sans risque de reprendre un choix périmé.
      values[slot.id] = slot.currentFile ? `selected/${slot.currentFile}` : '';
    } else {
      // Plusieurs options possibles : on ne présume jamais d'un choix précédent au
      // démarrage (même si public/selected garde un fichier d'une session passée),
      // sinon l'aperçu peut afficher une image que le menu déroulant ne montre pas
      // comme sélectionnée. On repart d'un placeholder vide tant que l'utilisateur
      // n'a pas choisi explicitement dans cette session.
      values[slot.id] = '';
    }
  }
  return values;
}

function setDeep(target: Record<string, unknown>, propPath: string, value: unknown): void {
  const parts = propPath.split('.');
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (typeof cursor[key] !== 'object' || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

export function buildInputProps(slots: SlotWithFiles[], values: SlotValues): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const slot of slots) {
    setDeep(props, slot.propPath, values[slot.id] ?? '');
  }
  return props;
}

/** Nombre de manches actives pour le format de match actuellement sélectionné. */
export function activeGameCount(values: SlotValues): number {
  const format = (values.matchFormat as MatchFormat) ?? 'BO3';
  return GAMES_BY_FORMAT[format] ?? GAMES_BY_FORMAT.BO3;
}

export function isSlotVisible(slot: SlotWithFiles, values: SlotValues): boolean {
  if (slot.gameNumber === undefined) return true;
  return slot.gameNumber <= activeGameCount(values);
}

/**
 * Déduit un nom lisible à partir d'un nom de fichier (ex: "Dark lord.png" -> "Dark Lord",
 * "team-alpha.svg" -> "Team Alpha"), pour pré-remplir automatiquement le champ texte lié
 * à un slot image/vidéo (logo, killer, map, caster...) sans que l'utilisateur ait à le taper.
 */
export function deriveNameFromFile(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  const spaced = withoutExt.replace(/[_-]+/g, ' ').trim();
  return spaced.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}
