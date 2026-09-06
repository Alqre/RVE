import type {SlotWithFiles} from '../../main/assets';
import {GAMES_BY_FORMAT, type MatchFormat} from '../../../../remotion-template/src/schema';

export type SlotValues = Record<string, string>;

export const TEAMS_PER_DIVISION = 8;

export const DEFAULT_TEXT_VALUES: SlotValues = {
  matchFormat: 'BO3',
  bracketMode: 'Bracket',
};

export function initialValues(slots: SlotWithFiles[]): SlotValues {
  const values: SlotValues = {};
  for (const slot of slots) {
    if (slot.type === 'text' || slot.type === 'select' || slot.type === 'datetime' || slot.type === 'nameSelect') {
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

export interface DivisionTeamOption {
  name: string;
  logoSrc: string;
}

export function withComputedStandingsNames(
  props: Record<string, unknown>,
  divisionTeamOptions: [DivisionTeamOption[], DivisionTeamOption[]],
): Record<string, unknown> {
  for (let division = 1; division <= 2; division++) {
    const options = divisionTeamOptions[division - 1];
    for (let team = 1; team <= TEAMS_PER_DIVISION; team++) {
      const key = `division${division}Team${team}`;
      const existing = (props[key] as Record<string, unknown>) ?? {};
      const option = options[team - 1];
      props[key] = {...existing, teamName: option?.name ?? '', logoSrc: option?.logoSrc ?? ''};
    }
  }
  return props;
}

export function activeGameCount(values: SlotValues): number {
  const format = (values.matchFormat as MatchFormat) ?? 'BO3';
  return GAMES_BY_FORMAT[format] ?? GAMES_BY_FORMAT.BO3;
}

export function bracketMode(values: SlotValues): 'Bracket' | 'Scoreboard' {
  return values.bracketMode === 'Scoreboard' ? 'Scoreboard' : 'Bracket';
}

export function isSlotVisible(slot: SlotWithFiles, values: SlotValues): boolean {
  if (slot.gameNumber !== undefined && slot.gameNumber > activeGameCount(values)) return false;
  if (slot.bracketVariant === 'bracket' && bracketMode(values) !== 'Bracket') return false;
  if (slot.bracketVariant === 'scoreboard' && bracketMode(values) !== 'Scoreboard') return false;
  return true;
}

export type SlotGroup = 'matchInfo' | 'games' | 'schedule' | 'bracket';

export function slotGroup(slot: SlotWithFiles): SlotGroup | null {
  if (slot.gameNumber !== undefined) return 'games';
  if (slot.id === 'matchFormat' || slot.id === 'bracketMode' || slot.bracketVariant === 'bracket') return null;
  if (slot.bracketVariant === 'scoreboard') return 'bracket';
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
