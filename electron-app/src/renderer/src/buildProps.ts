import type {SlotWithFiles} from '../../main/assets';

export type SlotValues = Record<string, string>;

export const DEFAULT_TEXT_VALUES: SlotValues = {
  teamAName: 'Équipe Alpha',
  teamBName: 'Équipe Beta',
  roundLabel: 'Demi-finale',
};

export function initialValues(slots: SlotWithFiles[]): SlotValues {
  const values: SlotValues = {};
  for (const slot of slots) {
    if (slot.type === 'text') {
      values[slot.id] = DEFAULT_TEXT_VALUES[slot.id] ?? '';
    } else {
      values[slot.id] = slot.currentFile ? `selected/${slot.currentFile}` : '';
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
