import React, {useMemo} from 'react';
import type {SlotWithFiles} from '../../../main/assets';
import {deriveNameFromFile} from '../buildProps';

interface Props {
  slot: SlotWithFiles;
  value: string;
  selectedSourcePath?: string;
  onPickFile: (slotId: string, sourcePath: string) => void;
  onTextChange: (slotId: string, value: string) => void;
  onClear: (slotId: string) => void;
}

export const SlotPicker: React.FC<Props> = ({slot, value, selectedSourcePath, onPickFile, onTextChange, onClear}) => {
  const sortedFiles = useMemo(
    () =>
      [...slot.files].sort((a, b) =>
        deriveNameFromFile(a.name).localeCompare(deriveNameFromFile(b.name), 'en', {sensitivity: 'base'}),
      ),
    [slot.files],
  );

  if (slot.type === 'text') {
    return (
      <div className="slot">
        <label className="slot-label">{slot.label}</label>
        <input
          className={`slot-text-input ${value.trim() !== '' ? 'slot-input-filled' : ''}`}
          type="text"
          value={value}
          placeholder={slot.placeholder}
          onChange={(e) => onTextChange(slot.id, e.target.value)}
        />
      </div>
    );
  }

  if (slot.type === 'datetime') {
    return (
      <div className="slot">
        <label className="slot-label">{slot.label}</label>
        <input
          className={`slot-text-input ${value.trim() !== '' ? 'slot-input-filled' : ''}`}
          type="datetime-local"
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
          No files in <code>assets/{slot.folder}</code>. Add one and restart the app.
        </p>
      </div>
    );
  }

  return (
    <div className="slot">
      <label className="slot-label">{slot.label}</label>
      <select
        className={`slot-select ${!selectedSourcePath ? 'slot-select-empty' : 'slot-input-filled'}`}
        value={selectedSourcePath ?? ''}
        onChange={(e) => {
          if (e.target.value) onPickFile(slot.id, e.target.value);
          else onClear(slot.id);
        }}
      >
        <option value="" style={{color: '#5c5c66'}}>Empty</option>
        {sortedFiles.map((file) => (
          <option key={file.path} value={file.path} style={{color: '#f0f0f2'}}>
            {deriveNameFromFile(file.name)}
          </option>
        ))}
      </select>
    </div>
  );
};
