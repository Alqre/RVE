import {contextBridge, ipcRenderer} from 'electron';
import type {SlotWithFiles} from '../main/assets';
import type {ExportFormat} from '../main/render';
import type {ExportOptions} from '../main/ipc';

export interface AppApi {
  listSlots: () => Promise<SlotWithFiles[]>;
  selectFileForSlot: (slotId: string, sourcePath: string) => Promise<string>;
  openAssetsFolder: () => Promise<void>;
  openExportsFolder: () => Promise<void>;
  openSchedule: () => Promise<void>;
  startExport: (inputProps: Record<string, unknown>, format: ExportFormat, options: ExportOptions) => Promise<string>;
  cancelExport: () => Promise<void>;
  onExportProgress: (callback: (progress: number) => void) => () => void;
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
};

contextBridge.exposeInMainWorld('api', api);
