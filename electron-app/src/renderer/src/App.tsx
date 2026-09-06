import React, {useEffect, useMemo, useRef, useState} from 'react';
import type {PlayerRef} from '@remotion/player';
import type {SlotWithFiles} from '../../main/assets';
import type {MainSceneProps} from '../../../../remotion-template/src/schema';
import type {ExportFormat} from '../../main/render';
import type {UpdaterStatus} from '../../main/updater';
import {SlotPicker} from './components/SlotPicker';
import {StandingsRow} from './components/StandingsRow';
import {PreviewPlayer} from './components/PreviewPlayer';
import {
  buildInputProps,
  deriveNameFromFile,
  initialValues,
  isSlotVisible,
  slotGroup,
  withComputedStandingsNames,
  TEAMS_PER_DIVISION,
  type DivisionTeamOption,
  type SlotGroup,
  type SlotValues,
} from './buildProps';
import appIcon from '../../../build-resources/icon.png';

const EXPORT_FORMATS: {value: ExportFormat; label: string}[] = [
  {value: 'mp4', label: '.mp4'},
  {value: 'webm', label: '.webm'},
];

const EXPORT_CANCELLED_MESSAGE = 'EXPORT_CANCELLED';

const STANDINGS_NAME_PATTERN = /^division(\d)Team(\d+)Name$/;
const STANDINGS_STAT_PATTERN = /^division\dTeam\d+(Wins|Losses|Ties|Points)$/;

const CLEAR_GROUPS: {group: SlotGroup; label: string}[] = [
  {group: 'matchInfo', label: 'Clear match info'},
  {group: 'games', label: 'Clear games'},
  {group: 'schedule', label: 'Clear schedule'},
  {group: 'bracket', label: 'Clear standings'},
];

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `~${minutes}m ${seconds}s left` : `~${seconds}s left`;
}

