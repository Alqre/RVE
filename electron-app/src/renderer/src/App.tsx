import React, {useEffect, useMemo, useState} from 'react';
import type {SlotWithFiles} from '../../main/assets';
import type {MainSceneProps} from '../../../../remotion-template/src/schema';
import {SlotPicker} from './components/SlotPicker';
import {PreviewPlayer} from './components/PreviewPlayer';
import {buildInputProps, deriveNameFromFile, initialValues, isSlotVisible, type SlotValues} from './buildProps';

function sectionStartLabel(slot: SlotWithFiles): string | null {
  if (slot.id === 'matchFormat') return 'Format du match';
  if (slot.id === 'teamALogo') return 'Équipes';
  if (slot.id === 'casterAImage') return 'Casters';
  if (slot.gameNumber !== undefined && slot.id === `killerGame${slot.gameNumber}`) return `Manche ${slot.gameNumber}`;
  if (slot.id === 'bracketImage') return 'Bracket';
  if (slot.id === 'schedulePeriod') return 'Planning — Période';
  if (slot.id === 'match1Team1') return 'Planning — Match 1';
  if (slot.id === 'match2Team1') return 'Planning — Match 2';
  if (slot.id === 'match3Team1') return 'Planning — Match 3';
  return null;
}

export const App: React.FC = () => {
  const [slots, setSlots] = useState<SlotWithFiles[] | null>(null);
  const [values, setValues] = useState<SlotValues>({});
  const [selectedSource, setSelectedSource] = useState<SlotValues>({});
  const [previewNonce, setPreviewNonce] = useState(0);
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

  const linkedTargetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slot of slots ?? []) {
      if (slot.linkedTextSlot) ids.add(slot.linkedTextSlot);
    }
    return ids;
  }, [slots]);

  // Les slots texte auto-remplis (nom d'équipe, de killer, de map, de caster...) ne sont
  // pas affichés : ils sont dérivés du fichier choisi dans le slot image correspondant.
  const visibleSlots = useMemo(
    () => (slots ?? []).filter((slot) => isSlotVisible(slot, values) && !linkedTargetIds.has(slot.id)),
    [slots, values, linkedTargetIds],
  );

  const inputProps = useMemo(() => {
    if (!slots) return null;
    return buildInputProps(slots, values) as unknown as MainSceneProps;
  }, [slots, values]);

  const handlePickFile = async (slotId: string, sourcePath: string) => {
    const relativePath = await window.api.selectFileForSlot(slotId, sourcePath);
    const slot = slots?.find((s) => s.id === slotId);
    const fileName = sourcePath.split(/[\\/]/).pop() ?? '';

    setValues((prev) => {
      const next = {...prev, [slotId]: relativePath};
      if (slot?.linkedTextSlot) {
        next[slot.linkedTextSlot] = deriveNameFromFile(fileName);
      }
      return next;
    });
    setSelectedSource((prev) => ({...prev, [slotId]: sourcePath}));
    setSlots((prev) =>
      prev
        ? prev.map((s) => (s.id === slotId ? {...s, currentFile: relativePath.replace('selected/', '')} : s))
        : prev,
    );
    // Le fichier copié dans public/selected garde le même nom pour un même slot (ex:
    // toujours "teamALogo.png"), donc la prop peut rester identique même si le contenu a
    // changé : on force un remontage complet du Player pour être sûr que l'aperçu recharge
    // bien la nouvelle image depuis le disque plutôt que de garder l'ancienne à l'écran.
    setPreviewNonce((n) => n + 1);
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
          {visibleSlots.map((slot) => {
            const sectionLabel = sectionStartLabel(slot);
            return (
              <React.Fragment key={slot.id}>
                {sectionLabel && <h2 className="slot-section-title">{sectionLabel}</h2>}
                <SlotPicker
                  slot={slot}
                  value={values[slot.id] ?? ''}
                  selectedSourcePath={selectedSource[slot.id]}
                  onPickFile={handlePickFile}
                  onTextChange={handleTextChange}
                />
              </React.Fragment>
            );
          })}
        </div>

        <div className="preview-panel">
          <PreviewPlayer key={previewNonce} inputProps={inputProps} />

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
