import React, {useEffect, useMemo, useState} from 'react';
import type {SlotWithFiles} from '../../main/assets';
import type {MainSceneProps} from '../../../../remotion-template/src/schema';
import {SlotPicker} from './components/SlotPicker';
import {PreviewPlayer} from './components/PreviewPlayer';
import {buildInputProps, initialValues, type SlotValues} from './buildProps';

export const App: React.FC = () => {
  const [slots, setSlots] = useState<SlotWithFiles[] | null>(null);
  const [values, setValues] = useState<SlotValues>({});
  const [selectedSource, setSelectedSource] = useState<SlotValues>({});
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.api.listSlots().then((loaded) => {
      setSlots(loaded);
      setValues(initialValues(loaded));
    });
  }, []);

  useEffect(() => {
    return window.api.onExportProgress((p) => setProgress(p));
  }, []);

  const inputProps = useMemo(() => {
    if (!slots) return null;
    return buildInputProps(slots, values) as unknown as MainSceneProps;
  }, [slots, values]);

  const handlePickFile = async (slotId: string, sourcePath: string) => {
    const relativePath = await window.api.selectFileForSlot(slotId, sourcePath);
    setValues((prev) => ({...prev, [slotId]: relativePath}));
    setSelectedSource((prev) => ({...prev, [slotId]: sourcePath}));
    setSlots((prev) =>
      prev
        ? prev.map((s) => (s.id === slotId ? {...s, currentFile: relativePath.replace('selected/', '')} : s))
        : prev,
    );
  };

  const handleTextChange = (slotId: string, value: string) => {
    setValues((prev) => ({...prev, [slotId]: value}));
  };

  const handleExport = async () => {
    if (!inputProps) return;
    setExporting(true);
    setProgress(0);
    setResultPath(null);
    setError(null);
    try {
      const outputPath = await window.api.startExport(inputProps);
      setResultPath(outputPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  };

  if (!slots || !inputProps) {
    return <div className="app-loading">Chargement des emplacements…</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Export de la scène de stream</h1>
        <button className="link-button" onClick={() => window.api.openAssetsFolder()}>
          Ouvrir le dossier des assets
        </button>
      </header>

      <div className="app-body">
        <div className="slots-panel">
          {slots.map((slot) => (
            <SlotPicker
              key={slot.id}
              slot={slot}
              value={values[slot.id] ?? ''}
              selectedSourcePath={selectedSource[slot.id]}
              onPickFile={handlePickFile}
              onTextChange={handleTextChange}
            />
          ))}
        </div>

        <div className="preview-panel">
          <PreviewPlayer inputProps={inputProps} />

          <button className="export-button" onClick={handleExport} disabled={exporting}>
            {exporting ? `Export en cours… ${Math.round(progress * 100)}%` : 'Exporter en .mp4'}
          </button>

          {exporting && (
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{width: `${progress * 100}%`}} />
            </div>
          )}

          {resultPath && <p className="export-success">Export terminé : {resultPath}</p>}
          {error && <p className="export-error">Erreur pendant l'export : {error}</p>}
        </div>
      </div>
    </div>
  );
};
