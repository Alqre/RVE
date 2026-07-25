import fs from 'node:fs';
import path from 'node:path';
import {app} from 'electron';

export interface SavedInputState {
  values: Record<string, string>;
  selectedSource: Record<string, string>;
}

const STATE_FILE = path.join(app.getPath('userData'), 'input-state.json');

export function loadInputState(): SavedInputState | null {
  try {
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    return JSON.parse(raw) as SavedInputState;
  } catch {
    return null;
  }
}

export function saveInputState(state: SavedInputState): void {
  fs.mkdirSync(path.dirname(STATE_FILE), {recursive: true});
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}
