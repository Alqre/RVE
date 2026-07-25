import {contextBridge, ipcRenderer} from 'electron';
import type {SlotWithFiles} from '../main/assets';
import type {ExportFormat} from '../main/render';
import type {ExportOptions} from '../main/ipc';
import type {SavedInputState} from '../main/state';
import type {UpdaterStatus} from '../main/updater';

export interface AppApi {
  listSlots: () => Promise<SlotWithFiles[]>;
  selectFileForSlot: (slotId: string, sourcePath: string) => Promise<string>;
  openAssetsFolder: () => Promise<void>;
  openExportsFolder: () => Promise<void>;
  openSchedule: () => Promise<void>;
  startExport: (inputProps: Record<string, unknown>, format: ExportFormat, options: ExportOptions) => Promise<string>;
  cancelExport: () => Promise<void>;
  onExportProgress: (callback: (progress: number) => void) => () => void;
  loadState: () => Promise<SavedInputState | null>;
  saveState: (state: SavedInputState) => Promise<void>;
  installUpdate: () => Promise<void>;
  onUpdateStatus: (callback: (status: UpdaterStatus) => void) => () => void;
  getAppVersion: () => Promise<string>;
}

const api: AppApi = {
  listSlots: () => ipcRenderer.invoke('slots:list'),
  selectFileForSlot: (slotId, sourcePath) => ipcRenderer.invoke('assets:selectForSlot', slotId, sourcePath),
  openAssetsFolder: () => ipcRenderer.invoke('assets:openFolder'),
  openExportsFolder: () => ipcRenderer.invoke('exports:openFolder'),
  openSchedule: () => ipcRenderer.invoke('schedule:open'),
  startExport: (inputProps, format, options) => ipcRenderer.invoke('export:start', inputProps, format, options),
  cancelExport: () => ipcRenderer.invoke('export:cancel'),
  onExportProgress: (callback) => {
    const listener = (_event: unknown, progress: number) => callback(progress);
    ipcRenderer.on('export:progress', listener);
    return () => ipcRenderer.removeListener('export:progress', listener);
  },
  loadState: () => ipcRenderer.invoke('state:load'),
  saveState: (state) => ipcRenderer.invoke('state:save', state),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  onUpdateStatus: (callback) => {
    const listener = (_event: unknown, status: UpdaterStatus) => callback(status);
    ipcRenderer.on('updater:status', listener);
    return () => ipcRenderer.removeListener('updater:status', listener);
  },
  getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
};

contextBridge.exposeInMainWorld('api', api);
