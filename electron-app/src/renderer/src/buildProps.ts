import type {SlotWithFiles} from '../../main/assets';
import {GAMES_BY_FORMAT, type MatchFormat} from '../../../../remotion-template/src/schema';

export type SlotValues = Record<string, string>;

export const DEFAULT_TEXT_VALUES: SlotValues = {
  matchFormat: 'BO3',
};

export function initialValues(slots: SlotWithFiles[]): SlotValues {
  const values: SlotValues = {};
  for (const slot of slots) {
    if (slot.type === 'text' || slot.type === 'select' || slot.type === 'datetime') {
      values[slot.id] = DEFAULT_TEXT_VALUES[slot.id] ?? slot.options?.[0] ?? '';
    } else if (slot.files.length === 1) {
      values[slot.id] = slot.currentFile ? `selected/${slot.currentFile}` : '';
    } else {
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

export function activeGameCount(values: SlotValues): number {
  const format = (values.matchFormat as MatchFormat) ?? 'BO3';
  return GAMES_BY_FORMAT[format] ?? GAMES_BY_FORMAT.BO3;
}

export function isSlotVisible(slot: SlotWithFiles, values: SlotValues): boolean {
  if (slot.gameNumber === undefined) return true;
  return slot.gameNumber <= activeGameCount(values);
}

export type SlotGroup = 'matchInfo' | 'games' | 'schedule';

export function slotGroup(slot: SlotWithFiles): SlotGroup | null {
  if (slot.gameNumber !== undefined) return 'games';
  if (slot.id === 'matchFormat' || slot.id === 'bracketImage') return null;
  if (slot.id === 'schedulePeriod' || /^match\d/.test(slot.id)) return 'schedule';
  return 'matchInfo';
}

const ROMAN_NUMERAL = /^(I|II|III|IV|V|VI|VII|VIII|IX|X)$/i;

export function deriveNameFromFile(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^.]+$/, '');
  const spaced = withoutExt.replace(/[_-]+/g, ' ').trim();
  return spaced.replace(/\S+/g, (word) => {
    if (ROMAN_NUMERAL.test(word)) return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}
