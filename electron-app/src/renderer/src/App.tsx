import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {PlayerRef} from '@remotion/player';
import type {SlotWithFiles} from '../../main/assets';
import type {MainSceneProps} from '../../../../remotion-template/src/schema';
import type {ExportFormat} from '../../main/render';
import {SlotPicker} from './components/SlotPicker';
import {PreviewPlayer} from './components/PreviewPlayer';
import {buildInputProps, deriveNameFromFile, initialValues, isSlotVisible, type SlotValues} from './buildProps';

const EXPORT_FORMATS: ExportFormat[] = ['mp4', 'webm'];

function sectionStartLabel(slot: SlotWithFiles): string | null {
  if (slot.id === 'tournamentName') return 'Tournament';
  if (slot.id === 'matchFormat') return 'Match Format';
  if (slot.id === 'teamALogo') return 'Teams';
  if (slot.id === 'casterAImage') return 'Casters';
  if (slot.gameNumber !== undefined && slot.id === `killerGame${slot.gameNumber}`) return `Game ${slot.gameNumber}`;
  if (slot.id === 'bracketImage') return 'Bracket';
  if (slot.id === 'schedulePeriod') return 'Schedule — Period';
  if (slot.id === 'match1Team1') return 'Schedule — Match 1';
  if (slot.id === 'match2Team1') return 'Schedule — Match 2';
  if (slot.id === 'match3Team1') return 'Schedule — Match 3';
  return null;
}

export const App: React.FC = () => {
  const [slots, setSlots] = useState<SlotWithFiles[] | null>(null);
  const [values, setValues] = useState<SlotValues>({});
  const [selectedSource, setSelectedSource] = useState<SlotValues>({});
  const [previewNonce, setPreviewNonce] = useState(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('mp4');
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef | null>(null);
  const pendingFrameRef = useRef<number | null>(null);

  // Le Player est remonté (voir previewNonce) à chaque sélection d'asset pour forcer le
  // rechargement du fichier depuis le disque. Sans ça, la lecture reviendrait à la frame 0
  // à chaque sélection : on restaure donc la position juste après le remontage.
  useEffect(() => {
    if (pendingFrameRef.current !== null) {
      playerRef.current?.seekTo(pendingFrameRef.current);
      pendingFrameRef.current = null;
    }
  }, [previewNonce]);

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
    pendingFrameRef.current = playerRef.current?.getCurrentFrame() ?? null;
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
      const outputPath = await window.api.startExport(inputProps, exportFormat);
      setResultPath(outputPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setExporting(false);
    }
  };

  if (!slots || !inputProps) {
    return <div className="app-loading">Loading slots…</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-titles">
          <h1>Revival Video Exporter</h1>
          <p className="app-subtitle">
            Made by <span className="app-subtitle-highlight">Pikz</span>
          </p>
        </div>
        <button className="link-button" onClick={() => window.api.openAssetsFolder()}>
          Open assets folder
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
          <PreviewPlayer key={previewNonce} inputProps={inputProps} ref={playerRef} />

          <div className="slot-options export-format-options">
            {EXPORT_FORMATS.map((format) => (
              <button
                key={format}
                className={`slot-option ${exportFormat === format ? 'slot-option-selected' : ''}`}
                onClick={() => setExportFormat(format)}
                disabled={exporting}
              >
                .{format}
              </button>
            ))}
          </div>

          <button className="export-button" onClick={handleExport} disabled={exporting}>
            {exporting ? `Exporting… ${Math.round(progress * 100)}%` : `Export to .${exportFormat}`}
          </button>

          {exporting && (
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{width: `${progress * 100}%`}} />
            </div>
          )}

          {resultPath && <p className="export-success">Export complete: {resultPath}</p>}
          {error && <p className="export-error">Error during export: {error}</p>}
        </div>
      </div>
    </div>
  );
};