function sectionStartLabel(slot: SlotWithFiles): string | null {
  if (slot.id === 'tournamentName') return 'Tournament';
  if (slot.id === 'matchFormat') return 'Match Format';
  if (slot.id === 'teamALogo') return 'Teams';
  if (slot.id === 'casterAImage') return 'Casters';
  if (slot.gameNumber !== undefined && slot.id === `killerGame${slot.gameNumber}`) return `Game ${slot.gameNumber}`;
  if (slot.id === 'bracketMode') return 'Bracket / Scoreboard';
  if (slot.id === 'division1Team1Name') return 'Division 1';
  if (slot.id === 'division2Team1Name') return 'Division 2';
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
  const [openFolderOnFinish, setOpenFolderOnFinish] = useState(true);
  const [closeAppOnFinish, setCloseAppOnFinish] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [remainingLabel, setRemainingLabel] = useState<string | null>(null);
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<UpdaterStatus | null>(null);
  const [appVersion, setAppVersion] = useState<string | null>(null);
  const playerRef = useRef<PlayerRef | null>(null);
  const pendingFrameRef = useRef<number | null>(null);
  const exportStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingFrameRef.current !== null) {
      playerRef.current?.seekTo(pendingFrameRef.current);
      pendingFrameRef.current = null;
    }
  }, [previewNonce]);

  useEffect(() => {
    Promise.all([window.api.listSlots(), window.api.loadState()]).then(([loaded, saved]) => {
      setSlots(loaded);

      const autoSelected: SlotValues = {};
      for (const slot of loaded) {
        if ((slot.type === 'image' || slot.type === 'video') && slot.files.length === 1) {
          autoSelected[slot.id] = slot.files[0].path;
        }
      }

      const restoredValues = initialValues(loaded);
      if (saved) {
        const knownIds = new Set(loaded.map((s) => s.id));
        for (const [id, value] of Object.entries(saved.values)) {
          if (knownIds.has(id)) restoredValues[id] = value;
        }
        for (const [id, source] of Object.entries(saved.selectedSource)) {
          if (knownIds.has(id)) autoSelected[id] = source;
        }
      }
      setValues(restoredValues);
      setSelectedSource(autoSelected);
    });
  }, []);

  useEffect(() => {
    if (!slots) return;
    const timeout = setTimeout(() => {
      window.api.saveState({values, selectedSource});
    }, 400);
    return () => clearTimeout(timeout);
  }, [slots, values, selectedSource]);

  useEffect(() => {
    return window.api.onUpdateStatus(setUpdateStatus);
  }, []);

  useEffect(() => {
    window.api.getAppVersion().then(setAppVersion);
  }, []);

  useEffect(() => {
    return window.api.onExportProgress((p) => {
      setProgress(p);
      if (exportStartRef.current !== null && p > 0.03) {
        const elapsedMs = Date.now() - exportStartRef.current;
        const totalEstimateMs = elapsedMs / p;
        setRemainingLabel(formatRemaining(totalEstimateMs - elapsedMs));
      }
    });
  }, []);

  const linkedTargetIds = useMemo(() => {
    const ids = new Set<string>();
    for (const slot of slots ?? []) {
      if (slot.linkedTextSlot) ids.add(slot.linkedTextSlot);
    }
    return ids;
  }, [slots]);

  const visibleSlots = useMemo(
    () => (slots ?? []).filter((slot) => isSlotVisible(slot, values) && !linkedTargetIds.has(slot.id)),
    [slots, values, linkedTargetIds],
  );

  const clearGroupSlotIds = useMemo(() => {
    const result: Record<SlotGroup, string[]> = {matchInfo: [], games: [], schedule: [], bracket: []};
    for (const slot of visibleSlots) {
      const group = slotGroup(slot);
      if (group) result[group].push(slot.id);
    }
    return result;
  }, [visibleSlots]);

  const allSlotsFilled = useMemo(
    () =>
      visibleSlots.every((slot) => STANDINGS_NAME_PATTERN.test(slot.id) || (values[slot.id] ?? '').trim() !== ''),
    [visibleSlots, values],
  );

  const divisionTeamFiles = useMemo((): [{name: string; path: string}[], {name: string; path: string}[]] => {
    const filesForDivision = (division: number) => {
      const nameSlot = (slots ?? []).find((s) => s.id === `division${division}Team1Name`);
      if (!nameSlot) return [];
      const byName = new Map<string, string>();
      for (const file of nameSlot.files) {
        const name = deriveNameFromFile(file.name);
        if (!byName.has(name)) byName.set(name, file.path);
      }
      return Array.from(byName.entries())
        .map(([name, path]) => ({name, path}))
        .sort((a, b) => a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}));
    };
    return [filesForDivision(1), filesForDivision(2)];
  }, [slots]);

  const [divisionTeamLogoSrcs, setDivisionTeamLogoSrcs] = useState<[string[], string[]]>([[], []]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      divisionTeamFiles.map((teams, divisionIndex) =>
        Promise.all(
          teams
            .slice(0, TEAMS_PER_DIVISION)
            .map((team, teamIndex) => window.api.selectFileForSlot(`division${divisionIndex + 1}Team${teamIndex + 1}Logo`, team.path)),
        ),
      ),
    ).then(([division1LogoSrcs, division2LogoSrcs]) => {
      if (!cancelled) setDivisionTeamLogoSrcs([division1LogoSrcs, division2LogoSrcs]);
    });
    return () => {
      cancelled = true;
    };
  }, [divisionTeamFiles]);

  const divisionTeamOptions = useMemo((): [DivisionTeamOption[], DivisionTeamOption[]] => {
    const build = (division: number): DivisionTeamOption[] =>
      divisionTeamFiles[division]
        .slice(0, TEAMS_PER_DIVISION)
        .map((team, index) => ({
          name: team.name,
          logoSrc: divisionTeamLogoSrcs[division][index] ?? '',
        }));
    return [build(0), build(1)];
  }, [divisionTeamFiles, divisionTeamLogoSrcs]);

  const inputProps = useMemo(() => {
    if (!slots) return null;
    const props = withComputedStandingsNames(buildInputProps(slots, values), divisionTeamOptions);
    props.transparentIntro = exportFormat === 'webm';
    return props as unknown as MainSceneProps;
  }, [slots, values, divisionTeamOptions, exportFormat]);

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
    pendingFrameRef.current = playerRef.current?.getCurrentFrame() ?? null;
    setPreviewNonce((n) => n + 1);
  };

  const handleClearGroup = (slotIds: string[]) => {
    if (slotIds.length === 0) return;

    setValues((prev) => {
      const next = {...prev};
      for (const slotId of slotIds) {
        next[slotId] = '';
        const slot = slots?.find((s) => s.id === slotId);
        if (slot?.linkedTextSlot) next[slot.linkedTextSlot] = '';
      }
      return next;
    });
    setSelectedSource((prev) => {
      const next = {...prev};
      for (const slotId of slotIds) next[slotId] = '';
      return next;
    });
    setSlots((prev) => (prev ? prev.map((s) => (slotIds.includes(s.id) ? {...s, currentFile: null} : s)) : prev));
    pendingFrameRef.current = playerRef.current?.getCurrentFrame() ?? null;
    setPreviewNonce((n) => n + 1);
  };

  const handleClearSlot = (slotId: string) => handleClearGroup([slotId]);

  const handleTextChange = (slotId: string, value: string) => {
    setValues((prev) => ({...prev, [slotId]: value}));
  };

  const handleExport = async () => {
    if (!inputProps) return;
    setExporting(true);
    setProgress(0);
    setRemainingLabel(null);
    setResultPath(null);
    setError(null);
    setCancelled(false);
    exportStartRef.current = Date.now();
    try {
      const outputPath = await window.api.startExport(inputProps, exportFormat, {
        openFolderOnFinish,
        closeAppOnFinish,
      });
      setResultPath(outputPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes(EXPORT_CANCELLED_MESSAGE)) {
        setCancelled(true);
      } else {
        setError(message);
      }
    } finally {
      setExporting(false);
      exportStartRef.current = null;
    }
  };

  const handleCancelExport = () => {
    window.api.cancelExport();
  };

  const handleOpenReleases = () => {
    window.api.openReleasesPage();
  };

  const updateAvailable = updateStatus?.state === 'available';
  const updateLabel = updateAvailable ? 'Update' : 'Up to date';

  if (!slots || !inputProps) {
    return <div className="app-loading">Loading slots…</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-titles">
          <img src={appIcon} alt="" className="app-logo" />
          <h1>Revival Video Exporter</h1>
          <p className="app-subtitle">
            Made by <span className="app-subtitle-highlight">Pikz</span>
          </p>
        </div>
        <div className="app-header-actions">
          {appVersion && (
            <span className="app-version">
              v{appVersion}
              {updateStatus?.state === 'available' && (
                <>
                  , <span className="app-version-update">new version available v{updateStatus.version}</span>
                </>
              )}
            </span>
          )}
          <button
            className={`link-button update-button ${updateAvailable ? 'update-button-available' : ''}`}
            onClick={handleOpenReleases}
            disabled={!updateAvailable}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
            {updateLabel}
          </button>
          <button className="link-button" onClick={() => window.api.openAssetsFolder()}>
            Open assets folder
          </button>
          <button className="link-button" onClick={() => window.api.openExportsFolder()}>
            Open exports folder
          </button>
          <button className="link-button discord-button" onClick={() => window.api.openSchedule()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1276c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            Go to schedule
          </button>
        </div>
      </header>

      <div className="app-body">
        <div className="slots-panel">
          <div className="clear-group-buttons">
            {CLEAR_GROUPS.map(({group, label}) => {
              const slotIds = clearGroupSlotIds[group];
              const hasValue = slotIds.some((id) => (values[id] ?? '').trim() !== '');
              return (
                <button
                  key={group}
                  className="link-button clear-group-button"
                  onClick={() => handleClearGroup(slotIds)}
                  disabled={!hasValue}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {visibleSlots.map((slot) => {
            if (STANDINGS_STAT_PATTERN.test(slot.id)) return null;

            const sectionLabel = sectionStartLabel(slot);
            const standingsMatch = STANDINGS_NAME_PATTERN.exec(slot.id);

            return (
              <React.Fragment key={slot.id}>
                {sectionLabel && <h2 className="slot-section-title">{sectionLabel}</h2>}
                {standingsMatch ? (
                  <StandingsRow
                    rank={Number(standingsMatch[2])}
                    name={divisionTeamOptions[Number(standingsMatch[1]) - 1][Number(standingsMatch[2]) - 1]?.name ?? ''}
                    winsId={slot.id.replace('Name', 'Wins')}
                    lossesId={slot.id.replace('Name', 'Losses')}
                    tiesId={slot.id.replace('Name', 'Ties')}
                    pointsId={slot.id.replace('Name', 'Points')}
                    values={values}
                    onTextChange={handleTextChange}
                  />
                ) : (
                  <SlotPicker
                    slot={slot}
                    value={values[slot.id] ?? ''}
                    selectedSourcePath={selectedSource[slot.id]}
                    onPickFile={handlePickFile}
                    onTextChange={handleTextChange}
                    onClear={handleClearSlot}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="preview-panel">
          <PreviewPlayer key={previewNonce} inputProps={inputProps} ref={playerRef} />

          <div className="slot-options export-format-options">
            {EXPORT_FORMATS.map((format) => (
              <button
                key={format.value}
                className={`slot-option ${exportFormat === format.value ? 'slot-option-selected' : ''}`}
                onClick={() => setExportFormat(format.value)}
                disabled={exporting}
              >
                {format.label}
              </button>
            ))}
          </div>

          <div className="export-option-toggles">
            <label className="export-option-toggle">
              <input
                type="checkbox"
                checked={openFolderOnFinish}
                onChange={(e) => setOpenFolderOnFinish(e.target.checked)}
                disabled={exporting}
              />
              Open export folder when done
            </label>
            <label className="export-option-toggle">
              <input
                type="checkbox"
                checked={closeAppOnFinish}
                onChange={(e) => setCloseAppOnFinish(e.target.checked)}
                disabled={exporting}
              />
              Close app when export finishes
            </label>
          </div>

          {allSlotsFilled ? (
            <p className="fill-status fill-status-ok">✓ All inputs are filled</p>
          ) : (
            <p className="fill-status fill-status-warning">⚠ Not all inputs are filled</p>
          )}

          <button className="export-button" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : `Export to ${EXPORT_FORMATS.find((f) => f.value === exportFormat)?.label}`}
          </button>

          {resultPath && <p className="export-success">Export complete: {resultPath}</p>}
          {cancelled && <p className="export-cancelled">Export cancelled</p>}
          {error && <p className="export-error">Error during export: {error}</p>}
        </div>

        {exporting && (
          <div className="export-overlay">
            <div className="export-overlay-content">
              <span className="progress-percentage">{Math.round(progress * 100)}%</span>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{width: `${progress * 100}%`}} />
              </div>
              {remainingLabel && <span className="progress-remaining">{remainingLabel}</span>}
              <button className="export-cancel-button" onClick={handleCancelExport}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
