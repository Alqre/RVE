import React from 'react';
import type {SlotWithFiles} from '../../../main/assets';

interface Props {
  slot: SlotWithFiles;
  value: string;
  selectedSourcePath?: string;
  onPickFile: (slotId: string, sourcePath: string) => void;
  onTextChange: (slotId: string, value: string) => void;
}

export const SlotPicker: React.FC<Props> = ({slot, value, selectedSourcePath, onPickFile, onTextChange}) => {
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

  return (
    <div className="slot">
      <label className="slot-label">{slot.label}</label>
      {slot.files.length === 0 ? (
        <p className="slot-empty">
          Aucun fichier dans <code>assets/{slot.folder}</code>. Ajoutez-en un puis relancez l'appli.
        </p>
      ) : (
        <div className="slot-grid">
          {slot.files.map((file) => {
            const isSelected = selectedSourcePath === file.path;
            return (
              <button
                key={file.path}
                className={`slot-thumb ${isSelected ? 'slot-thumb-selected' : ''}`}
                onClick={() => onPickFile(slot.id, file.path)}
                title={file.name}
              >
                {slot.type === 'image' ? (
                  <img src={file.url} alt={file.name} />
                ) : (
                  <video src={file.url} muted preload="metadata" />
                )}
                <span className="slot-thumb-name">{file.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
