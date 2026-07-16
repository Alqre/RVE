import React, {useMemo} from 'react';
import type {SlotWithFiles} from '../../../main/assets';
import {deriveNameFromFile} from '../buildProps';

interface Props {
  slot: SlotWithFiles;
  value: string;
  selectedSourcePath?: string;
  onPickFile: (slotId: string, sourcePath: string) => void;
  onTextChange: (slotId: string, value: string) => void;
}

export const SlotPicker: React.FC<Props> = ({slot, value, selectedSourcePath, onPickFile, onTextChange}) => {
  const sortedFiles = useMemo(
    () =>
      [...slot.files].sort((a, b) =>
        deriveNameFromFile(a.name).localeCompare(deriveNameFromFile(b.name), 'fr', {sensitivity: 'base'}),
      ),
    [slot.files],
  );

  if (slot.type === 'text') {
    return (
      <div className="slot">
        <label className="slot-label">{slot.label}</label>
        <input
          className="slot-text-input"
          type="text"
          value={value}
          onChange={(e) => onTextChange(slot.id, e.target.value)}
        />
      </div>
    );
  }

  if (slot.type === 'select') {
    return (
      <div className="slot">
        <label className="slot-label">{slot.label}</label>
        <div className="slot-options">
          {(slot.options ?? []).map((option) => (
            <button
              key={option}
              className={`slot-option ${value === option ? 'slot-option-selected' : ''}`}
              onClick={() => onTextChange(slot.id, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (slot.files.length === 0) {
    return (
      <div className="slot">
        <label className="slot-label">{slot.label}</label>
        <p className="slot-empty">
          Aucun fichier dans <code>assets/{slot.folder}</code>. Ajoutez-en un puis relancez l'appli.
        </p>
      </div>
    );
  }

  return (
    <div className="slot">
      <label className="slot-label">{slot.label}</label>
      <select
        className="slot-select"
        value={selectedSourcePath ?? ''}
        onChange={(e) => {
          if (e.target.value) onPickFile(slot.id, e.target.value);
        }}
      >
        <option value="">— Choisir —</option>
        {sortedFiles.map((file) => (
          <option key={file.path} value={file.path}>
            {deriveNameFromFile(file.name)}
          </option>
        ))}
      </select>
    </div>
  );
};
